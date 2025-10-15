import { describe, expect, it } from 'vitest';

import { formatCOP } from '../currency';

describe('formatCOP', () => {
  it('formats large numbers with grouping separators and currency symbol', () => {
    expect(formatCOP(1234567)).toBe('$ 1.234.567');
  });

  it('rounds fractional values to the nearest peso', () => {
    expect(formatCOP(1999.6)).toBe('$ 2.000');
    expect(formatCOP(1999.4)).toBe('$ 1.999');
  });

  it('keeps the minus sign for negative values', () => {
    expect(formatCOP(-420)).toBe('-$ 420');
  });
});
