import { describe, expect, expectTypeOf, it } from 'vitest';

import { ErrorCodes } from '../constants/error-codes';
import type { ApiResponse, PaymentInitResponse, ValidationErrorDetail } from './responses';

describe('API response contracts', () => {
  it('supports successful payloads with strongly typed data', () => {
    const payload: PaymentInitResponse = {
      sessionId: 'session-123',
      expiresAt: '2025-10-06T12:00:00.000Z',
    };

    const response: ApiResponse<PaymentInitResponse> = {
      code: ErrorCodes.OK,
      message: 'Payment session created',
      data: payload,
    };

    expect(response.code).toBe(ErrorCodes.OK);
    expect(response.data).toEqual(payload);
    expectTypeOf(response.data).toEqualTypeOf<PaymentInitResponse | undefined>();
  });

  it('captures validation details when the request is invalid', () => {
    const errors: ValidationErrorDetail[] = [
      { field: 'email', message: 'Formato invalido' },
      { field: 'phone', message: 'Debe contener 10 digitos' },
    ];

    const response: ApiResponse = {
      code: ErrorCodes.VALIDATION,
      message: 'Validation failed',
      errors,
    };

    expect(response.errors).toHaveLength(2);
    expect(response.errors).toContainEqual(
      expect.objectContaining({ field: 'email', message: 'Formato invalido' }),
    );
    expectTypeOf(response.errors).toEqualTypeOf<ValidationErrorDetail[] | undefined>();
  });
});
