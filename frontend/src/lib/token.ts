export function parseWholeUnits(value: string): bigint {
  const normalized = value.trim();

  if (!/^\d+$/.test(normalized)) {
    throw new Error('Initial supply must be a non-negative integer');
  }

  return BigInt(normalized);
}
