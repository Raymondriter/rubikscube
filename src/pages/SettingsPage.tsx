import { useProgressStore } from '../state/progressStore'

export function SettingsPage() {
  const settings = useProgressStore((state) => state.settings)
  const setReducedMotion = useProgressStore((state) => state.setReducedMotion)
  const setColorblind = useProgressStore((state) => state.setColorblind)
  const setDemoSpeed = useProgressStore((state) => state.setDemoSpeed)
  const setTrainerOrder = useProgressStore((state) => state.setTrainerOrder)
  const setAufExecute = useProgressStore((state) => state.setAufExecute)
  const setOnboarded = useProgressStore((state) => state.setOnboarded)

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Preferences</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Settings</h1>
      <p className="mt-3 text-sm text-white/55">Saved in this browser with your XP and times.</p>

      <ul className="mt-8 space-y-4 text-sm text-white/80">
        <li className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="font-medium text-white">Colorblind stickers</p>
            <p className="text-xs text-white/45">High-contrast colors plus W/Y/R/O/B/G letters.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.colorblind ?? false}
            onChange={(event) => setColorblind(event.target.checked)}
          />
        </li>
        <li className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="font-medium text-white">Reduce demo motion</p>
            <p className="text-xs text-white/45">Lesson Play applies the algorithm instantly.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.reducedMotion ?? false}
            onChange={(event) => setReducedMotion(event.target.checked)}
          />
        </li>
        <li className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="font-medium text-white">Random AUF in trainer execute</p>
            <p className="text-xs text-white/45">Last-layer cases get a random U turn. Align, then do the alg.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.aufExecute ?? true}
            onChange={(event) => setAufExecute(event.target.checked)}
          />
        </li>
        <li className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <label className="font-medium text-white" htmlFor="demo-speed">
            Demo speed
          </label>
          <select
            id="demo-speed"
            value={settings.demoSpeed}
            onChange={(event) => setDemoSpeed(event.target.value as 'slow' | 'normal' | 'fast')}
            className="rounded-full border border-white/15 bg-ink-900 px-3 py-1 text-white/80"
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </li>
        <li className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <label className="font-medium text-white" htmlFor="trainer-order">
            Trainer order
          </label>
          <select
            id="trainer-order"
            value={settings.trainerOrder ?? 'weighted'}
            onChange={(event) => setTrainerOrder(event.target.value === 'slowest' ? 'slowest' : 'weighted')}
            className="rounded-full border border-white/15 bg-ink-900 px-3 py-1 text-white/80"
          >
            <option value="weighted">Weak first</option>
            <option value="slowest">Slowest first</option>
          </select>
        </li>
      </ul>

      <button
        type="button"
        className="mt-8 text-xs text-white/40 underline-offset-2 hover:text-white/70 hover:underline"
        onClick={() => setOnboarded(false)}
      >
        Replay the intro
      </button>
    </div>
  )
}
