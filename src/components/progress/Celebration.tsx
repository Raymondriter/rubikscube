interface CelebrationProps {
  title: string
  detail?: string
  onDismiss: () => void
  actionLabel?: string
}

export function Celebration({ title, detail, onDismiss, actionLabel = 'Continue' }: CelebrationProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm">
      <div className="celebrate-pop mx-6 max-w-sm rounded-3xl border border-white/10 bg-ink-800 px-8 py-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cube-green/20 text-2xl">
          ✓
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
        {detail && <p className="mt-2 text-sm text-white/60">{detail}</p>}
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 rounded-full bg-brand-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  )
}
