import { Loader2, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AuthBanner() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 border-b-2 border-ocean-700 bg-ocean-900 px-4 py-2 text-sm text-spray">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Checking login…
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-between gap-3 border-b-2 border-catch/30 bg-ocean-900 px-4 py-3">
        <p className="text-base font-medium text-foam">
          Sign in to save marks and catches
        </p>
        <Link
          to="/login"
          className="shrink-0 rounded-xl bg-action px-4 py-2 text-base font-bold text-action-text hover:bg-action-hover"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b-2 border-ocean-700 bg-ocean-900 px-4 py-2">
      <p className="min-w-0 truncate text-sm text-spray">
        Signed in as{' '}
        <span className="font-medium text-foam">{user.email}</span>
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/settings"
          className="flex items-center gap-1.5 rounded-lg border-2 border-ocean-600 px-3 py-1.5 text-sm font-semibold text-foam hover:bg-ocean-800"
        >
          <User className="h-4 w-4" aria-hidden />
          Profile
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-lg border-2 border-ocean-600 px-3 py-1.5 text-sm font-semibold text-spray hover:bg-ocean-800 hover:text-foam"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
