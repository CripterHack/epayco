import { Transform } from 'class-transformer';
import { Length } from 'class-validator';

function trimString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export class BalanceQueryDto {
  @Length(5, 20)
  @Transform(({ value }) => trimString(value))
  document!: string;

  @Length(7, 20)
  @Transform(({ value }) => trimString(value))
  phone!: string;
}
