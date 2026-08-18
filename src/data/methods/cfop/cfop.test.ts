import { describe, expect, it } from 'vitest'
import { cfopF2lCases } from './f2l'
import { cfopOllCases } from './oll'
import { cfopPllCases } from './pll'
import { cfopCases } from './index'

describe('CFOP library sizes', () => {
  it('has the full 119 algorithm cases plus the two cross demos', () => {
    expect(cfopF2lCases).toHaveLength(41)
    expect(cfopOllCases).toHaveLength(57)
    expect(cfopPllCases).toHaveLength(21)
    expect(cfopCases.length).toBe(41 + 57 + 21 + 2)
  })

  it('numbers OLL 1–57 without gaps', () => {
    const numbers = cfopOllCases.map((entry) => Number(entry.id.slice(-2)))
    expect(numbers).toEqual(Array.from({ length: 57 }, (_, i) => i + 1))
  })
})
