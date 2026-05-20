import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { MarketplaceListingWithAuthor } from '../lib/marketplaceDisplay'
import { useAuth } from './useAuth'

export function useMarketplaceListing(listingId: string | undefined) {
  const { user, loading: authLoading } = useAuth()
  const [listing, setListing] = useState<MarketplaceListingWithAuthor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startingChat, setStartingChat] = useState(false)

  const fetchListing = useCallback(async () => {
    if (!user || !listingId) {
      setListing(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('marketplace_listings')
      .select('*, profiles(full_name, boat_name, username)')
      .eq('id', listingId)
      .maybeSingle()

    if (fetchError) {
      setError(fetchError.message)
      setListing(null)
      setLoading(false)
      return
    }

    setListing((data as unknown as MarketplaceListingWithAuthor) ?? null)
    setLoading(false)
  }, [user, listingId])

  useEffect(() => {
    if (authLoading) return
    void fetchListing()
  }, [authLoading, fetchListing])

  const startConversation = useCallback(async () => {
    if (!listingId) {
      throw new Error('Listing not found.')
    }

    setStartingChat(true)
    setError(null)

    const { data, error: rpcError } = await supabase.rpc(
      'start_marketplace_conversation',
      { p_listing_id: listingId },
    )

    setStartingChat(false)

    if (rpcError) {
      throw new Error(rpcError.message)
    }

    return data as string
  }, [listingId])

  const isOwnListing = Boolean(user && listing && listing.user_id === user.id)

  return {
    listing,
    loading: authLoading || loading,
    error,
    startingChat,
    startConversation,
    isOwnListing,
    isAuthenticated: Boolean(user),
    refetch: fetchListing,
  }
}
