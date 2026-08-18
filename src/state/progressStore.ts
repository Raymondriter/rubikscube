import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  type DemoSpeed,
  type ProgressSettings,
  type ProgressSnapshot,
  type TrainerOrder,
  PROGRESS_VERSION,
  completeLesson,
  defaultProgress,
  ensureDailyDrill,
  masterCase,
  recordRecognize,
  recordSolve,
  deleteLastTimedSolve,
  migrateDailyDrill,
  migrateTimedSolves,
  penalizeLastTimedSolve,
  recordTimedSolve,
} from './progress'

interface ProgressActions {
  completeLesson: (lessonId: string, xpReward: number) => void
  masterCase: (caseId: string, xpReward?: number) => void
  recordSolve: (caseId: string, ms: number) => void
  recordRecognize: (caseId: string, correct: boolean) => void
  recordTimedSolve: (ms: number) => void
  deleteLastTimedSolve: () => void
  penalizeLastTimedSolve: (penalty: 'none' | 'plus2' | 'dnf') => void
  setDemoSpeed: (demoSpeed: DemoSpeed) => void
  setReducedMotion: (reducedMotion: boolean) => void
  setColorblind: (colorblind: boolean) => void
  setTrainerOrder: (trainerOrder: TrainerOrder) => void
  setOnboarded: (onboarded: boolean) => void
  setAufExecute: (aufExecute: boolean) => void
  setSound: (sound: boolean) => void
  ensureDailyDrill: () => void
}

export type ProgressStore = ProgressSnapshot & ProgressActions

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      ...defaultProgress(),
      completeLesson: (lessonId, xpReward) => set((state) => completeLesson(state, lessonId, xpReward)),
      masterCase: (caseId, xpReward) => set((state) => masterCase(state, caseId, xpReward)),
      recordSolve: (caseId, ms) => set((state) => recordSolve(state, caseId, ms)),
      recordRecognize: (caseId, correct) => set((state) => recordRecognize(state, caseId, correct)),
      recordTimedSolve: (ms) => set((state) => recordTimedSolve(state, ms)),
      deleteLastTimedSolve: () => set((state) => deleteLastTimedSolve(state)),
      penalizeLastTimedSolve: (penalty) => set((state) => penalizeLastTimedSolve(state, penalty)),
      setDemoSpeed: (demoSpeed) =>
        set((state) => ({ settings: { ...state.settings, demoSpeed } satisfies ProgressSettings })),
      setReducedMotion: (reducedMotion) =>
        set((state) => ({ settings: { ...state.settings, reducedMotion } satisfies ProgressSettings })),
      setColorblind: (colorblind) =>
        set((state) => ({ settings: { ...state.settings, colorblind } satisfies ProgressSettings })),
      setTrainerOrder: (trainerOrder) =>
        set((state) => ({ settings: { ...state.settings, trainerOrder } satisfies ProgressSettings })),
      setOnboarded: (onboarded) =>
        set((state) => ({ settings: { ...state.settings, onboarded } satisfies ProgressSettings })),
      setAufExecute: (aufExecute) =>
        set((state) => ({ settings: { ...state.settings, aufExecute } satisfies ProgressSettings })),
      setSound: (sound) => set((state) => ({ settings: { ...state.settings, sound } satisfies ProgressSettings })),
      ensureDailyDrill: () => set((state) => ensureDailyDrill(state)),
    }),
    {
      name: 'rubikscube-progress',
      version: PROGRESS_VERSION,
      migrate: (persisted) => {
        const prior = persisted as Partial<ProgressSnapshot>
        const defaults = defaultProgress()
        return {
          ...defaults,
          ...prior,
          caseStats: prior.caseStats ?? {},
          timedSolves: migrateTimedSolves(prior.timedSolves),
          dailyDrill: migrateDailyDrill(prior.dailyDrill),
          settings: {
            ...defaults.settings,
            ...prior.settings,
            onboarded:
              prior.settings?.onboarded ??
              ((prior.xp ?? 0) > 0 || (prior.completedLessons?.length ?? 0) > 0),
          },
        }
      },
      partialize: (state) => ({
        xp: state.xp,
        streakDays: state.streakDays,
        lastActiveDate: state.lastActiveDate,
        completedLessons: state.completedLessons,
        masteredCases: state.masteredCases,
        achievements: state.achievements,
        caseStats: state.caseStats,
        timedSolves: state.timedSolves,
        dailyDrill: state.dailyDrill,
        settings: state.settings,
      }),
    },
  ),
)
