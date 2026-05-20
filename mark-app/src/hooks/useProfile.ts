import { useCallback, useEffect, useState } from 'react'
import { usernameFromEmail } from '../lib/profileUsername'
import { supabase } from '../lib/supabase'
import type { Profile, ProfileUpdate } from '../types/database'
import { useAuth } from './useAuth'

export function useProfile() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (fetchError) {
      setError(fetchError.message)
      setProfile(null)
    } else {
      setProfile(data)
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return

    let cancelled = false

    async function loadProfile() {
      if (!user) {
        if (!cancelled) {
          setProfile(null)
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        setProfile(null)
      } else if (!data) {
        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: usernameFromEmail(user.email, user.id),
          })
          .select()
          .single()

        if (cancelled) return

        if (insertError) {
          setError(insertError.message)
          setProfile(null)
        } else {
          setProfile(created)
        }
      } else {
        setProfile(data)
      }

      setLoading(false)
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [authLoading, user])

  const updateProfile = useCallback(
    async (input: ProfileUpdate) => {
      if (!user) {
        throw new Error('Sign in to update your profile.')
      }

      setSaving(true)
      setError(null)

      const payload: ProfileUpdate = {}

      if (input.full_name !== undefined) {
        payload.full_name = input.full_name?.trim() || null
      }
      if (input.boat_name !== undefined) {
        payload.boat_name = input.boat_name?.trim() || null
      }
      if (input.share_spots !== undefined) {
        payload.share_spots = input.share_spots
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id)
        .select()
        .single()

      setSaving(false)

      if (updateError) {
        throw new Error(updateError.message)
      }

      setProfile(data)
      return data
    },
    [user],
  )

  return {
    profile,
    loading: authLoading || loading,
    error,
    saving,
    updateProfile,
    refetch: fetchProfile,
    isAuthenticated: Boolean(user),
  }
}
