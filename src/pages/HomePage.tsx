import { Link } from 'react-router-dom'
import { firstIncompleteStep, methods } from '../data/methods/catalog'
import { ACHIEVEMENTS } from '../state/progress'
import { useProgressStore } from '../state/progressStore'
import { DailyDrillCard } from '../components/trainer/DailyDrillCard'
import { XpBar } from '../components/progress/XpBar'
import { btnPrimary, btnGhost } from '../components/ui/styles'

export function HomePage() {
  const completedLessons = useProgressStore((state) => state.completedLessons)
  const masteredCases = useProgressStore((state) => state.masteredCases)
  const achievements = useProgressStore((state) => state.achievements)
  const xp = useProgressStore((state) => state.xp)
  const nextMethod = methods.find((method) => method.steps.some((step) => !completedLessons.includes(step.id))) ?? methods[0]!
  const continueStep = firstIncompleteStep(nextMethod, completedLessons)
  const lessonTotal = methods.reduce((sum, method) => sum + method.steps.length, 0)
  const lessonDone = methods.reduce(
    (sum, method) => sum + method.steps.filter((step) => completedLessons.includes(step.id)).length,
    0,
  )


  return (
    <div className="flex flex-col gap-10">
      <section className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Beginner, then CFOP</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Learn to solve the cube.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/60">
            Start with the beginner method, then learn CFOP — 119 algorithms you can play, step, and practice on a
            live cube. Progress stays on this device.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/learn/${nextMethod.id}/${continueStep?.id ?? ''}`} className={btnPrimary}>
              {lessonDone === 0 ? 'Start the course' : lessonDone === lessonTotal ? 'Review lessons' : 'Continue'}
            </Link>
            <Link to="/train" className={btnGhost}>
              Open trainer
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <XpBar xp={xp} />
          <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
            <Stat label="Lessons" value={`${lessonDone}/${lessonTotal}`} />
            <Stat label="Cases" value={`${masteredCases.length}`} />
            <Stat label="Badges" value={`${achievements.length}`} />
          </dl>
        </div>
      </section>

      <section>
        <DailyDrillCard />
      </section>

      <section className="grid gap-4">
        {methods.map((method) => {
          const done = method.steps.filter((step) => completedLessons.includes(step.id)).length
          return (
            <Link
              key={method.id}
              to={`/learn/${method.id}`}
              className="block rounded-3xl border border-white/10 bg-ink-800/60 p-6 transition hover:border-brand-500/40 hover:bg-ink-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{method.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm text-white/55">{method.summary}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-500/15 px-3 py-1 text-xs font-medium text-brand-400">
                  {done}/{method.steps.length}
                </span>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
                  style={{ width: `${(done / method.steps.length) * 100}%` }}
                />
              </div>
            </Link>
          )
        })}
      </section>

      <p className="flex flex-wrap gap-4 text-xs text-white/40">
        <Link to="/badges" className="hover:text-white/70">
          All badges
        </Link>
        <Link to="/settings" className="hover:text-white/70">
          Settings
        </Link>
      </p>

      {achievements.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">Badges</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ACHIEVEMENTS.filter((item) => achievements.includes(item.id)).map((item) => (
              <li
                key={item.id}
                className="rounded-full border border-cube-yellow/30 bg-cube-yellow/10 px-3 py-1 text-xs text-cube-yellow"
                title={item.description}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-white/40">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-white">{value}</dd>
    </div>
  )
}
