import { describe, expect, it } from 'vitest'
import { rouxCmllCases } from './cmll'
import { rouxCases } from './index'

describe('Roux library sizes', () => {
  it('has 42 CMLL cases plus block-building and LSE examples', () => {
    expect(rouxCmllCases).toHaveLength(42)
    expect(rouxCases.length).toBe(3 + 3 + 42 + 3 + 3 + 3)
  })

  it('numbers CMLL 1-42 without gaps', () => {
    const numbers = rouxCmllCases.map((entry) => Number(entry.id.slice(-2)))
    expect(numbers).toEqual(Array.from({ length: 42 }, (_, i) => i + 1))
  })
})
