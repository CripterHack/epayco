import { ApiResponse, ErrorCodes } from '@epayco/shared';
import { HttpStatus } from '@nestjs/common';
import { ApiErrorException } from '../exceptions/api-error.exception';
import { resolveHttpStatus } from '../constants/error-http-status.map';

export function ensureSuccess<T>(
  response: ApiResponse<T>,
  fallbackStatus: HttpStatus,
): ApiResponse<T> {
  if (response.code === ErrorCodes.OK) {
    return response;
  }

  const status = resolveHttpStatus(response.code) ?? fallbackStatus;
  throw new ApiErrorException(status, response.code, response.message, response.errors);
}

export function wrapSuccess<T>(data: ApiResponse<T>, message?: string): ApiResponse<T> {
  return {
    ...data,
    message: message ?? data.message,
  };
}
