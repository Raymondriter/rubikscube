# Twist (rubikscube)

Interactive 3×3 tutorial: beginner method, then CFOP, with a live Three.js cube.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build
```

Production: https://rubikscube-xi.vercel.app  
Jira: project `RUBIKSCUBE` at https://rpr2998.atlassian.net

## Stack

Vite, React 19, TypeScript, Tailwind 4, Three.js (no R3F), Zustand persist, React Router, Vitest.

## Architecture

- **Engine** (`src/engine`): cubie-based. Each cubie's position/quaternion *is* the state. Moves are `{axis, layers, quarterTurns}`. Notation in `notation.ts`. `isSolved` is home-seat; `isColorSolved` is “looks solved” (used after yellow-on-U holds).
- **Content** (`src/data`): `AlgorithmCase` / `LessonStep` / `Method`. Last-layer cases wrap `x2` so they teach yellow-on-U; `studentAlgorithm()` strips only that bookkeeping `x2`. Critical test: setup + primary alg = solved (`src/data/cases.test.ts`).
- **Trainer** (`/train`): timed execute + recognition. Stats live in `progress.caseStats`. Weak cases are weighted higher.
- **Progress**: Zustand persist key `rubikscube-progress`, schema `PROGRESS_VERSION` (currently 6). Bump version and migrate when the snapshot shape changes. Settings include colorblind, trainerOrder, onboarded, aufExecute. `timedSolves` holds the last 50 sandbox times. `dailyDrill` is today’s trainer quota (set + reps / 20).

## Conventions

- Do not add a solver library. Teaching algs, not shortest solutions.
- Source published CFOP lists (solvethecube.com / Speedsolving wiki numbers), then let invert tests catch typos.
- F2L cases are the FR slot; other slots are a `y` rotation.
- Jira project creation needs `~/.claude/secrets/atlassian.env` (the MCP connector cannot create projects). Issues/comments go through the API or Jira MCP.

## What to build next (updated 2026-08-18)

Do **not** start Roux or ZZ next. CFOP is the method almost everyone uses after beginner; Roux/ZZ are minority second methods. We already shipped 119 CFOP cases as a catalog. The gap versus J Perm / SpeedCubeDB is a **daily drill loop** (trainer, recognition, times) — that work started in `/train`.

Shipped: lazy routes, trainer (execute/recognize/2-sided PLL), sandbox timer with +2/DNF, daily drill quota (20 reps + today’s set), weak-case review and single-case drill (`?case=`).

`RUBIKSCUBE-24` (real-device drag-to-twist check) is closed: verified via the iOS Simulator's genuine WebKit touch engine — a face-drag committed a real layer twist (Solved -> Scrambled), a background-drag correctly fell through to orbit. Requires `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` to be run once on a fresh machine before the Simulator MCP tool works.

Still later:

1. Roux only if someone actually wants a second method.
2. Phase 6's epic description mentions lazy-loading each method's content by route (so Beginner doesn't pull in all 119 CFOP records) — not done, `src/data/methods/index.ts` combines `allCases` eagerly. Never broken into a concrete ticket; not urgent at current bundle size (Three.js dominates the bundle, not case data).

Epics 3 (Roux) and 4 (ZZ) stay parked on purpose.
