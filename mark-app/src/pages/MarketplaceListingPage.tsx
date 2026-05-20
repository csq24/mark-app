import { AlertCircle, ArrowLeft, Loader2, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { categoryLabel, conditionLabel } from '../data/marketplaceCategories'
import { useMarketplaceListing } from '../hooks/useMarketplaceListing'
import {
  displaySellerName,
  formatListingPrice,
  formatMarketplaceWhen,
} from '../lib/marketplaceDisplay'

export function MarketplaceListingPage() {
  const { listingId } = useParams<{ listingId: string }>()
  const navigate = useNavigate()
  const {
    listing,
    loading,
    error,
    startingChat,
    startConversation,
    isOwnListing,
    isAuthenticated,
  } = useMarketplaceListing(listingId)
  const [messageError, setMessageError] = useState<string | null>(null)

  async function handleMessageSeller() {
    setMessageError(null)
    try {
      const conversationId = await startConversation()
      navigate(`/marketplace/inbox/${conversationId}`)
    } catch (err) {
      setMessageError(
        err instanceof Error ? err.message : 'Could not start conversation.',
      )
    }
  }

  return (
    <div>
      <PageHeader
        title={listing?.title ?? 'Listing'}
        subtitle={listing ? categoryLabel(listing.category) : 'Marketplace'}
        action={
          <Link
            to="/marketplace"
            className="flex h-12 items-center gap-2 rounded-xl border-2 border-ocean-600 px-4 font-semibold text-foam hover:bg-ocean-800"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            <span className="hidden sm:inline">Back</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        {loading ? (
          <p className="flex items-center justify-center gap-2 py-16 text-spray">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading listing…
          </p>
        ) : null}

        {error && !listing ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border-2 border-red-400/50 bg-red-950/40 px-4 py-3 text-foam"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
            {error}
          </p>
        ) : null}

        {listing ? (
          <article className="rounded-2xl border-2 border-ocean-700 bg-ocean-900 px-5 py-5">
            {listing.photo_url ? (
              <img
                src={listing.photo_url}
                alt=""
                className="mb-4 max-h-72 w-full rounded-xl object-cover"
              />
            ) : null}

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-mark-blue/15 px-2.5 py-0.5 font-semibold text-mark-blue">
                {categoryLabel(listing.category)}
              </span>
              <span className="text-spray">{conditionLabel(listing.condition)}</span>
              <span className="text-spray/70">{formatMarketplaceWhen(listing.created_at)}</span>
            </div>

            <p className="mt-3 text-3xl font-bold text-mark-gold">
              {formatListingPrice(listing.price_cents)}
            </p>

            <h2 className="mt-2 text-2xl font-bold text-foam">{listing.title}</h2>

            <p className="mt-1 text-sm text-spray">
              {displaySellerName(listing.profiles)}
              {listing.profiles?.boat_name ? ` · ${listing.profiles.boat_name}` : ''}
            </p>

            <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-foam">
              {listing.description}
            </p>

            {listing.status !== 'active' ? (
              <p className="mt-4 rounded-xl bg-ocean-800 px-4 py-3 text-sm text-spray">
                This listing is no longer available.
              </p>
            ) : null}

            {isAuthenticated && listing.status === 'active' ? (
              <div className="mt-6 space-y-3">
                {isOwnListing ? (
                  <p className="text-sm text-spray">
                    This is your listing. Check{' '}
                    <Link
                      to="/marketplace/inbox"
                      className="font-semibold text-mark-blue hover:underline"
                    >
                      Messages
                    </Link>{' '}
                    when buyers reach out about shipping or pickup.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-spray">
                      Ask about shipping, local pickup, payment, or condition before
                      you buy.
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleMessageSeller()}
                      disabled={startingChat}
                      className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-action font-bold text-action-text hover:bg-action-hover disabled:opacity-50"
                    >
                      {startingChat ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                          Opening chat…
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-5 w-5" aria-hidden />
                          Message seller
                        </>
                      )}
                    </button>
                    {messageError ? (
                      <p role="alert" className="text-sm text-red-300">
                        {messageError}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}

            {!isAuthenticated ? (
              <Link
                to="/login"
                className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-action px-6 font-bold text-action-text hover:bg-action-hover"
              >
                Sign in to message seller
              </Link>
            ) : null}
          </article>
        ) : null}
      </div>
    </div>
  )
}
