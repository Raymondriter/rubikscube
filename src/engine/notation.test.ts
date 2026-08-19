import { describe, expect, it } from 'vitest'
import {
  inverseAlgorithm,
  inverseMove,
  invertAlgorithmString,
  isExtendedToken,
  parseAlgorithm,
  parseMove,
  usesExtendedMoves,
} from './notation'

describe('parseMove', () => {
  it('parses basic face turns with correct axis/layer', () => {
    expect(parseMove('R')).toEqual({ axis: 'x', layers: [1], quarterTurns: -1 })
    expect(parseMove('L')).toEqual({ axis: 'x', layers: [-1], quarterTurns: 1 })
    expect(parseMove('U')).toEqual({ axis: 'y', layers: [1], quarterTurns: -1 })
    expect(parseMove('D')).toEqual({ axis: 'y', layers: [-1], quarterTurns: 1 })
    expect(parseMove('F')).toEqual({ axis: 'z', layers: [1], quarterTurns: -1 })
    expect(parseMove('B')).toEqual({ axis: 'z', layers: [-1], quarterTurns: 1 })
  })

  it('parses primes and double turns', () => {
    expect(parseMove("R'")).toEqual({ axis: 'x', layers: [1], quarterTurns: 1 })
    expect(parseMove('R2')).toEqual({ axis: 'x', layers: [1], quarterTurns: -2 })
    expect(parseMove("R2'")).toEqual({ axis: 'x', layers: [1], quarterTurns: -2 })
  })

  it('parses slice moves following their paired face', () => {
    expect(parseMove('M')).toEqual({ axis: 'x', layers: [0], quarterTurns: 1 }) // follows L
    expect(parseMove('E')).toEqual({ axis: 'y', layers: [0], quarterTurns: 1 }) // follows D
    expect(parseMove('S')).toEqual({ axis: 'z', layers: [0], quarterTurns: -1 }) // follows F
  })

  it('parses whole-cube rotations following their paired face', () => {
    expect(parseMove('x')).toEqual({ axis: 'x', layers: [-1, 0, 1], quarterTurns: -1 }) // follows R
    expect(parseMove('y')).toEqual({ axis: 'y', layers: [-1, 0, 1], quarterTurns: -1 }) // follows U
    expect(parseMove('z')).toEqual({ axis: 'z', layers: [-1, 0, 1], quarterTurns: -1 }) // follows F
  })

  it('parses wide moves (both Rw and r forms) grabbing two layers', () => {
    expect(parseMove('Rw')).toEqual({ axis: 'x', layers: [1, 0], quarterTurns: -1 })
    expect(parseMove('r')).toEqual({ axis: 'x', layers: [1, 0], quarterTurns: -1 })
    expect(parseMove("Rw'")).toEqual({ axis: 'x', layers: [1, 0], quarterTurns: 1 })
  })

  it('throws on garbage input', () => {
    expect(() => parseMove('Q')).toThrow()
    expect(() => parseMove('')).toThrow()
  })
})

describe('parseAlgorithm', () => {
  it('splits on whitespace and parses each token', () => {
    const moves = parseAlgorithm("R U R' U'")
    expect(moves).toHaveLength(4)
    expect(moves[0]).toEqual(parseMove('R'))
    expect(moves[3]).toEqual(parseMove("U'"))
  })

  it('tolerates extra whitespace', () => {
    expect(parseAlgorithm('  R   U  ')).toHaveLength(2)
  })
})

describe('inverseMove / inverseAlgorithm', () => {
  it('inverts a single move by negating quarterTurns', () => {
    expect(inverseMove(parseMove('R'))).toEqual(parseMove("R'"))
  })

  it("a double turn's inverse is physically the same 180° rotation, even though the sign differs", () => {
    const doubleTurn = parseMove('R2')
    const inverse = inverseMove(doubleTurn)
    expect(Math.abs(inverse.quarterTurns)).toBe(2)
    expect(inverse.axis).toBe(doubleTurn.axis)
    expect(inverse.layers).toEqual(doubleTurn.layers)
  })

  it('inverts an algorithm by reversing order and inverting each move', () => {
    const alg = parseAlgorithm("R U R' U'")
    const inverse = inverseAlgorithm(alg)
    expect(inverse).toEqual(parseAlgorithm("U R U' R'"))
  })
})

describe('invertAlgorithmString', () => {
  it('reverses tokens and flips primes, leaving double turns as-is', () => {
    expect(invertAlgorithmString("R U R' U'")).toBe("U R U' R'")
    expect(invertAlgorithmString('F R U R\' U\' F\'')).toBe('F U R U\' R\' F\'')
    expect(invertAlgorithmString('R2 U')).toBe("U' R2")
  })
})

describe('extended-move detection', () => {
  it('treats the six face turns as within reach of the plain keypad', () => {
    for (const token of ['R', "R'", 'R2', 'U', 'D2', "L'", 'F', 'B2']) {
      expect(isExtendedToken(token)).toBe(false)
    }
  })

  it('flags slices, wide turns, and rotations', () => {
    for (const token of ['M', "M'", 'M2', 'E', 'S', 'r', "u'", 'd2', 'f', 'l', 'b', 'Rw', "Uw'", 'x', "y'", 'z2']) {
      expect(isExtendedToken(token)).toBe(true)
    }
  })

  it('ignores tokens it cannot parse rather than guessing', () => {
    expect(isExtendedToken('nonsense')).toBe(false)
    expect(isExtendedToken('')).toBe(false)
  })

  it('detects whether a whole algorithm needs more than the six faces', () => {
    expect(usesExtendedMoves("R U R' U'")).toBe(false)
    expect(usesExtendedMoves('M2 U M2 U2 M2 U M2')).toBe(true)
    expect(usesExtendedMoves("r U R' U' r' F R F'")).toBe(true)
    expect(usesExtendedMoves('')).toBe(false)
  })
})
