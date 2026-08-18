import { Link, Navigate, useParams } from 'react-router-dom'
import { caseById } from '../data/methods'
import { trainerSetById, trainerSets } from '../data/trainerSets'
import { formatTime, rankWeakCases, type WeakCaseReason } from '../state/progress'
import { useProgressStore } from '../state/progressStore'

const REASON_LABEL: Record<WeakCaseReason, string> = {
  unseen: 'New',
  missed: 'Misses',
  slow: 'Slow',
}

export function TrainerStatsPage() {
  const { setId = '' } = useParams()
  const caseStats = useProgressStore((state) => state.caseStats)
  const known = trainerSets.some((entry) => entry.id === setId)
  if (!known) return <Navigate to="/train" replace />
  const set = trainerSetById(setId)

  const rows = rankWeakCases(set.caseIds, caseStats).map((row) => {
    const cubeCase = caseById(row.id)
    const stats = caseStats[row.id]
    const accuracy =
      stats && stats.recognizeAttempts > 0
        ? Math.round((stats.recognizes / stats.recognizeAttempts) * 100)
        : null
    return { cubeCase, stats, accuracy, reason: row.reason }
  })

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={`/train/${set.id}`} className="text-xs font-medium text-white/40 hover:text-white/70">
        ← {set.name}
      </Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Stats</h1>
      <p className="mt-2 text-sm text-white/50">
        Weakest first. Tap a case to drill it — new AUF each rep, same alg.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-3 py-2 font-medium">Case</th>
              <th className="px-3 py-2 font-medium">Solves</th>
              <th className="px-3 py-2 font-medium">Last</th>
              <th className="px-3 py-2 font-medium">Best</th>
              <th className="px-3 py-2 font-medium">Recog</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ cubeCase, stats, accuracy, reason }) => (
              <tr key={cubeCase.id} className="border-t border-white/10">
                <td className="px-3 py-2">
                  <Link to={`/train/${set.id}?case=${cubeCase.id}`} className="text-white hover:text-brand-400">
                    {cubeCase.name}
                  </Link>
                  <span className="ml-2 text-[11px] uppercase tracking-wider text-white/35">
                    {REASON_LABEL[reason]}
                  </span>
                </td>
                <td className="px-3 py-2 text-white/60">{stats?.solves ?? 0}</td>
                <td className="px-3 py-2 font-mono text-white/80">
                  {stats?.lastMs != null ? `${formatTime(stats.lastMs)}s` : '—'}
                </td>
                <td className="px-3 py-2 font-mono text-white/80">
                  {stats?.bestMs != null ? `${formatTime(stats.bestMs)}s` : '—'}
                </td>
                <td className="px-3 py-2 text-white/60">{accuracy == null ? '—' : `${accuracy}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
