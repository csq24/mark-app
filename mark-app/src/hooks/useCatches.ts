import { useCallback, useEffect, useState } from 'react'
import { deleteCatchPhoto } from '../lib/catchPhotos'
import { supabase } from '../lib/supabase'
import type { Catch } from '../types/database'
import { useAuth } from './useAuth'

export type CatchWithMark = Catch & {
  marks: { name: string } | null
}

export function useCatches() {
  const { user, loading: authLoading } = useAuth()
  const [catches, setCatches] = useState<CatchWithMark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchCatches = useCallback(async () => {
    if (!user) {
      setCatches([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('catches')
      .select('*, marks(name)')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setCatches([])
    } else {
      setCatches((data as CatchWithMark[]) ?? [])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    void fetchCatches()
  }, [authLoading, fetchCatches])

  const deleteCatch = useCallback(
    async (catchId: string, photoUrl: string | null) => {
      if (!user) {
        throw new Error('Sign in to delete catches.')
      }

      setDeletingId(catchId)
      setError(null)

      try {
        await deleteCatchPhoto(photoUrl)

        const { error: deleteError } = await supabase
          .from('catches')
          .delete()
          .eq('id', catchId)

        if (deleteError) {
          throw new Error(deleteError.message)
        }

        setCatches((prev) => prev.filter((entry) => entry.id !== catchId))
      } finally {
        setDeletingId(null)
      }
    },
    [user],
  )

  return {
    catches,
    loading: authLoading || loading,
    error,
    refetch: fetchCatches,
    deleteCatch,
    deletingId,
    isAuthenticated: Boolean(user),
  }
}
