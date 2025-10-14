import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

function trim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export class RegisterClientDto {
  @ApiProperty({ example: '1234567890', minLength: 5, maxLength: 20 })
  @IsNotEmpty()
  @Length(5, 20)
  @Transform(({ value }) => trim(value))
  document!: string;

  @ApiProperty({ example: 'Ada Lovelace', minLength: 2, maxLength: 160 })
  @IsNotEmpty()
  @Length(2, 160)
  @Transform(({ value }) => trim(value))
  fullName!: string;

  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail()
  @Transform(({ value }) => trim(value))
  email!: string;

  @ApiProperty({ example: '3001234567', minLength: 7, maxLength: 20 })
  @IsNotEmpty()
  @Length(7, 20)
  @Transform(({ value }) => trim(value))
  phone!: string;
}
