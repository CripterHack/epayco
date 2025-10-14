const SCALE = 100n;

export function toMinorUnits(value: string | number): bigint {
  const normalized = value.toString().trim();
  if (!normalized) {
    return 0n;
  }

  const isNegative = normalized.startsWith('-');
  const unsigned = isNegative ? normalized.slice(1) : normalized;
  const [wholePartRaw, decimalPartRaw = ''] = unsigned.split('.');
  const wholePart = wholePartRaw ? BigInt(wholePartRaw) : 0n;
  const fractionalPart = decimalPartRaw.padEnd(2, '0').slice(0, 2);
  const fractional = fractionalPart ? BigInt(fractionalPart) : 0n;
  const total = wholePart * SCALE + fractional;
  return isNegative ? -total : total;
}

export function fromMinorUnits(value: bigint): string {
  const isNegative = value < 0n;
  const absolute = isNegative ? -value : value;
  const whole = absolute / SCALE;
  const fractional = absolute % SCALE;
  const formatted = `${whole.toString()}.${fractional.toString().padStart(2, '0')}`;
  return isNegative ? `-${formatted}` : formatted;
}

export function toNumber(value: bigint): number {
  return Number(value) / Number(SCALE);
}
