# Twist — Learn to solve the cube

Interactive 3×3 Rubik's Cube tutorial with a live Three.js cube. Teaches the beginner method first, then your choice of CFOP, Roux, or ZZ — all four methods ship today, with a timed trainer (execute + recognition), a sandbox with timer, daily drill quotas, and progress that persists locally.

Production: https://rubikscube-xi.vercel.app
Also published as a lab at https://raymondriter.dev/labs/twist
Jira: project `RUBIKSCUBE` at https://rpr2998.atlassian.net

## Run

```bash
npm install
npm run dev              # http://localhost:5173
npm test                 # Vitest
npm run build            # standalone -> dist/
npm run build:portfolio  # lab edition -> dist-portfolio/
```

## Stack

Vite, React 19, TypeScript, Tailwind 4, Three.js (no React Three Fiber), Zustand (persisted progress store), React Router, Vitest, Oxlint.

## Project docs

See `AGENTS.md` in this folder for the full architecture notes: the cubie-based engine in `src/engine`, the lesson/case content model in `src/data`, trainer and progress-store conventions, the portfolio-edition build rules (hash routing, base path, the literal `/labs` backlink the host validator checks), and the current build history and next-up work (Phase 7 monetization).

## Status notes

- Cube skins ship free with a picker in Settings (RUBIKSCUBE-62, Done). Selling skins is a separate Phase 7 question (RUBIKSCUBE-45/-49/-50).
- Production deploys are currently blocked by an invalid `VERCEL_TOKEN` secret (RUBIKSCUBE-61) — token rotation is an owner action.
