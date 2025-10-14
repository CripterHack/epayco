import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

function trimString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export class RegisterCustomerDto {
  @IsNotEmpty()
  @Length(5, 20)
  @Transform(({ value }) => trimString(value))
  document!: string;

  @IsNotEmpty()
  @Length(2, 160)
  @Transform(({ value }) => trimString(value))
  fullName!: string;

  @IsEmail()
  @Transform(({ value }) => trimString(value))
  email!: string;

  @IsNotEmpty()
  @Length(7, 20)
  @Transform(({ value }) => trimString(value))
  phone!: string;
}
