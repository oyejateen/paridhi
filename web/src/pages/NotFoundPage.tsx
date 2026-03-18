import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <p className="text-sm font-semibold text-slate-500">404</p>
      <h1 className="mt-1 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">The page you are looking for does not exist.</p>
      <Link to="/home" className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
        Back to Home
      </Link>
    </main>
  )
}