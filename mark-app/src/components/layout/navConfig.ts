import {
  BookOpen,
  Fish,
  Map,
  MessageSquare,
  PlusCircle,
  ShoppingBag,
  User,
  type LucideIcon,
} from 'lucide-react'

export type NavRoute =
  | '/map'
  | '/species'
  | '/marketplace'
  | '/forums'
  | '/logbook'
  | '/new-catch'
  | '/settings'

export type NavItemConfig = {
  to: NavRoute
  label: string
  shortLabel: string
  icon: LucideIcon
  prominent?: boolean
  sidebarOnly?: boolean
}

export const NAV_ITEMS: NavItemConfig[] = [
  { to: '/map', label: 'Map', shortLabel: 'Map', icon: Map },
  { to: '/species', label: 'Species', shortLabel: 'Species', icon: Fish },
  {
    to: '/marketplace',
    label: 'Marketplace',
    shortLabel: 'Market',
    icon: ShoppingBag,
  },
  { to: '/forums', label: 'Forums', shortLabel: 'Forums', icon: MessageSquare },
  {
    to: '/logbook',
    label: 'Notebook',
    shortLabel: 'Log',
    icon: BookOpen,
  },
  {
    to: '/new-catch',
    label: 'Log Catch',
    shortLabel: 'Catch',
    icon: PlusCircle,
    prominent: true,
  },
  {
    to: '/settings',
    label: 'Profile',
    shortLabel: 'Profile',
    icon: User,
  },
]

export const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter((item) => !item.sidebarOnly)
