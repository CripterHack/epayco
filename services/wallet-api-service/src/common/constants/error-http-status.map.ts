import { HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '@epayco/shared';

export const ERROR_HTTP_STATUS_MAP: Record<ErrorCodes, HttpStatus> = {
  [ErrorCodes.OK]: HttpStatus.OK,
  [ErrorCodes.VALIDATION]: HttpStatus.BAD_REQUEST,
  [ErrorCodes.DUPLICATE]: HttpStatus.CONFLICT,
  [ErrorCodes.INSUFFICIENT_FUNDS]: HttpStatus.BAD_REQUEST,
  [ErrorCodes.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCodes.TOKEN_INVALID]: HttpStatus.UNAUTHORIZED,
  [ErrorCodes.TOKEN_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [ErrorCodes.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
};

export function resolveHttpStatus(code: ErrorCodes): HttpStatus {
  return ERROR_HTTP_STATUS_MAP[code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
}
