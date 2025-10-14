import { ApiProperty } from '@nestjs/swagger';
import { ApiSuccessResponseDto } from '../../../common/swagger/api-response.dto';

export class RegisterClientDataDto {
  @ApiProperty({ example: 'b8eaa9dd-0b53-4a2c-90ab-b5a9f9a7b9a6' })
  customerId!: string;
}

export class RegisterClientResponseDto extends ApiSuccessResponseDto<RegisterClientDataDto> {
  @ApiProperty({ type: RegisterClientDataDto, required: false })
  data?: RegisterClientDataDto;
}
