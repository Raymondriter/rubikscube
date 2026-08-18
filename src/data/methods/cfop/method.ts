import type { LessonStep, Method } from '../../types'
import {
  cfopCrossIds,
  cfopF2lIds,
  cfopOllIds,
  cfopOllTwoLookIds,
  cfopPllIds,
  cfopPllTwoLookIds,
} from './ids'

const steps: LessonStep[] = [
  {
    id: 'cfop-intro',
    method: 'cfop',
    title: 'What CFOP is',
    practiceMode: 'none',
    xpReward: 10,
    demoCaseIds: [],
    bodyMd: `CFOP is Cross, F2L, OLL, PLL — the method almost every speedsolver uses.

You already know the beginner path. CFOP keeps the same first layer **cross**, then inserts **pairs** (a white corner plus its matching edge) instead of finishing corners then edges separately. Last layer becomes two looks: orient every yellow sticker (**OLL**), then permute the pieces (**PLL**).

This course holds the cube **white on the bottom, yellow on top** from the first move. The case browser has every algorithm: 41 F2L, 57 OLL, 21 PLL.`,
  },
  {
    id: 'cfop-cross',
    method: 'cfop',
    title: 'Cross on bottom',
    practiceMode: 'guided',
    xpReward: 20,
    demoCaseIds: [...cfopCrossIds],
    bodyMd: `Build the white cross on **D**, not on U. Each white edge still has to match its side center.

Plan the four edges before you start turning. Good crosses use 8 moves or fewer. Inspect, rotate the cube so the first easy edge is in front, insert it, then walk the other three around.

You do **not** need a new algorithm for every edge — the same inserts as beginner, just aimed at the bottom.`,
  },
  {
    id: 'cfop-f2l',
    method: 'cfop',
    title: 'F2L · 41 cases',
    practiceMode: 'guided',
    xpReward: 40,
    demoCaseIds: [...cfopF2lIds],
    bodyMd: `Each F2L pair is one white corner and the edge that belongs next to it. You pair them in the top layer, then insert the pair into its slot in one motion.

All 41 cases here are for the **front-right** slot. For the other three slots, rotate the cube (\`y\`) so that slot is in front-right, then use the same alg.

Start with the four **basic inserts**. Everything else is “set up a basic insert, then do it.” Intuition first; open the case browser when a pair keeps going wrong.`,
  },
  {
    id: 'cfop-oll-2look',
    method: 'cfop',
    title: '2-look OLL',
    practiceMode: 'guided',
    xpReward: 30,
    demoCaseIds: [...cfopOllTwoLookIds],
    bodyMd: `Two-look OLL orients the last layer without 57 algs.

1. Make the **yellow cross** — you already know \`F R U R' U' F'\` (line) and \`f R U R' U' f'\` (P / L-shape).
2. Orient the **corners** with one of seven cases: Sune, Anti-Sune, H, Pi, U, T, L.

After this step the whole top face is yellow. Pieces can still be in the wrong seats — that’s PLL.`,
  },
  {
    id: 'cfop-oll',
    method: 'cfop',
    title: 'Full OLL · 57 cases',
    practiceMode: 'quiz',
    xpReward: 50,
    demoCaseIds: [...cfopOllIds],
    bodyMd: `Full OLL orients every last-layer sticker in **one** algorithm. Cases are grouped by the yellow shape on U: dot, square, T, P, line, and so on.

Learn by family, not by number. The numbers match the Speedsolving wiki so you can look up alternates. Filter the case browser by shape when you drill.`,
  },
  {
    id: 'cfop-pll-2look',
    method: 'cfop',
    title: '2-look PLL',
    practiceMode: 'guided',
    xpReward: 30,
    demoCaseIds: [...cfopPllTwoLookIds],
    bodyMd: `Two-look PLL permutes the last layer with six algorithms.

1. **Corners** — T-perm (adjacent swap) or Y-perm (diagonal). Hold so the solved headlights or the pair you want to swap match the alg.
2. **Edges** — Ua, Ub, H, or Z. Hold a solved edge at the back for U-perms.

That’s enough to finish any scramble. Full PLL collapses both looks into one alg.`,
  },
  {
    id: 'cfop-pll',
    method: 'cfop',
    title: 'Full PLL · 21 cases',
    practiceMode: 'quiz',
    xpReward: 40,
    demoCaseIds: [...cfopPllIds],
    bodyMd: `21 permutations, named by letter. Learn them in this order:

- **Edges only** — Ua, Ub, H, Z
- **Corners only** — Aa, Ab, E
- **Adjacent corner swap** — T, Jb, Ja, F, Ra, Rb
- **Diagonal corner swap** — Y, V, Na, Nb
- **G perms** — Ga, Gb, Gc, Gd

Recognition: look at the headlights (two same-color stickers on one side) and how the edges cycle. The case browser filters by those families.`,
  },
]

export const cfopMethod: Method = {
  id: 'cfop',
  name: 'CFOP',
  summary:
    'Cross, F2L, OLL, PLL — 119 algorithms. Start with 2-look last layer, then learn the full sets from the case browser.',
  steps,
}
