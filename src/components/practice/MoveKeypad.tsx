const FACES = ['U', 'D', 'R', 'L', 'F', 'B'] as const

interface MoveKeypadProps {
  disabled?: boolean
  onMove: (token: string) => void
}

export function MoveKeypad({ disabled, onMove }: MoveKeypadProps) {
  return (
    <div className="grid w-full max-w-sm grid-cols-3 gap-2">
      {FACES.map((face) => (
        <div key={face} className="flex overflow-hidden rounded-2xl border border-white/10">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onMove(face)}
            className="min-h-11 flex-1 bg-white/5 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40"
          >
            {face}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onMove(`${face}'`)}
            className="min-h-11 flex-1 border-l border-white/10 bg-white/5 py-2 font-mono text-xs text-white/70 hover:bg-white/10 disabled:opacity-40"
          >
            {face}'
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onMove(`${face}2`)}
            className="min-h-11 flex-1 border-l border-white/10 bg-white/5 py-2 font-mono text-xs text-white/70 hover:bg-white/10 disabled:opacity-40"
          >
            {face}2
          </button>
        </div>
      ))}
    </div>
  )
}
