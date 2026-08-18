import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { CubeCanvas, type CubeCanvasHandle } from '../components/cube/CubeCanvas'
import { MoveKeypad } from '../components/practice/MoveKeypad'
import { primaryAlgorithm, studentAlgorithm } from '../data/algorithm'
import { twoSidedPllView } from '../data/pllView'
import { caseById } from '../data/methods'
import type { AlgorithmCase } from '../data/types'
import type { StickerColor } from '../engine/types'
import { SideStickers } from '../components/trainer/SideStickers'
import { trainerSetById, trainerSets } from '../data/trainerSets'
import {
  dailyDrillStatus,
  formatTime,
  pickSlowestCase,
  pickWeightedCase,
  sessionSummary,
  TRAINER_RECOGNIZE_XP,
  TRAINER_SOLVE_XP,
} from '../state/progress'
import { useProgressStore } from '../state/progressStore'
import { btnGhost, btnPrimary, cubeStageClass, cubeStageStyle } from '../components/ui/styles'

type Mode = 'execute' | 'recognize' | 'sides'
type Phase = 'inspect' | 'running' | 'done'

const AUFS = ['', 'U', "U'", 'U2'] as const
const YTURNS = ['', 'y', "y'", 'y2'] as const

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = next[i]
    const b = next[j]
    if (a !== undefined && b !== undefined) {
      next[i] = b
      next[j] = a
    }
  }
  return next
}

function recognitionChoices(correct: AlgorithmCase, pool: AlgorithmCase[]): AlgorithmCase[] {
  const others = shuffle(pool.filter((entry) => entry.id !== correct.id)).slice(0, 3)
  return shuffle([correct, ...others])
}

export function TrainerSessionPage() {
  const { setId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const cubeRef = useRef<CubeCanvasHandle>(null)
  const startedAtRef = useRef(0)
  const recordedRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState<Phase>('inspect')
  const [caseId, setCaseId] = useState<string | null>(null)
  const [choices, setChoices] = useState<AlgorithmCase[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [hint, setHint] = useState(false)
  const [lastMs, setLastMs] = useState<number | null>(null)
  const [sessionTimes, setSessionTimes] = useState<number[]>([])
  const [sideView, setSideView] = useState<{ front: StickerColor[]; right: StickerColor[] } | null>(null)

  const caseStats = useProgressStore((state) => state.caseStats)
  const recordSolve = useProgressStore((state) => state.recordSolve)
  const recordRecognize = useProgressStore((state) => state.recordRecognize)
  const trainerOrder = useProgressStore((state) => state.settings.trainerOrder)
  const setTrainerOrder = useProgressStore((state) => state.setTrainerOrder)
  const aufExecute = useProgressStore((state) => state.settings.aufExecute ?? true)
  const ensureDailyDrill = useProgressStore((state) => state.ensureDailyDrill)
  const dailyDrill = useProgressStore((state) => state.dailyDrill)
  const completedLessons = useProgressStore((state) => state.completedLessons)
  const drill = dailyDrillStatus({ dailyDrill, completedLessons, caseStats })

  const knownSet = trainerSets.some((entry) => entry.id === setId)
  const set = knownSet ? trainerSetById(setId) : null
  const rawMode = params.get('mode')
  const mode: Mode = rawMode === 'recognize' || rawMode === 'sides' ? rawMode : 'execute'
  const requestedCase = params.get('case')
  const lockedId = set && requestedCase && set.caseIds.includes(requestedCase) ? requestedCase : null
  const cubeCase = caseId ? caseById(caseId) : null
  const pool = useMemo(() => (set ? set.caseIds.map(caseById) : []), [set])

  const writeParams = (nextMode: Mode, caseOverride: string | null = lockedId) => {
    const next = new URLSearchParams()
    if (nextMode !== 'execute') next.set('mode', nextMode)
    if (caseOverride) next.set('case', caseOverride)
    setParams(next)
  }

  const loadNext = useCallback(() => {
    if (!set) return
    const nextId =
      lockedId ??
      (trainerOrder === 'slowest'
        ? pickSlowestCase(set.caseIds, caseStats, caseId ?? undefined)
        : pickWeightedCase(set.caseIds, caseStats, caseId ?? undefined))
    const nextCase = caseById(nextId)
    setCaseId(nextId)
    setPhase('inspect')
    setHint(false)
    setPicked(null)
    setLastMs(null)
    setElapsed(0)
    recordedRef.current = false
    const quiz = mode === 'recognize' || mode === 'sides'
    setChoices(quiz ? recognitionChoices(nextCase, pool) : [])
    if (mode === 'sides') {
      const extras = [
        AUFS[Math.floor(Math.random() * AUFS.length)] ?? '',
        YTURNS[Math.floor(Math.random() * YTURNS.length)] ?? '',
      ]
      setSideView(twoSidedPllView(nextCase.setupMoves, extras))
      return
    }
    setSideView(null)
    const cube = cubeRef.current
    if (!cube) return
    cube.reset()
    cube.applyAlgorithmInstant(nextCase.setupMoves)
    const needsAuf = mode === 'recognize' || (mode === 'execute' && aufExecute)
    if (needsAuf) {
      const auf = AUFS[Math.floor(Math.random() * AUFS.length)]
      if (auf) cube.applyAlgorithmInstant(auf)
    }
    cube.setHighlightSlots([])
  }, [set, caseStats, caseId, lockedId, mode, pool, trainerOrder, aufExecute])

  useEffect(() => {
    ensureDailyDrill()
  }, [ensureDailyDrill])

  useEffect(() => {
    setCaseId(null)
    setPhase('inspect')
  }, [mode, lockedId])

  useEffect(() => {
    if (mode === 'sides') setReady(true)
  }, [mode])

  useEffect(() => {
    if (ready && set && !caseId) loadNext()
  }, [ready, set, caseId, loadNext])

  useEffect(() => {
    if (phase !== 'running' || mode !== 'execute') return
    const id = window.setInterval(() => setElapsed(performance.now() - startedAtRef.current), 50)
    return () => window.clearInterval(id)
  }, [phase, mode])

  const start = () => {
    if (phase !== 'inspect') return
    startedAtRef.current = performance.now()
    setPhase('running')
  }

  const finishSolve = useCallback(() => {
    if (phase !== 'running' || mode !== 'execute' || recordedRef.current || !caseId) return
    const ms = Math.round(performance.now() - startedAtRef.current)
    recordedRef.current = true
    setLastMs(ms)
    setElapsed(ms)
    setPhase('done')
    setSessionTimes((times) => [...times, ms])
    recordSolve(caseId, ms)
  }, [phase, mode, caseId, recordSolve])

  const pickName = (id: string) => {
    if (phase !== 'running' || (mode !== 'recognize' && mode !== 'sides') || !cubeCase || recordedRef.current) return
    recordedRef.current = true
    const correct = id === cubeCase.id
    setPicked(id)
    setPhase('done')
    recordRecognize(cubeCase.id, correct)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
        return
      }
      if (event.code === 'Space') {
        event.preventDefault()
        if (phase === 'inspect') start()
        else if (phase === 'done') loadNext()
        return
      }
      if ((mode === 'recognize' || mode === 'sides') && phase === 'running') {
        const index = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(event.code)
        const choice = choices[index]
        if (choice) pickName(choice.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!knownSet || !set) return <Navigate to="/train" replace />

  const stats = caseId ? caseStats[caseId] : undefined
  const hintAlg = cubeCase ? studentAlgorithm(primaryAlgorithm(cubeCase)) : ''
  const session = sessionSummary(sessionTimes)

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
      <div className="w-full">
        <Link to="/train" className="text-xs font-medium text-white/40 hover:text-white/70">
          ← Trainer
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white">{set.name}</h1>
          <div className="flex rounded-full border border-white/10 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => writeParams('execute')}
              className={`rounded-full px-3 py-1 ${mode === 'execute' ? 'bg-white/10 text-white' : 'text-white/50'}`}
            >
              Execute
            </button>
            <button
              type="button"
              onClick={() => writeParams('recognize')}
              className={`rounded-full px-3 py-1 ${mode === 'recognize' ? 'bg-white/10 text-white' : 'text-white/50'}`}
            >
              Recognize
            </button>
            {(set.id === 'pll' || set.id === 'pll-2look' || set.id === 'cmll' || set.id === 'zz-ocll') && (
              <button
                type="button"
                onClick={() => writeParams('sides')}
                className={`rounded-full px-3 py-1 ${mode === 'sides' ? 'bg-white/10 text-white' : 'text-white/50'}`}
              >
                2-sided
              </button>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-white/50">
          {mode === 'execute'
            ? `Solve it. Space starts and goes to the next case. ${aufExecute ? 'A random U turn is applied — AUF, then the alg. ' : ''}+${TRAINER_SOLVE_XP} XP per solve.`
            : mode === 'sides'
              ? 'Name the case from two last-layer sides only — how you recognize in a real solve. Keys 1–4.'
              : `Name the case. A random U turn is applied so you can't memorize one picture. Keys 1–4 pick an answer. +${TRAINER_RECOGNIZE_XP} XP if you're right.`}
        </p>
        {lockedId && (
          <p className="mt-2 text-sm text-white/55">
            Drilling {caseById(lockedId).name}.{' '}
            <button type="button" className="text-brand-400 hover:text-brand-300" onClick={() => writeParams(mode, null)}>
              Train full set
            </button>
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/45">
          {!lockedId && (
            <label className="flex items-center gap-2">
              Order
              <select
                value={trainerOrder}
                onChange={(event) => setTrainerOrder(event.target.value === 'slowest' ? 'slowest' : 'weighted')}
                className="rounded-full border border-white/15 bg-ink-900 px-2 py-1 text-white/80"
              >
                <option value="weighted">Weak first</option>
                <option value="slowest">Slowest first</option>
              </select>
            </label>
          )}
          <Link to={`/train/${set.id}/stats`} className="hover:text-white/70">
            Stats
          </Link>
          {session && (
            <span>
              Session {session.count} · avg {formatTime(session.meanMs)} · best {formatTime(session.bestMs)}
            </span>
          )}
          {set.id === drill.setId && (
            <span>
              Today {drill.reps}/{drill.target}
            </span>
          )}
        </div>
        {set.id === drill.setId && drill.done && (
          <p className="mt-2 text-sm text-brand-400">Daily drill complete</p>
        )}
      </div>

      {mode === 'sides' ? (
        <div className="flex min-h-48 w-full max-w-xl flex-col items-center justify-center rounded-3xl border border-white/10 bg-ink-900/60 py-10">
          {sideView && <SideStickers front={sideView.front} right={sideView.right} />}
          {phase === 'inspect' && (
            <button type="button" className={`${btnPrimary} mt-8`} onClick={start}>
              Press Space or tap to start
            </button>
          )}
        </div>
      ) : (
        <div className={`${cubeStageClass} w-full`} style={cubeStageStyle}>
          <CubeCanvas
            ref={cubeRef}
            className="h-full w-full"
            twistEnabled={mode === 'execute' && phase === 'running'}
            onReady={() => setReady(true)}
            onBusyChange={setBusy}
            onMove={() => {
              if (cubeRef.current?.getIsColorSolved()) finishSolve()
            }}
          />
          <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 font-mono text-sm text-white">
            {mode === 'execute' && phase !== 'inspect' ? formatTime(elapsed) : '0.00'}
          </div>
          {phase === 'inspect' && (
            <button
              type="button"
              onClick={start}
              className="absolute inset-0 z-10 flex items-center justify-center bg-ink-950/55 text-sm font-medium text-white"
            >
              Press Space or tap to start
            </button>
          )}
        </div>
      )}

      {(mode === 'recognize' || mode === 'sides') && phase !== 'inspect' && (
        <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
          {choices.map((entry, index) => {
            const correct = cubeCase && entry.id === cubeCase.id
            const show = phase === 'done'
            return (
              <button
                key={entry.id}
                type="button"
                disabled={phase !== 'running'}
                onClick={() => pickName(entry.id)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm ${
                  show && correct
                    ? 'border-cube-green/50 bg-cube-green/15 text-cube-green'
                    : show && picked === entry.id
                      ? 'border-cube-red/50 bg-cube-red/10 text-red-300'
                      : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-2 text-white/35">{index + 1}</span>
                {entry.name}
              </button>
            )
          })}
        </div>
      )}

      {phase === 'done' && (
        <div className="text-center">
          {mode === 'execute' && lastMs !== null && (
            <p className="text-lg font-semibold text-white">
              {formatTime(lastMs)}s
              {stats?.bestMs === lastMs ? ' · best' : ''}
            </p>
          )}
          {(mode === 'recognize' || mode === 'sides') && (
            <p className="text-lg font-semibold text-white">{picked === cubeCase?.id ? 'Correct' : 'Not quite'}</p>
          )}
          <p className="mt-2 font-mono text-sm text-brand-400">{hintAlg}</p>
          {cubeCase && <p className="mt-1 text-xs text-white/40">{cubeCase.name}</p>}
        </div>
      )}

      {mode === 'execute' && phase === 'running' && (
        <>
          {hint && <p className="font-mono text-sm text-brand-400">{hintAlg}</p>}
          <MoveKeypad
            disabled={busy}
            onMove={(token) => {
              cubeRef.current?.enqueueMove(token, 120)
            }}
          />
        </>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {phase === 'inspect' && (
          <button type="button" className={btnPrimary} onClick={start}>
            Start
          </button>
        )}
        {mode === 'execute' && phase === 'running' && (
          <button type="button" className={btnGhost} onClick={() => setHint((value) => !value)}>
            {hint ? 'Hide hint' : 'Show hint'}
          </button>
        )}
        {phase === 'done' && (
          <button type="button" className={btnPrimary} onClick={loadNext}>
            {lockedId ? 'Again' : 'Next'}
          </button>
        )}
        <button type="button" className={btnGhost} onClick={loadNext}>
          Skip
        </button>
      </div>
    </div>
  )
}
