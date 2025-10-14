import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from '@epayco/shared';

export class ApiErrorResponseDto {
  @ApiProperty({ example: ErrorCodes.INTERNAL })
  code!: ErrorCodes;

  @ApiProperty({ example: 'Unexpected error' })
  message!: string;

  @ApiProperty({ required: false, example: [{ field: 'email', message: 'Invalid email' }] })
  errors?: Array<{ field: string; message: string }>;
}

export class ApiSuccessResponseDto<T> {
  @ApiProperty({ example: ErrorCodes.OK })
  code!: ErrorCodes;

  @ApiProperty({ example: 'Operation completed successfully.' })
  message!: string;

  @ApiProperty({ required: false })
  data?: T;
}
