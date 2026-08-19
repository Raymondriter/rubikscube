import { Link, NavLink, Outlet } from 'react-router-dom'
import { isPortfolioBuild, portfolioLabsHref } from '../../portfolio'
import { useProgressStore } from '../../state/progressStore'
import { Onboarding } from '../onboarding/Onboarding'
import { XpBar } from '../progress/XpBar'

// Tighter horizontal padding under `sm`: the nav is the widest thing in the
// header, and at 375px the row has no slack left once the portfolio edition
// adds its Labs backlink - without this the level badge is pushed off-screen.
const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-2 py-1.5 text-sm transition sm:px-3 ${
    isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white'
  }`

export function AppShell() {
  const xp = useProgressStore((state) => state.xp)
  const streakDays = useProgressStore((state) => state.streakDays)

  return (
    <div className="relative min-h-screen overflow-hidden pb-[env(safe-area-inset-bottom)]">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--color-brand-500) 18%, transparent), transparent 70%), radial-gradient(40% 40% at 90% 80%, color-mix(in oklab, var(--color-cube-green) 8%, transparent), transparent)',
        }}
      />

      <header className="sticky top-0 z-20 border-b border-white/5 bg-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 sm:gap-4">
          <div className="flex items-center gap-2">
            {isPortfolioBuild && (
              // A real document link, not a route: it leaves the lab for the
              // site hosting it. Label collapses to the arrow on small screens
              // so it never crowds the nav.
              <a
                href={portfolioLabsHref}
                aria-label="Back to Raymond Riter's labs"
                title="Back to Raymond Riter's labs"
                className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
              >
                <span aria-hidden="true">←</span>
                <span aria-hidden="true" className="hidden sm:inline"> Labs</span>
              </a>
            )}
            <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-white">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-xs font-bold">3×3</span>
              {/* The portfolio edition spends this row's remaining width on the
                  Labs backlink, so below `sm` the badge carries the identity on
                  its own. Standalone has the room and keeps the wordmark. */}
              <span className={isPortfolioBuild ? 'hidden sm:inline' : undefined}>Twist</span>
            </Link>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Learn
            </NavLink>
            <NavLink to="/train" className={navClass}>
              Train
            </NavLink>
            <NavLink to="/sandbox" className={navClass}>
              Sandbox
            </NavLink>
            <NavLink to="/badges" className={`${navClass} hidden sm:inline-flex`}>
              Badges
            </NavLink>
            <NavLink to="/settings" className={`${navClass} hidden sm:inline-flex`}>
              Settings
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            {streakDays > 0 && (
              <span className="hidden text-xs text-orange-300 sm:inline" title="Day streak">
                {streakDays}d streak
              </span>
            )}
            <XpBar xp={xp} compact />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Outlet />
        <nav className="mt-10 flex justify-center gap-5 text-xs text-white/40 sm:hidden">
          <Link to="/badges" className="hover:text-white/70">
            Badges
          </Link>
          <Link to="/settings" className="hover:text-white/70">
            Settings
          </Link>
        </nav>
      </main>
      <Onboarding />
    </div>
  )
}
