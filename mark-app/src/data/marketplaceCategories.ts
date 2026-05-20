import type { MarketplaceCategory } from '../types/database'

export type MarketplaceCategoryId = MarketplaceCategory | 'all'

export type MarketplaceConditionId =
  | 'new'
  | 'like_new'
  | 'good'
  | 'fair'

export const MARKETPLACE_CATEGORIES: {
  id: MarketplaceCategoryId
  label: string
}[] = [
  { id: 'all', label: 'All' },
  { id: 'rods_reels', label: 'Rods & Reels' },
  { id: 'tackle', label: 'Tackle & Lures' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'engines', label: 'Engines & Parts' },
  { id: 'boat_gear', label: 'Boat Gear' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'services', label: 'Services' },
  { id: 'other', label: 'Other' },
]

export const LISTING_CATEGORIES = MARKETPLACE_CATEGORIES.filter((c) => c.id !== 'all')

export const MARKETPLACE_CONDITIONS: { id: MarketplaceConditionId; label: string }[] =
  [
    { id: 'new', label: 'New' },
    { id: 'like_new', label: 'Like new' },
    { id: 'good', label: 'Good' },
    { id: 'fair', label: 'Fair' },
  ]

export function categoryLabel(id: MarketplaceCategory): string {
  return MARKETPLACE_CATEGORIES.find((c) => c.id === id)?.label ?? id
}

export function conditionLabel(id: MarketplaceConditionId): string {
  return MARKETPLACE_CONDITIONS.find((c) => c.id === id)?.label ?? id
}
