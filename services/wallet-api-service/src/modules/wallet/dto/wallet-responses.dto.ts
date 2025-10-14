import { ApiProperty } from '@nestjs/swagger';
import { ApiSuccessResponseDto } from '../../../common/swagger/api-response.dto';

export class WalletBalanceDataDto {
  @ApiProperty({ example: 120.5 })
  balance!: number;
}

export class WalletBalanceResponseDto extends ApiSuccessResponseDto<WalletBalanceDataDto> {
  @ApiProperty({ type: WalletBalanceDataDto, required: false })
  data?: WalletBalanceDataDto;
}

export class WalletTopUpDataDto {
  @ApiProperty({ example: 150.75 })
  balance!: number;
}

export class WalletTopUpResponseDto extends ApiSuccessResponseDto<WalletTopUpDataDto> {
  @ApiProperty({ type: WalletTopUpDataDto, required: false })
  data?: WalletTopUpDataDto;
}
