import type { AlgorithmCase } from '../../types'
import { cfopOllCases } from '../cfop/oll'
import { cfopPllCases } from '../cfop/pll'

/**
 * ZZ's OCLL and PLL use the exact same algorithms as CFOP's (same physical moves at that
 * stage of either method - CFOP OLL 21-27 are already the 7 pure corner-orientation cases,
 * and full PLL is identical). cases.test.ts requires every case's `method` field to match its
 * owning Method, so we clone with rewritten id/method/step/tags rather than referencing the
 * CFOP OLL/PLL ids directly - setupMoves/solutions are copied verbatim, no re-derivation or
 * re-sourcing needed.
 */
function cloneForZz(original: AlgorithmCase, idPrefix: string, step: string): AlgorithmCase {
  const suffix = original.id.split('-').at(-1)
  const tags = original.tags.map((tag) => (tag === 'cfop' ? 'zz' : tag === 'oll' ? 'ocll' : tag))
  return { ...original, id: `${idPrefix}-${suffix}`, method: 'zz', step, tags }
}

export const zzOcllCases: AlgorithmCase[] = cfopOllCases
  .slice(20, 27)
  .map((c) => cloneForZz(c, 'zz-ocll', 'zz-ocll'))
  .map((c) => ({ ...c, name: c.name.replace(/^OLL /, 'OCLL ') }))

export const zzPllCases: AlgorithmCase[] = cfopPllCases.map((c) => cloneForZz(c, 'zz-pll', 'zz-pll'))
