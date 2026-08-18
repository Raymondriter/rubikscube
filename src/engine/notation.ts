import type { Axis, Coord, MoveSpec } from './types'

/**
 * Every named move reduces to {axis, layers, quarterTurns} about a single
 * fixed +axis reference direction per axis - never per face. The physical
 * "clockwise viewed from outside the face" convention works out to:
 *
 *   - R, F, U (the "positive" faces) turn clockwise = -1 quarter turn about +axis
 *   - L, B, D (the "negative" faces) turn clockwise = +1 quarter turn about +axis
 *
 * This isn't arbitrary: standing outside the R face looking at the cube (in
 * the -x direction, with +x pointing at your eye) is exactly the viewpoint
 * where Three.js's right-hand-rule positive rotation about +x reads
 * counter-clockwise - so physical clockwise there is the negative angle.
 * The same argument applies to F/+z and U/+y. L/B/D sit on the opposite
 * side, so their own "clockwise from outside" flips sign relative to the
 * shared +axis. (Sanity check this gives real cubing identities like
 * x = R M' L' - it does: R and L' both land on -1, matching the fact that
 * whole-cube x rotation turns the L layer the same physical way R does,
 * which from L's own opposite-side vantage looks like L'.)
 *
 * Slice moves (M/E/S) and whole-cube rotations (x/y/z) don't have their own
 * "outside" to view from, so by convention they just follow the face they're
 * paired with (M follows L, E follows D, S follows F).
 */
const FACE_AXIS: Record<string, Axis> = { R: 'x', L: 'x', U: 'y', D: 'y', F: 'z', B: 'z' }
const FACE_LAYER: Record<string, Coord> = { R: 1, L: -1, U: 1, D: -1, F: 1, B: -1 }
const FACE_SIGN: Record<string, 1 | -1> = { R: -1, L: 1, U: -1, D: 1, F: -1, B: 1 }

const SLICE_AXIS: Record<string, Axis> = { M: 'x', E: 'y', S: 'z' }
const SLICE_SIGN: Record<string, 1 | -1> = { M: 1, E: 1, S: -1 } // follow L, D, F respectively

const ROTATION_AXIS: Record<string, Axis> = { x: 'x', y: 'y', z: 'z' }
const ROTATION_SIGN: Record<string, 1 | -1> = { x: -1, y: -1, z: -1 } // follow R, U, F respectively

const ALL_LAYERS: Coord[] = [-1, 0, 1]

const TOKEN_RE = /^(Rw|Lw|Uw|Dw|Fw|Bw|[RLUDFBMESxyz]|[rludfb])(2'|'2|2|')?$/

/** Parses a single Singmaster-notation token (e.g. "R", "R'", "U2", "Rw'", "r2") into a MoveSpec. */
export function parseMove(token: string): MoveSpec {
  const match = TOKEN_RE.exec(token)
  if (!match) {
    throw new Error(`Unrecognized move: "${token}"`)
  }
  const [, rawFace, suffix] = match

  const isLowercaseWide = /^[rludfb]$/.test(rawFace)
  const isWide = rawFace.length === 2 || isLowercaseWide
  const face = (isLowercaseWide ? rawFace.toUpperCase() : rawFace.replace('w', '')) as string

  let axis: Axis
  let layers: Coord[]
  let baseSign: 1 | -1

  if (face in FACE_AXIS) {
    axis = FACE_AXIS[face]
    baseSign = FACE_SIGN[face]
    layers = isWide ? [FACE_LAYER[face], 0] : [FACE_LAYER[face]]
  } else if (face in SLICE_AXIS) {
    axis = SLICE_AXIS[face]
    baseSign = SLICE_SIGN[face]
    layers = [0]
  } else if (face in ROTATION_AXIS) {
    axis = ROTATION_AXIS[face]
    baseSign = ROTATION_SIGN[face]
    layers = ALL_LAYERS
  } else {
    throw new Error(`Unrecognized move: "${token}"`)
  }

  const isDouble = suffix === '2' || suffix === "2'"
  const quarterTurns = isDouble
    ? ((baseSign * 2) as 2 | -2)
    : suffix === "'"
      ? ((-baseSign) as 1 | -1)
      : baseSign

  return { axis, layers, quarterTurns }
}

/** Splits a whitespace-separated algorithm into Singmaster tokens. */
export function tokenizeAlgorithm(algorithm: string): string[] {
  return algorithm.trim().split(/\s+/).filter(Boolean)
}

/** Parses a whitespace-separated algorithm string (e.g. "R U R' U'") into MoveSpecs. */
export function parseAlgorithm(algorithm: string): MoveSpec[] {
  return tokenizeAlgorithm(algorithm).map(parseMove)
}

/** The exact inverse of a single move: same axis/layers, opposite (or equal, for double turns) sign. */
export function inverseMove(move: MoveSpec): MoveSpec {
  return { ...move, quarterTurns: (-move.quarterTurns) as MoveSpec['quarterTurns'] }
}

/** The inverse of a whole algorithm: reverse order, each move inverted. */
export function inverseAlgorithm(moves: MoveSpec[]): MoveSpec[] {
  return [...moves].reverse().map(inverseMove)
}

/** Token-level inverse of an algorithm string (R → R', R' → R, R2 → R2). */
export function invertAlgorithmString(algorithm: string): string {
  return algorithm
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .reverse()
    .map((token) => {
      if (token.endsWith('2')) return token
      if (token.endsWith("'")) return token.slice(0, -1)
      return `${token}'`
    })
    .join(' ')
}
