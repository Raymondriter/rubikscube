import { beginnerMethod } from '../data/methods/beginner'
import { trainerSets } from '../data/trainerSets'

export const PROGRESS_VERSION = 6
export const XP_PER_LEVEL = 50
export const PRACTICE_XP = 20
export const TRAINER_SOLVE_XP = 5
export const TRAINER_RECOGNIZE_XP = 2
export const DAILY_DRILL_TARGET = 20

export type DemoSpeed = 'slow' | 'normal' | 'fast'

export type TrainerOrder = 'weighted' | 'slowest'

export interface ProgressSettings {
  demoSpeed: DemoSpeed
  reducedMotion: boolean
  colorblind: boolean
  trainerOrder: TrainerOrder
  onboarded: boolean
  aufExecute: boolean
}

export interface CaseStats {
  attempts: number
  solves: number
  recognizeAttempts: number
  recognizes: number
  bestMs: number | null
  lastMs: number | null
}

export interface DailyDrill {
  date: string
  setId: string
  reps: number
}

export interface DailyDrillStatus {
  date: string
  setId: string
  reps: number
  target: number
  remaining: number
  done: boolean
}

export interface ProgressSnapshot {
  xp: number
  streakDays: number
  lastActiveDate: string | null
  completedLessons: string[]
  masteredCases: string[]
  achievements: string[]
  caseStats: Record<string, CaseStats>
  timedSolves: TimedSolve[]
  dailyDrill: DailyDrill | null
  settings: ProgressSettings
}

export interface TimedSolve {
  ms: number
  penalty: 'none' | 'plus2' | 'dnf'
}

export interface Achievement {
  id: string
  name: string
  description: string
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', name: 'First notes', description: 'Finish any lesson.' },
  { id: 'white-cross', name: 'Plus sign', description: 'Build the white cross.' },
  { id: 'first-layer', name: 'Layer one', description: 'Finish the white corners.' },
  { id: 'two-layers', name: 'Equator', description: 'Insert the second-layer edges.' },
  { id: 'graduate', name: 'Beginner graduate', description: 'Complete every beginner lesson.' },
  { id: 'first-practice', name: 'Hands on', description: 'Solve a practice case.' },
  { id: 'case-collector', name: 'Case collector', description: 'Master 8 practice cases.' },
  { id: 'on-a-roll', name: 'On a roll', description: 'Keep a 3-day streak.' },
  { id: 'cfop-cross', name: 'White down', description: 'Finish the CFOP cross lesson.' },
  { id: 'cfop-f2l', name: 'Pairs', description: 'Finish the F2L lesson.' },
  { id: 'cfop-graduate', name: 'CFOP graduate', description: 'Complete every CFOP lesson.' },
  { id: 'first-train', name: 'Reps', description: 'Finish a timed trainer solve.' },
  { id: 'pll-five', name: 'Five perms', description: 'Log a solve on five different PLL cases.' },
  { id: 'first-timed', name: 'Clock started', description: 'Finish a timed sandbox solve.' },
  { id: 'daily-done', name: 'Quota', description: 'Finish today’s 20 trainer reps.' },
]

export const defaultProgress = (): ProgressSnapshot => ({
  xp: 0,
  streakDays: 0,
  lastActiveDate: null,
  completedLessons: [],
  masteredCases: [],
  achievements: [],
  caseStats: {},
  timedSolves: [],
  dailyDrill: null,
  settings: {
    demoSpeed: 'normal',
    reducedMotion: false,
    colorblind: false,
    trainerOrder: 'weighted',
    onboarded: false,
    aufExecute: true,
  },
})

export function todayISO(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

function dayDiff(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`)
  const b = Date.parse(`${to}T00:00:00Z`)
  return Math.round((b - a) / 86_400_000)
}

export function nextStreak(lastActiveDate: string | null, today: string, current: number): number {
  if (lastActiveDate === today) return Math.max(current, 1)
  if (lastActiveDate && dayDiff(lastActiveDate, today) === 1) return current + 1
  return 1
}

function isTrainerSetId(id: string): boolean {
  return trainerSets.some((set) => set.id === id)
}

function setHasUnseen(setId: string, caseStats: Record<string, CaseStats>): boolean {
  const set = trainerSets.find((entry) => entry.id === setId)
  if (!set) return false
  return set.caseIds.some((id) => (caseStats[id]?.solves ?? 0) === 0)
}

function drilledRatio(caseIds: string[], caseStats: Record<string, CaseStats>): number {
  if (caseIds.length === 0) return 1
  const drilled = caseIds.filter((id) => (caseStats[id]?.solves ?? 0) > 0).length
  return drilled / caseIds.length
}

export function selectDailySetId(
  completedLessons: string[],
  caseStats: Record<string, CaseStats>,
): string {
  const fallback = trainerSets[0]?.id
  if (!fallback) throw new Error('selectDailySetId requires at least one trainer set')

  const beginnerDone = beginnerMethod.steps.every((step) => completedLessons.includes(step.id))
  if (!beginnerDone && setHasUnseen('beginner-ll', caseStats)) return 'beginner-ll'
  if (setHasUnseen('pll-2look', caseStats)) return 'pll-2look'
  if (setHasUnseen('oll-2look', caseStats)) return 'oll-2look'

  let bestId = fallback
  let bestRatio = Number.POSITIVE_INFINITY
  for (const set of trainerSets) {
    const ratio = drilledRatio(set.caseIds, caseStats)
    if (ratio < bestRatio) {
      bestRatio = ratio
      bestId = set.id
    }
  }
  return bestId
}

export function ensureDailyDrill(state: ProgressSnapshot, today = todayISO()): ProgressSnapshot {
  const drill = state.dailyDrill
  if (drill && drill.date === today && isTrainerSetId(drill.setId)) return state
  return {
    ...state,
    dailyDrill: {
      date: today,
      setId: selectDailySetId(state.completedLessons, state.caseStats),
      reps: 0,
    },
  }
}

export function incrementDailyRep(state: ProgressSnapshot, today = todayISO()): ProgressSnapshot {
  const next = ensureDailyDrill(state, today)
  const drill = next.dailyDrill
  if (!drill) return next
  return { ...next, dailyDrill: { ...drill, reps: drill.reps + 1 } }
}

export function dailyDrillStatus(
  state: Pick<ProgressSnapshot, 'completedLessons' | 'caseStats' | 'dailyDrill'>,
  today = todayISO(),
): DailyDrillStatus {
  const stored = state.dailyDrill
  const drill =
    stored && stored.date === today && isTrainerSetId(stored.setId)
      ? stored
      : {
          date: today,
          setId: selectDailySetId(state.completedLessons, state.caseStats),
          reps: 0,
        }
  return {
    date: drill.date,
    setId: drill.setId,
    reps: drill.reps,
    target: DAILY_DRILL_TARGET,
    remaining: Math.max(0, DAILY_DRILL_TARGET - drill.reps),
    done: drill.reps >= DAILY_DRILL_TARGET,
  }
}

export function migrateDailyDrill(raw: unknown): DailyDrill | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as { date?: unknown; setId?: unknown; reps?: unknown }
  if (typeof row.date !== 'string' || row.date.length === 0) return null
  if (typeof row.setId !== 'string' || row.setId.length === 0) return null
  if (typeof row.reps !== 'number' || !Number.isFinite(row.reps)) return null
  return { date: row.date, setId: row.setId, reps: Math.max(0, Math.floor(row.reps)) }
}

export function levelForXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function xpIntoLevel(xp: number): number {
  return xp % XP_PER_LEVEL
}

function unlockedAchievements(state: ProgressSnapshot): string[] {
  const have = new Set(state.completedLessons)
  const earned: string[] = []
  if (state.completedLessons.length > 0) earned.push('first-lesson')
  if (have.has('beginner-white-cross')) earned.push('white-cross')
  if (have.has('beginner-white-corners')) earned.push('first-layer')
  if (have.has('beginner-second-layer')) earned.push('two-layers')
  if (
    [
      'beginner-intro',
      'beginner-white-cross',
      'beginner-white-corners',
      'beginner-flip',
      'beginner-second-layer',
      'beginner-yellow-cross',
      'beginner-yellow-corners-orient',
      'beginner-yellow-corners-permute',
      'beginner-yellow-edges-permute',
    ].every((id) => have.has(id))
  ) {
    earned.push('graduate')
  }
  if (state.timedSolves.length > 0) earned.push('first-timed')
  if (Object.values(state.caseStats).some((row) => row.solves > 0)) earned.push('first-train')
  if (
    Object.entries(state.caseStats).filter(([id, row]) => id.startsWith('cfop-pll-') && row.solves > 0).length >= 5
  ) {
    earned.push('pll-five')
  }
  if (state.masteredCases.length > 0) earned.push('first-practice')
  if (state.masteredCases.length >= 8) earned.push('case-collector')
  if (state.streakDays >= 3) earned.push('on-a-roll')
  if (have.has('cfop-cross')) earned.push('cfop-cross')
  if (have.has('cfop-f2l')) earned.push('cfop-f2l')
  if (
    [
      'cfop-intro',
      'cfop-cross',
      'cfop-f2l',
      'cfop-oll-2look',
      'cfop-oll',
      'cfop-pll-2look',
      'cfop-pll',
    ].every((id) => have.has(id))
  ) {
    earned.push('cfop-graduate')
  }
  if ((state.dailyDrill?.reps ?? 0) >= DAILY_DRILL_TARGET) earned.push('daily-done')
  return earned
}

export function touchActivity(state: ProgressSnapshot, today = todayISO()): ProgressSnapshot {
  const streakDays = nextStreak(state.lastActiveDate, today, state.streakDays)
  return withAchievements({ ...state, streakDays, lastActiveDate: today })
}

export function completeLesson(state: ProgressSnapshot, lessonId: string, xpReward: number): ProgressSnapshot {
  if (state.completedLessons.includes(lessonId)) return state
  return withAchievements(
    touchActivity({
      ...state,
      xp: state.xp + xpReward,
      completedLessons: [...state.completedLessons, lessonId],
    }),
  )
}

export function masterCase(state: ProgressSnapshot, caseId: string, xpReward = PRACTICE_XP): ProgressSnapshot {
  if (state.masteredCases.includes(caseId)) return touchActivity(state)
  return withAchievements(
    touchActivity({
      ...state,
      xp: state.xp + xpReward,
      masteredCases: [...state.masteredCases, caseId],
    }),
  )
}

function withAchievements(state: ProgressSnapshot): ProgressSnapshot {
  const next = new Set(state.achievements)
  for (const id of unlockedAchievements(state)) next.add(id)
  return { ...state, achievements: [...next] }
}

export function emptyCaseStats(): CaseStats {
  return { attempts: 0, solves: 0, recognizeAttempts: 0, recognizes: 0, bestMs: null, lastMs: null }
}

export function recordSolve(state: ProgressSnapshot, caseId: string, ms: number): ProgressSnapshot {
  const previous = state.caseStats[caseId] ?? emptyCaseStats()
  const next: CaseStats = {
    ...previous,
    attempts: previous.attempts + 1,
    solves: previous.solves + 1,
    lastMs: ms,
    bestMs: previous.bestMs === null ? ms : Math.min(previous.bestMs, ms),
  }
  const masteredCases = state.masteredCases.includes(caseId)
    ? state.masteredCases
    : [...state.masteredCases, caseId]
  return withAchievements(
    touchActivity(
      incrementDailyRep({
        ...state,
        xp: state.xp + TRAINER_SOLVE_XP,
        masteredCases,
        caseStats: { ...state.caseStats, [caseId]: next },
      }),
    ),
  )
}

export function recordRecognize(state: ProgressSnapshot, caseId: string, correct: boolean): ProgressSnapshot {
  const previous = state.caseStats[caseId] ?? emptyCaseStats()
  const next: CaseStats = {
    ...previous,
    recognizeAttempts: previous.recognizeAttempts + 1,
    recognizes: previous.recognizes + (correct ? 1 : 0),
  }
  return withAchievements(
    touchActivity(
      incrementDailyRep({
        ...state,
        xp: state.xp + (correct ? TRAINER_RECOGNIZE_XP : 0),
        caseStats: { ...state.caseStats, [caseId]: next },
      }),
    ),
  )
}

export function caseWeight(stats: CaseStats | undefined): number {
  if (!stats || stats.solves === 0) return 8
  if (stats.solves < 3) return 4
  return 1
}

export function pickWeightedCase(
  ids: string[],
  stats: Record<string, CaseStats>,
  avoid?: string,
): string {
  const pool = ids.filter((id) => id !== avoid)
  const use = pool.length > 0 ? pool : ids
  const first = use[0]
  if (!first) throw new Error('pickWeightedCase requires at least one case id')
  const weights = use.map((id) => caseWeight(stats[id]))
  let roll = Math.random() * weights.reduce((sum, weight) => sum + weight, 0)
  for (let i = 0; i < use.length; i++) {
    roll -= weights[i] ?? 0
    const id = use[i]
    if (roll <= 0 && id) return id
  }
  return use[use.length - 1] ?? first
}

export function formatTime(ms: number): string {
  return (ms / 1000).toFixed(2)
}

export function formatTimedSolve(solve: TimedSolve): string {
  if (solve.penalty === 'dnf') return 'DNF'
  const label = formatTime(solve.ms + (solve.penalty === 'plus2' ? 2000 : 0))
  return solve.penalty === 'plus2' ? `${label}+` : label
}

export function pickSlowestCase(
  ids: string[],
  stats: Record<string, CaseStats>,
  avoid?: string,
): string {
  const pool = ids.filter((id) => id !== avoid)
  const use = pool.length > 0 ? pool : ids
  const first = use[0]
  if (!first) throw new Error('pickSlowestCase requires at least one case id')
  let chosen = first
  let score = Number.NEGATIVE_INFINITY
  for (const id of use) {
    const row = stats[id]
    const value = !row || row.solves === 0 ? Number.POSITIVE_INFINITY : (row.lastMs ?? row.bestMs ?? 0)
    if (value > score) {
      score = value
      chosen = id
    }
  }
  return chosen
}

export type WeakCaseReason = 'unseen' | 'missed' | 'slow'

export interface WeakCase {
  id: string
  reason: WeakCaseReason
}

const RECOG_MISS_THRESHOLD = 0.75

export function weaknessReason(stats: CaseStats | undefined): WeakCaseReason {
  if (!stats || stats.solves === 0) return 'unseen'
  if (stats.recognizeAttempts > 0 && stats.recognizes / stats.recognizeAttempts < RECOG_MISS_THRESHOLD) {
    return 'missed'
  }
  return 'slow'
}

function weaknessScore(stats: CaseStats | undefined): number {
  if (!stats || stats.solves === 0) return Number.POSITIVE_INFINITY
  const miss = stats.recognizeAttempts > 0 ? 1 - stats.recognizes / stats.recognizeAttempts : 0
  const time = stats.lastMs ?? stats.bestMs ?? 0
  return miss * 1_000_000 + time
}

export function rankWeakCases(
  ids: string[],
  stats: Record<string, CaseStats>,
  limit = ids.length,
): WeakCase[] {
  return [...ids]
    .sort((a, b) => {
      const diff = weaknessScore(stats[b]) - weaknessScore(stats[a])
      if (diff !== 0) return diff
      return a.localeCompare(b)
    })
    .slice(0, Math.max(0, limit))
    .map((id) => ({ id, reason: weaknessReason(stats[id]) }))
}

export function effectiveMs(solve: TimedSolve): number | null {
  if (solve.penalty === 'dnf') return null
  return solve.ms + (solve.penalty === 'plus2' ? 2000 : 0)
}

export function sessionSummary(
  solves: Array<number | TimedSolve>,
): { count: number; meanMs: number; bestMs: number } | null {
  const times = solves
    .map((entry) => (typeof entry === 'number' ? entry : effectiveMs(entry)))
    .filter((ms): ms is number => ms !== null)
  if (times.length === 0) return null
  const bestMs = Math.min(...times)
  const meanMs = times.reduce((sum, ms) => sum + ms, 0) / times.length
  return { count: solves.length, meanMs, bestMs }
}

export function recordTimedSolve(state: ProgressSnapshot, ms: number): ProgressSnapshot {
  return withAchievements(
    touchActivity({
      ...state,
      timedSolves: [...state.timedSolves, { ms, penalty: 'none' as const }].slice(-50),
    }),
  )
}

export function deleteLastTimedSolve(state: ProgressSnapshot): ProgressSnapshot {
  if (state.timedSolves.length === 0) return state
  return { ...state, timedSolves: state.timedSolves.slice(0, -1) }
}

export function penalizeLastTimedSolve(
  state: ProgressSnapshot,
  penalty: TimedSolve['penalty'],
): ProgressSnapshot {
  const last = state.timedSolves.at(-1)
  if (!last) return state
  return {
    ...state,
    timedSolves: [...state.timedSolves.slice(0, -1), { ...last, penalty }],
  }
}

/** WCA-style average of 5: drop best and worst of the last 5, mean the middle 3. Two DNFs make it DNF. */
export function averageOfFive(solves: TimedSolve[]): number | null {
  if (solves.length < 5) return null
  const window = solves.slice(-5).map(effectiveMs)
  const dnfs = window.filter((ms) => ms === null).length
  if (dnfs >= 2) return null
  const times = window.map((ms) => ms ?? Number.POSITIVE_INFINITY).sort((a, b) => a - b)
  const middle = times.slice(1, 4).filter((ms) => Number.isFinite(ms))
  if (middle.length < 3) return null
  return middle.reduce((sum, ms) => sum + ms, 0) / 3
}

export function migrateTimedSolves(raw: unknown): TimedSolve[] {
  if (!Array.isArray(raw)) return []
  return raw.map((entry) => {
    if (typeof entry === 'number') return { ms: entry, penalty: 'none' as const }
    if (entry && typeof entry === 'object' && 'ms' in entry) {
      const row = entry as TimedSolve
      return { ms: row.ms, penalty: row.penalty ?? 'none' }
    }
    return { ms: 0, penalty: 'dnf' as const }
  })
}
