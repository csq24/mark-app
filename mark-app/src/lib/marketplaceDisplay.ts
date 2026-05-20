import type { MarketplaceAuthor, MarketplaceListing } from '../types/database'
import { displayAuthorName } from './forumDisplay'

export type MarketplaceListingWithAuthor = MarketplaceListing & {
  profiles: MarketplaceAuthor | null
}

export function formatListingPrice(cents: number): string {
  if (cents === 0) return 'Free'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}

export function formatMarketplaceWhen(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export { displayAuthorName as displaySellerName }

export function filterMarketplaceListings(
  listings: MarketplaceListingWithAuthor[],
  options: { category?: string; query?: string },
): MarketplaceListingWithAuthor[] {
  const q = options.query?.trim().toLowerCase() ?? ''
  const category = options.category ?? 'all'

  let list = listings.filter((l) => l.status === 'active')

  if (category !== 'all') {
    list = list.filter((l) => l.category === category)
  }

  if (q) {
    list = list.filter((l) => {
      const haystack = [
        l.title,
        l.description,
        displayAuthorName(l.profiles),
        l.profiles?.boat_name ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }

  return list
}
