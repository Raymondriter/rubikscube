import { describe, expect, it } from 'vitest'
import { cfopCases } from '../cfop'
import { zzOcllCases, zzPllCases } from './lastLayer'
import { zzCases } from './index'

describe('ZZ library sizes', () => {
  it('has 7 OCLL + 21 PLL cases plus EOLine/F2L examples', () => {
    expect(zzOcllCases).toHaveLength(7)
    expect(zzPllCases).toHaveLength(21)
    expect(zzCases.length).toBe(3 + 4 + 7 + 21)
  })

  it('OCLL clones ids 21-27 from CFOP OLL', () => {
    const numbers = zzOcllCases.map((entry) => Number(entry.id.split('-').at(-1)))
    expect(numbers).toEqual([21, 22, 23, 24, 25, 26, 27])
  })

  it('every clone has method zz and no id collides with a CFOP case', () => {
    const cfopIds = new Set(cfopCases.map((entry) => entry.id))
    for (const entry of [...zzOcllCases, ...zzPllCases]) {
      expect(entry.method).toBe('zz')
      expect(cfopIds.has(entry.id)).toBe(false)
    }
  })
})
