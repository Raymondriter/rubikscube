import type { AlgorithmCase } from '../types'
import { beginnerCases } from './beginner'
import { cfopCases } from './cfop'

export {
  adjacentSteps,
  firstIncompleteStep,
  methodById,
  methods,
  methodsById,
  stepById,
} from './catalog'

export const allCases: AlgorithmCase[] = [...beginnerCases, ...cfopCases]

export const casesById: Record<string, AlgorithmCase> = Object.fromEntries(
  allCases.map((cubeCase) => [cubeCase.id, cubeCase]),
)

export function casesForMethod(methodId: string): AlgorithmCase[] {
  return allCases.filter((cubeCase) => cubeCase.method === methodId)
}

export function caseById(id: string): AlgorithmCase {
  const cubeCase = casesById[id]
  if (!cubeCase) throw new Error(`Unknown algorithm case: "${id}"`)
  return cubeCase
}

export function casesForStep(step: { demoCaseIds: string[] }): AlgorithmCase[] {
  return step.demoCaseIds.map(caseById)
}
