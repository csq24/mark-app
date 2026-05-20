import { Fish } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { MapMarkFab } from '../map/MapMarkFab'
import { AuthBanner } from './AuthBanner'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-mark-950">
      <Sidebar />

      <div className="flex min-h-dvh flex-col lg:pl-64">
        <header className="flex items-center gap-3 border-b border-mark-700 bg-mark-950 px-4 py-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mark-blue text-mark-950">
            <Fish className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight text-foam">Mark</p>
            <p className="text-xs text-spray/80">Marks &amp; log book</p>
          </div>
        </header>

        <AuthBanner />
        <main
          id="main-content"
          className="flex min-h-0 flex-1 flex-col pb-[calc(4.75rem+env(safe-area-inset-bottom))]"
        >
          <Outlet />
        </main>

        <BottomNav />
        <MapMarkFab />
      </div>
    </div>
  )
}
