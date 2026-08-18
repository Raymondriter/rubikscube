import { describe, expect, it } from 'vitest'
import { applyAlgorithm, createSolvedCubies } from '../engine/cubeState'
import { parseAlgorithm } from '../engine/notation'
import { isColorSolved, isSolved } from '../engine/solvedCheck'
import { primaryAlgorithm, studentAlgorithm } from './algorithm'
import { allCases, caseById, methods } from './methods'

describe('method content', () => {
  it('every demoCaseId resolves to a case on the same method and step', () => {
    for (const method of methods) {
      for (const step of method.steps) {
        for (const id of step.demoCaseIds) {
          const cubeCase = caseById(id)
          expect(cubeCase.method, id).toBe(method.id)
        }
      }
    }
  })

  it('every case is referenced by its step', () => {
    const referenced = new Set(methods.flatMap((method) => method.steps.flatMap((step) => step.demoCaseIds)))
    for (const cubeCase of allCases) {
      expect(referenced.has(cubeCase.id), cubeCase.id).toBe(true)
    }
  })

  it('case ids are unique', () => {
    const ids = allCases.map((cubeCase) => cubeCase.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('setup + primary algorithm = solved', () => {
  it.each(allCases.map((cubeCase) => [cubeCase.id, cubeCase] as const))('%s', (_id, cubeCase) => {
    const cubies = createSolvedCubies()
    applyAlgorithm(cubies, parseAlgorithm(cubeCase.setupMoves))
    expect(isSolved(cubies), `${cubeCase.id} setup should leave the cube unsolved`).toBe(false)
    applyAlgorithm(cubies, parseAlgorithm(primaryAlgorithm(cubeCase)))
    expect(isSolved(cubies), `${cubeCase.id} setup + primary should solve`).toBe(true)
  })

  it('the student-facing algorithm color-solves the setup (practice win condition)', () => {
    for (const cubeCase of allCases) {
      const cubies = createSolvedCubies()
      applyAlgorithm(cubies, parseAlgorithm(cubeCase.setupMoves))
      applyAlgorithm(cubies, parseAlgorithm(studentAlgorithm(primaryAlgorithm(cubeCase))))
      expect(isColorSolved(cubies), cubeCase.id).toBe(true)
    }
  })

  it('alternative solutions also undo the same setup', () => {
    for (const cubeCase of allCases) {
      for (const solution of cubeCase.solutions.slice(1)) {
        const cubies = createSolvedCubies()
        applyAlgorithm(cubies, parseAlgorithm(cubeCase.setupMoves))
        applyAlgorithm(cubies, parseAlgorithm(solution))
        expect(isSolved(cubies), `${cubeCase.id} alt "${solution}"`).toBe(true)
      }
    }
  })
})

describe('studentAlgorithm', () => {
  it('strips the yellow-on-U bookkeeping rotations', () => {
    expect(studentAlgorithm("x2 F R U R' U' F' x2")).toBe("F R U R' U' F'")
    expect(studentAlgorithm('F2')).toBe('F2')
  })
})
