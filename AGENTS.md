# Twist (rubikscube)

Interactive 3×3 tutorial: beginner method, then CFOP or Roux, with a live Three.js cube.

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
- **Content** (`src/data`): `AlgorithmCase` / `LessonStep` / `Method`. Last-layer cases wrap `x2` so they teach yellow-on-U; `studentAlgorithm()` strips only that bookkeeping `x2`. Critical test: setup + primary alg = solved (`src/data/cases.test.ts`). Freeform/intuitive steps (CFOP's cross, all of Roux's First/Second Block and LSE) need no special-casing - a `LessonStep` with `demoCaseIds: []` just renders `bodyMd` with no demo, and a handful of illustrative worked-example `AlgorithmCase`s (not a memorized case table) covers the 3D demo. Don't invent a bigger case library for a step that's actually taught intuitively - check how the method is really taught (a real tutorial, not memory) before assuming a CFOP-style fixed table is needed.
- **Trainer** (`/train`): timed execute + recognition. Stats live in `progress.caseStats`. Weak cases are weighted higher.
- **Progress**: Zustand persist key `rubikscube-progress`, schema `PROGRESS_VERSION` (currently 6). Bump version and migrate when the snapshot shape changes. Settings include colorblind, trainerOrder, onboarded, aufExecute. `timedSolves` holds the last 50 sandbox times. `dailyDrill` is today’s trainer quota (set + reps / 20).

## Conventions

- Do not add a solver library. Teaching algs, not shortest solutions.
- Source published CFOP lists (solvethecube.com / Speedsolving wiki numbers), then let invert tests catch typos.
- F2L cases are the FR slot; other slots are a `y` rotation.
- Jira project creation needs `~/.claude/secrets/atlassian.env` (the MCP connector cannot create projects). Issues/comments go through the API or Jira MCP.

## What to build next (updated 2026-08-18)

**Roux shipped** (`RUBIKSCUBE-4`, all 5 child tickets Done): `roux-intro`, First/Second Block (freeform, worked examples), full 42-case CMLL (`src/data/methods/roux/cmll.ts`, sourced from Kian Mansour's CMLL sheet), and LSE in 3 steps (EO/UL-UR/finish, each taught via the one M/U "arrow" trigger + intuition rather than a fixed case table - confirmed against a real Roux tutorial, not assumed). Wired into the trainer (`cmll` set), case browser family filters, and achievements. ZZ (`RUBIKSCUBE-5`) is still explicitly parked - only start it if someone actually wants a third method.

Shipped before that: lazy routes, trainer (execute/recognize/2-sided PLL), sandbox timer with +2/DNF, daily drill quota (20 reps + today's set), weak-case review and single-case drill (`?case=`).

`RUBIKSCUBE-24` (real-device drag-to-twist check) is closed: verified via the iOS Simulator's genuine WebKit touch engine — a face-drag committed a real layer twist (Solved -> Scrambled), a background-drag correctly fell through to orbit. Requires `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` to be run once on a fresh machine before the Simulator MCP tool works.

Fixed in passing: every 3-letter corner entry in CFOP's `recognitionHighlight` arrays (`oll.ts`/`pll.ts`/`f2l.ts`) used the wrong letter order (`UFR` instead of the engine's canonical `URF`) and silently never matched a cubie - corner recognition highlights had never actually lit up. Fixed to the `slotIdFromCoords` (U/D, then R/L, then F/B) convention; Roux's own data was authored with the correct order from the start.

Still later:

1. A dedicated EOLR / full-L6E algorithm table for Roux, if someone wants to push past the current intuitive-LSE teaching toward faster execution. Not required — matches how Roux is actually taught at the level this course covers.
2. A CMLL-equivalent of the PLL-only "2-sided recognition" trainer mode (`twoSidedPllView` in `src/data/pllView.ts`, gated to `set.id === 'pll'` in `TrainerSessionPage.tsx`) — CMLL is corners-only so the same `lastLayerSideColors` primitive would work, just needs the wiring. Stretch, not required.
3. Phase 6's epic description mentions lazy-loading each method's content by route (so Beginner doesn't pull in all 119 CFOP + 42 CMLL records) — not done, `src/data/methods/index.ts` combines `allCases` eagerly. Never broken into a concrete ticket; not urgent at current bundle size (Three.js dominates the bundle, not case data).
4. ZZ (`RUBIKSCUBE-5`) stays parked on purpose.
