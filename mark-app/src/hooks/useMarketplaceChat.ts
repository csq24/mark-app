import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { MarketplaceAuthor, MarketplaceListing } from '../types/database'
import { useAuth } from './useAuth'

export type MarketplaceMessageWithSender = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
  profiles: MarketplaceAuthor | null
}

export type MarketplaceChatContext = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  marketplace_listings: Pick<MarketplaceListing, 'id' | 'title' | 'status'> | null
  buyer: MarketplaceAuthor | null
  seller: MarketplaceAuthor | null
}

export function useMarketplaceChat(conversationId: string | undefined) {
  const { user, loading: authLoading } = useAuth()
  const [conversation, setConversation] = useState<MarketplaceChatContext | null>(
    null,
  )
  const [messages, setMessages] = useState<MarketplaceMessageWithSender[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const fetchChat = useCallback(async () => {
    if (!user || !conversationId) {
      setConversation(null)
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const [convResult, msgResult] = await Promise.all([
      supabase
        .from('marketplace_conversations')
        .select(
          `
          *,
          marketplace_listings ( id, title, status ),
          buyer:profiles!marketplace_conversations_buyer_id_profiles_fkey ( full_name, boat_name, username ),
          seller:profiles!marketplace_conversations_seller_id_profiles_fkey ( full_name, boat_name, username )
        `,
        )
        .eq('id', conversationId)
        .maybeSingle(),
      supabase
        .from('marketplace_messages')
        .select('*, profiles(full_name, boat_name, username)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true }),
    ])

    if (convResult.error) {
      setError(convResult.error.message)
      setConversation(null)
      setMessages([])
      setLoading(false)
      return
    }

    if (!convResult.data) {
      setError('Conversation not found.')
      setConversation(null)
      setMessages([])
      setLoading(false)
      return
    }

    if (msgResult.error) {
      setError(msgResult.error.message)
    }

    setConversation(convResult.data as unknown as MarketplaceChatContext)
    setMessages((msgResult.data ?? []) as unknown as MarketplaceMessageWithSender[])
    setLoading(false)
  }, [user, conversationId])

  useEffect(() => {
    if (authLoading) return
    void fetchChat()
  }, [authLoading, fetchChat])

  const sendMessage = useCallback(
    async (body: string) => {
      if (!user || !conversationId) {
        throw new Error('Sign in to send a message.')
      }

      const trimmed = body.trim()
      if (!trimmed) return

      setSending(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('marketplace_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          body: trimmed,
        })
        .select('*, profiles(full_name, boat_name, username)')
        .single()

      setSending(false)

      if (insertError) {
        throw new Error(insertError.message)
      }

      const row = data as unknown as MarketplaceMessageWithSender
      setMessages((prev) => [...prev, row])
    },
    [user, conversationId],
  )

  const otherParty =
    conversation && user
      ? user.id === conversation.buyer_id
        ? conversation.seller
        : conversation.buyer
      : null

  return {
    conversation,
    messages,
    loading: authLoading || loading,
    error,
    sending,
    sendMessage,
    otherParty,
    refetch: fetchChat,
    isAuthenticated: Boolean(user),
  }
}
