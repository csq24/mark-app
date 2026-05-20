import { Loader2, LogIn, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

type AuthBarProps = {
  compact?: boolean
}

export function AuthBar({ compact = false }: AuthBarProps) {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div
        className={[
          'flex items-center gap-2 text-spray/70',
          compact ? 'px-3 py-2' : 'px-6 py-4',
        ].join(' ')}
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span className="text-sm">Checking session…</span>
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className={[
          'flex items-center gap-2 font-semibold text-mark-blue transition-colors hover:text-mark-blue-hover',
          compact
            ? 'rounded-xl bg-mark-800/80 px-3 py-2 text-sm'
            : 'mx-3 mb-3 min-h-11 justify-center rounded-full border border-mark-700 bg-mark-800 px-4 py-2.5 text-sm',
        ].join(' ')}
      >
        <LogIn className="h-5 w-5 shrink-0" aria-hidden />
        Sign in
      </Link>
    )
  }

  const email = user.email ?? 'Signed in'

  return (
    <div
      className={[
        'flex items-center gap-2',
        compact ? 'max-w-[12rem] px-2' : 'border-t border-mark-700 px-3 py-3',
      ].join(' ')}
    >
      <p
        className={[
          'min-w-0 flex-1 truncate text-spray',
          compact ? 'text-xs' : 'text-sm',
        ].join(' ')}
        title={email}
      >
        {compact ? email.split('@')[0] : email}
      </p>
      <button
        type="button"
        onClick={() => void signOut()}
        className={[
          'flex shrink-0 items-center justify-center rounded-lg text-spray transition-colors hover:bg-ocean-800 hover:text-foam',
          compact ? 'h-9 w-9' : 'gap-2 px-3 py-2 text-sm font-medium',
        ].join(' ')}
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        {!compact ? <span>Sign out</span> : null}
      </button>
    </div>
  )
}
