import type { LessonStep, Method } from '../../types'
import { rouxCmllIds, rouxFirstBlockIds, rouxSecondBlockIds } from './ids'

const steps: LessonStep[] = [
  {
    id: 'roux-intro',
    method: 'roux',
    title: 'What Roux is',
    practiceMode: 'none',
    xpReward: 10,
    demoCaseIds: [],
    bodyMd: `Roux swaps F2L's 41 cases for two intuitive 1x2x3 blocks, then finishes the cube with just 42 algorithms (**CMLL**) plus edge-only cleanup (**LSE**) — about a third of CFOP's algorithm count, at the cost of more spatial reasoning up front.

You already know the beginner path. Roux keeps the same **white on the bottom, yellow on top** hold the whole way through, but instead of a cross, you build a **1x2x3 block on the left** (First Block), mirror it on the right (Second Block), then solve the last layer's 4 corners in one look (CMLL) and the remaining 6 edges with M-slice moves (LSE).

This course leans on \`M\` and the wide-move family (\`Rw\`, \`Lw\`) — if those are new to you, \`M\` is just the middle slice and \`Rw\` is a two-layer turn. Both work in the sandbox and every demo here.`,
  },
  {
    id: 'roux-first-block',
    method: 'roux',
    title: 'First Block · left 1x2x3',
    practiceMode: 'guided',
    xpReward: 20,
    demoCaseIds: [...rouxFirstBlockIds],
    bodyMd: `Build a 1x2x3 block — the D-L edge plus two edge-corner pairs — on the **left** side. No algorithm to memorize: plan the pieces during inspection, then place them in whatever order avoids re-breaking what's already down.

Two shapes come up constantly:
- **Free pair** — the edge and its corner are already next to each other. Drop them in together.
- **Split pair** — they're apart. Bring the corner to U first, then insert.

A good first block takes about 8 moves. The examples below show a couple of typical placements — there's no single "right" sequence. This is the one step in the whole app where intuition beats memorization.`,
  },
  {
    id: 'roux-second-block',
    method: 'roux',
    title: 'Second Block · right 1x2x3',
    practiceMode: 'guided',
    xpReward: 20,
    demoCaseIds: [...rouxSecondBlockIds],
    bodyMd: `Mirror the first block on the **right**, without disturbing what's already solved on the left. This is the harder of the two blocks — every insertion has to route around a block that's already in the way.

Same two shapes as before (free pair, split pair), just aimed at the right side. If a piece you need turns out to be buried inside the first block, that's a planning problem to avoid during inspection, not something to fix mid-solve — once this feels natural, start planning both blocks together before you turn a single move.`,
  },
  {
    id: 'roux-cmll',
    method: 'roux',
    title: 'CMLL · 42 cases',
    practiceMode: 'quiz',
    xpReward: 50,
    demoCaseIds: [...rouxCmllIds],
    bodyMd: `With both blocks done, 8 pieces are left: the last layer's 4 corners and the 6 edges outside the blocks (the last two are placeholder-solved by the blocks themselves for now). CMLL orients **and** permutes all 4 corners in one algorithm — the M-slice doesn't matter yet, so recognition is just the 4 side stickers around the top layer, same as PLL corners.

Cases are grouped by corner-permutation family: **O** (already permuted, 2 cases), **H**, **Pi**, **U**, **T**, **L** — each with an even split of solved/swapped column patterns — then **Sune** and **Anti-Sune**, the two you already half-know from 2-look OLL.

Learn Sune/Anti-Sune first (you already recognize the shape), then O (only 2 cases), then the rest by family. Full CMLL is 42 algorithms total — a third of CFOP's 119, concentrated entirely in this one step.`,
  },
]

export const rouxMethod: Method = {
  id: 'roux',
  name: 'Roux',
  summary:
    "Two intuitive blocks, then 42 CMLL algorithms and M-slice edges — about a third of CFOP's algorithm count, more spatial reasoning up front.",
  steps,
}
