import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponse, ErrorCodes, ValidationErrorDetail } from '@epayco/shared';

export class ApiErrorException extends HttpException {
  constructor(
    status: HttpStatus,
    code: ErrorCodes,
    message: string,
    errors?: ValidationErrorDetail[],
  ) {
    const payload: ApiResponse = {
      code,
      message,
      errors,
    };
    super(payload, status);
  }
}
