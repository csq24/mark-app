import { Fish } from 'lucide-react'
import { AuthBar } from '../auth/AuthBar'
import { NAV_ITEMS } from './navConfig'
import { NavLinkItem } from './NavLinkItem'

export function Sidebar() {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-mark-700 bg-mark-950 lg:flex"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-3 border-b border-mark-700 px-5 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mark-blue text-mark-950">
          <Fish className="h-6 w-6" strokeWidth={2.25} aria-hidden />
        </div>
        <div>
          <p className="text-xl font-bold tracking-tight text-foam">Mark</p>
          <p className="text-xs text-spray/80">Marks &amp; log book</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <NavLinkItem key={item.to} item={item} layout="sidebar" />
        ))}
      </nav>

      <AuthBar />
    </aside>
  )
}
