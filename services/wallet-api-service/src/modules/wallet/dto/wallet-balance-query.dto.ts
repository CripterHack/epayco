import { Transform } from 'class-transformer';
import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

function trim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export class WalletBalanceQueryDto {
  @ApiProperty({ example: '1234567890' })
  @Length(5, 20)
  @Transform(({ value }) => trim(value))
  document!: string;

  @ApiProperty({ example: '3001234567' })
  @Length(7, 20)
  @Transform(({ value }) => trim(value))
  phone!: string;
}
