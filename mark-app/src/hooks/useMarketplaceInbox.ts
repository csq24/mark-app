import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { MarketplaceAuthor, MarketplaceListing } from '../types/database'
import { useAuth } from './useAuth'

export type MarketplaceConversationRow = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  created_at: string
  updated_at: string
  marketplace_listings: Pick<
    MarketplaceListing,
    'id' | 'title' | 'photo_url' | 'price_cents' | 'status'
  > | null
  buyer: MarketplaceAuthor | null
  seller: MarketplaceAuthor | null
}

export function useMarketplaceInbox() {
  const { user, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<MarketplaceConversationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInbox = useCallback(async () => {
    if (!user) {
      setConversations([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('marketplace_conversations')
      .select(
        `
        *,
        marketplace_listings ( id, title, photo_url, price_cents, status ),
        buyer:profiles!marketplace_conversations_buyer_id_profiles_fkey ( full_name, boat_name, username ),
        seller:profiles!marketplace_conversations_seller_id_profiles_fkey ( full_name, boat_name, username )
      `,
      )
      .order('updated_at', { ascending: false })

    if (fetchError) {
      const missingTable =
        fetchError.code === 'PGRST205' ||
        fetchError.message.includes('marketplace_conversations')
      setError(
        missingTable
          ? 'Marketplace messaging is not set up yet. Run supabase/marketplace-schema.sql.'
          : fetchError.message,
      )
      setConversations([])
      setLoading(false)
      return
    }

    setConversations((data ?? []) as unknown as MarketplaceConversationRow[])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    void fetchInbox()
  }, [authLoading, fetchInbox])

  return {
    conversations,
    loading: authLoading || loading,
    error,
    refetch: fetchInbox,
    isAuthenticated: Boolean(user),
  }
}
