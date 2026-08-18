import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { AlgorithmDemo } from '../components/lesson/AlgorithmDemo'
import { casesForMethod, methodsById } from '../data/methods'
import { useProgressStore } from '../state/progressStore'

export function CaseBrowserPage() {
  const { methodId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const speed = useProgressStore((state) => state.settings.demoSpeed)
  const reducedMotion = useProgressStore((state) => state.settings.reducedMotion)
  const setDemoSpeed = useProgressStore((state) => state.setDemoSpeed)
  const masteredCases = useProgressStore((state) => state.masteredCases)
  const method = methodsById[methodId]
  const cases = method ? casesForMethod(method.id) : []
  const primaryFamilies = ['cross', 'f2l', 'oll', 'pll', 'edges', 'corners', 'both']
  const families = [
    'all',
    ...primaryFamilies.filter((name) => cases.some((entry) => entry.tags.includes(name) || entry.group === name)),
  ]

  if (!method) return <Navigate to="/" replace />

  const family = params.get('family') ?? 'all'
  const visible = cases.filter((entry) => family === 'all' || entry.tags.includes(family) || entry.group === family)
  const ids = visible.map((entry) => entry.id)
  const mastered = visible.filter((entry) => masteredCases.includes(entry.id)).length

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
      <div className="w-full">
        <Link to={`/learn/${method.id}`} className="text-xs font-medium text-white/40 hover:text-white/70">
          ← {method.name}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Case browser</h1>
        <p className="mt-1 text-sm text-white/50">
          {visible.length} cases · {mastered} practiced
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
        {families.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setParams(name === 'all' ? {} : { family: name })}
            className={`rounded-full border px-3 py-1 text-xs ${
              family === name
                ? 'border-brand-400 bg-brand-500/20 text-white'
                : 'border-white/10 text-white/60 hover:bg-white/5'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {ids.length > 0 ? (
        <AlgorithmDemo
          caseIds={ids}
          speed={speed}
          reducedMotion={reducedMotion}
          onSpeedChange={setDemoSpeed}
        />
      ) : (
        <p className="text-sm text-white/40">Nothing in this family.</p>
      )}
    </div>
  )
}
