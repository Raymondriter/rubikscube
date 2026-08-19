import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgressStore } from '../../state/progressStore'
import { btnGhost, btnPrimary } from '../ui/styles'

const STEPS = [
  {
    title: 'Learn on a live cube',
    body: 'Every lesson plays the algorithm on a 3×3 you can orbit. Drag the background to turn the camera. Drag a face to twist it; smear onto the next layer for a wide turn.',
  },
  {
    title: 'Then drill it',
    body: 'After a lesson, open Train. Timed execute and recognition are how the 119 CFOP cases actually stick.',
  },
  {
    title: 'Progress stays here',
    body: 'XP, streaks, and times are saved in this browser. No account. You can turn on colorblind stickers in Settings anytime.',
  },
]

export function Onboarding() {
  const onboarded = useProgressStore((state) => state.settings.onboarded)
  const setOnboarded = useProgressStore((state) => state.setOnboarded)
  const [index, setIndex] = useState(0)
  const [hydrated, setHydrated] = useState(() => useProgressStore.persist.hasHydrated())

  useEffect(() => {
    const unsub = useProgressStore.persist.onFinishHydration(() => setHydrated(true))
    if (useProgressStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  if (!hydrated || onboarded) return null

  const last = index === STEPS.length - 1
  const step = STEPS[index]
  if (!step) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/75 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-ink-800 p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
          {index + 1} / {STEPS.length}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{step.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/65">{step.body}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className={btnGhost} onClick={() => setOnboarded(true)}>
            Skip
          </button>
          {!last ? (
            <button type="button" className={btnPrimary} onClick={() => setIndex((value) => value + 1)}>
              Next
            </button>
          ) : (
            <Link to="/learn/beginner/beginner-intro" className={btnPrimary} onClick={() => setOnboarded(true)}>
              Start the first lesson
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
