import { ACHIEVEMENTS } from '../state/progress'
import { useProgressStore } from '../state/progressStore'

export function AchievementsPage() {
  const unlocked = useProgressStore((state) => state.achievements)
  const have = new Set(unlocked)

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Collection</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Badges</h1>
      <p className="mt-3 text-sm text-white/55">
        {unlocked.length} of {ACHIEVEMENTS.length} unlocked. They stay on this device.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((item) => {
          const open = have.has(item.id)
          return (
            <li
              key={item.id}
              className={`rounded-2xl border px-4 py-4 ${
                open ? 'border-cube-yellow/30 bg-cube-yellow/10' : 'border-white/10 bg-white/5 opacity-60'
              }`}
            >
              <p className={`font-medium ${open ? 'text-cube-yellow' : 'text-white/70'}`}>{item.name}</p>
              <p className="mt-1 text-xs text-white/45">{item.description}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
