import { useEffect, useRef, useState } from 'react'
import { CubeCanvas, type CubeCanvasHandle } from '../components/cube/CubeCanvas'
import { MoveKeypad } from '../components/practice/MoveKeypad'
import { btnGhost, btnPrimary, cubeStageClass, cubeStageStyle } from '../components/ui/styles'
import { playSolveChime, playTwistClick } from '../engine/sound'
import { averageOfFive, formatTime, formatTimedSolve, sessionSummary } from '../state/progress'
import { useProgressStore } from '../state/progressStore'

type Phase = 'idle' | 'inspect' | 'timing' | 'done'

export function SandboxPage() {
  const cubeRef = useRef<CubeCanvasHandle>(null)
  const startedAtRef = useRef(0)
  const recordedRef = useRef(false)
  const suppressNextChimeRef = useRef(false)
  const [solved, setSolved] = useState(true)
  const [busy, setBusy] = useState(false)
  const [lastScramble, setLastScramble] = useState<string[]>([])
  const [phase, setPhase] = useState<Phase>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [inspectLeft, setInspectLeft] = useState(15)
  const [showPad, setShowPad] = useState(false)
  const recordTimedSolve = useProgressStore((state) => state.recordTimedSolve)
  const deleteLastTimedSolve = useProgressStore((state) => state.deleteLastTimedSolve)
  const penalizeLastTimedSolve = useProgressStore((state) => state.penalizeLastTimedSolve)
  const timedSolves = useProgressStore((state) => state.timedSolves)
  const lastSolve = timedSolves.at(-1)
  const summary = sessionSummary(timedSolves)
  const ao5 = averageOfFive(timedSolves)

  useEffect(() => {
    if (phase !== 'timing') return
    const id = window.setInterval(() => setElapsed(performance.now() - startedAtRef.current), 50)
    return () => window.clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (!busy && !solved && lastScramble.length > 0 && phase === 'idle') {
      setPhase('inspect')
      setInspectLeft(15)
      recordedRef.current = false
    }
  }, [busy, solved, lastScramble.length, phase])

  const startClock = () => {
    if (phase !== 'inspect') return
    startedAtRef.current = performance.now()
    setElapsed(0)
    setPhase('timing')
  }

  useEffect(() => {
    if (phase !== 'inspect') return
    const id = window.setInterval(() => setInspectLeft((left) => left - 1), 1000)
    return () => window.clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'inspect' || inspectLeft > 0) return
    startedAtRef.current = performance.now()
    setElapsed(0)
    setPhase('timing')
  }, [inspectLeft, phase])

  const finish = () => {
    if (phase !== 'timing' || recordedRef.current) return
    const ms = Math.round(performance.now() - startedAtRef.current)
    recordedRef.current = true
    setElapsed(ms)
    setPhase('done')
    recordTimedSolve(ms)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return
      event.preventDefault()
      if (phase === 'inspect') startClock()
      else if (phase === 'done' || phase === 'idle') {
        const tokens = cubeRef.current?.scramble() ?? []
        if (tokens.length > 0) {
          setLastScramble(tokens)
          setPhase('idle')
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="flex flex-col items-center gap-6">
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Sandbox</h1>
        <p className="mt-1 text-sm text-white/50">
          Scramble, then Space to start the clock. Drag a face or use the keypad.
          <span className="pointer-coarse:hidden"> Arrow keys orbit.</span>
        </p>
      </header>

      <div className={`${cubeStageClass} w-full`} style={cubeStageStyle}>
        <CubeCanvas
          ref={cubeRef}
          className="h-full w-full"
          onSolvedChange={(value) => {
            setSolved(value)
            if (value) {
              finish()
              if (!suppressNextChimeRef.current) playSolveChime()
              suppressNextChimeRef.current = false
            }
          }}
          onBusyChange={setBusy}
          onMove={playTwistClick}
        />
        <div
          className={`pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1 font-mono text-sm ${
            solved ? 'bg-cube-green/20 text-cube-green' : 'bg-white/10 text-white'
          }`}
        >
          {phase === 'timing' || phase === 'done' ? formatTime(elapsed) : solved ? 'Solved' : 'Scrambled'}
        </div>
        {phase === 'inspect' && (
          <button
            type="button"
            onClick={startClock}
            className="absolute inset-0 z-10 flex items-center justify-center bg-ink-950/50 text-sm font-medium text-white"
          >
            Inspect {inspectLeft}s — Space or tap to start
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            const tokens = cubeRef.current?.scramble() ?? []
            if (tokens.length) {
              setLastScramble(tokens)
              setPhase('idle')
              setElapsed(0)
            }
          }}
          className={btnPrimary}
        >
          {busy ? 'Scrambling…' : 'Scramble'}
        </button>
        <button
          type="button"
          onClick={() => {
            suppressNextChimeRef.current = true
            cubeRef.current?.reset()
            setLastScramble([])
            setPhase('idle')
            setElapsed(0)
          }}
          className={btnGhost}
        >
          Reset
        </button>
        <button type="button" className={btnGhost} onClick={() => setShowPad((value) => !value)}>
          {showPad ? 'Hide keypad' : 'Show keypad'}
        </button>
      </div>

      {showPad && (
        <MoveKeypad
          disabled={busy || phase === 'inspect'}
          onMove={(token) => cubeRef.current?.enqueueMove(token, 120)}
        />
      )}

      {lastScramble.length > 0 && (
        <div className="flex max-w-xl flex-col items-center gap-2">
          <p className="text-center font-mono text-xs text-white/40">{lastScramble.join(' ')}</p>
          <button
            type="button"
            className="text-xs text-white/40 hover:text-white/70"
            onClick={() => void navigator.clipboard.writeText(lastScramble.join(' '))}
          >
            Copy scramble
          </button>
        </div>
      )}

      {phase === 'done' && lastSolve && (
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" className={btnGhost} onClick={() => penalizeLastTimedSolve('plus2')}>
            +2
          </button>
          <button type="button" className={btnGhost} onClick={() => penalizeLastTimedSolve('dnf')}>
            DNF
          </button>
          <button type="button" className={btnGhost} onClick={() => deleteLastTimedSolve()}>
            Delete
          </button>
        </div>
      )}

      {summary && (
        <p className="text-xs text-white/45">
          {summary.count} timed solves
          {lastSolve ? ` · last ${formatTimedSolve(lastSolve)}` : ''} · best {formatTime(summary.bestMs)} · avg{' '}
          {formatTime(summary.meanMs)}
          {ao5 !== null && ` · ao5 ${formatTime(ao5)}`}
        </p>
      )}
    </div>
  )
}
