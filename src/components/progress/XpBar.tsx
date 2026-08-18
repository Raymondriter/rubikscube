import { levelForXp, XP_PER_LEVEL, xpIntoLevel } from '../../state/progress'

export function XpBar({ xp, compact = false }: { xp: number; compact?: boolean }) {
  const level = levelForXp(xp)
  const into = xpIntoLevel(xp)
  const pct = Math.round((into / XP_PER_LEVEL) * 100)

  if (compact) {
    return (
      <div className="flex items-center gap-2" title={`${xp} XP`}>
        <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[11px] font-semibold text-brand-400">
          Lv {level}
        </span>
        <span className="hidden text-xs text-white/50 sm:inline">{xp} XP</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-semibold text-brand-400">Level {level}</span>
        <span className="text-white/40">
          {into} / {XP_PER_LEVEL} XP
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-brand-400 to-brand-600 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
