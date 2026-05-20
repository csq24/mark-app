import { Fish, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const MAP_DROP_MARK_EVENT = 'mark-app:drop-mark'

export function MapMarkFab() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onBusy = (event: Event) => {
      const detail = (event as CustomEvent<{ busy: boolean }>).detail
      setBusy(detail?.busy ?? false)
    }
    window.addEventListener('mark-app:mark-button-busy', onBusy)
    return () => window.removeEventListener('mark-app:mark-button-busy', onBusy)
  }, [])

  if (location.pathname !== '/map') return null

  const isAuthenticated = Boolean(user)

  function handleClick() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    window.dispatchEvent(new CustomEvent(MAP_DROP_MARK_EVENT))
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={
        isAuthenticated ? 'Drop a mark at your location' : 'Sign in to drop marks'
      }
      className={[
        'fixed left-1/2 z-[100] flex min-h-14 -translate-x-1/2 items-center justify-center gap-2 rounded-full px-10 py-3 text-lg font-bold shadow-xl transition-transform active:scale-[0.98] disabled:cursor-wait disabled:opacity-80',
        'bottom-[calc(6.25rem+env(safe-area-inset-bottom))]',
        isAuthenticated
          ? 'bg-mark-blue text-mark-950 shadow-mark-blue/30 hover:bg-mark-blue-hover'
          : 'border-2 border-mark-blue bg-mark-950/95 text-mark-blue backdrop-blur-md hover:bg-mark-800',
      ].join(' ')}
    >
      {busy ? (
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      ) : (
        <Fish className="h-6 w-6" strokeWidth={2.5} aria-hidden />
      )}
      <span>{isAuthenticated ? 'Mark' : 'Sign in to Mark'}</span>
    </button>
  )
}
