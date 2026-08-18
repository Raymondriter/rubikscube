import { caseFromSolution } from '../../algorithm'
import type { AlgorithmCase } from '../../types'

function f2lExample(id: string, name: string, solution: string, highlight: string[]): AlgorithmCase {
  return caseFromSolution({
    id,
    method: 'zz',
    step: 'zz-f2l',
    name,
    group: 'example',
    solution,
    yellowOnU: true,
    recognitionHighlight: highlight,
    tags: ['zz', 'f2l'],
  })
}

/**
 * The 4 mirror algorithms every beginner ZZ guide teaches (sourced, not invented) - RUL-only
 * so they never disturb the edge orientation EOLine established. One per slot, since the
 * pattern is genuinely a mirror/rotation of the same trigger across all four F2L slots.
 * These exist for the 3D demo, not as a case table to memorize wholesale - F2L here is still
 * primarily intuitive (see bodyMd).
 */
export const zzF2lCases: AlgorithmCase[] = [
  f2lExample('zz-f2l-example-fr', 'Front-right pair', "R U R' U'", ['URF', 'RF']),
  f2lExample('zz-f2l-example-br', 'Back-right pair', "R' U' R U", ['URB', 'RB']),
  f2lExample('zz-f2l-example-fl', 'Front-left pair', "L' U' L U", ['ULF', 'LF']),
  f2lExample('zz-f2l-example-bl', 'Back-left pair', "L U L' U'", ['ULB', 'LB']),
]
