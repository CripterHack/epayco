import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { randomInt, randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { DataSource, EntityManager } from 'typeorm';
import {
  ApiResponse,
  ErrorCodes,
  PaymentConfirmResponse,
  PaymentInitResponse,
} from '@epayco/shared';
import { successResponse } from '../../common/responses/response.util';
import { ApiErrorException } from '../../common/exceptions/api-error.exception';
import { CustomerRepository } from '../customers/customer.repository';
import { WalletRepository } from '../wallets/wallet.repository';
import { PaymentSessionRepository } from '../payment-sessions/payment-session.repository';
import { PaymentRepository } from '../payments/payment.repository';
import { InitPaymentDto } from './dto/init-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { fromMinorUnits, toMinorUnits, toNumber } from '../../common/utils/money.util';
import { PaymentSessionStatus } from '../payment-sessions/entities/payment-session.entity';
import { PaymentEntity } from '../payments/entities/payment.entity';
import type { AppConfig } from '../../config/configuration';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly tokensTtlMinutes: number;

  constructor(
    private readonly dataSource: DataSource,
    private readonly customerRepository: CustomerRepository,
    private readonly walletRepository: WalletRepository,
    private readonly paymentSessionRepository: PaymentSessionRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly mailerService: MailerService,
    configService: ConfigService<AppConfig>,
  ) {
    const tokensConfig = configService.get('tokens', { infer: true });
    this.tokensTtlMinutes = tokensConfig?.ttlMinutes ?? 10;
  }

  async initPayment(dto: InitPaymentDto): Promise<ApiResponse<PaymentInitResponse>> {
    const customer = await this.customerRepository.findByDocumentAndPhone(dto.document, dto.phone);

    if (!customer) {
      throw new ApiErrorException(
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
        'Cliente no encontrado para iniciar el pago.',
      );
    }

    const wallet = await this.walletRepository.findByCustomerId(customer.id);

    if (!wallet) {
      throw new ApiErrorException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.INTERNAL,
        'La billetera del cliente no existe.',
      );
    }

    const amountMinor = toMinorUnits(dto.amount);

    if (amountMinor <= 0n) {
      throw new ApiErrorException(
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION,
        'El valor del pago debe ser mayor que cero.',
      );
    }

    const walletBalance = toMinorUnits(wallet.balance);

    if (walletBalance < amountMinor) {
      throw new ApiErrorException(
        HttpStatus.BAD_REQUEST,
        ErrorCodes.INSUFFICIENT_FUNDS,
        'Saldo insuficiente para iniciar el pago.',
      );
    }

    const sessionId = randomUUID();
    const rawToken = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const tokenHash = await argon2.hash(rawToken);

    const expiresAt = new Date(Date.now() + this.tokensTtlMinutes * 60_000);

    const session = this.paymentSessionRepository.create({
      walletId: wallet.id,
      sessionId,
      amount: fromMinorUnits(amountMinor),
      tokenHash,
      status: PaymentSessionStatus.PENDING,
      expiresAt,
    });

    await this.paymentSessionRepository.save(session);

    try {
      await this.sendTokenEmail({
        fullName: customer.fullName,
        email: customer.email,
        token: rawToken,
        expiresAt,
      });
    } catch (error) {
      await this.paymentSessionRepository.remove(session);
      throw error;
    }

    this.logger.log(
      {
        event: 'payment_session.created',
        sessionId,
        walletId: wallet.id,
        amount: Number(toNumber(amountMinor).toFixed(2)),
        expiresAt: expiresAt.toISOString(),
      },
      'Sesión de pago creada',
    );

    return successResponse('Sesion de pago generada correctamente.', {
      sessionId,
      expiresAt: expiresAt.toISOString(),
    });
  }

  async confirmPayment(dto: ConfirmPaymentDto): Promise<ApiResponse<PaymentConfirmResponse>> {
    let resultingBalanceMinor = 0n;

    await this.dataSource.transaction(async (manager: EntityManager) => {
      const session = await this.paymentSessionRepository.lockPendingBySessionId(
        dto.sessionId,
        manager,
      );

      if (!session) {
        throw new ApiErrorException(
          HttpStatus.NOT_FOUND,
          ErrorCodes.NOT_FOUND,
          'Sesion de pago no encontrada o no valida.',
        );
      }

      if (session.status !== PaymentSessionStatus.PENDING) {
        throw new ApiErrorException(
          HttpStatus.CONFLICT,
          ErrorCodes.VALIDATION,
          'La sesion de pago ya fue procesada.',
        );
      }

      if (session.expiresAt.getTime() < Date.now()) {
        throw new ApiErrorException(
          HttpStatus.UNAUTHORIZED,
          ErrorCodes.TOKEN_EXPIRED,
          'El token ha expirado.',
        );
      }

      const tokenValid = await argon2.verify(session.tokenHash, dto.token6);

      if (!tokenValid) {
        throw new ApiErrorException(
          HttpStatus.UNAUTHORIZED,
          ErrorCodes.TOKEN_INVALID,
          'El token proporcionado no es valido.',
        );
      }

      const wallet = await this.walletRepository.lockById(session.walletId, manager);

      if (!wallet) {
        throw new ApiErrorException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorCodes.INTERNAL,
          'No se encontro la billetera asociada.',
        );
      }

      const walletBalance = toMinorUnits(wallet.balance);
      const sessionAmount = toMinorUnits(session.amount);

      if (walletBalance < sessionAmount) {
        throw new ApiErrorException(
          HttpStatus.BAD_REQUEST,
          ErrorCodes.INSUFFICIENT_FUNDS,
          'Saldo insuficiente para confirmar el pago.',
        );
      }

      const existingPayment = await this.paymentRepository.findBySessionId(session.sessionId);
      if (existingPayment) {
        throw new ApiErrorException(
          HttpStatus.CONFLICT,
          ErrorCodes.DUPLICATE,
          'El pago ya fue confirmado anteriormente.',
        );
      }

      const newBalance = walletBalance - sessionAmount;
      wallet.balance = fromMinorUnits(newBalance);
      session.status = PaymentSessionStatus.CONFIRMED;

      const payment = manager.create(PaymentEntity, {
        walletId: wallet.id,
        sessionId: session.sessionId,
        amount: fromMinorUnits(sessionAmount),
      });

      await manager.save(wallet);
      await manager.save(session);
      await manager.save(payment);

      resultingBalanceMinor = newBalance;

      this.logger.log(
        {
          event: 'payment.confirmed',
          sessionId: dto.sessionId,
          walletId: wallet.id,
          amount: Number(toNumber(sessionAmount).toFixed(2)),
          balance: Number(toNumber(newBalance).toFixed(2)),
        },
        'Pago confirmado',
      );
    });

    return successResponse('Pago confirmado correctamente.', {
      balance: Number(toNumber(resultingBalanceMinor).toFixed(2)),
    });
  }

  private async sendTokenEmail(params: {
    fullName: string;
    email: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    const { fullName, email, token, expiresAt } = params;
    const formattedExpiration = new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(expiresAt);

    const subject = 'Token de confirmación de pago';
    const text = [
      `Hola ${fullName},`,
      `Tu token para confirmar el pago es ${token}.`,
      `Este token vence el ${formattedExpiration}.`,
      'Ingresa el token únicamente en el flujo de confirmación que solicitaste.',
      'Si no solicitaste este pago, ignora este mensaje.',
    ].join('\n');

    const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
    <main role="main" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 24px; color: #0f172a;">
      <h1 style="font-size: 22px; margin-top: 0;">Confirmación de pago</h1>
      <p style="margin: 16px 0;">Hola <strong>${fullName}</strong>,</p>
      <p style="margin: 16px 0;">
        Usa el siguiente código de un solo uso para confirmar tu pago. Mantén este código privado.
      </p>
      <section aria-label="Código de confirmación" style="margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600;">Token de confirmación:</p>
        <p
          style="font-size: 32px; letter-spacing: 6px; font-weight: 700; color: #0ea5e9; margin: 0;"
          aria-live="polite"
        >
          ${token}
        </p>
        <p style="margin: 12px 0 0 0; color: #334155;">
          El token vence el <strong>${formattedExpiration}</strong> (hora UTC).
        </p>
      </section>
      <p style="margin: 16px 0;">
        Si tú no solicitaste este pago, ignora este mensaje. No compartas este código fuera de la aplicación oficial.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="margin: 0; font-size: 13px; color: #64748b;">Mensaje generado automáticamente por la billetera virtual.</p>
    </main>
  </body>
</html>`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        text,
        html,
      });

      this.logger.log(
        {
          event: 'payment_session.token_sent',
          email,
          expiresAt: expiresAt.toISOString(),
        },
        'Token de confirmación enviado',
      );
    } catch (error) {
      this.logger.error('Error enviando correo de token', { error });
      throw new ApiErrorException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.INTERNAL,
        'No se pudo enviar el token de confirmacion.',
      );
    }
  }
}
