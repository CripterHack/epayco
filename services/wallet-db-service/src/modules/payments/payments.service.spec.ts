import { HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '@epayco/shared';
import * as argon2 from 'argon2';
import { DataSource, EntityManager } from 'typeorm';
import { ApiErrorException } from '../../common/exceptions/api-error.exception';
import { PaymentsService } from './payments.service';
import {
  PaymentSessionStatus,
  PaymentSessionEntity,
} from '../payment-sessions/entities/payment-session.entity';
import { CustomerRepository } from '../customers/customer.repository';
import { WalletRepository } from '../wallets/wallet.repository';
import { PaymentSessionRepository } from '../payment-sessions/payment-session.repository';
import { PaymentRepository } from '../payments/payment.repository';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';

describe('PaymentsService', () => {
  const paymentRepositoryMock = {
    findBySessionId: jest.fn().mockResolvedValue(null),
  } as unknown as PaymentRepository;

  const mailerServiceMock = {
    sendMail: jest.fn(),
  } as unknown as MailerService;

  const configServiceMock = {
    get: jest.fn().mockReturnValue({ ttlMinutes: 5 }),
  } as unknown as ConfigService<AppConfig>;

  beforeEach(() => {
    jest.resetAllMocks();
    (mailerServiceMock.sendMail as jest.Mock).mockReset();
  });

  it('throws TOKEN_INVALID cuando el token no coincide en confirmación', async () => {
    expect.assertions(5);

    const customerRepositoryMock = {} as CustomerRepository;
    const hashedToken = await argon2.hash('123456');

    const session = {
      id: 'session-entity-id',
      walletId: 'wallet-id',
      sessionId: '0d0fb38e-9f85-42cf-87e0-123456789abc',
      tokenHash: hashedToken,
      status: PaymentSessionStatus.PENDING,
      expiresAt: new Date(Date.now() + 60_000),
      amount: '10.00',
    };

    const paymentSessionRepositoryMock = {
      lockPendingBySessionId: jest.fn().mockResolvedValue(session),
    } as unknown as PaymentSessionRepository;

    const walletRepositoryMock = {
      lockById: jest.fn(),
    } as unknown as WalletRepository;

    const managerMock = {
      create: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<Partial<EntityManager>>;

    const dataSourceMock = {
      transaction: jest.fn(
        async (runInTransaction: (entityManager: EntityManager) => Promise<unknown>) => {
          return await runInTransaction(managerMock as EntityManager);
        },
      ),
    } as jest.Mocked<Partial<DataSource>>;

    const service = new PaymentsService(
      dataSourceMock as DataSource,
      customerRepositoryMock,
      walletRepositoryMock,
      paymentSessionRepositoryMock,
      paymentRepositoryMock,
      mailerServiceMock,
      configServiceMock,
    );

    const lockPendingBySessionIdSpy = jest.spyOn(
      paymentSessionRepositoryMock,
      'lockPendingBySessionId',
    );
    const lockByIdSpy = jest.spyOn(walletRepositoryMock, 'lockById');

    try {
      await service.confirmPayment({
        sessionId: session.sessionId,
        token6: '000000',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiErrorException);
      const exception = error as ApiErrorException;
      expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      expect(exception.getResponse()).toEqual(
        expect.objectContaining({ code: ErrorCodes.TOKEN_INVALID }),
      );
    }

    expect(lockPendingBySessionIdSpy).toHaveBeenCalledWith(session.sessionId, managerMock);
    expect(lockByIdSpy).not.toHaveBeenCalled();
  });

  it('envía correo accesible con token y expiración en initPayment', async () => {
    const customerRepositoryMock = {
      findByDocumentAndPhone: jest.fn().mockResolvedValue({
        id: 'customer-id',
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
      }),
    } as unknown as CustomerRepository;

    const walletRepositoryMock = {
      findByCustomerId: jest.fn().mockResolvedValue({ id: 'wallet-id', balance: '150.00' }),
    } as unknown as WalletRepository;

    const paymentSessionRepositoryMock = {
      create: jest.fn().mockImplementation((payload: Partial<PaymentSessionEntity>) => ({
        id: 'session-entity-id',
        ...payload,
      })),
      save: jest.fn().mockImplementation((entity: PaymentSessionEntity) => Promise.resolve(entity)),
      remove: jest.fn().mockResolvedValue(undefined),
    } as unknown as PaymentSessionRepository;

    const dataSourceMock = {} as jest.Mocked<Partial<DataSource>>;

    const service = new PaymentsService(
      dataSourceMock as DataSource,
      customerRepositoryMock,
      walletRepositoryMock,
      paymentSessionRepositoryMock,
      paymentRepositoryMock,
      mailerServiceMock,
      configServiceMock,
    );

    const sendMailMock = jest.fn().mockResolvedValue(undefined);
    mailerServiceMock.sendMail = sendMailMock;

    const response = await service.initPayment({
      document: '1234567890',
      phone: '3001234567',
      amount: 75.5,
    });

    expect(response.code).toBe(ErrorCodes.OK);
    expect(sendMailMock).toHaveBeenCalledTimes(1);

    const mailPayload = sendMailMock.mock.calls[0] as unknown as [
      {
        to: string;
        subject: string;
        text: string;
        html: string;
      },
    ];
    expect(mailPayload[0]?.to).toBe('ada@example.com');
    expect(mailPayload[0]?.subject).toContain('Token');
    expect(mailPayload[0]?.text).toContain('token para confirmar el pago');
    expect(mailPayload[0]?.text.toLowerCase()).toContain('vence el');
    const tokenMatch = mailPayload[0]?.text.match(/\b\d{6}\b/);
    expect(tokenMatch).not.toBeNull();
    const token = tokenMatch ? tokenMatch[0] : '';
    expect(token).toHaveLength(6);
    expect(mailPayload[0]?.html).toContain('<main');
    expect(mailPayload[0]?.html).toContain('aria-live="polite"');
    expect(mailPayload[0]?.html).toContain(token);
    expect(mailPayload[0]?.html).toContain('hora UTC');
  });
});
