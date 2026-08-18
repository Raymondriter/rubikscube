import { Link } from 'react-router-dom'
import { btnPrimary } from '../components/ui/styles'

export function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-semibold text-white">That page isn’t here</h1>
      <p className="mt-2 text-sm text-white/50">The lesson or route doesn’t exist.</p>
      <Link to="/" className={`${btnPrimary} mt-6 inline-flex`}>
        Back to learn
      </Link>
    </div>
  )
}
