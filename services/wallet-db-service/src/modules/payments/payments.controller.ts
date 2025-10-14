import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, PaymentConfirmResponse, PaymentInitResponse } from '@epayco/shared';
import { PaymentsService } from './payments.service';
import { InitPaymentDto } from './dto/init-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('init')
  @HttpCode(HttpStatus.CREATED)
  init(@Body() dto: InitPaymentDto): Promise<ApiResponse<PaymentInitResponse>> {
    return this.paymentsService.initPayment(dto);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirm(@Body() dto: ConfirmPaymentDto): Promise<ApiResponse<PaymentConfirmResponse>> {
    return this.paymentsService.confirmPayment(dto);
  }
}
