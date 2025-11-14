// Test for validateScrap utility
import { validateScrap } from './scrapValidation'

describe('validateScrap', () => {
  test('allows valid positive numbers', () => {
    expect(validateScrap(100)).toBe(100)
  })

  test('floors decimal values', () => {
    expect(validateScrap(10.7)).toBe(10)
  })

  test('rejects negative values', () => {
    expect(validateScrap(-5)).toBe(0)
  })

  test('rejects NaN', () => {
    expect(validateScrap(NaN)).toBe(0)
  })

  test('rejects Infinity', () => {
    expect(validateScrap(Infinity)).toBe(0)
  })
})
