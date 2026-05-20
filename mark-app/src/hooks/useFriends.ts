import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'
import { useAuth } from './useAuth'

export type FriendRow = {
  id: string
  friend_id: string
  created_at: string
  source: string
  profiles: Pick<Profile, 'full_name' | 'boat_name' | 'share_spots' | 'username'> | null
}

export function useFriends() {
  const { user, loading: authLoading } = useAuth()
  const [friends, setFriends] = useState<FriendRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchFriends = useCallback(async () => {
    if (!user) {
      setFriends([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('friends')
      .select(
        'id, friend_id, created_at, source, profiles(full_name, boat_name, share_spots, username)',
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setFriends([])
    } else {
      setFriends((data ?? []) as unknown as FriendRow[])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return

    void fetchFriends()

    const onRefetch = () => {
      void fetchFriends()
    }
    window.addEventListener('mark-app:refetch-friends', onRefetch)
    return () => window.removeEventListener('mark-app:refetch-friends', onRefetch)
  }, [authLoading, fetchFriends])

  const removeFriend = useCallback(
    async (friendRowId: string) => {
      if (!user) return

      setRemovingId(friendRowId)
      setError(null)

      const { error: deleteError } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendRowId)
        .eq('user_id', user.id)

      setRemovingId(null)

      if (deleteError) {
        setError(deleteError.message)
        throw new Error(deleteError.message)
      }

      setFriends((prev) => prev.filter((f) => f.id !== friendRowId))
      window.dispatchEvent(new CustomEvent('mark-app:refetch-marks'))
    },
    [user],
  )

  return {
    friends,
    loading: authLoading || loading,
    error,
    removingId,
    removeFriend,
    refetch: fetchFriends,
    isAuthenticated: Boolean(user),
  }
}
