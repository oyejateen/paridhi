import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function TopHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-orange-200/70 bg-[#fff7f0]/95 px-4 py-3 backdrop-blur">
      <div className="relative flex items-center justify-center">
        <Link
          to="/profile"
          className="absolute left-0 grid h-9 w-9 place-items-center rounded-full border border-orange-200 bg-white text-lg shadow-sm"
          aria-label="Open profile"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName ?? 'User'} className="h-full w-full rounded-full object-cover" />
          ) : (
            '👤'
          )}
        </Link>
        <h1 className="text-base font-semibold tracking-tight text-neutral-900">Paridhi</h1>
      </div>
    </header>
  )
}