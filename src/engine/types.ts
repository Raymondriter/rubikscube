export type Axis = 'x' | 'y' | 'z'

/** A layer coordinate along an axis: -1, 0 (middle slice), or 1. */
export type Coord = -1 | 0 | 1

export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B'

export type StickerColor = 'white' | 'yellow' | 'red' | 'orange' | 'blue' | 'green'

export type PieceKind = 'corner' | 'edge' | 'center'

/**
 * A move expressed in the engine's native form: grab every cubie whose
 * rounded coordinate along `axis` is in `layers`, and rotate it by
 * `quarterTurns` quarter turns (each 90°) about the canonical +axis vector.
 *
 * Signs are fixed once, globally, per axis (not per face) - see notation.ts
 * for how named moves like R/L/U/D/F/B map onto this. That's what lets move
 * application, scrambling, and algorithm playback all share one code path.
 */
export interface MoveSpec {
  axis: Axis
  layers: Coord[]
  quarterTurns: 1 | -1 | 2 | -2
}
