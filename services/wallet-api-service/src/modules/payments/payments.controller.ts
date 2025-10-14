import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentsFacadeService } from './payments.service';
import { InitPaymentDto } from './dto/init-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import {
  PaymentConfirmDataDto,
  PaymentConfirmResponseDto,
  PaymentInitDataDto,
  PaymentInitResponseDto,
} from './dto/payment-responses.dto';
import { ApiErrorResponseDto } from '../../common/swagger/api-response.dto';

@Controller('payments')
@ApiTags('Payments')
@ApiExtraModels(
  PaymentInitResponseDto,
  PaymentInitDataDto,
  PaymentConfirmResponseDto,
  PaymentConfirmDataDto,
  ApiErrorResponseDto,
)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsFacadeService) {}

  @Post('init')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate a payment and issue a confirmation token.' })
  @ApiBody({
    type: InitPaymentDto,
    examples: {
      default: {
        value: {
          document: '1234567890',
          phone: '3001234567',
          amount: 49.99,
        },
      },
    },
  })
  @ApiCreatedResponse({ type: PaymentInitResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  async init(@Body() dto: InitPaymentDto): Promise<PaymentInitResponseDto> {
    return this.paymentsService.initPayment(dto) as Promise<PaymentInitResponseDto>;
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm a pending payment with the issued token.' })
  @ApiBody({
    type: ConfirmPaymentDto,
    examples: {
      default: {
        value: {
          sessionId: '0d0fb38e-9f85-42cf-87e0-123456789abc',
          token6: '123456',
        },
      },
    },
  })
  @ApiOkResponse({ type: PaymentConfirmResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  async confirm(@Body() dto: ConfirmPaymentDto): Promise<PaymentConfirmResponseDto> {
    return this.paymentsService.confirmPayment(dto) as Promise<PaymentConfirmResponseDto>;
  }
}
