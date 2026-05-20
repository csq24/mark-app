import { AlertCircle, Loader2, MessageSquare, Plus, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreateListingModal } from '../components/marketplace/CreateListingModal'
import { ListingCard } from '../components/marketplace/ListingCard'
import { MarketplaceFilters } from '../components/marketplace/MarketplaceFilters'
import { PageHeader } from '../components/layout/PageHeader'
import { useMarketplaceListings } from '../hooks/useMarketplaceListings'
import { filterMarketplaceListings } from '../lib/marketplaceDisplay'
import { isSupabaseConfigured } from '../lib/supabase'
import type { MarketplaceCategory, MarketplaceCondition } from '../types/database'

export function MarketplacePage() {
  const {
    listings,
    loading,
    error,
    creating,
    createListing,
    refetch,
    isAuthenticated,
  } = useMarketplaceListings()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const filtered = useMemo(
    () => filterMarketplaceListings(listings, { query, category }),
    [listings, query, category],
  )

  async function handleCreate(input: {
    category: MarketplaceCategory
    title: string
    description: string
    priceCents: number
    condition: MarketplaceCondition
  }) {
    setCreateError(null)
    try {
      const created = await createListing(input)
      setModalOpen(false)
      if (created) {
        setCategory(created.category)
        setQuery('')
      }
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Could not publish your listing.',
      )
    }
  }

  return (
    <div>
      <PageHeader
        title="Marketplace"
        subtitle="Buy and sell tackle, parts, and boat gear"
        action={
          isAuthenticated ? (
            <div className="flex gap-2">
              <Link
                to="/marketplace/inbox"
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ocean-600 text-spray hover:border-spray hover:text-foam"
                aria-label="Messages"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={loading}
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ocean-600 text-spray hover:border-spray hover:text-foam disabled:opacity-50"
                aria-label="Refresh listings"
              >
                <RefreshCw
                  className={['h-5 w-5', loading ? 'animate-spin' : ''].join(' ')}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreateError(null)
                  setModalOpen(true)
                }}
                className="flex min-h-12 items-center gap-2 rounded-xl bg-action px-4 font-bold text-action-text hover:bg-action-hover"
              >
                <Plus className="h-5 w-5" aria-hidden />
                <span className="hidden sm:inline">List item</span>
              </button>
            </div>
          ) : null
        }
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        <p className="text-sm text-spray">
          Message sellers to agree on shipping, pickup, and payment — like a crew
          marketplace board.
        </p>

        {!isSupabaseConfigured ? (
          <SetupBanner message="Add Supabase keys to .env to enable the marketplace." />
        ) : null}

        {!loading && !isAuthenticated ? (
          <div className="rounded-2xl border-2 border-dashed border-ocean-600 bg-ocean-900/50 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-foam">Sign in to buy and sell</p>
            <p className="mt-2 text-spray">
              List gear, browse listings, and message sellers about delivery.
            </p>
            <Link
              to="/login"
              className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-action px-6 font-bold text-action-text hover:bg-action-hover"
            >
              Sign in
            </Link>
          </div>
        ) : null}

        {isAuthenticated ? (
          <>
            <MarketplaceFilters
              query={query}
              category={category}
              onQueryChange={setQuery}
              onCategoryChange={setCategory}
            />

            {error ? (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border-2 border-red-400/50 bg-red-950/40 px-4 py-3 text-foam"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
                {error}
              </p>
            ) : null}

            {loading ? (
              <p className="flex items-center justify-center gap-2 py-16 text-spray">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Loading listings…
              </p>
            ) : null}

            {!loading && !error && filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-ocean-600 px-6 py-12 text-center">
                <p className="text-lg font-semibold text-foam">No listings yet</p>
                <p className="mt-2 text-spray">
                  Be the first to list rods, tackle, electronics, or services.
                </p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-action px-6 font-bold text-action-text hover:bg-action-hover"
                >
                  <Plus className="h-5 w-5" aria-hidden />
                  List an item
                </button>
              </div>
            ) : null}

            {!loading && filtered.length > 0 ? (
              <ul className="space-y-3">
                {filtered.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </div>

      <CreateListingModal
        open={modalOpen}
        saving={creating}
        error={createError}
        onClose={() => !creating && setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}

function SetupBanner({ message }: { message: string }) {
  return (
    <p className="rounded-xl border-2 border-amber-400/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
      {message}
    </p>
  )
}
