import { invertAlgorithmString } from '../engine/notation'
import type { AlgorithmCase } from './types'

/** Strips grouping parens and treats R2' as R2 so published CFOP lists parse cleanly. */
export function sanitizeAlgorithm(raw: string): string {
  return raw
    .replace(/[()]/g, ' ')
    .replace(/([RLUDFBMESrludfbxyz]w?)2'/g, '$12')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(' ')
}

/** Drops the x2 hold we wrap last-layer cases with — not y/z turns that belong to the alg. */
export function studentAlgorithm(algorithm: string): string {
  const tokens = algorithm.trim().split(/\s+/).filter(Boolean)
  if (tokens[0] === 'x2') tokens.shift()
  if (tokens.at(-1) === 'x2') tokens.pop()
  return tokens.join(' ')
}

export function primaryAlgorithm(cubeCase: AlgorithmCase): string {
  const primary = cubeCase.solutions[0]
  if (!primary) throw new Error(`Case "${cubeCase.id}" has no solutions`)
  return primary
}

interface CaseDraft extends Omit<AlgorithmCase, 'setupMoves' | 'solutions'> {
  solution: string
  alternatives?: string[]
  /** Hold yellow on U (white on D) so last-layer / second-layer U-moves match standard notation. */
  yellowOnU?: boolean
}

/** Builds a case whose setup is the inverse of the primary student algorithm. */
export function caseFromSolution(draft: CaseDraft): AlgorithmCase {
  const { solution, alternatives = [], yellowOnU = false, ...rest } = draft
  const primary = sanitizeAlgorithm(solution)
  const alts = alternatives.map(sanitizeAlgorithm)
  const setupMoves = yellowOnU ? `x2 ${invertAlgorithmString(primary)}` : invertAlgorithmString(primary)
  const solutions = [primary, ...alts].map((alg) => (yellowOnU ? `${alg} x2` : alg))
  return { ...rest, setupMoves, solutions }
}
