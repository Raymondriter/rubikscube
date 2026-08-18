import { caseFromSolution } from '../../algorithm'
import type { AlgorithmCase } from '../../types'

/** The 6 edges LSE works on: the 4 U-layer edges plus DF/DB (the 2 D-layer edges neither block touched). */
const LSE_HIGHLIGHT = ['UF', 'UR', 'UB', 'UL', 'DF', 'DB']

function eoExample(n: number, name: string, solution: string): AlgorithmCase {
  return caseFromSolution({
    id: `roux-lse-eo-example-${n}`,
    method: 'roux',
    step: 'roux-lse-eo',
    name,
    group: 'example',
    solution,
    yellowOnU: true,
    recognitionHighlight: LSE_HIGHLIGHT,
    tags: ['roux', 'lse', 'eo'],
  })
}

function edgesExample(n: number, name: string, solution: string): AlgorithmCase {
  return caseFromSolution({
    id: `roux-lse-edges-example-${n}`,
    method: 'roux',
    step: 'roux-lse-edges',
    name,
    group: 'example',
    solution,
    yellowOnU: true,
    recognitionHighlight: LSE_HIGHLIGHT,
    tags: ['roux', 'lse', 'edges'],
  })
}

function l6eExample(n: number, name: string, solution: string): AlgorithmCase {
  return caseFromSolution({
    id: `roux-lse-l6e-example-${n}`,
    method: 'roux',
    step: 'roux-lse-l6e',
    name,
    group: 'example',
    solution,
    yellowOnU: true,
    recognitionHighlight: LSE_HIGHLIGHT,
    tags: ['roux', 'lse', 'l6e'],
  })
}

/**
 * Illustrative worked examples, not a memorized case table - real Roux tutorials teach LSE
 * through one M/U "arrow" trigger applied after counting + repositioning, not a fixed list
 * (confirmed against tutorial.rouxers.com/beginners/lse.html). These exist for the 3D demo.
 */
export const rouxLseEoCases: AlgorithmCase[] = [
  eoExample(1, 'Arrow already lined up', "M' U2 M"),
  eoExample(2, 'One reposition, then the trigger', "U2 M' U2 M"),
  eoExample(3, 'Two triggers needed', "M' U2 M U2 M' U2 M"),
]

export const rouxLseEdgesCases: AlgorithmCase[] = [
  edgesExample(1, 'Both target edges already on D', 'M2'),
  edgesExample(2, 'One quarter-turn setup first', "U' M2 U"),
  edgesExample(3, 'Full sequence with a swap', "M' U2 M U M2 U'"),
]

export const rouxLseL6eCases: AlgorithmCase[] = [
  l6eExample(1, 'Both edges cycle together', 'M2 U2 M2 U2'),
  l6eExample(2, 'Single 4-cycle', 'M2 U M2 U2 M2 U M2'),
  l6eExample(3, 'Longer cleanup', "M2 U2 M2 U M2 U2 M2 U' M2"),
]
