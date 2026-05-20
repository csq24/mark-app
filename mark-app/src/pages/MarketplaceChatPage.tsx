import { AlertCircle, ArrowLeft, Loader2, Send } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { useMarketplaceChat } from '../hooks/useMarketplaceChat'
import {
  displaySellerName,
  formatMarketplaceWhen,
} from '../lib/marketplaceDisplay'
import { useAuth } from '../hooks/useAuth'

export function MarketplaceChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { user } = useAuth()
  const {
    conversation,
    messages,
    loading,
    error,
    sending,
    sendMessage,
    otherParty,
  } = useMarketplaceChat(conversationId)

  const [body, setBody] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)

  const listingTitle =
    conversation?.marketplace_listings?.title ?? 'Marketplace chat'

  async function handleSend(event: React.FormEvent) {
    event.preventDefault()
    setSendError(null)
    try {
      await sendMessage(body)
      setBody('')
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Could not send message.')
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      <PageHeader
        title={listingTitle}
        subtitle={
          otherParty
            ? `Chat with ${displaySellerName(otherParty)}`
            : 'Discuss shipping and pickup'
        }
        action={
          <Link
            to="/marketplace/inbox"
            className="flex h-12 items-center gap-2 rounded-xl border-2 border-ocean-600 px-4 font-semibold text-foam hover:bg-ocean-800"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            <span className="hidden sm:inline">Inbox</span>
          </Link>
        }
      />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6">
        {conversation?.listing_id ? (
          <Link
            to={`/marketplace/${conversation.listing_id}`}
            className="mb-4 text-sm font-semibold text-mark-blue hover:underline"
          >
            View listing
          </Link>
        ) : null}

        <p className="mb-4 rounded-xl border border-ocean-600 bg-ocean-900/60 px-4 py-3 text-sm text-spray">
          Coordinate shipping, local pickup, payment method, and timing here. Meet
          in safe public places for handoffs.
        </p>

        {loading ? (
          <p className="flex flex-1 items-center justify-center gap-2 text-spray">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading chat…
          </p>
        ) : null}

        {error && !conversation ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border-2 border-red-400/50 bg-red-950/40 px-4 py-3 text-foam"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
            {error}
          </p>
        ) : null}

        <ul className="flex-1 space-y-3 overflow-y-auto pb-4">
          {messages.length === 0 && !loading ? (
            <li className="text-center text-spray py-8">
              No messages yet. Say hi and ask how they prefer to ship or meet up.
            </li>
          ) : null}
          {messages.map((msg) => {
            const mine = msg.sender_id === user?.id
            return (
              <li
                key={msg.id}
                className={['flex', mine ? 'justify-end' : 'justify-start'].join(' ')}
              >
                <div
                  className={[
                    'max-w-[85%] rounded-2xl px-4 py-3',
                    mine
                      ? 'bg-mark-blue text-white'
                      : 'border-2 border-ocean-600 bg-ocean-900 text-foam',
                  ].join(' ')}
                >
                  {!mine ? (
                    <p className="mb-1 text-xs font-semibold opacity-80">
                      {displaySellerName(msg.profiles)}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap text-base leading-relaxed">
                    {msg.body}
                  </p>
                  <p
                    className={[
                      'mt-1 text-xs',
                      mine ? 'text-white/70' : 'text-spray/70',
                    ].join(' ')}
                  >
                    {formatMarketplaceWhen(msg.created_at)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>

        {conversation ? (
          <form
            onSubmit={(e) => void handleSend(e)}
            className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] border-t-2 border-ocean-700 bg-ocean-950 pt-4 sm:bottom-0"
          >
            <label className="sr-only" htmlFor="marketplace-chat-input">
              Message
            </label>
            <div className="flex gap-2">
              <textarea
                id="marketplace-chat-input"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Ask about shipping, pickup location, or payment…"
                rows={2}
                disabled={sending}
                className="min-h-12 flex-1 resize-none rounded-xl border-2 border-ocean-600 bg-ocean-800 px-4 py-3 text-base text-foam placeholder:text-spray/50 focus:border-mark-blue focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || !body.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-action text-action-text hover:bg-action-hover disabled:opacity-50"
                aria-label="Send message"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            {sendError ? (
              <p role="alert" className="mt-2 text-sm text-red-300">
                {sendError}
              </p>
            ) : null}
          </form>
        ) : null}
      </div>
    </div>
  )
}
