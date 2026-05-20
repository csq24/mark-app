import { BOTTOM_NAV_ITEMS } from './navConfig'
import { NavLinkItem } from './NavLinkItem'

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-mark-700 bg-mark-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex w-full max-w-lg items-end justify-around gap-0 px-1 pt-1.5 sm:max-w-2xl md:max-w-3xl lg:max-w-4xl lg:px-4 lg:pt-2">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <NavLinkItem key={item.to} item={item} layout="bottom" />
        ))}
      </div>
    </nav>
  )
}
