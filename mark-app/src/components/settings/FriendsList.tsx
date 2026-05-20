import { AlertCircle, Bot, Loader2, RefreshCw, UserMinus, Users } from 'lucide-react'
import { useFriends } from '../../hooks/useFriends'
import { displayFriendName } from '../../lib/friendDisplay'

type FriendsListProps = {
  disabled?: boolean
}

export function FriendsList({ disabled = false }: FriendsListProps) {
  const {
    friends,
    loading,
    error,
    removingId,
    removeFriend,
    refetch,
    isAuthenticated,
  } = useFriends()

  if (!isAuthenticated) {
    return null
  }

  return (
    <section
      id="friends"
      className="rounded-2xl border-2 border-ocean-600 bg-ocean-900 px-4 py-4 sm:px-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foam">
          <Users className="h-5 w-5 shrink-0 text-action" aria-hidden />
          Friends
          {!loading ? (
            <span className="rounded-md bg-ocean-800 px-2 py-0.5 text-xs font-bold text-spray">
              {friends.length}
            </span>
          ) : null}
        </h2>
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => void refetch()}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-ocean-600 px-2.5 py-1.5 text-xs font-semibold text-spray hover:bg-ocean-800 hover:text-foam disabled:opacity-50"
          aria-label="Refresh friends list"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Refresh
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-spray">
        Only friends who turn on <strong className="text-foam">Share spots</strong>{' '}
        show their marks on your map (teal pins). Your marks stay separate unless you
        share too.
      </p>

      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-spray">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading friends…
        </p>
      ) : friends.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-ocean-600 bg-ocean-950/60 px-3 py-4 text-sm text-spray">
          No friends yet. Use <strong className="text-foam">Add demo bots</strong>{' '}
          below to add test anglers—they&apos;ll appear here and their random spots
          will show on the map.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {friends.map((row) => {
            const name = displayFriendName(row.profiles)
            const sharing = row.profiles?.share_spots ?? false
            const isDemo = row.source === 'demo'

            return (
              <li
                key={row.id}
                className="flex items-center gap-3 rounded-xl border border-ocean-700 bg-ocean-950/80 px-3 py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean-800 text-action">
                  <Users className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foam">{name}</p>
                  {row.profiles?.boat_name ? (
                    <p className="truncate text-xs text-spray">{row.profiles.boat_name}</p>
                  ) : null}
                  {row.profiles?.username ? (
                    <p className="truncate font-mono text-[10px] text-spray/50">
                      @{row.profiles.username}
                    </p>
                  ) : null}
                  <p className="mt-0.5 text-xs text-spray/70">
                    {sharing ? 'Sharing spots on map' : 'Spots not shared'}
                    {isDemo ? (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 text-sky-400">
                        <Bot className="h-3 w-3" aria-hidden />
                        Demo
                      </span>
                    ) : null}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={disabled || removingId === row.id}
                  onClick={() => void removeFriend(row.id)}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-ocean-600 px-2.5 py-1.5 text-xs font-semibold text-spray hover:bg-ocean-800 hover:text-foam disabled:opacity-50"
                  aria-label={`Remove ${name} from friends`}
                >
                  {removingId === row.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <UserMinus className="h-3.5 w-3.5" aria-hidden />
                  )}
                  Remove
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {error ? (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 text-sm text-red-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </section>
  )
}
