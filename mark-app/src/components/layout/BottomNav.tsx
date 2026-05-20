import { BOTTOM_NAV_ITEMS } from './navConfig'
import { NavLinkItem } from './NavLinkItem'

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-mark-700 bg-mark-950 pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Main navigation"
    >
      <div className="flex w-full items-end justify-evenly gap-0 px-1 pt-2">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <NavLinkItem key={item.to} item={item} layout="bottom" />
        ))}
      </div>
    </nav>
  )
}
