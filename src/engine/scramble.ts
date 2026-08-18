import type { Cubie } from './cubeState'
import { applyMove } from './cubeState'
import type { Axis } from './types'
import { parseMove } from './notation'

const SCRAMBLE_FACES = ['R', 'L', 'U', 'D', 'F', 'B'] as const
const SUFFIXES = ['', "'", '2']

function randomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

/**
 * Generates `length` random face turns, never repeating the same axis twice
 * in a row. This isn't a WCA-legal random-*state* scramble (those need a
 * proper solver-backed generator) - it's just enough to mix the cube up for
 * teaching purposes, and avoiding same-axis repeats prevents dead moves like
 * "R L" that don't cancel outright but also don't add real difficulty.
 */
export function generateScramble(length = 22): string[] {
  const moves: string[] = []
  let lastAxis: Axis | null = null
  while (moves.length < length) {
    const face = SCRAMBLE_FACES[randomInt(SCRAMBLE_FACES.length)]
    const spec = parseMove(face)
    if (spec.axis === lastAxis) continue
    const suffix = SUFFIXES[randomInt(SUFFIXES.length)]
    moves.push(`${face}${suffix}`)
    lastAxis = spec.axis
  }
  return moves
}

export function applyScramble(cubies: Cubie[], scramble: string[]): void {
  for (const token of scramble) applyMove(cubies, parseMove(token))
}
