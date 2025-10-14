import { Transform } from 'class-transformer';
import { IsNumber, IsPositive, Length } from 'class-validator';

function trimString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumberValue(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  return NaN;
}

export class TopUpWalletDto {
  @Length(5, 20)
  @Transform(({ value }) => trimString(value))
  document!: string;

  @Length(7, 20)
  @Transform(({ value }) => trimString(value))
  phone!: string;

  @Transform(({ value }) => toNumberValue(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;
}
