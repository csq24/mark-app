import { MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoryLabel, conditionLabel } from '../../data/marketplaceCategories'
import {
  displaySellerName,
  formatListingPrice,
  formatMarketplaceWhen,
  type MarketplaceListingWithAuthor,
} from '../../lib/marketplaceDisplay'

type ListingCardProps = {
  listing: MarketplaceListingWithAuthor
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <li>
      <Link
        to={`/marketplace/${listing.id}`}
        className="flex gap-4 rounded-2xl border-2 border-ocean-700 bg-ocean-900 p-4 transition-colors hover:border-ocean-500 hover:bg-ocean-800/80"
      >
        <ListingThumb photoUrl={listing.photo_url} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-lg font-bold text-foam line-clamp-2">{listing.title}</p>
            <span className="shrink-0 text-lg font-bold text-mark-gold">
              {formatListingPrice(listing.price_cents)}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-spray">
            <span className="rounded-full bg-mark-blue/15 px-2 py-0.5 font-semibold text-mark-blue">
              {categoryLabel(listing.category)}
            </span>
            <span>{conditionLabel(listing.condition)}</span>
            <span className="text-spray/60">·</span>
            <span>{formatMarketplaceWhen(listing.created_at)}</span>
          </div>

          <p className="mt-2 text-sm text-spray line-clamp-2">{listing.description}</p>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-spray">
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
            {displaySellerName(listing.profiles)}
            {listing.profiles?.boat_name ? ` · ${listing.profiles.boat_name}` : ''}
          </p>
        </div>
      </Link>
    </li>
  )
}

function ListingThumb({ photoUrl }: { photoUrl: string | null }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className="h-24 w-24 shrink-0 rounded-xl object-cover bg-ocean-800"
      />
    )
  }

  return (
    <div
      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-ocean-600 bg-ocean-800/80 text-xs font-semibold text-spray"
      aria-hidden
    >
      No photo
    </div>
  )
}
