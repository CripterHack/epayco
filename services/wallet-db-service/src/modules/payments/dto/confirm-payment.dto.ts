import { Transform } from 'class-transformer';
import { Length } from 'class-validator';

function trimString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export class ConfirmPaymentDto {
  @Length(36, 36)
  @Transform(({ value }) => trimString(value))
  sessionId!: string;

  @Length(6, 6)
  @Transform(({ value }) => trimString(value))
  token6!: string;
}
