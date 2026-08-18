export const btnPrimary =
  'rounded-full bg-brand-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/25 transition hover:scale-105 hover:bg-brand-600 active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950'

export const btnGhost =
  'rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-white/80 transition hover:scale-105 hover:bg-white/5 active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950'

export const btnTiny =
  'rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white/70 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400'

export const cubeStageClass =
  'relative aspect-square w-full max-w-xl max-h-[65vh] overflow-hidden rounded-3xl border border-white/10'

export const cubeStageStyle = {
  background: 'radial-gradient(120% 100% at 50% 15%, var(--color-ink-800), var(--color-ink-950))',
  boxShadow: '0 40px 80px -30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
} as const
