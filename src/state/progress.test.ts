import { describe, expect, it } from 'vitest'
import { CUBE_SKINS, DEFAULT_SKIN_ID, isKnownSkinId } from '../engine/render/skins'
import { beginnerMethod } from '../data/methods/beginner'
import { cfopOllTwoLookIds, cfopPllIds, cfopPllTwoLookIds } from '../data/methods/cfop/ids'
import { beginnerLastLayerIds } from '../data/trainerSets'
import {
  averageOfFive,
  caseWeight,
  completeLesson,
  DAILY_DRILL_TARGET,
  dailyDrillStatus,
  defaultProgress,
  deleteLastTimedSolve,
  emptyCaseStats,
  ensureDailyDrill,
  formatTimedSolve,
  levelForXp,
  masterCase,
  penalizeLastTimedSolve,
  pickSlowestCase,
  pickWeightedCase,
  rankWeakCases,
  recordRecognize,
  recordSolve,
  recordTimedSolve,
  nextStreak,
  selectDailySetId,
  sessionSummary,
  todayISO,
  touchActivity,
} from './progress'

describe('nextStreak', () => {
  it('starts a streak on the first active day', () => {
    expect(nextStreak(null, '2026-08-18', 0)).toBe(1)
  })

  it('does not increment twice on the same day', () => {
    expect(nextStreak('2026-08-18', '2026-08-18', 3)).toBe(3)
  })

  it('increments on consecutive days and resets after a gap', () => {
    expect(nextStreak('2026-08-17', '2026-08-18', 2)).toBe(3)
    expect(nextStreak('2026-08-15', '2026-08-18', 4)).toBe(1)
  })
})

describe('completeLesson / masterCase', () => {
  it('awards XP once per lesson and unlocks first-lesson', () => {
    const once = completeLesson(defaultProgress(), 'beginner-intro', 10)
    expect(once.xp).toBe(10)
    expect(once.achievements).toContain('first-lesson')
    expect(completeLesson(once, 'beginner-intro', 10).xp).toBe(10)
  })

  it('awards practice XP once per case', () => {
    const first = masterCase(defaultProgress(), 'beginner-sune', 20)
    expect(first.xp).toBe(20)
    expect(first.achievements).toContain('first-practice')
    expect(masterCase(first, 'beginner-sune', 20).xp).toBe(20)
  })

  it('unlocks graduate when every beginner lesson is done', () => {
    const ids = [
      'beginner-intro',
      'beginner-white-cross',
      'beginner-white-corners',
      'beginner-flip',
      'beginner-second-layer',
      'beginner-yellow-cross',
      'beginner-yellow-corners-orient',
      'beginner-yellow-corners-permute',
      'beginner-yellow-edges-permute',
    ]
    let state = defaultProgress()
    for (const id of ids) state = completeLesson(state, id, 1)
    expect(state.achievements).toContain('graduate')
  })
})

describe('levelForXp', () => {
  it('starts at level 1 and steps every 50 XP', () => {
    expect(levelForXp(0)).toBe(1)
    expect(levelForXp(49)).toBe(1)
    expect(levelForXp(50)).toBe(2)
  })
})

describe('trainer stats', () => {
  it('records best time and awards trainer XP', () => {
    const first = recordSolve(defaultProgress(), 'cfop-pll-t', 4200)
    expect(first.xp).toBe(5)
    expect(first.caseStats['cfop-pll-t']?.bestMs).toBe(4200)
    expect(first.masteredCases).toContain('cfop-pll-t')
    expect(first.achievements).toContain('first-train')
    const faster = recordSolve(first, 'cfop-pll-t', 2100)
    expect(faster.caseStats['cfop-pll-t']?.bestMs).toBe(2100)
    expect(faster.xp).toBe(10)
  })

  it('scores recognition separately', () => {
    const miss = recordRecognize(defaultProgress(), 'cfop-pll-t', false)
    expect(miss.xp).toBe(0)
    const hit = recordRecognize(miss, 'cfop-pll-t', true)
    expect(hit.xp).toBe(2)
    expect(hit.caseStats['cfop-pll-t']?.recognizes).toBe(1)
  })

  it('weights unseen cases heavier than drilled ones', () => {
    expect(caseWeight(undefined)).toBeGreaterThan(caseWeight({ ...emptyCaseStats(), solves: 5 }))
  })

  it('picks the slowest recent solve, preferring unseen', () => {
    expect(
      pickSlowestCase(['fast', 'slow'], {
        fast: { ...emptyCaseStats(), solves: 2, lastMs: 1000 },
        slow: { ...emptyCaseStats(), solves: 2, lastMs: 9000 },
      }),
    ).toBe('slow')
    expect(
      pickSlowestCase(['fast', 'new'], {
        fast: { ...emptyCaseStats(), solves: 2, lastMs: 1000 },
      }),
    ).toBe('new')
  })

  it('summarizes a session', () => {
    expect(sessionSummary([])).toBeNull()
    expect(sessionSummary([2000, 4000])).toEqual({ count: 2, meanMs: 3000, bestMs: 2000 })
  })

  it('does not pick the avoided case when another exists', () => {
    const picks = new Set(
      Array.from({ length: 20 }, () => pickWeightedCase(['a', 'b'], {}, 'a')),
    )
    expect(picks.has('a')).toBe(false)
    expect(picks.has('b')).toBe(true)
  })
})

describe('timed sandbox solves', () => {
  it('keeps the last 50 and unlocks first-timed', () => {
    let state = defaultProgress()
    for (let i = 0; i < 52; i++) state = recordTimedSolve(state, 1000 + i)
    expect(state.timedSolves).toHaveLength(50)
    expect(state.achievements).toContain('first-timed')
  })

  it('computes ao5 by dropping best and worst', () => {
    const stamp = (ms: number) => ({ ms, penalty: 'none' as const })
    expect(averageOfFive([stamp(1000), stamp(2000), stamp(3000), stamp(4000)])).toBeNull()
    expect(averageOfFive([stamp(1000), stamp(5000), stamp(3000), stamp(2000), stamp(4000)])).toBe(3000)
  })

  it('applies +2, DNF, and delete to the last solve', () => {
    const once = recordTimedSolve(defaultProgress(), 5000)
    expect(formatTimedSolve(penalizeLastTimedSolve(once, 'plus2').timedSolves[0]!)).toBe('7.00+')
    expect(formatTimedSolve(penalizeLastTimedSolve(once, 'dnf').timedSolves[0]!)).toBe('DNF')
    expect(deleteLastTimedSolve(once).timedSolves).toHaveLength(0)
  })
})

describe('touchActivity', () => {
  it('writes lastActiveDate', () => {
    const next = touchActivity(defaultProgress(), '2026-08-18')
    expect(next.lastActiveDate).toBe('2026-08-18')
    expect(next.streakDays).toBe(1)
  })
})

function solvedStats(ids: readonly string[], count?: number) {
  const use = count === undefined ? ids : ids.slice(0, count)
  return Object.fromEntries(use.map((id) => [id, { ...emptyCaseStats(), solves: 1 }]))
}

const beginnerDone = beginnerMethod.steps.map((step) => step.id)

describe('daily drill', () => {
  it('prefers unseen beginner-ll when the beginner course is incomplete', () => {
    expect(selectDailySetId([], {})).toBe('beginner-ll')
  })

  it('prefers unseen pll-2look otherwise', () => {
    expect(selectDailySetId(beginnerDone, {})).toBe('pll-2look')
    expect(selectDailySetId([], solvedStats(beginnerLastLayerIds))).toBe('pll-2look')
  })

  it('picks the lowest drilled ratio after intro sets are covered', () => {
    const stats = {
      ...solvedStats(beginnerLastLayerIds),
      ...solvedStats(cfopPllTwoLookIds),
      ...solvedStats(cfopOllTwoLookIds),
      ...solvedStats(cfopPllIds, 10),
    }
    expect(selectDailySetId(beginnerDone, stats)).toBe('f2l')
  })

  it('rolls over on a new date and resets reps', () => {
    const stale = {
      ...defaultProgress(),
      dailyDrill: { date: '2026-08-17', setId: 'pll', reps: 12 },
    }
    const next = ensureDailyDrill(stale, '2026-08-18')
    expect(next.dailyDrill).toEqual({ date: '2026-08-18', setId: 'beginner-ll', reps: 0 })
    expect(ensureDailyDrill(stale, '2026-08-17')).toBe(stale)
  })

  it('increments today’s reps on solve and recognize', () => {
    const today = todayISO()
    const solved = recordSolve(defaultProgress(), 'cfop-pll-t', 3200)
    expect(solved.dailyDrill).toEqual({ date: today, setId: 'beginner-ll', reps: 1 })
    const miss = recordRecognize(solved, 'cfop-pll-t', false)
    expect(miss.dailyDrill?.reps).toBe(2)
    expect(miss.dailyDrill?.date).toBe(today)
  })

  it('unlocks daily-done at 20 reps', () => {
    let state = defaultProgress()
    for (let i = 0; i < DAILY_DRILL_TARGET; i++) state = recordSolve(state, 'cfop-pll-t', 2000)
    expect(state.dailyDrill?.reps).toBe(DAILY_DRILL_TARGET)
    expect(state.achievements).toContain('daily-done')
  })

  it('reports done and remaining from today’s drill', () => {
    const today = todayISO()
    const mid = dailyDrillStatus({
      ...defaultProgress(),
      dailyDrill: { date: today, setId: 'pll-2look', reps: 7 },
    })
    expect(mid).toMatchObject({
      date: today,
      setId: 'pll-2look',
      reps: 7,
      target: DAILY_DRILL_TARGET,
      remaining: 13,
      done: false,
    })
    expect(
      dailyDrillStatus({
        ...defaultProgress(),
        dailyDrill: { date: today, setId: 'pll-2look', reps: DAILY_DRILL_TARGET },
      }),
    ).toMatchObject({ remaining: 0, done: true })
    expect(
      dailyDrillStatus({
        ...defaultProgress(),
        dailyDrill: { date: '2020-01-01', setId: 'pll', reps: 19 },
      }, '2026-08-18'),
    ).toMatchObject({ date: '2026-08-18', setId: 'beginner-ll', reps: 0, remaining: 20, done: false })
  })
})

describe('rankWeakCases', () => {
  const unseen = 'unseen'
  const missed = 'missed'
  const slow = 'slow'
  const fast = 'fast'

  const stats = {
    [unseen]: emptyCaseStats(),
    [missed]: {
      ...emptyCaseStats(),
      solves: 4,
      lastMs: 1500,
      bestMs: 1400,
      recognizeAttempts: 4,
      recognizes: 1,
    },
    [slow]: { ...emptyCaseStats(), solves: 3, lastMs: 9000, bestMs: 4000 },
    [fast]: { ...emptyCaseStats(), solves: 8, lastMs: 1200, bestMs: 1100 },
  }

  it('ranks unseen, then missed, then slowest times', () => {
    expect(rankWeakCases([fast, slow, missed, unseen], stats).map((row) => row.id)).toEqual([
      unseen,
      missed,
      slow,
      fast,
    ])
    expect(rankWeakCases([fast, slow, missed, unseen], stats).map((row) => row.reason)).toEqual([
      'unseen',
      'missed',
      'slow',
      'slow',
    ])
  })

  it('caps the list', () => {
    expect(rankWeakCases([fast, slow, missed, unseen], stats, 2).map((row) => row.id)).toEqual([
      unseen,
      missed,
    ])
  })
})

describe('cube skin setting', () => {
  it('defaults to a skin that actually exists', () => {
    expect(isKnownSkinId(defaultProgress().settings.skinId)).toBe(true)
    expect(defaultProgress().settings.skinId).toBe(DEFAULT_SKIN_ID)
  })

  it('has unique skin ids and a swatch for every skin', () => {
    const ids = CUBE_SKINS.map((skin) => skin.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const skin of CUBE_SKINS) {
      expect(skin.swatch).toMatch(/^#[0-9a-f]{6}$/i)
      expect(skin.name.length).toBeGreaterThan(0)
    }
  })

  // The reason PROGRESS_VERSION had to go to 8. Zustand persist only runs
  // migrate() when the stored version differs, and migrate() fills new fields
  // by spreading defaults under the persisted settings - so a v7 snapshot,
  // which has no skinId at all, only gets one because that spread supplies it.
  it('supplies skinId when merged under an older snapshot that lacks it', () => {
    const v7Settings = { ...defaultProgress().settings } as Record<string, unknown>
    delete v7Settings.skinId

    const merged = { ...defaultProgress().settings, ...v7Settings }

    expect(merged.skinId).toBe(DEFAULT_SKIN_ID)
  })
})
