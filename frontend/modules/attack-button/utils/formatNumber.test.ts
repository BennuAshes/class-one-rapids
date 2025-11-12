import { formatNumber } from './formatNumber'

describe('formatNumber', () => {
  test('formats small numbers without commas', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(1)).toBe('1')
    expect(formatNumber(999)).toBe('999')
  })

  test('formats thousands with commas', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(12345)).toBe('12,345')
    expect(formatNumber(999999)).toBe('999,999')
  })

  test('formats millions with commas', () => {
    expect(formatNumber(1000000)).toBe('1,000,000')
    expect(formatNumber(12345678)).toBe('12,345,678')
  })

  test('formats MAX_SAFE_INTEGER correctly', () => {
    expect(formatNumber(Number.MAX_SAFE_INTEGER)).toBe('9,007,199,254,740,991')
  })
})
