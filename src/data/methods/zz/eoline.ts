import { caseFromSolution } from '../../algorithm'
import type { AlgorithmCase } from '../../types'

/** The "line": DF and DB, the two D-layer edges EOLine places once every edge is oriented. */
const EOLINE_HIGHLIGHT = ['DF', 'DB']

function eolineExample(n: number, name: string, solution: string): AlgorithmCase {
  return caseFromSolution({
    id: `zz-eoline-example-${n}`,
    method: 'zz',
    step: 'zz-eoline',
    name,
    group: 'example',
    solution,
    yellowOnU: true,
    recognitionHighlight: EOLINE_HIGHLIGHT,
    tags: ['zz', 'eoline'],
  })
}

/**
 * Illustrative worked examples, not a memorized case table - EOLine is genuinely taught via
 * decision-tree intuition (count bad edges, set up a group to F or B, one quarter turn to fix
 * them), confirmed against a real beginner ZZ guide. These exist for the 3D demo.
 */
export const zzEolineCases: AlgorithmCase[] = [
  eolineExample(1, 'Edges already oriented, just place the line', "R U' L'"),
  eolineExample(2, 'One group of four to orient', "F2 D R U' L' D'"),
  eolineExample(3, 'Full EOLine from a scramble', "F2 B2 D' R U' L' U R' D F2"),
]
