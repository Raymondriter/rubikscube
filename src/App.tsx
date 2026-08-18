import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import { MethodPage } from './pages/MethodPage'
import { NotFoundPage } from './pages/NotFoundPage'

const TrainerHomePage = lazy(() =>
  import('./pages/TrainerHomePage').then((module) => ({ default: module.TrainerHomePage })),
)
const CaseBrowserPage = lazy(() =>
  import('./pages/CaseBrowserPage').then((module) => ({ default: module.CaseBrowserPage })),
)
const LessonPage = lazy(() => import('./pages/LessonPage').then((module) => ({ default: module.LessonPage })))
const PracticePage = lazy(() =>
  import('./pages/PracticePage').then((module) => ({ default: module.PracticePage })),
)
const TrainerSessionPage = lazy(() =>
  import('./pages/TrainerSessionPage').then((module) => ({ default: module.TrainerSessionPage })),
)
const SandboxPage = lazy(() => import('./pages/SandboxPage').then((module) => ({ default: module.SandboxPage })))
const AchievementsPage = lazy(() =>
  import('./pages/AchievementsPage').then((module) => ({ default: module.AchievementsPage })),
)
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const TrainerStatsPage = lazy(() =>
  import('./pages/TrainerStatsPage').then((module) => ({ default: module.TrainerStatsPage })),
)

function PageFallback() {
  return <p className="py-16 text-center text-sm text-white/40">Loading…</p>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'sandbox',
        element: (
          <Suspense fallback={<PageFallback />}>
            <SandboxPage />
          </Suspense>
        ),
      },
      {
        path: 'badges',
        element: (
          <Suspense fallback={<PageFallback />}>
            <AchievementsPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageFallback />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: 'train',
        element: (
          <Suspense fallback={<PageFallback />}>
            <TrainerHomePage />
          </Suspense>
        ),
      },
      {
        path: 'train/:setId/stats',
        element: (
          <Suspense fallback={<PageFallback />}>
            <TrainerStatsPage />
          </Suspense>
        ),
      },
      {
        path: 'train/:setId',
        element: (
          <Suspense fallback={<PageFallback />}>
            <TrainerSessionPage />
          </Suspense>
        ),
      },
      { path: 'learn/:methodId', element: <MethodPage /> },
      {
        path: 'learn/:methodId/cases',
        element: (
          <Suspense fallback={<PageFallback />}>
            <CaseBrowserPage />
          </Suspense>
        ),
      },
      {
        path: 'learn/:methodId/:stepId',
        element: (
          <Suspense fallback={<PageFallback />}>
            <LessonPage />
          </Suspense>
        ),
      },
      {
        path: 'learn/:methodId/:stepId/practice',
        element: (
          <Suspense fallback={<PageFallback />}>
            <PracticePage />
          </Suspense>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
