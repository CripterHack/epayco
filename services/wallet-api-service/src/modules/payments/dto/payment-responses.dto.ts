import { ApiProperty } from '@nestjs/swagger';
import { ApiSuccessResponseDto } from '../../../common/swagger/api-response.dto';

export class PaymentInitDataDto {
  @ApiProperty({ example: '0d0fb38e-9f85-42cf-87e0-123456789abc' })
  sessionId!: string;

  @ApiProperty({ example: '2025-10-03T02:45:00.000Z' })
  expiresAt!: string;
}

export class PaymentInitResponseDto extends ApiSuccessResponseDto<PaymentInitDataDto> {
  @ApiProperty({ type: PaymentInitDataDto, required: false })
  data?: PaymentInitDataDto;
}

export class PaymentConfirmDataDto {
  @ApiProperty({ example: 75.4 })
  balance!: number;
}

export class PaymentConfirmResponseDto extends ApiSuccessResponseDto<PaymentConfirmDataDto> {
  @ApiProperty({ type: PaymentConfirmDataDto, required: false })
  data?: PaymentConfirmDataDto;
}
