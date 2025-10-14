import { Transform } from 'class-transformer';
import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

function trim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export class ConfirmPaymentDto {
  @ApiProperty({ example: '0d0fb38e-9f85-42cf-87e0-123456789abc' })
  @Length(36, 36)
  @Transform(({ value }) => trim(value))
  sessionId!: string;

  @ApiProperty({ example: '123456' })
  @Length(6, 6)
  @Transform(({ value }) => trim(value))
  token6!: string;
}
