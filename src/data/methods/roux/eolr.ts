import { caseFromSolution } from '../../algorithm'
import type { AlgorithmCase } from '../../types'

/** The 6 LSE edges - same highlight as the intuitive EO/edges/finish steps this collapses. */
const EOLR_HIGHLIGHT = ['UF', 'UR', 'UB', 'UL', 'DF', 'DB']

function eolr(n: number, name: string, group: string, solution: string, alternatives?: string[]): AlgorithmCase {
  return caseFromSolution({
    id: `roux-eolr-${String(n).padStart(2, '0')}`,
    method: 'roux',
    step: 'roux-eolr',
    name: `EOLR ${n} · ${name}`,
    group,
    solution,
    alternatives,
    yellowOnU: true,
    recognitionHighlight: EOLR_HIGHLIGHT,
    tags: ['roux', 'eolr', group],
  })
}

/**
 * 47 EOLR (Edge Orientation Left/Right) cases - collapses the intuitive EO + UL/UR-placement
 * steps into one memorized table. Algorithms from cubingapp.com's structured LSE-EOLR list.
 * All-M/U except case 41 (2 Opp/0, DF DB), which needs R/U/M (not M/U-only) - a documented
 * exception, not a typo. The source also lists a second alg for case 41 ("U S R' F R S' R'
 * F' R") - dropped, since it isn't corner-neutral (verified against this engine: it leaves 4
 * U-layer corners displaced instead of returning them home) and never independently solves the
 * case, unlike every other primary/alternate pair here. The primary alone is fully verified.
 */
export const rouxEolrCases: AlgorithmCase[] = [
  // Arrow (4)
  eolr(1, 'Arrow (UF DF)', 'arrow', 'M'),
  eolr(2, 'Arrow (UB UR)', 'arrow', "M' U M"),
  eolr(3, 'Arrow (UF UR)', 'arrow', "U M' U2 M U M"),
  eolr(4, 'Arrow (DF DB)', 'arrow', "U' M U' M' U' M"),

  // 1/1 (11)
  eolr(5, '1/1 (UF UR)', 'one-one', "M' U M' U M U M"),
  eolr(6, '1/1 (UF DF)', 'one-one', "M U M' U M U M'"),
  eolr(7, '1/1 (UF DF)', 'one-one', "U' M' U M' U2 M U M"),
  eolr(8, '1/1 (UF UB)', 'one-one', "M U' M' U2 M' U2 M' U M"),
  eolr(9, '1/1 (UR UB)', 'one-one', "M U' M' U' M'"),
  eolr(10, '1/1 (UR UL)', 'one-one', "U' M' U M' U2 M U M'"),
  eolr(11, '1/1 (UR DF)', 'one-one', "M' U' M' U' M'"),
  eolr(12, '1/1 (UR DB)', 'one-one', "M U M' U M U M"),
  eolr(13, '1/1 (UB DF)', 'one-one', "U M' U2 M U M U M' U M'"),
  eolr(14, '1/1 (UB DB)', 'one-one', "U' M' U M' U2 M'"),
  eolr(15, '1/1 (DF DB)', 'one-one', "M' U' M' U2 M' U2 M' U M"),

  // 2 Adj/2 (7)
  eolr(16, '2 Adj/2 (UF UL)', 'two-adj-two', "U M' U2 M U M U M"),
  eolr(17, '2 Adj/2 (UF UR)', 'two-adj-two', "M' U' M U2 M U2 M' U M'"),
  eolr(18, '2 Adj/2 (UF UB)', 'two-adj-two', "U M' U' M' U' M' U' M"),
  eolr(19, '2 Adj/2 (UL UB)', 'two-adj-two', "U' M2 U M'"),
  eolr(20, '2 Adj/2 (UF DF)', 'two-adj-two', "U' M2 U M U M"),
  eolr(21, '2 Adj/2 (UL DF)', 'two-adj-two', "U2 M' U2 M' U M'"),
  eolr(22, '2 Adj/2 (DF DB)', 'two-adj-two', "U M' U' M' U' M' U' M'"),

  // 2 Adj/0 (7)
  eolr(23, '2 Adj/0 (UF UL)', 'two-adj-zero', "U M' U' M' U2 M"),
  eolr(24, '2 Adj/0 (UF UR)', 'two-adj-zero', "M' U2 M' U' M' U' M U' M"),
  eolr(25, '2 Adj/0 (UF UB)', 'two-adj-zero', "M' U M U M' U2 M U' M"),
  eolr(26, '2 Adj/0 (UL UB)', 'two-adj-zero', "U M' U' M' U M U' M' U' M"),
  eolr(27, '2 Adj/0 (UF DF)', 'two-adj-zero', "U2 M U M' U2 M U' M'"),
  eolr(28, '2 Adj/0 (UL DF)', 'two-adj-zero', "M' U M' U2 M' U M"),
  eolr(29, '2 Adj/0 (DF DB)', 'two-adj-zero', "M' U M' U2 M' U' M'"),

  // 2 Opp/2 (6)
  eolr(30, '2 Opp/2 (UF UR)', 'two-opp-two', "M' U2 M' U2 M U M"),
  eolr(31, '2 Opp/2 (UR UL)', 'two-opp-two', "M2 U' M' U2 M' U2 M"),
  eolr(32, '2 Opp/2 (UF DF)', 'two-opp-two', "M2 U' M' U2 M' U2 M' U M'"),
  eolr(33, '2 Opp/2 (DF DB)', 'two-opp-two', "M' U2 M' U2 M'"),
  eolr(34, '2 Opp/2 (UR DF)', 'two-opp-two', "M' U2 M U M U2 M' U' M'"),
  eolr(35, '2 Opp/2 (UF UB)', 'two-opp-two', "M' U2 M' U2 M U' M U' M' U2 M"),

  // 2 Opp/0 (6)
  eolr(36, '2 Opp/0 (UF UR)', 'two-opp-zero', "M' U' M U M' U M'"),
  eolr(37, '2 Opp/0 (UF UB)', 'two-opp-zero', "M' U' M U M' U' M'"),
  eolr(38, '2 Opp/0 (UF DF)', 'two-opp-zero', "M U M' U' M U' M'"),
  eolr(39, '2 Opp/0 (UR DF)', 'two-opp-zero', "M' U M U' M"),
  eolr(40, '2 Opp/0 (UR UL)', 'two-opp-zero', "M' U' M' U' M' U2 M U' M'"),
  eolr(41, '2 Opp/0 (DF DB)', 'two-opp-zero', "R U R' U' M' U R U' r'"),

  // 0/2 (4)
  eolr(42, '0/2 (UF UR)', 'zero-two', "M' U' M' U M'"),
  eolr(43, '0/2 (UL UR)', 'zero-two', "M' U' M U' M U2 M' U' M"),
  eolr(44, '0/2 (UF DF)', 'zero-two', "U M' U' M' U M U M"),
  eolr(45, '0/2 (DF DB)', 'zero-two', "M' U' M' U M U' M'"),

  // All 6 (2)
  eolr(46, 'All 6 (UF DF)', 'all-six', "U' M U M' U' M U' M' U2 M"),
  eolr(47, 'All 6 (DF DB)', 'all-six', "M' U' M' U' M U' M' U2 M' U' M"),
]
