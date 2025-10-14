import { Transform } from 'class-transformer';
import { IsNumber, IsPositive, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

function trim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    return Number(value);
  }
  return NaN;
}

export class InitPaymentDto {
  @ApiProperty({ example: '1234567890' })
  @Length(5, 20)
  @Transform(({ value }) => trim(value))
  document!: string;

  @ApiProperty({ example: '3001234567' })
  @Length(7, 20)
  @Transform(({ value }) => trim(value))
  phone!: string;

  @ApiProperty({ example: 25.99 })
  @Transform(({ value }) => toNumber(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;
}
