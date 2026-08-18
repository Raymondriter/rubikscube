import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AlgorithmDemo } from '../components/lesson/AlgorithmDemo'
import { LessonMarkdown } from '../components/lesson/LessonMarkdown'
import { adjacentSteps, methodById, stepById } from '../data/methods/catalog'
import { useProgressStore } from '../state/progressStore'
import { btnGhost, btnPrimary } from '../components/ui/styles'

const TRAINER_FOR_STEP: Record<string, string> = {
  'cfop-pll': '/train/pll',
  'cfop-pll-2look': '/train/pll-2look',
  'cfop-oll': '/train/oll',
  'cfop-oll-2look': '/train/oll-2look',
  'cfop-f2l': '/train/f2l',
  'beginner-yellow-cross': '/train/beginner-ll',
  'beginner-yellow-corners-orient': '/train/beginner-ll',
  'beginner-yellow-corners-permute': '/train/beginner-ll',
  'beginner-yellow-edges-permute': '/train/beginner-ll',
  'roux-cmll': '/train/cmll',
}

export function LessonPage() {
  const { methodId = '', stepId = '' } = useParams()
  const completedLessons = useProgressStore((state) => state.completedLessons)
  const completeLesson = useProgressStore((state) => state.completeLesson)
  const speed = useProgressStore((state) => state.settings.demoSpeed)
  const reducedMotion = useProgressStore((state) => state.settings.reducedMotion)
  const setDemoSpeed = useProgressStore((state) => state.setDemoSpeed)
  const [justCompleted, setJustCompleted] = useState(false)

  let method
  let step
  try {
    method = methodById(methodId)
    step = stepById(method, stepId)
  } catch {
    return <Navigate to="/" replace />
  }

  const { prev, next } = adjacentSteps(method, step.id)
  const done = completedLessons.includes(step.id)

  const markDone = () => {
    completeLesson(step.id, step.xpReward)
    setJustCompleted(true)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <Link to={`/learn/${method.id}`} className="text-xs font-medium text-white/40 hover:text-white/70">
          ← {method.name}
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white">{step.title}</h1>
          <span className="text-xs text-white/40">{step.xpReward} XP</span>
        </div>
      </div>

      <LessonMarkdown source={step.bodyMd} />

      {step.demoCaseIds.length > 0 && (
        <AlgorithmDemo
          caseIds={step.demoCaseIds}
          speed={speed}
          reducedMotion={reducedMotion}
          onSpeedChange={setDemoSpeed}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
        <div className="flex flex-wrap gap-2">
          {prev && (
            <Link to={`/learn/${method.id}/${prev.id}`} className={btnGhost}>
              ← {prev.title}
            </Link>
          )}
          {next && (
            <Link to={`/learn/${method.id}/${next.id}`} className={btnGhost}>
              {next.title} →
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {step.demoCaseIds.length > 0 && (
            <Link to={`/learn/${method.id}/${step.id}/practice`} className={btnGhost}>
              Practice
            </Link>
          )}
          {TRAINER_FOR_STEP[step.id] && (
            <Link to={TRAINER_FOR_STEP[step.id]} className={btnGhost}>
              Drill in trainer
            </Link>
          )}
          <button type="button" className={btnPrimary} disabled={done} onClick={markDone}>
            {done ? (justCompleted ? `+${step.xpReward} XP` : 'Completed') : 'Mark complete'}
          </button>
        </div>
      </div>
    </div>
  )
}
