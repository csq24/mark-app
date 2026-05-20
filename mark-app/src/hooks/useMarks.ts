import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Mark, MarkInsert } from '../types/database'
import { useAuth } from './useAuth'

type CreateMarkInput = MarkInsert

export function useMarks() {
  const { user, loading: authLoading } = useAuth()
  const [marks, setMarks] = useState<Mark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMarks = useCallback(async () => {
    if (!user) {
      setMarks([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('marks')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setMarks([])
    } else {
      setMarks(data ?? [])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    const onRefetch = () => {
      void fetchMarks()
    }
    window.addEventListener('mark-app:refetch-marks', onRefetch)
    return () => window.removeEventListener('mark-app:refetch-marks', onRefetch)
  }, [fetchMarks])

  useEffect(() => {
    if (authLoading) return

    let cancelled = false

    async function loadMarks() {
      if (!user) {
        if (!cancelled) {
          setMarks([])
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('marks')
        .select('*')
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        setMarks([])
      } else {
        setMarks(data ?? [])
      }

      setLoading(false)
    }

    void loadMarks()

    return () => {
      cancelled = true
    }
  }, [authLoading, user])

  const createMark = useCallback(
    async (input: CreateMarkInput) => {
      if (!user) {
        throw new Error('Sign in to save marks.')
      }

      const { data, error: insertError } = await supabase
        .from('marks')
        .insert({
          user_id: user.id,
          name: input.name.trim(),
          latitude: input.latitude,
          longitude: input.longitude,
          description: input.description?.trim() || null,
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      setMarks((prev) => [data, ...prev])
      return data
    },
    [user],
  )

  return {
    marks,
    loading: authLoading || loading,
    error,
    createMark,
    refetch: fetchMarks,
    isAuthenticated: Boolean(user),
  }
}
