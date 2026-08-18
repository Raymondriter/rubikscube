import * as THREE from 'three'
import type { Axis, Coord, Face, MoveSpec, PieceKind, StickerColor } from './types'

export interface Sticker {
  /** Home-orientation outward normal - one of the 6 axis-aligned unit vectors, fixed for the cubie's lifetime. */
  normal: THREE.Vector3
  color: StickerColor
  face: Face
}

export interface Cubie {
  id: string
  kind: PieceKind
  /** position + quaternion ARE the live logical state - no separate array to fall out of sync with. */
  object: THREE.Object3D
  homePosition: THREE.Vector3
  stickers: Sticker[]
}

const AXIS_VECTORS: Record<Axis, THREE.Vector3> = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
}

const FACE_COLOR: Record<Face, StickerColor> = {
  U: 'white',
  D: 'yellow',
  F: 'green',
  B: 'blue',
  R: 'red',
  L: 'orange',
}

const FACE_NORMAL: Record<Face, THREE.Vector3> = {
  U: new THREE.Vector3(0, 1, 0),
  D: new THREE.Vector3(0, -1, 0),
  F: new THREE.Vector3(0, 0, 1),
  B: new THREE.Vector3(0, 0, -1),
  R: new THREE.Vector3(1, 0, 0),
  L: new THREE.Vector3(-1, 0, 0),
}

const FACE_AT: { face: Face; axis: Axis; coord: Coord }[] = [
  { face: 'U', axis: 'y', coord: 1 },
  { face: 'D', axis: 'y', coord: -1 },
  { face: 'R', axis: 'x', coord: 1 },
  { face: 'L', axis: 'x', coord: -1 },
  { face: 'F', axis: 'z', coord: 1 },
  { face: 'B', axis: 'z', coord: -1 },
]

function roundCoord(value: number): Coord {
  return Math.round(value) as Coord
}

function pieceKind(x: Coord, y: Coord, z: Coord): PieceKind | null {
  const nonZero = [x, y, z].filter((c) => c !== 0).length
  if (nonZero === 3) return 'corner'
  if (nonZero === 2) return 'edge'
  if (nonZero === 1) return 'center'
  return null // the invisible core piece isn't represented - it has no stickers and never moves
}

/** Slot name for a cubie at these coordinates (UF, UFR, …). Same scheme as home piece ids. */
export function slotIdFromCoords(x: Coord, y: Coord, z: Coord): string {
  const parts: string[] = []
  if (y === 1) parts.push('U')
  if (y === -1) parts.push('D')
  if (x === 1) parts.push('R')
  if (x === -1) parts.push('L')
  if (z === 1) parts.push('F')
  if (z === -1) parts.push('B')
  return parts.join('')
}

export function slotIdFromPosition(position: THREE.Vector3): string {
  return slotIdFromCoords(
    Math.round(position.x) as Coord,
    Math.round(position.y) as Coord,
    Math.round(position.z) as Coord,
  )
}

function pieceId(x: Coord, y: Coord, z: Coord): string {
  return slotIdFromCoords(x, y, z)
}

/** Builds the 26 visible cubies (8 corners + 12 edges + 6 centers) in their solved home transforms. */
export function createSolvedCubies(): Cubie[] {
  const cubies: Cubie[] = []
  for (const x of [-1, 0, 1] as Coord[]) {
    for (const y of [-1, 0, 1] as Coord[]) {
      for (const z of [-1, 0, 1] as Coord[]) {
        const kind = pieceKind(x, y, z)
        if (!kind) continue
        const object = new THREE.Object3D()
        object.position.set(x, y, z)
        const stickers: Sticker[] = FACE_AT.filter(
          (f) =>
            (f.axis === 'x' && x === f.coord) ||
            (f.axis === 'y' && y === f.coord) ||
            (f.axis === 'z' && z === f.coord),
        ).map((f) => ({ normal: FACE_NORMAL[f.face].clone(), color: FACE_COLOR[f.face], face: f.face }))
        cubies.push({ id: pieceId(x, y, z), kind, object, homePosition: new THREE.Vector3(x, y, z), stickers })
      }
    }
  }
  return cubies
}

/** Cubies whose rounded position along `move.axis` falls in `move.layers`. */
export function cubiesInMove(cubies: Cubie[], move: MoveSpec): Cubie[] {
  return cubies.filter((c) => move.layers.includes(roundCoord(c.object.position[move.axis])))
}

/**
 * Applies a move instantly. This is the single source of truth for state
 * transitions - renderer-side twist animation is purely visual (a temporary
 * pivot object interpolated for the user's eyes); the actual position/
 * quaternion update always goes through this same function, so the final
 * state never depends on how a move was visually interpolated, and
 * floating-point error never accumulates beyond a single quaternion
 * multiply per move.
 */
export function applyMove(cubies: Cubie[], move: MoveSpec): Cubie[] {
  const axisVector = AXIS_VECTORS[move.axis]
  const angle = move.quarterTurns * (Math.PI / 2)
  const rotation = new THREE.Quaternion().setFromAxisAngle(axisVector, angle)
  const affected = cubiesInMove(cubies, move)
  for (const cubie of affected) {
    cubie.object.position.applyQuaternion(rotation)
    cubie.object.position.set(
      Math.round(cubie.object.position.x),
      Math.round(cubie.object.position.y),
      Math.round(cubie.object.position.z),
    )
    cubie.object.quaternion.premultiply(rotation)
  }
  return affected
}

export function applyAlgorithm(cubies: Cubie[], moves: MoveSpec[]): void {
  for (const move of moves) applyMove(cubies, move)
}

/** Resets every cubie back to its solved home position and orientation. */
export function resetToSolved(cubies: Cubie[]): void {
  for (const cubie of cubies) {
    cubie.object.position.copy(cubie.homePosition)
    cubie.object.quaternion.identity()
  }
}
