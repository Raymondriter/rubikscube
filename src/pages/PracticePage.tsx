import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { CubeCanvas, type CubeCanvasHandle } from '../components/cube/CubeCanvas'
import { MoveKeypad } from '../components/practice/MoveKeypad'
import { Celebration } from '../components/progress/Celebration'
import { primaryAlgorithm, studentAlgorithm } from '../data/algorithm'
import { casesForStep, methodById, stepById } from '../data/methods'
import { PRACTICE_XP } from '../state/progress'
import { useProgressStore } from '../state/progressStore'
import { btnGhost, btnPrimary, cubeStageClass, cubeStageStyle } from '../components/ui/styles'

export function PracticePage() {
  const { methodId = '', stepId = '' } = useParams()
  const cubeRef = useRef<CubeCanvasHandle>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [index, setIndex] = useState(0)
  const [hint, setHint] = useState(false)
  const [won, setWon] = useState(false)
  const [awarded, setAwarded] = useState(false)
  const masteredCases = useProgressStore((state) => state.masteredCases)
  const masterCase = useProgressStore((state) => state.masterCase)

  const method = (() => {
    try {
      return methodById(methodId)
    } catch {
      return null
    }
  })()
  const step = method
    ? (() => {
        try {
          return stepById(method, stepId)
        } catch {
          return null
        }
      })()
    : null
  const cases = step ? casesForStep(step) : []
  const cubeCase = cases[index] ?? cases[0]
  const caseId = cubeCase?.id

  const loadCase = useCallback(() => {
    const cube = cubeRef.current
    if (!cube || !cubeCase) return
    cube.reset()
    cube.applyAlgorithmInstant(cubeCase.setupMoves)
    setWon(false)
    setAwarded(false)
    setHint(false)
  }, [cubeCase])

  useEffect(() => {
    if (ready && caseId) loadCase()
  }, [ready, caseId, loadCase])

  if (!method || !step) return <Navigate to="/" replace />
  if (!cubeCase) return <Navigate to={`/learn/${method.id}/${step.id}`} replace />

  const alreadyMastered = masteredCases.includes(cubeCase.id)
  const hideName = step.practiceMode === 'quiz'
  const hintAlg = studentAlgorithm(primaryAlgorithm(cubeCase))

  const checkSolved = () => {
    if (won) return
    if (cubeRef.current?.getIsColorSolved()) {
      setWon(true)
      if (!alreadyMastered) {
        masterCase(cubeCase.id)
        setAwarded(true)
      }
    }
  }

  const goNext = () => {
    setIndex((current) => (current + 1) % cases.length)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
      <div className="w-full">
        <Link
          to={`/learn/${method.id}/${step.id}`}
          className="text-xs font-medium text-white/40 hover:text-white/70"
        >
          ← {step.title}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Practice</h1>
        <p className="mt-1 text-sm text-white/50">
          {hideName
            ? 'Recognize the case and solve it. Drag a face or use the keypad.'
            : 'Solve this case with the algorithm you just learned — or find your own way.'}
        </p>
      </div>

      <div className={`${cubeStageClass} w-full`} style={cubeStageStyle}>
        <CubeCanvas
          ref={cubeRef}
          className="h-full w-full"
          twistEnabled
          onReady={() => setReady(true)}
          onBusyChange={setBusy}
          onMove={checkSolved}
        />
        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
          {hideName && !hint ? `Case ${index + 1} of ${cases.length}` : cubeCase.name}
        </div>
        {won && (
          <Celebration
            title="Solved!"
            detail={awarded ? `+${PRACTICE_XP} XP · case mastered` : 'Already mastered — nice cleanup.'}
            onDismiss={goNext}
            actionLabel={index === cases.length - 1 ? 'Again' : 'Next case'}
          />
        )}
      </div>

      {hint && (
        <p className="font-mono text-sm text-brand-400">{hintAlg}</p>
      )}

      <MoveKeypad
        disabled={busy || won}
        onMove={(token) => {
          cubeRef.current?.enqueueMove(token, 140)
        }}
      />

      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className={btnGhost} onClick={loadCase}>
          Reset case
        </button>
        <button type="button" className={btnGhost} onClick={() => setHint((value) => !value)}>
          {hint ? 'Hide hint' : 'Show hint'}
        </button>
        <button type="button" className={btnPrimary} onClick={goNext}>
          Skip
        </button>
      </div>
    </div>
  )
}
