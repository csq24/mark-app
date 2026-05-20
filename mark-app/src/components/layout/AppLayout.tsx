import { Outlet } from 'react-router-dom'
import { AuthBanner } from './AuthBanner'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-mark-950">
      <Sidebar />

      <div className="flex min-h-dvh flex-col lg:pl-64">
        <AuthBanner />
        <main
          id="main-content"
          className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0"
        >
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
