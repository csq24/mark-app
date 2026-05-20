import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { deleteMarkPhoto, uploadMarkPhoto } from '../lib/markPhotos'
import type { Mark, MarkInsert, MarkWithOwner } from '../types/database'

const MARKS_SELECT =
  '*, profiles!marks_user_id_profiles_fkey(full_name, boat_name, username)'
import { useAuth } from './useAuth'

type CreateMarkInput = MarkInsert

export function useMarks() {
  const { user, loading: authLoading } = useAuth()
  const [marks, setMarks] = useState<MarkWithOwner[]>([])
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
      .select(MARKS_SELECT)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setMarks([])
    } else {
      setMarks((data ?? []) as unknown as MarkWithOwner[])
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
        .select(MARKS_SELECT)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        setMarks([])
      } else {
        setMarks((data ?? []) as unknown as MarkWithOwner[])
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

      const row = { ...(data as Mark), profiles: null } as MarkWithOwner
      setMarks((prev) => [row, ...prev])
      return row
    },
    [user],
  )

  const setMarkPhoto = useCallback(
    async (markId: string, file: File | null) => {
      if (!user) throw new Error('Sign in to update this mark.')

      const existing = marks.find((m) => m.id === markId)
      if (!existing || existing.user_id !== user.id) {
        throw new Error('You can only add photos to your own marks.')
      }

      if (!file) {
        if (existing.photo_url) {
          await deleteMarkPhoto(existing.photo_url)
        }
        const { data, error: updateError } = await supabase
          .from('marks')
          .update({ photo_url: null })
          .eq('id', markId)
          .eq('user_id', user.id)
          .select(MARKS_SELECT)
          .single()

        if (updateError) throw new Error(updateError.message)
        const updated = data as unknown as MarkWithOwner
        setMarks((prev) => prev.map((m) => (m.id === markId ? updated : m)))
        return updated
      }

      const photoUrl = await uploadMarkPhoto(markId, user.id, file)
      if (existing.photo_url && existing.photo_url !== photoUrl) {
        await deleteMarkPhoto(existing.photo_url)
      }

      const { data, error: updateError } = await supabase
        .from('marks')
        .update({ photo_url: photoUrl })
        .eq('id', markId)
        .eq('user_id', user.id)
        .select(MARKS_SELECT)
        .single()

      if (updateError) throw new Error(updateError.message)
      const updated = data as unknown as MarkWithOwner
      setMarks((prev) => prev.map((m) => (m.id === markId ? updated : m)))
      return updated
    },
    [user, marks],
  )

  return {
    marks,
    loading: authLoading || loading,
    error,
    createMark,
    setMarkPhoto,
    refetch: fetchMarks,
    isAuthenticated: Boolean(user),
  }
}
