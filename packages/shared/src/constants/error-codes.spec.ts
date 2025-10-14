import { describe, expect, it } from 'vitest';

import { ErrorCodes } from './error-codes';

describe('ErrorCodes enum', () => {
  it('maps each label to the expected numeric code', () => {
    expect(ErrorCodes.OK).toBe(0);
    expect(ErrorCodes.VALIDATION).toBe(1001);
    expect(ErrorCodes.DUPLICATE).toBe(2001);
    expect(ErrorCodes.INSUFFICIENT_FUNDS).toBe(3001);
    expect(ErrorCodes.NOT_FOUND).toBe(4004);
    expect(ErrorCodes.TOKEN_INVALID).toBe(4010);
    expect(ErrorCodes.TOKEN_EXPIRED).toBe(4011);
    expect(ErrorCodes.INTERNAL).toBe(5000);
  });

  it('does not reuse numeric codes across different labels', () => {
    const numericValues = Object.values(ErrorCodes).filter(
      (value): value is number => typeof value === 'number',
    );
    const uniqueValues = new Set(numericValues);

    expect(uniqueValues.size).toBe(numericValues.length);
  });
});
