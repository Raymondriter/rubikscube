import { describe, expect, it } from 'vitest'
import { rouxCmllCases } from './cmll'
import { rouxEolrCases } from './eolr'
import { rouxCases } from './index'

describe('Roux library sizes', () => {
  it('has 42 CMLL cases plus block-building, LSE examples, and 47 EOLR cases', () => {
    expect(rouxCmllCases).toHaveLength(42)
    expect(rouxEolrCases).toHaveLength(47)
    expect(rouxCases.length).toBe(3 + 3 + 42 + 3 + 3 + 3 + 47)
  })

  it('numbers CMLL 1-42 without gaps', () => {
    const numbers = rouxCmllCases.map((entry) => Number(entry.id.slice(-2)))
    expect(numbers).toEqual(Array.from({ length: 42 }, (_, i) => i + 1))
  })

  it('numbers EOLR 1-47 without gaps', () => {
    const numbers = rouxEolrCases.map((entry) => Number(entry.id.slice(-2)))
    expect(numbers).toEqual(Array.from({ length: 47 }, (_, i) => i + 1))
  })
})
