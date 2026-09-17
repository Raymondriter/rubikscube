import type { Axis, Coord, MoveSpec } from '../types'

const ALL_LAYERS: Coord[] = [-1, 0, 1]
const AXES: Axis[] = ['x', 'y', 'z']

type Vec3 = Record<Axis, number>

/**
 * Which layers a drag turns. A finger on the cube always turns exactly the
 * one layer it grabbed - it never grows onto a neighbouring row because the
 * swipe drifted, which on a touchscreen it always does. Keyboard modifiers
 * are the desktop-only way to ask for more (Shift = wide, Ctrl/Cmd = whole
 * cube); on touch, wide moves and rotations live on the keypad.
 */
export function layersForDrag(input: { layer: Coord; shiftKey?: boolean; rotateKey?: boolean }): Coord[] {
  if (input.rotateKey) return [...ALL_LAYERS]
  if (input.shiftKey && input.layer !== 0) return input.layer > 0 ? [0, 1] : [-1, 0]
  return [input.layer]
}

export function asCoord(value: number): Coord | null {
  const rounded = Math.round(value)
  if (rounded === -1 || rounded === 0 || rounded === 1) return rounded
  return null
}

/** The outward face a point on the cube's surface belongs to: whichever coordinate sticks out furthest. */
export function faceNormalAt(point: Vec3): Vec3 {
  let best: Axis = 'x'
  for (const axis of AXES) if (Math.abs(point[axis]) > Math.abs(point[best])) best = axis
  return unit(best, Math.sign(point[best]) || 1)
}

export interface TwistChoice {
  /** The world axis the layer turns about. */
  axis: Axis
  /** The in-face axis the finger is moving along. */
  tangent: Axis
  /** +1/-1: turns "finger moves toward +tangent" into a signed angle about +axis. */
  sign: 1 | -1
}

/**
 * Decides the twist from how far the finger has moved *across the grabbed
 * face, in 3D* - the drag re-projected onto that face's plane, not the raw
 * screen vector. On a face seen at an angle (the top face, most of the
 * time) the two in-face directions can look nearly parallel on screen, and
 * judging by the screen picks the wrong one; on the face plane they're
 * always perpendicular.
 */
export function chooseTwist(normal: Vec3, dragOnFace: Vec3): TwistChoice | null {
  const normalAxis = dominant(normal)
  const tangents = AXES.filter((axis) => axis !== normalAxis)
  const tangent = Math.abs(dragOnFace[tangents[0]]) >= Math.abs(dragOnFace[tangents[1]]) ? tangents[0] : tangents[1]
  if (dragOnFace[tangent] === 0) return null
  // Rotation vector for "finger moves toward +tangent" is normal × tangent.
  const rotation = cross(normal, unit(tangent, 1))
  const axis = dominant(rotation)
  return { axis, tangent, sign: Math.sign(rotation[axis]) as 1 | -1 }
}

/**
 * How many whole quarter turns a released drag lands on. A quick short flick
 * completes the quarter turn it was heading for, the way a real cube carries
 * on; a slow drag that stops short falls back. Momentum only ever rescues a
 * turn that would otherwise cancel - it never adds a second quarter turn, so
 * a hard swipe is still exactly one move unless the finger truly travelled
 * past the halfway point of the next one.
 */
export function releaseTurns(turns: number, velocityTurnsPerMs: number, carryMs = 110): number {
  const rounded = Math.round(turns)
  if (rounded !== 0) return rounded
  const projected = turns + velocityTurnsPerMs * carryMs
  return Math.abs(projected) >= 0.5 && Math.sign(projected) === Math.sign(turns) ? Math.sign(turns) : 0
}

/** Maps any whole number of quarter turns onto the engine's -1..2 range; a full turn is no move at all. */
export function normalizeQuarterTurns(turns: number): MoveSpec['quarterTurns'] | 0 {
  const mod = ((Math.round(turns) % 4) + 4) % 4
  return (mod === 3 ? -1 : mod) as MoveSpec['quarterTurns'] | 0
}

function unit(axis: Axis, sign: number): Vec3 {
  return { x: axis === 'x' ? sign : 0, y: axis === 'y' ? sign : 0, z: axis === 'z' ? sign : 0 }
}

function dominant(v: Vec3): Axis {
  let best: Axis = 'x'
  for (const axis of AXES) if (Math.abs(v[axis]) > Math.abs(v[best])) best = axis
  return best
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }
}
