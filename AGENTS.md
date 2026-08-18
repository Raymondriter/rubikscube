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
- **Progress**: Zustand persist key `rubikscube-progress`, schema `PROGRESS_VERSION` (currently 7). Bump version and migrate when the snapshot shape changes - zustand persist only runs `migrate()` when the stored version differs from current, so a new settings field with a non-`undefined` default needs the bump or existing users never get it. Settings include colorblind, trainerOrder, onboarded, aufExecute, sound. `timedSolves` holds the last 50 sandbox times. `dailyDrill` is today’s trainer quota (set + reps / 20).
- **Sound** (`src/engine/sound.ts`): synthesized Web Audio, no external assets. Mirrors `materials.ts`'s pattern - a module-level flag callers push state into (`setSoundEnabled`), not something the module reads from the store itself. Wired into Sandbox/Practice only, not Trainer (deliberate - fast drilling is a different UX register).

## Conventions

- Do not add a solver library. Teaching algs, not shortest solutions.
- Source published CFOP lists (solvethecube.com / Speedsolving wiki numbers), then let invert tests catch typos.
- F2L cases are the FR slot; other slots are a `y` rotation.
- Jira project creation needs `~/.claude/secrets/atlassian.env` (the MCP connector cannot create projects). Issues/comments go through the API or Jira MCP.

## What to build next (updated 2026-08-18)

**All four methods now ship**: beginner, CFOP, Roux (`RUBIKSCUBE-4`), and ZZ (`RUBIKSCUBE-5`) — every phase-0-through-4 epic is Done. ZZ's 5 steps: `zz-intro`, `zz-eoline` (freeform, worked examples - EOLine is decision-tree taught, not a case table, confirmed against a real beginner ZZ guide), `zz-f2l` (freeform, RUL-only - the 4 mirror algorithms are genuinely sourced, not invented; ZZ's F2L is *not* CFOP's 41-case set, since CFOP F2L uses F/B which would break ZZ's edge orientation), `zz-ocll` and `zz-pll` (case-based, **cloned** from CFOP's OLL 21-27 and full PLL via `src/data/methods/zz/lastLayer.ts`'s `cloneForZz` helper - same physical algorithms, just re-tagged with `method: 'zz'` since `cases.test.ts` requires every case's `method` field to match its owning `Method`). Wired into the trainer (`zz-ocll`/`zz-pll` sets), case browser family filters, and achievements.

**New: Phase 7 Monetization epic** (`RUBIKSCUBE-43`, 8 child tickets, all To Do) - tip jar, cosmetic cube-skin unlocks, cube-retailer affiliate link. No ads, no paywalled lessons. The real architectural note: this app is currently 100% static (no backend, no accounts) - a real cosmetic purchase needs *some* server-side entitlement check, which is a genuine "first backend" decision (`RUBIKSCUBE-45` scopes it: Vercel serverless + Stripe Checkout, account-less vs. accounts tradeoff). Account creation and affiliate applications need Raymond directly.

Also shipped: sound design (`RUBIKSCUBE-52` - twist click + solve chime), and a bundle-size fix (`RUBIKSCUBE-53`) - `TrainerHomePage` was the one eagerly-loaded page pulling the full heavy case-data barrel (just for `caseById(id).name` on 3 "Needs work" cards), so it wasn't actually a data-layer coupling problem the way it looked - `HomePage`/`MethodPage` already imported the light `catalog.ts` directly, and every method's own `method.ts` already only depends on its `ids.ts`, not the heavy per-step case files. Making `TrainerHomePage` `lazy()` in `App.tsx` (matching every other secondary page) was the whole fix - main bundle dropped from 357KB to 305KB raw (112KB to 97KB gzip), no data-layer changes needed. Worth remembering: verify the actual root cause before reaching for the bigger refactor a ticket assumes is needed.

Shipped earlier: lazy routes, trainer (execute/recognize/2-sided PLL), sandbox timer with +2/DNF, daily drill quota (20 reps + today's set), weak-case review and single-case drill (`?case=`). `RUBIKSCUBE-24` (real-device drag-to-twist check) is closed: verified via the iOS Simulator's genuine WebKit touch engine.

Fixed in passing: every 3-letter corner entry in CFOP's `recognitionHighlight` arrays (`oll.ts`/`pll.ts`/`f2l.ts`) used the wrong letter order (`UFR` instead of the engine's canonical `URF`) and silently never matched a cubie - corner recognition highlights had never actually lit up. Fixed to the `slotIdFromCoords` (U/D, then R/L, then F/B) convention; Roux and ZZ's own data were authored with the correct order from the start.

**Stretch items, all resolved**: three items noted below were researched and closed out.

1. **Roux EOLR shipped** (`RUBIKSCUBE-54`/`-55`) - a new `roux-eolr` lesson step with all 47 EOLR (Edge Orientation Left/Right) cases, sourced from cubingapp.com's LSE-EOLR list, wired into the trainer and case browser (`?family=eolr`). Optional/advanced - collapses the intuitive `roux-lse-eo`/`roux-lse-edges` steps into one memorized table; `roux-graduate`'s achievement check is a fixed step-id list that deliberately excludes it. One correction made while shipping: case 41's second published algorithm ("U S R' F R S' R' F' R") looked correctly transcribed (re-verified character-for-character against the source) but failed this project's automatic setup+solution round-trip test - it isn't corner-neutral, permanently displacing 4 U-layer corners instead of returning them home, so it can't independently solve a pure-edge case. Dropped; case 41 ships with only its verified primary. Worth remembering for any future alternate-algorithm sourcing: a site listing an algorithm isn't proof it's independently valid for the case as modeled here - the automatic round-trip test is what actually catches this, and did.
2. **ZZF2L full case table - deliberately dropped**, not built. Research (community consensus + AlgDb.net's own stance) confirmed ZZF2L genuinely isn't memorized as a table even by advanced solvers - building one would have contradicted this project's own "match how a method is actually taught" principle. Raymond confirmed dropping it.
3. **2-sided CMLL/OCLL recognition shipped** (`RUBIKSCUBE-56`) - `twoSidedPllView`/`lastLayerSideColors`/`SideStickers` were already 100% generic (zero PLL-specific logic once read line-by-line), so this was a small gate-and-copy change in `TrainerSessionPage.tsx` plus one new homepage promo card for CMLL (`/train/cmll?mode=sides`). No OCLL promo card - 7 cases doesn't carry the same value as CMLL's 42, though the toggle works fine reached directly by URL.

Next up: Phase 7 (Monetization) - see above, all 8 tickets To Do. No other open epics.
