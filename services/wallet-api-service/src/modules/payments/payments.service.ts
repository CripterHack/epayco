import { HttpStatus, Injectable } from '@nestjs/common';
import {
  ApiResponse,
  PaymentConfirmRequest,
  PaymentConfirmResponse,
  PaymentInitRequest,
  PaymentInitResponse,
} from '@epayco/shared';
import { InternalDbService } from '../proxy/internal-db.service';
import { ensureSuccess } from '../../common/utils/internal-response.util';
import { InitPaymentDto } from './dto/init-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Injectable()
export class PaymentsFacadeService {
  constructor(private readonly internalDbService: InternalDbService) {}

  async initPayment(dto: InitPaymentDto): Promise<ApiResponse<PaymentInitResponse>> {
    const payload: PaymentInitRequest = {
      document: dto.document,
      phone: dto.phone,
      amount: dto.amount,
    };

    const response = await this.internalDbService.initPayment(payload);
    return ensureSuccess(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async confirmPayment(dto: ConfirmPaymentDto): Promise<ApiResponse<PaymentConfirmResponse>> {
    const payload: PaymentConfirmRequest = {
      sessionId: dto.sessionId,
      token6: dto.token6,
    };

    const response = await this.internalDbService.confirmPayment(payload);
    return ensureSuccess(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
