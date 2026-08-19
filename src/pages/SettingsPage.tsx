import { CUBE_SKINS, DEFAULT_SKIN_ID } from '../engine/render/skins'
import { useProgressStore } from '../state/progressStore'

export function SettingsPage() {
  const settings = useProgressStore((state) => state.settings)
  const setReducedMotion = useProgressStore((state) => state.setReducedMotion)
  const setColorblind = useProgressStore((state) => state.setColorblind)
  const setDemoSpeed = useProgressStore((state) => state.setDemoSpeed)
  const setTrainerOrder = useProgressStore((state) => state.setTrainerOrder)
  const setAufExecute = useProgressStore((state) => state.setAufExecute)
  const setOnboarded = useProgressStore((state) => state.setOnboarded)
  const setSound = useProgressStore((state) => state.setSound)
  const setSkinId = useProgressStore((state) => state.setSkinId)
  const skinId = settings.skinId ?? DEFAULT_SKIN_ID

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Preferences</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Settings</h1>
      <p className="mt-3 text-sm text-white/55">Saved in this browser with your XP and times.</p>

      <ul className="mt-8 space-y-4 text-sm text-white/80">
        <li className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <label className="block font-medium text-white" htmlFor="colorblind">
              Colorblind stickers
            </label>
            <p className="text-xs text-white/45" id="colorblind-hint">
              High-contrast colors plus W/Y/R/O/B/G letters.
            </p>
          </div>
          <input
            id="colorblind"
            type="checkbox"
            aria-describedby="colorblind-hint"
            checked={settings.colorblind ?? false}
            onChange={(event) => setColorblind(event.target.checked)}
          />
        </li>
        <li className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <label className="block font-medium text-white" htmlFor="sound">
              Sound
            </label>
            <p className="text-xs text-white/45" id="sound-hint">
              A soft click on twists, a chime when you solve.
            </p>
          </div>
          <input
            id="sound"
            type="checkbox"
            aria-describedby="sound-hint"
            checked={settings.sound ?? true}
            onChange={(event) => setSound(event.target.checked)}
          />
        </li>
        <li className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <label className="block font-medium text-white" htmlFor="reduce-motion">
              Reduce demo motion
            </label>
            <p className="text-xs text-white/45" id="reduce-motion-hint">
              Lesson Play applies the algorithm instantly.
            </p>
          </div>
          <input
            id="reduce-motion"
            type="checkbox"
            aria-describedby="reduce-motion-hint"
            checked={settings.reducedMotion ?? false}
            onChange={(event) => setReducedMotion(event.target.checked)}
          />
        </li>
        <li className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <label className="block font-medium text-white" htmlFor="auf-execute">
              Random AUF in trainer execute
            </label>
            <p className="text-xs text-white/45" id="auf-execute-hint">
              Last-layer cases get a random U turn. Align, then do the alg.
            </p>
          </div>
          <input
            id="auf-execute"
            type="checkbox"
            aria-describedby="auf-execute-hint"
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

      {/* Radios rather than a select: this is one choice among a few, and the
          swatch has to be visible to mean anything. Native inputs give keyboard
          and screen-reader behaviour for free. */}
      <fieldset className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <legend className="px-1 font-medium text-white">Cube skin</legend>
        <p className="text-xs text-white/45">
          Changes the plastic, never the sticker colors - so it stays colorblind-safe.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CUBE_SKINS.map((skin) => {
            const active = skin.id === skinId
            return (
              <label
                key={skin.id}
                // The radio itself is sr-only, so the focus ring has to be moved
                // onto the label - otherwise keyboard users arrowing through the
                // swatches get no visible indication of where they are.
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-400 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-ink-950 ${
                  active
                    ? 'border-brand-500 bg-brand-500/15 text-white'
                    : 'border-white/10 text-white/70 hover:border-white/25 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="cube-skin"
                  value={skin.id}
                  checked={active}
                  onChange={() => setSkinId(skin.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="h-5 w-5 flex-none rounded-md ring-1 ring-white/20"
                  style={{ background: skin.swatch }}
                />
                {skin.name}
              </label>
            )
          })}
        </div>
      </fieldset>

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
