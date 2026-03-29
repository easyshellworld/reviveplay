import { describe, expect, it } from 'vitest';
import { parseWholeUnits } from './token';

describe('parseWholeUnits', () => {
  it('parses whole-number supplies into bigint', () => {
    expect(parseWholeUnits('1000000')).toBe(1000000n);
    expect(parseWholeUnits(' 42 ')).toBe(42n);
  });

  it('rejects decimal and negative supplies', () => {
    expect(() => parseWholeUnits('1.5')).toThrow('Initial supply must be a non-negative integer');
    expect(() => parseWholeUnits('-2')).toThrow('Initial supply must be a non-negative integer');
  });
});
