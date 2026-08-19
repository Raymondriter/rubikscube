import { useState } from 'react'
import { usesExtendedMoves } from '../../engine/notation'

const FACES = ['U', 'D', 'R', 'L', 'F', 'B'] as const

/**
 * Everything past the six faces. The engine has always parsed these; the pad
 * used to stop at face turns, which left 123 of the 276 taught algorithms
 * impossible to enter - M alone appears 224 times, because Roux is built on it.
 * Kept behind a toggle so a beginner (whose 16 cases need none of this) still
 * opens to the same six buttons they had before.
 */
const EXTENDED_GROUPS: { label: string; hint: string; moves: readonly string[] }[] = [
  { label: 'Slices', hint: 'middle layer only', moves: ['M', 'E', 'S'] },
  { label: 'Wide', hint: 'face + middle layer', moves: ['r', 'l', 'u', 'd', 'f', 'b'] },
  { label: 'Rotations', hint: 'turns the whole cube', moves: ['x', 'y', 'z'] },
]

interface MoveKeypadProps {
  disabled?: boolean
  onMove: (token: string) => void
  /**
   * The algorithm currently on screen, when there is one. If it needs a key
   * beyond the six faces, the extended rows open on their own - so the moves
   * appear exactly when the learner can see they are being asked for, rather
   * than leaving them to discover a toggle mid-solve.
   */
  algorithm?: string
}

function MoveTriplet({
  move,
  disabled,
  onMove,
}: {
  move: string
  disabled?: boolean
  onMove: (token: string) => void
}) {
  return (
    <div className="flex overflow-hidden rounded-2xl border border-white/10">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onMove(move)}
        className="min-h-11 flex-1 bg-white/5 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40"
      >
        {move}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onMove(`${move}'`)}
        className="min-h-11 flex-1 border-l border-white/10 bg-white/5 py-2 font-mono text-xs text-white/70 hover:bg-white/10 disabled:opacity-40"
      >
        {move}'
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onMove(`${move}2`)}
        className="min-h-11 flex-1 border-l border-white/10 bg-white/5 py-2 font-mono text-xs text-white/70 hover:bg-white/10 disabled:opacity-40"
      >
        {move}2
      </button>
    </div>
  )
}

export function MoveKeypad({ disabled, onMove, algorithm }: MoveKeypadProps) {
  const [openedByHand, setOpenedByHand] = useState(false)
  const neededHere = algorithm ? usesExtendedMoves(algorithm) : false
  const showExtended = openedByHand || neededHere

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {FACES.map((face) => (
          <MoveTriplet key={face} move={face} disabled={disabled} onMove={onMove} />
        ))}
      </div>

      {showExtended && (
        <div className="flex flex-col gap-3">
          {EXTENDED_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 text-[11px] uppercase tracking-[0.14em] text-white/35">
                {group.label} <span className="tracking-normal normal-case text-white/25">· {group.hint}</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {group.moves.map((move) => (
                  <MoveTriplet key={move} move={move} disabled={disabled} onMove={onMove} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden while an on-screen algorithm is forcing the rows open: collapsing
          them would just take away keys the learner is currently being asked for. */}
      {!neededHere && (
        <button
          type="button"
          onClick={() => setOpenedByHand((value) => !value)}
          aria-expanded={showExtended}
          className="self-center text-xs text-white/40 underline-offset-2 hover:text-white/70 hover:underline"
        >
          {showExtended ? 'Fewer moves' : 'Slice, wide & rotation moves'}
        </button>
      )}
    </div>
  )
}
