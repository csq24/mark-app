import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { useMarketplaceInbox } from '../hooks/useMarketplaceInbox'
import {
  displaySellerName,
  formatListingPrice,
  formatMarketplaceWhen,
} from '../lib/marketplaceDisplay'
import { useAuth } from '../hooks/useAuth'

export function MarketplaceInboxPage() {
  const { user } = useAuth()
  const { conversations, loading, error } = useMarketplaceInbox()

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="Shipping, pickup, and deal details with buyers and sellers"
        action={
          <Link
            to="/marketplace"
            className="flex h-12 items-center gap-2 rounded-xl border-2 border-ocean-600 px-4 font-semibold text-foam hover:bg-ocean-800"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            <span className="hidden sm:inline">Marketplace</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6">
        {loading ? (
          <p className="flex items-center justify-center gap-2 py-16 text-spray">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading messages…
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border-2 border-red-400/50 bg-red-950/40 px-4 py-3 text-foam"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
            {error}
          </p>
        ) : null}

        {!loading && !error && conversations.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-ocean-600 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-foam">No conversations yet</p>
            <p className="mt-2 text-spray">
              Open a listing and tap Message seller to talk about shipping or pickup.
            </p>
            <Link
              to="/marketplace"
              className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-action px-6 font-bold text-action-text hover:bg-action-hover"
            >
              Browse listings
            </Link>
          </div>
        ) : null}

        {!loading && conversations.length > 0 ? (
          <ul className="space-y-3">
            {conversations.map((row) => {
              const listing = row.marketplace_listings
              const isBuyer = user?.id === row.buyer_id
              const other = isBuyer ? row.seller : row.buyer

              return (
                <li key={row.id}>
                  <Link
                    to={`/marketplace/inbox/${row.id}`}
                    className="block rounded-2xl border-2 border-ocean-700 bg-ocean-900 px-5 py-4 hover:border-ocean-500 hover:bg-ocean-800/80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-foam line-clamp-1">
                          {listing?.title ?? 'Listing'}
                        </p>
                        <p className="mt-1 text-sm text-spray">
                          {isBuyer ? 'Seller' : 'Buyer'}: {displaySellerName(other)}
                        </p>
                      </div>
                      {listing ? (
                        <span className="shrink-0 font-bold text-mark-gold">
                          {formatListingPrice(listing.price_cents)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs text-spray/70">
                      Updated {formatMarketplaceWhen(row.updated_at)}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
