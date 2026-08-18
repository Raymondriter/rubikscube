import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { primaryAlgorithm, studentAlgorithm } from '../../data/algorithm'
import { caseById } from '../../data/methods'
import { tokenizeAlgorithm } from '../../engine/notation'
import type { DemoSpeed } from '../../state/progress'
import { CubeCanvas, type CubeCanvasHandle } from '../cube/CubeCanvas'
import { CasePicker } from './CasePicker'
import { btnGhost, btnPrimary, cubeStageClass, cubeStageStyle } from '../ui/styles'

const SPEED_MS: Record<DemoSpeed, number> = { slow: 280, normal: 170, fast: 90 }

interface AlgorithmDemoProps {
  caseIds: string[]
  speed: DemoSpeed
  reducedMotion?: boolean
  onSpeedChange?: (speed: DemoSpeed) => void
}

export function AlgorithmDemo({ caseIds, speed, reducedMotion = false, onSpeedChange }: AlgorithmDemoProps) {
  const cubeRef = useRef<CubeCanvasHandle>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [activeId, setActiveId] = useState(caseIds[0] ?? '')
  const [cursor, setCursor] = useState(-1)
  const playingAllRef = useRef(false)

  useEffect(() => {
    if (!caseIds.includes(activeId)) setActiveId(caseIds[0] ?? '')
  }, [caseIds, activeId])

  const cubeCase = activeId ? caseById(activeId) : null
  const tokens = useMemo(
    () => (cubeCase ? tokenizeAlgorithm(studentAlgorithm(primaryAlgorithm(cubeCase))) : []),
    [cubeCase],
  )

  const loadCase = useCallback(() => {
    const cube = cubeRef.current
    if (!cube || !cubeCase) return
    cube.reset()
    cube.applyAlgorithmInstant(cubeCase.setupMoves)
    cube.setHighlightSlots(cubeCase.recognitionHighlight)
    setCursor(-1)
    playingAllRef.current = false
  }, [cubeCase])

  useEffect(() => {
    if (ready) loadCase()
  }, [ready, loadCase])

  const playAll = () => {
    const cube = cubeRef.current
    if (!cube || !cubeCase || tokens.length === 0) return
    loadCase()
    const alg = tokens.join(' ')
    if (reducedMotion) {
      cube.applyAlgorithmInstant(alg)
      cube.setHighlightSlots([])
      setCursor(tokens.length - 1)
      return
    }
    playingAllRef.current = true
    cube.enqueueAlgorithm(alg, SPEED_MS[speed])
  }

  const stepOnce = () => {
    const cube = cubeRef.current
    if (!cube || busy) return
    const next = cursor + 1
    if (next >= tokens.length) return
    if (cursor < 0) loadCase()
    playingAllRef.current = false
    const token = tokens[next]
    if (!token) return
    cube.enqueueMove(token, SPEED_MS[speed])
    setCursor(next)
    if (next === tokens.length - 1) cube.setHighlightSlots([])
  }

  return (
    <section className="flex flex-col items-center gap-4">
      {caseIds.length > 1 && (
        <CasePicker caseIds={caseIds} activeId={activeId} onSelect={setActiveId} />
      )}

      <div className={cubeStageClass} style={cubeStageStyle}>
        <CubeCanvas
          ref={cubeRef}
          className="h-full w-full"
          twistEnabled={false}
          onReady={() => setReady(true)}
          onBusyChange={setBusy}
          onMove={() => {
            if (!playingAllRef.current) return
            setCursor((current) => {
              const next = current + 1
              if (next >= tokens.length - 1) cubeRef.current?.setHighlightSlots([])
              return next
            })
          }}
        />
        {cubeCase && (
          <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
            {cubeCase.name}
          </div>
        )}
      </div>

      <p className="max-w-xl text-center font-mono text-sm tracking-wide text-white/80">
        {tokens.map((token, index) => (
          <span
            key={`${token}-${index}`}
            className={`mx-0.5 inline-block rounded px-1.5 py-0.5 transition-colors ${
              index === cursor
                ? 'bg-brand-500 text-white'
                : index < cursor
                  ? 'text-white/40'
                  : 'text-white/80'
            }`}
          >
            {token}
          </span>
        ))}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" className={btnPrimary} disabled={busy} onClick={playAll}>
          {busy ? 'Playing…' : 'Play'}
        </button>
        <button type="button" className={btnGhost} disabled={busy || cursor >= tokens.length - 1} onClick={stepOnce}>
          Step
        </button>
        <button type="button" className={btnGhost} onClick={loadCase}>
          Reset
        </button>
        <label className="ml-1 flex items-center gap-2 text-xs text-white/50">
          Speed
          <select
            value={speed}
            onChange={(event) => onSpeedChange?.(event.target.value as DemoSpeed)}
            className="rounded-full border border-white/15 bg-ink-900 px-2 py-1 text-white/80"
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </label>
      </div>
    </section>
  )
}
