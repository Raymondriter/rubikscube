import { caseFromSolution } from '../algorithm'
import type { AlgorithmCase, LessonStep, Method } from '../types'

export const beginnerCases: AlgorithmCase[] = [
  caseFromSolution({
    id: 'beginner-cross-from-down',
    method: 'beginner',
    step: 'beginner-white-cross',
    name: 'Edge parked underneath',
    group: 'cross',
    solution: 'F2',
    recognitionHighlight: ['DF'],
    tags: ['beginner', 'cross', 'edge'],
  }),
  caseFromSolution({
    id: 'beginner-cross-from-middle',
    method: 'beginner',
    step: 'beginner-white-cross',
    name: 'Edge in the middle layer',
    group: 'cross',
    solution: "F'",
    recognitionHighlight: ['FR'],
    tags: ['beginner', 'cross', 'edge'],
  }),
  caseFromSolution({
    id: 'beginner-cross-flipped',
    method: 'beginner',
    step: 'beginner-white-cross',
    name: 'Flipped edge on top',
    group: 'cross',
    solution: "F U' R U",
    recognitionHighlight: ['UF'],
    tags: ['beginner', 'cross', 'edge'],
  }),

  caseFromSolution({
    id: 'beginner-corner-white-on-right',
    method: 'beginner',
    step: 'beginner-white-corners',
    name: 'White sticker on the right',
    group: 'corners',
    solution: "R' D' R D",
    recognitionHighlight: ['DFR'],
    tags: ['beginner', 'corners'],
  }),
  caseFromSolution({
    id: 'beginner-corner-white-on-front',
    method: 'beginner',
    step: 'beginner-white-corners',
    name: 'White sticker on the front',
    group: 'corners',
    solution: "R' D' R D R' D' R D R' D' R D",
    recognitionHighlight: ['DFR'],
    tags: ['beginner', 'corners'],
  }),

  caseFromSolution({
    id: 'beginner-edge-insert-right',
    method: 'beginner',
    step: 'beginner-second-layer',
    name: 'Insert edge to the right',
    group: 'edges',
    yellowOnU: true,
    solution: "U R U' R' U' F' U F",
    recognitionHighlight: ['UF', 'FR'],
    tags: ['beginner', 'f2l', 'edge'],
  }),
  caseFromSolution({
    id: 'beginner-edge-insert-left',
    method: 'beginner',
    step: 'beginner-second-layer',
    name: 'Insert edge to the left',
    group: 'edges',
    yellowOnU: true,
    solution: "U' L' U L U F U' F'",
    recognitionHighlight: ['UF', 'FL'],
    tags: ['beginner', 'f2l', 'edge'],
  }),
  caseFromSolution({
    id: 'beginner-edge-wrong-in-slot',
    method: 'beginner',
    step: 'beginner-second-layer',
    name: 'Edge in its slot, flipped',
    group: 'edges',
    yellowOnU: true,
    solution: "U R U' R' U' F' U F U' R U' R' U' F' U F",
    recognitionHighlight: ['FR'],
    tags: ['beginner', 'f2l', 'edge'],
  }),

  caseFromSolution({
    id: 'beginner-yellow-line',
    method: 'beginner',
    step: 'beginner-yellow-cross',
    name: 'Yellow line',
    group: 'oll',
    yellowOnU: true,
    solution: "F R U R' U' F'",
    recognitionHighlight: ['UL', 'UR'],
    tags: ['beginner', 'oll', 'cross'],
  }),
  caseFromSolution({
    id: 'beginner-yellow-l',
    method: 'beginner',
    step: 'beginner-yellow-cross',
    name: 'Yellow L-shape',
    group: 'oll',
    yellowOnU: true,
    solution: "F U R U' R' F'",
    recognitionHighlight: ['UB', 'UL'],
    tags: ['beginner', 'oll', 'cross'],
  }),
  caseFromSolution({
    id: 'beginner-yellow-dot',
    method: 'beginner',
    step: 'beginner-yellow-cross',
    name: 'Yellow dot',
    group: 'oll',
    yellowOnU: true,
    solution: "F R U R' U' F' U2 F U R U' R' F'",
    recognitionHighlight: ['U'],
    tags: ['beginner', 'oll', 'cross'],
  }),

  caseFromSolution({
    id: 'beginner-sune',
    method: 'beginner',
    step: 'beginner-yellow-corners-orient',
    name: 'Sune',
    group: 'oll',
    yellowOnU: true,
    solution: "R U R' U R U2 R'",
    recognitionHighlight: ['UFR', 'UBR', 'UBL'],
    tags: ['beginner', 'oll', 'corners'],
  }),
  caseFromSolution({
    id: 'beginner-antisune',
    method: 'beginner',
    step: 'beginner-yellow-corners-orient',
    name: 'Anti-Sune',
    group: 'oll',
    yellowOnU: true,
    solution: "R U2 R' U' R U' R'",
    recognitionHighlight: ['UFL', 'UFR', 'UBR'],
    tags: ['beginner', 'oll', 'corners'],
  }),

  caseFromSolution({
    id: 'beginner-corner-cycle',
    method: 'beginner',
    step: 'beginner-yellow-corners-permute',
    name: 'Cycle three corners',
    group: 'pll',
    yellowOnU: true,
    solution: "R U' L' U R' U' L",
    recognitionHighlight: ['UFR', 'UBR', 'UBL'],
    tags: ['beginner', 'pll', 'corners'],
  }),

  caseFromSolution({
    id: 'beginner-u-perm-a',
    method: 'beginner',
    step: 'beginner-yellow-edges-permute',
    name: 'U-perm (clockwise)',
    group: 'pll',
    yellowOnU: true,
    solution: "R2 U R U R' U' R' U' R' U R'",
    recognitionHighlight: ['UF', 'UR', 'UB'],
    tags: ['beginner', 'pll', 'edges'],
  }),
  caseFromSolution({
    id: 'beginner-u-perm-b',
    method: 'beginner',
    step: 'beginner-yellow-edges-permute',
    name: 'U-perm (counter-clockwise)',
    group: 'pll',
    yellowOnU: true,
    solution: "R U' R U R U R U' R' U' R2",
    recognitionHighlight: ['UF', 'UL', 'UB'],
    tags: ['beginner', 'pll', 'edges'],
  }),
]

const steps: LessonStep[] = [
  {
    id: 'beginner-intro',
    method: 'beginner',
    title: 'Meet the cube',
    practiceMode: 'none',
    xpReward: 10,
    demoCaseIds: [],
    bodyMd: `A 3×3 cube has **six faces**, each a solid color when solved. This site uses the standard Western scheme:

- **White** opposite **yellow**
- **Red** opposite **orange**
- **Blue** opposite **green**

Pieces come in three kinds: **centers** (one color, they never move relative to each other), **edges** (two colors), and **corners** (three colors). You solve by moving those pieces — the centers tell you which color a face should be.

Moves are written in Singmaster notation. A letter is a **clockwise** quarter turn of that face, as if you were looking straight at it:

- \`R\` right, \`L\` left, \`U\` up, \`D\` down, \`F\` front, \`B\` back
- A prime (\`R'\`) is the same face the other way
- A 2 (\`R2\`) is a half turn

Hold the cube so a face stays in front while you learn a move. The next steps build the first layer on white.`,
  },
  {
    id: 'beginner-white-cross',
    method: 'beginner',
    title: 'White cross',
    practiceMode: 'guided',
    xpReward: 25,
    demoCaseIds: ['beginner-cross-from-down', 'beginner-cross-from-middle', 'beginner-cross-flipped'],
    bodyMd: `Goal: the four white edges around the white center, each side color matching the center next to it. A plus sign, not just any four white stickers.

Keep **white on top**. For each white edge:

1. Bring it to the front.
2. Turn the bottom (\`D\`) until the edge's *other* color matches the center in front.
3. Insert it.

**Parked underneath** — white facing down, other color already matching the front: \`F2\`.

**Sitting in the middle layer** — twist the front face so the white sticker joins the white center: \`F'\` (or \`F\`, depending on which side it's on).

**On top but flipped** — white pointing to the side instead of up: \`F U' R U\` puts it in correctly.

Do all four edges. If an edge is already in the white face but over the wrong center, take it out with a front twist and treat it as a new edge.`,
  },
  {
    id: 'beginner-white-corners',
    method: 'beginner',
    title: 'White corners',
    practiceMode: 'guided',
    xpReward: 30,
    demoCaseIds: ['beginner-corner-white-on-right', 'beginner-corner-white-on-front'],
    bodyMd: `Goal: the four white corners sitting between their three matching centers. After this, the whole first layer is done.

Keep **white on top**. Find a white corner in the *bottom* layer and turn \`D\` until it sits **under** the slot it belongs to (the three side colors of the slot match the corner's three colors, in some order).

Then repeat this sequence until the corner clicks into place:

\`R' D' R D\`

How many times depends on which way the white sticker faces:

- **White on the right** face — once
- **White on the front** or **white facing down** — keep going (usually three times)

If a white corner is already in the top layer but twisted or in the wrong slot, take it out with one \`R' D' R\` and start from the bottom. Never turn \`U\` while the first-layer edges are still solved — that would break the cross.`,
  },
  {
    id: 'beginner-flip',
    method: 'beginner',
    title: 'Flip the cube',
    practiceMode: 'none',
    xpReward: 5,
    demoCaseIds: [],
    bodyMd: `Turn the whole cube over so **white is on the bottom** and the unsolved yellow face is on top.

The first layer you just built stays together — you are only changing how you hold it. From here on, every algorithm is written with yellow on top, which is how the rest of cubing is taught.`,
  },
  {
    id: 'beginner-second-layer',
    method: 'beginner',
    title: 'Second-layer edges',
    practiceMode: 'guided',
    xpReward: 35,
    demoCaseIds: ['beginner-edge-insert-right', 'beginner-edge-insert-left', 'beginner-edge-wrong-in-slot'],
    bodyMd: `Goal: the four middle-layer edges. After this, the first two layers (often called F2L) are done.

Keep **yellow on top**. Find an edge in the top layer that has **no yellow sticker**. Turn \`U\` until that edge sits above the center matching its *front* color. Then look at the edge's top color — that tells you which way it goes:

- Top color matches the **right** center — insert right:
  \`U R U' R' U' F' U F\`
- Top color matches the **left** center — insert left:
  \`U' L' U L U F U' F'\`

If the edge you want is already in the middle layer but flipped or in the wrong slot, do the *right-insert* algorithm on that slot to pop it up to the top, then insert it properly.`,
  },
  {
    id: 'beginner-yellow-cross',
    method: 'beginner',
    title: 'Yellow cross',
    practiceMode: 'guided',
    xpReward: 25,
    demoCaseIds: ['beginner-yellow-dot', 'beginner-yellow-l', 'beginner-yellow-line'],
    bodyMd: `Goal: a yellow plus sign on the top face. Side colors of those edges can wait.

Look only at the **yellow edge stickers on U**. You will see one of four shapes:

- **Dot** (no yellow edges up) — do the line algorithm, then the L-shape algorithm
- **L-shape** (two yellow edges, next to each other) — hold the L in the back-left, like a backwards ⌐, then:
  \`F U R U' R' F'\`
- **Line** (two yellow edges opposite each other) — hold the line left-to-right, then:
  \`F R U R' U' F'\`
- **Cross** — you're done

The two algorithms are almost the same. The extra \`R U\` in the line version is the only difference. Corners do not matter yet; ignore them.`,
  },
  {
    id: 'beginner-yellow-corners-orient',
    method: 'beginner',
    title: 'Orient the yellow corners',
    practiceMode: 'guided',
    xpReward: 30,
    demoCaseIds: ['beginner-sune', 'beginner-antisune'],
    bodyMd: `Goal: the whole top face yellow. The corners can still be in the wrong *seats* as long as their yellow stickers point up.

Two shapes cover almost every case:

- **Sune** — one yellow corner already facing up, plus a pattern of headlights. Hold the solved-looking corner in the back-left, then:
  \`R U R' U R U2 R'\`
- **Anti-Sune** — the mirror. Hold the solved-looking corner in the back-left, then:
  \`R U2 R' U' R U' R'\`

If no corner is yellow-up yet, do Sune from any angle once — a yellow-up corner will appear — then recognize Sune or Anti-Sune and finish. Repeat rather than memorizing every last-layer picture.`,
  },
  {
    id: 'beginner-yellow-corners-permute',
    method: 'beginner',
    title: 'Place the yellow corners',
    practiceMode: 'guided',
    xpReward: 25,
    demoCaseIds: ['beginner-corner-cycle'],
    bodyMd: `Goal: each yellow corner in its correct seat. They are already oriented, so only the *position* is wrong.

Turn \`U\` until **at least one** corner is sitting in the correct seat (its three side colors match the three centers around it). Hold that corner in the front-left. Then cycle the other three:

\`R U' L' U R' U' L\`

If the other three are still wrong, do the same algorithm again. Two passes is the most you will ever need. The front-left corner stays put the whole time.`,
  },
  {
    id: 'beginner-yellow-edges-permute',
    method: 'beginner',
    title: 'Place the yellow edges',
    practiceMode: 'quiz',
    xpReward: 35,
    demoCaseIds: ['beginner-u-perm-a', 'beginner-u-perm-b'],
    bodyMd: `Goal: the four last-layer edges. After this, the cube is solved.

Turn \`U\` until as many edges as possible already match their centers. Usually **one edge is solved** and the other three need to cycle.

Hold the solved edge at the **back**. Then:

- The remaining three need to go **clockwise**:
  \`R2 U R U R' U' R' U' R' U R'\`
- They need to go **counter-clockwise**:
  \`R U' R U R U R U' R' U' R2\`

If no edge is solved, do either algorithm once — a solved edge will appear — then hold that edge at the back and finish. When the last edge clicks in, you're done.`,
  },
]

export const beginnerMethod: Method = {
  id: 'beginner',
  name: "Beginner's Method",
  summary:
    'The classic layer-by-layer method: white cross, first-layer corners, second-layer edges, then a beginner last layer (yellow cross, corner orientation, corner permutation, edge permutation).',
  steps,
}
