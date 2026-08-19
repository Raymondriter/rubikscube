import type { Coord } from '../types'

const ALL_LAYERS: Coord[] = [-1, 0, 1]

/** Every layer from `start` through `end` inclusive, in engine order. */
export function layersFromSpan(start: Coord, end: Coord): Coord[] {
  const lo = Math.min(start, end)
  const hi = Math.max(start, end)
  return ALL_LAYERS.filter((coord) => coord >= lo && coord <= hi)
}

/**
 * Which layers a drag should turn.
 *
 * The span is the physical gesture: stay on one cubie for a face or slice,
 * smear onto the equator for a wide turn, smear all the way across for a
 * whole-cube rotation. Keyboard modifiers are the desktop shortcut for the
 * same thing (Shift = wide, Ctrl/Cmd = rotation) so a small drag on an
 * outer cubie can still enter those moves.
 */
export function layersForDrag(input: {
  start: Coord
  end: Coord
  shiftKey?: boolean
  rotateKey?: boolean
}): Coord[] {
  if (input.rotateKey) return [...ALL_LAYERS]
  let layers = layersFromSpan(input.start, input.end)
  if (input.shiftKey && layers.length === 1 && layers[0] !== 0) {
    layers = layersFromSpan(layers[0], 0)
  }
  return layers
}

/** Grows an in-progress drag's layer set so it never shrinks mid-gesture. */
export function expandLayers(current: readonly Coord[], next: Coord): Coord[] {
  if (current.length === 0) return [next]
  return layersFromSpan(
    Math.min(next, ...current) as Coord,
    Math.max(next, ...current) as Coord,
  )
}

export function asCoord(value: number): Coord | null {
  const rounded = Math.round(value)
  if (rounded === -1 || rounded === 0 || rounded === 1) return rounded
  return null
}
