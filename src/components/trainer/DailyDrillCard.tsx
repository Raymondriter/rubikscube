import { Link } from 'react-router-dom'
import { trainerSetById } from '../../data/trainerSets'
import { dailyDrillStatus } from '../../state/progress'
import { useProgressStore } from '../../state/progressStore'
import { btnPrimary } from '../ui/styles'

export function DailyDrillCard() {
  const dailyDrill = useProgressStore((state) => state.dailyDrill)
  const completedLessons = useProgressStore((state) => state.completedLessons)
  const caseStats = useProgressStore((state) => state.caseStats)
  const streakDays = useProgressStore((state) => state.streakDays)
  // New object each call — selecting it from the store loops useSyncExternalStore.
  const status = dailyDrillStatus({ dailyDrill, completedLessons, caseStats })
  const set = trainerSetById(status.setId)
  const pct = Math.min(100, (status.reps / status.target) * 100)

  return (
    <div className="rounded-3xl border border-brand-500/30 bg-brand-500/10 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Daily drill</p>
      <h2 className="mt-2 text-xl font-semibold text-white">{set.name}</h2>
      {streakDays > 0 && <p className="mt-1 text-xs text-orange-300">{streakDays}d streak</p>}
      <p className="mt-3 text-sm text-white/60">
        {status.done ? 'Daily drill done — keep going' : `${status.reps} / ${status.target} reps`}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link to={`/train/${status.setId}`} className={`${btnPrimary} inline-flex`}>
          {status.done ? 'Keep going' : "Start today’s drill"}
        </Link>
        <Link to={`/train/${status.setId}/stats`} className="text-xs text-white/45 hover:text-white/70">
          Review cases
        </Link>
      </div>
    </div>
  )
}
