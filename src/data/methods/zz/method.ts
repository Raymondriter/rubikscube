import type { LessonStep, Method } from '../../types'
import { zzEolineIds, zzF2lIds } from './ids'

const steps: LessonStep[] = [
  {
    id: 'zz-intro',
    method: 'zz',
    title: 'What ZZ is',
    practiceMode: 'none',
    xpReward: 10,
    demoCaseIds: [],
    bodyMd: `ZZ front-loads edge orientation. Solve that first (**EOLine**) and everything after gets simpler: **F2L** never needs an F or B turn (so it's R/U/L only), and the last layer never needs full OLL — just the 7 pure corner-orientation cases (**OCLL**), then **PLL** to finish.

The tradeoff is up front: EOLine is a genuinely harder first step than a beginner cross, and it's the one step every later step depends on getting right. Get it wrong and F2L stops being R/U/L-only.

This course keeps the same **white on the bottom, yellow on top** hold CFOP and Roux use.`,
  },
  {
    id: 'zz-eoline',
    method: 'zz',
    title: 'EOLine',
    practiceMode: 'guided',
    xpReward: 30,
    demoCaseIds: [...zzEolineIds],
    bodyMd: `Orient all 12 edges, then place the DF and DB edges — those two plus the D-layer center are the "line" that gives this step its name.

An edge is oriented if it can be solved without ever needing a quarter F or B turn. Using only \`R U L D F2 B2\` won't disturb orientation, so set up bad edges in groups (commonly groups of four) using those moves, then fire a single quarter \`F\` or \`B\` turn to fix the whole group at once. Recount, repeat, then slot DF and DB last.

No algorithm to memorize here — it's the same "plan during inspection, count as you go" skill as beginner cross, just working on all 12 edges instead of 4. The examples below show a couple of typical starting points, not a case table.`,
  },
  {
    id: 'zz-f2l',
    method: 'zz',
    title: 'F2L · RUL only',
    practiceMode: 'guided',
    xpReward: 30,
    demoCaseIds: [...zzF2lIds],
    bodyMd: `Insert the four remaining pairs — front-right, back-right, front-left, back-left — using **only R, U, and L**. Any F or B turn here would undo the edge orientation EOLine just built, so if you reach for one, stop and re-read the position instead.

Every slot reduces to the same shape, mirrored: \`R U R' U'\` for front-right, \`R' U' R U\` for back-right, \`L' U' L U\` for front-left, \`L U L' U'\` for back-left. Once you can see that these four are the same trigger reflected across the cube, F2L stops being four things to learn and becomes one.

For corners that are awkwardly placed, the **keyhole** trick helps: pull the empty slot's edge out of the way with a U move first, drop the corner in from the "open" side, then replace the edge — no new algorithm, just a different entry point into the same trigger.

This covers the common shapes intuitively, matching how ZZ is actually taught at the beginner level. A fuller RUL-only case set (closer to CFOP's case-table treatment of F2L) is a legitimate later addition if you want faster recognition.`,
  },
]

export const zzMethod: Method = {
  id: 'zz',
  name: 'ZZ',
  summary:
    'Orient every edge up front (EOLine), then F2L never needs F/B and the last layer never needs full OLL.',
  steps,
}
