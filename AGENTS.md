# Twist (rubikscube)

Interactive 3×3 tutorial: beginner method, then CFOP, Roux, or ZZ, with a live Three.js cube.

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

**All four methods now ship**: beginner, CFOP, Roux (`RUBIKSCUBE-4`), and ZZ (`RUBIKSCUBE-5`) — every phase-0-through-4 epic is Done. ZZ's 5 steps: `zz-intro`, `zz-eoline` (freeform, worked examples - EOLine is decision-tree taught, not a case table, confirmed against a real beginner ZZ guide), `zz-f2l` (freeform, RUL-only - the 4 mirror algorithms are genuinely sourced, not invented; ZZ's F2L is *not* CFOP's 41-case set, since CFOP F2L uses F/B which would break ZZ's edge orientation), `zz-ocll` and `zz-pll` (case-based, **cloned** from CFOP's OLL 21-27 and full PLL via `src/data/methods/zz/lastLayer.ts`'s `cloneForZz` helper - same physical algorithms, just re-tagged with `method: 'zz'` since `cases.test.ts` requires every case's `method` field to match its owning `Method`). Wired into the trainer (`zz-ocll`/`zz-pll` sets), case browser family filters, and achievements.

**New: Phase 7 Monetization epic** (`RUBIKSCUBE-43`, 8 child tickets, all To Do) - tip jar, cosmetic cube-skin unlocks, cube-retailer affiliate link. No ads, no paywalled lessons. The real architectural note: this app is currently 100% static (no backend, no accounts) - a real cosmetic purchase needs *some* server-side entitlement check, which is a genuine "first backend" decision (`RUBIKSCUBE-45` scopes it: Vercel serverless + Stripe Checkout, account-less vs. accounts tradeoff). Account creation and affiliate applications need Raymond directly.

Shipped earlier: lazy routes, trainer (execute/recognize/2-sided PLL), sandbox timer with +2/DNF, daily drill quota (20 reps + today's set), weak-case review and single-case drill (`?case=`). `RUBIKSCUBE-24` (real-device drag-to-twist check) is closed: verified via the iOS Simulator's genuine WebKit touch engine.

Fixed in passing: every 3-letter corner entry in CFOP's `recognitionHighlight` arrays (`oll.ts`/`pll.ts`/`f2l.ts`) used the wrong letter order (`UFR` instead of the engine's canonical `URF`) and silently never matched a cubie - corner recognition highlights had never actually lit up. Fixed to the `slotIdFromCoords` (U/D, then R/L, then F/B) convention; Roux and ZZ's own data were authored with the correct order from the start.

Still later:

1. A dedicated EOLR / full-L6E algorithm table for Roux, and a fuller RUL-only case set for ZZ's F2L, if someone wants to push past the current intuitive teaching toward faster execution. Neither is required — matches how both methods are actually taught at the level this course covers.
2. A CMLL/OCLL-equivalent of the PLL-only "2-sided recognition" trainer mode (`twoSidedPllView` in `src/data/pllView.ts`, gated to `set.id === 'pll'` in `TrainerSessionPage.tsx`) — both are corners-only so the same `lastLayerSideColors` primitive would work, just needs the wiring. Stretch, not required.
3. Phase 6's epic description mentions lazy-loading each method's content by route (so Beginner doesn't pull in all 119 CFOP + 42 CMLL + 35 ZZ records) — not done, `src/data/methods/index.ts` combines `allCases` eagerly. Never broken into a concrete ticket; not urgent at current bundle size (Three.js dominates the bundle, not case data).
4. Phase 7 (Monetization) — see above, all 8 tickets To Do.
