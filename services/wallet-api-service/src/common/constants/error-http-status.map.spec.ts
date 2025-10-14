import { HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '@epayco/shared';

import { ERROR_HTTP_STATUS_MAP, resolveHttpStatus } from './error-http-status.map';

describe('ERROR_HTTP_STATUS_MAP', () => {
  it('covers every shared error code with an explicit status', () => {
    const mappedCodes = Object.keys(ERROR_HTTP_STATUS_MAP).map((value) => Number(value));
    const expectedCodes = Object.values(ErrorCodes).filter(
      (value): value is number => typeof value === 'number',
    );

    expect(new Set(mappedCodes)).toEqual(new Set(expectedCodes));
  });

  it('maps known codes to the documented HTTP status', () => {
    expect(ERROR_HTTP_STATUS_MAP[ErrorCodes.OK]).toBe(HttpStatus.OK);
    expect(ERROR_HTTP_STATUS_MAP[ErrorCodes.VALIDATION]).toBe(HttpStatus.BAD_REQUEST);
    expect(ERROR_HTTP_STATUS_MAP[ErrorCodes.DUPLICATE]).toBe(HttpStatus.CONFLICT);
    expect(ERROR_HTTP_STATUS_MAP[ErrorCodes.INSUFFICIENT_FUNDS]).toBe(HttpStatus.BAD_REQUEST);
    expect(ERROR_HTTP_STATUS_MAP[ErrorCodes.NOT_FOUND]).toBe(HttpStatus.NOT_FOUND);
    expect(ERROR_HTTP_STATUS_MAP[ErrorCodes.TOKEN_INVALID]).toBe(HttpStatus.UNAUTHORIZED);
    expect(ERROR_HTTP_STATUS_MAP[ErrorCodes.TOKEN_EXPIRED]).toBe(HttpStatus.UNAUTHORIZED);
    expect(ERROR_HTTP_STATUS_MAP[ErrorCodes.INTERNAL]).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('falls back to internal server error for unknown codes', () => {
    const unknown = 9999 as ErrorCodes;

    expect(resolveHttpStatus(unknown)).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
