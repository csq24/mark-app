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
          'group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 font-semibold transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mark-blue',
          isBottom
            ? isProminent
              ? 'min-w-0 flex-1 -mt-2 rounded-2xl px-0.5 py-2'
              : 'min-w-0 flex-1 rounded-xl px-0.5 py-2'
            : 'w-full gap-3 rounded-xl px-4 py-3.5 text-left md:flex-row md:items-center',
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
                  ? 'h-8 w-8'
                  : 'h-6 w-6'
                : 'h-6 w-6',
              isActive && !isProminent ? 'stroke-[2.5]' : 'stroke-2',
            ].join(' ')}
            aria-hidden
          />
          <span
            className={[
              'leading-tight',
              isBottom ? (isProminent ? 'text-xs' : 'text-[10px]') : 'text-base',
            ].join(' ')}
          >
            {isBottom ? item.shortLabel : item.label}
          </span>
        </>
      )}
    </NavLink>
  )
}
