import { Link, Navigate, useParams } from 'react-router-dom'
import { methodById, methodsById } from '../data/methods/catalog'
import { useProgressStore } from '../state/progressStore'

export function MethodPage() {
  const { methodId = 'beginner' } = useParams()
  const completedLessons = useProgressStore((state) => state.completedLessons)
  const masteredCases = useProgressStore((state) => state.masteredCases)
  if (!methodsById[methodId]) return <Navigate to="/" replace />
  const method = methodById(methodId)

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Course</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{method.name}</h1>
      <p className="mt-3 text-sm text-white/55">{method.summary}</p>
      <Link
        to={`/learn/${method.id}/cases`}
        className="mt-4 inline-flex text-sm font-medium text-brand-400 hover:text-brand-300"
      >
        Open case browser →
      </Link>

      <ol className="mt-8 space-y-3">
        {method.steps.map((step, index) => {
          const done = completedLessons.includes(step.id)
          const mastered = step.demoCaseIds.filter((id) => masteredCases.includes(id)).length
          return (
            <li
              key={step.id}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:border-brand-500/40"
            >
              <Link
                to={`/learn/${method.id}/${step.id}`}
                className="flex min-w-0 flex-1 items-center gap-4"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                    done ? 'bg-cube-green/20 text-cube-green' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {done ? '✓' : index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-white">{step.title}</p>
                  <p className="text-xs text-white/40">
                    {step.xpReward} XP
                    {step.demoCaseIds.length > 0 &&
                      ` · ${mastered}/${step.demoCaseIds.length} cases practiced`}
                  </p>
                </div>
              </Link>
              {step.demoCaseIds.length > 0 && (
                <Link
                  to={`/learn/${method.id}/${step.id}/practice`}
                  className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 hover:bg-white/5"
                >
                  Practice
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
