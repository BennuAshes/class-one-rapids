import { formatNumber } from './formatNumber';

describe('formatNumber', () => {
  test('formats zero correctly', () => {
    expect(formatNumber(0)).toBe('0');
  });

  test('formats small numbers without separators', () => {
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(99)).toBe('99');
    expect(formatNumber(999)).toBe('999');
  });

  test('formats thousands with comma separator', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1234)).toBe('1,234');
  });

  test('formats millions with comma separators', () => {
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  test('formats billions with comma separators', () => {
    expect(formatNumber(1000000000)).toBe('1,000,000,000');
  });

  test('handles large numbers within JavaScript safe integer range', () => {
    expect(formatNumber(999999999999)).toBe('999,999,999,999');
  });

  test('handles negative numbers (edge case)', () => {
    expect(formatNumber(-1234)).toBe('-1,234');
  });

  test('handles decimal numbers', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
  });
});
