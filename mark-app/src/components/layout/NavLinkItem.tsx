import { NavLink } from 'react-router-dom'
import type { NavItemConfig } from './navConfig'

type NavLinkItemProps = {
  item: NavItemConfig
  layout: 'bottom' | 'sidebar'
}

export function NavLinkItem({ item, layout }: NavLinkItemProps) {
  const Icon = item.icon
  const isBottom = layout === 'bottom'
  const isProminent = item.prominent === true

  return (
    <NavLink
      to={item.to}
      aria-label={item.label}
      className={({ isActive }) =>
        [
          'group flex min-w-0 flex-1 flex-col items-center justify-center font-semibold transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mark-blue',
          isBottom
            ? isProminent
              ? 'min-w-0 max-w-[4.5rem] flex-none -mt-3 rounded-2xl px-1 py-2 sm:max-w-[5rem] lg:-mt-3.5 lg:px-1.5 lg:py-2.5'
              : 'min-w-0 flex-1 rounded-xl px-0.5 py-2 lg:py-2.5'
            : 'w-full gap-2 rounded-lg px-3 py-2 text-left',
          isProminent
            ? isActive
              ? 'bg-mark-blue text-mark-950 shadow-lg shadow-mark-blue/25'
              : 'bg-mark-800 text-mark-blue ring-1 ring-mark-blue/40 hover:bg-mark-700'
            : isActive
              ? isBottom
                ? 'bg-mark-blue/20 text-mark-blue'
                : 'bg-mark-blue text-mark-950 shadow-md'
              : isBottom
                ? 'text-spray hover:bg-mark-800 hover:text-foam'
                : 'text-spray hover:bg-mark-800/80 hover:text-foam',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={[
              'shrink-0',
              isBottom
                ? isProminent
                  ? 'h-7 w-7 sm:h-8 sm:w-8'
                  : 'h-5 w-5 sm:h-6 sm:w-6'
                : 'h-5 w-5',
              isActive && !isProminent ? 'stroke-[2.5]' : 'stroke-2',
            ].join(' ')}
            aria-hidden
          />
          <span
            className={[
              'leading-tight',
              isBottom
                ? isProminent
                  ? 'text-[10px] sm:text-xs'
                  : 'text-[9px] sm:text-[10px] lg:text-xs'
                : 'text-sm',
            ].join(' ')}
          >
            {isBottom ? item.shortLabel : item.label}
          </span>
        </>
      )}
    </NavLink>
  )
}
