export type MethodId = 'beginner' | 'cfop' | 'roux' | 'zz'

export type PracticeMode = 'none' | 'guided' | 'quiz'

/**
 * One teachable situation. `setupMoves` applied to a solved cube produces
 * the "before" state; the first entry in `solutions` undoes that setup
 * exactly (setup + primary = solved). Whole-cube rotations in those strings
 * are engine bookkeeping so last-layer cases can be held yellow-on-U;
 * strip them with `studentAlgorithm` before showing the alg to a learner.
 */
export interface AlgorithmCase {
  id: string
  method: MethodId
  step: string
  name: string
  group: string
  setupMoves: string
  solutions: string[]
  /** Slots to pulse after setup, named in the teaching view (e.g. "UF", "UFR"). */
  recognitionHighlight: string[]
  tags: string[]
}

export interface LessonStep {
  id: string
  method: MethodId
  title: string
  bodyMd: string
  demoCaseIds: string[]
  practiceMode: PracticeMode
  xpReward: number
}

export interface Method {
  id: MethodId
  name: string
  summary: string
  steps: LessonStep[]
}
