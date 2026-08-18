import { caseFromSolution } from '../../algorithm'
import type { AlgorithmCase } from '../../types'

// Slot ids follow the engine's canonical U/D, then R/L, then F/B order (src/engine/cubeState.ts).
const FIRST_BLOCK_HIGHLIGHT = ['DL', 'DLF', 'LF', 'DLB', 'LB']
const SECOND_BLOCK_HIGHLIGHT = ['DR', 'DRF', 'RF', 'DRB', 'RB']

function firstBlockExample(n: number, name: string, solution: string): AlgorithmCase {
  return caseFromSolution({
    id: `roux-fb-example-${n}`,
    method: 'roux',
    step: 'roux-first-block',
    name,
    group: 'example',
    solution,
    yellowOnU: true,
    recognitionHighlight: FIRST_BLOCK_HIGHLIGHT,
    tags: ['roux', 'first-block'],
  })
}

function secondBlockExample(n: number, name: string, solution: string): AlgorithmCase {
  return caseFromSolution({
    id: `roux-sb-example-${n}`,
    method: 'roux',
    step: 'roux-second-block',
    name,
    group: 'example',
    solution,
    yellowOnU: true,
    recognitionHighlight: SECOND_BLOCK_HIGHLIGHT,
    tags: ['roux', 'second-block'],
  })
}

/**
 * Illustrative worked examples, not memorized algorithms - block-building is intuitive/freeform,
 * so these exist for the 3D demo, not as "the" answer (see roux-first-block/-second-block bodyMd).
 */
export const rouxFirstBlockCases: AlgorithmCase[] = [
  firstBlockExample(1, 'Free pair, drop straight in', "U' L' U L"),
  firstBlockExample(2, 'Split pair, corner in U first', "U L U2 L' U' L U L'"),
  firstBlockExample(3, 'Edge parked in the middle layer', "L' U' L U L F' L' F"),
]

export const rouxSecondBlockCases: AlgorithmCase[] = [
  secondBlockExample(1, 'Free pair, drop straight in', "U' R' U R"),
  secondBlockExample(2, 'Split pair, corner in U first', "U' R U2 R' U R U' R'"),
  secondBlockExample(3, 'Edge parked in the middle layer', "R U R' U' R F' R' F"),
]
