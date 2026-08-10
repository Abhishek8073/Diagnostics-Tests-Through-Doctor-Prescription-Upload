import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl bg-white p-10 text-center shadow-soft">
      <p className="font-mono text-sm uppercase tracking-widest text-slate-400">Error 404</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Back to home
      </Link>
    </div>
  )
}
