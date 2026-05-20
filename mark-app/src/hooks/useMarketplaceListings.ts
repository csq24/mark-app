import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { MarketplaceListingWithAuthor } from '../lib/marketplaceDisplay'
import type {
  MarketplaceCategory,
  MarketplaceCondition,
  MarketplaceListingInsert,
} from '../types/database'
import { useAuth } from './useAuth'

export function useMarketplaceListings() {
  const { user, loading: authLoading } = useAuth()
  const [listings, setListings] = useState<MarketplaceListingWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const fetchListings = useCallback(async () => {
    if (!user) {
      setListings([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('marketplace_listings')
      .select('*, profiles(full_name, boat_name, username)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (fetchError) {
      const missingTable =
        fetchError.code === 'PGRST205' ||
        (fetchError.code === '42P01' &&
          fetchError.message.includes('marketplace_listings'))
      setError(
        missingTable
          ? 'Marketplace is not set up yet. Run supabase/marketplace-schema.sql in your Supabase project.'
          : fetchError.message,
      )
      setListings([])
      setLoading(false)
      return
    }

    setListings((data ?? []) as unknown as MarketplaceListingWithAuthor[])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    void fetchListings()
  }, [authLoading, fetchListings])

  const createListing = useCallback(
    async (input: {
      category: MarketplaceCategory
      title: string
      description: string
      priceCents: number
      condition: MarketplaceCondition
    }) => {
      if (!user) {
        throw new Error('Sign in to list an item.')
      }

      setCreating(true)
      setError(null)

      const payload: MarketplaceListingInsert = {
        user_id: user.id,
        category: input.category,
        title: input.title.trim(),
        description: input.description.trim(),
        price_cents: input.priceCents,
        condition: input.condition,
      }

      const { data, error: insertError } = await supabase
        .from('marketplace_listings')
        .insert(payload)
        .select('*, profiles(full_name, boat_name, username)')
        .single()

      setCreating(false)

      if (insertError) {
        throw new Error(insertError.message)
      }

      const row = data as unknown as MarketplaceListingWithAuthor
      setListings((prev) => [row, ...prev])
      return row
    },
    [user],
  )

  return {
    listings,
    loading: authLoading || loading,
    error,
    creating,
    createListing,
    refetch: fetchListings,
    isAuthenticated: Boolean(user),
  }
}
