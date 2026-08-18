import { Link } from 'react-router-dom'
import { DailyDrillCard } from '../components/trainer/DailyDrillCard'
import { caseById } from '../data/methods'
import { trainerSetById, trainerSets } from '../data/trainerSets'
import { dailyDrillStatus, rankWeakCases, type WeakCaseReason } from '../state/progress'
import { useProgressStore } from '../state/progressStore'

const REASON_LABEL: Record<WeakCaseReason, string> = {
  unseen: 'New',
  missed: 'Misses',
  slow: 'Slow',
}

export function TrainerHomePage() {
  const caseStats = useProgressStore((state) => state.caseStats)
  const dailyDrill = useProgressStore((state) => state.dailyDrill)
  const completedLessons = useProgressStore((state) => state.completedLessons)
  const drill = dailyDrillStatus({ dailyDrill, completedLessons, caseStats })
  const todaySet = trainerSetById(drill.setId)
  const needsWork = rankWeakCases(todaySet.caseIds, caseStats, 3)

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Daily reps</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Trainer</h1>
      <p className="mt-3 text-sm text-white/55">
        Timed execution and recognition drills. Weak cases come up more often. Space starts and advances.
      </p>

      <div className="mt-8">
        <DailyDrillCard />
      </div>

      {needsWork.length > 0 && (
        <section className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">Needs work</h2>
            <Link to={`/train/${todaySet.id}/stats`} className="text-xs text-white/40 hover:text-white/70">
              All stats
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {needsWork.map((row) => {
              const cubeCase = caseById(row.id)
              return (
                <li key={row.id}>
                  <Link
                    to={`/train/${todaySet.id}?case=${row.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:border-brand-500/40"
                  >
                    <span className="text-white">{cubeCase.name}</span>
                    <span className="text-[11px] uppercase tracking-wider text-white/35">
                      {REASON_LABEL[row.reason]}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <ul className="mt-6 space-y-3">
        {trainerSets.map((set) => {
          const drilled = set.caseIds.filter((id) => (caseStats[id]?.solves ?? 0) > 0).length
          const bests = set.caseIds
            .map((id) => caseStats[id]?.bestMs)
            .filter((ms): ms is number => ms !== undefined && ms !== null)
          const mean =
            bests.length > 0 ? (bests.reduce((sum, ms) => sum + ms, 0) / bests.length / 1000).toFixed(2) : null
          return (
            <li key={set.id}>
              <Link
                to={`/train/${set.id}`}
                className="block rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:border-brand-500/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{set.name}</p>
                    <p className="mt-1 text-sm text-white/45">{set.summary}</p>
                  </div>
                  <span className="shrink-0 text-xs text-white/40">
                    {drilled}/{set.caseIds.length}
                  </span>
                </div>
                {mean && <p className="mt-2 text-xs text-brand-400">avg best {mean}s</p>}
              </Link>
            </li>
          )
        })}
      </ul>

      <Link
        to="/train/pll?mode=sides"
        className="mt-6 block rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm transition hover:border-brand-500/40"
      >
        <p className="font-medium text-white">2-sided PLL recognition</p>
        <p className="mt-1 text-white/45">
          Name the perm from two last-layer sides only — the view you get in a real solve.
        </p>
      </Link>
    </div>
  )
}
