import { describe, expect, it } from 'vitest'
import { applyAlgorithm, applyMove, createSolvedCubies } from './cubeState'
import { isColorSolved, isSolved } from './solvedCheck'
import { parseAlgorithm, parseMove, inverseAlgorithm } from './notation'
import { generateScramble, applyScramble } from './scramble'

describe('createSolvedCubies', () => {
  it('builds exactly 26 pieces: 8 corners + 12 edges + 6 centers', () => {
    const cubies = createSolvedCubies()
    expect(cubies).toHaveLength(26)
    expect(cubies.filter((c) => c.kind === 'corner')).toHaveLength(8)
    expect(cubies.filter((c) => c.kind === 'edge')).toHaveLength(12)
    expect(cubies.filter((c) => c.kind === 'center')).toHaveLength(6)
  })

  it('starts solved', () => {
    expect(isSolved(createSolvedCubies())).toBe(true)
    expect(isColorSolved(createSolvedCubies())).toBe(true)
  })
})

describe('isColorSolved', () => {
  it('stays true after a whole-cube rotation, unlike isSolved', () => {
    const cubies = createSolvedCubies()
    applyMove(cubies, parseMove('x2'))
    expect(isSolved(cubies)).toBe(false)
    expect(isColorSolved(cubies)).toBe(true)
  })

  it('is false after a single face turn', () => {
    const cubies = createSolvedCubies()
    applyMove(cubies, parseMove('R'))
    expect(isColorSolved(cubies)).toBe(false)
  })
})

describe('applyMove identities', () => {
  it('any single quarter-turn move applied 4 times returns to solved', () => {
    for (const face of ['R', 'L', 'U', 'D', 'F', 'B', 'M', 'E', 'S', 'x', 'y', 'z']) {
      const cubies = createSolvedCubies()
      const move = parseMove(face)
      applyMove(cubies, move)
      applyMove(cubies, move)
      applyMove(cubies, move)
      expect(isSolved(cubies)).toBe(false) // 3 quarter turns should not be solved
      applyMove(cubies, move)
      expect(isSolved(cubies), `${face} x4 should be identity`).toBe(true)
    }
  })

  it('a single move actually changes the state', () => {
    const cubies = createSolvedCubies()
    applyMove(cubies, parseMove('R'))
    expect(isSolved(cubies)).toBe(false)
  })

  it("R U R' U' has order 6 (classic sexy-move identity)", () => {
    const cubies = createSolvedCubies()
    const alg = parseAlgorithm("R U R' U'")
    for (let i = 0; i < 6; i++) applyAlgorithm(cubies, alg)
    expect(isSolved(cubies)).toBe(true)
  })

  it('a move followed by its own inverse returns to solved', () => {
    const cubies = createSolvedCubies()
    const alg = parseAlgorithm("R U2 F' L B2 M E' S")
    applyAlgorithm(cubies, alg)
    expect(isSolved(cubies)).toBe(false)
    applyAlgorithm(cubies, inverseAlgorithm(alg))
    expect(isSolved(cubies)).toBe(true)
  })
})

describe('scramble', () => {
  it('never repeats the same axis on consecutive moves', () => {
    const scramble = generateScramble(50)
    const axes = scramble.map((token) => parseMove(token).axis)
    for (let i = 1; i < axes.length; i++) {
      expect(axes[i]).not.toBe(axes[i - 1])
    }
  })

  it('a scramble followed by its inverse returns to solved', () => {
    const cubies = createSolvedCubies()
    const scramble = generateScramble(25)
    applyScramble(cubies, scramble)
    expect(isSolved(cubies)).toBe(false)
    const inverse = inverseAlgorithm(scramble.map(parseMove))
    applyAlgorithm(cubies, inverse)
    expect(isSolved(cubies)).toBe(true)
  })
})
