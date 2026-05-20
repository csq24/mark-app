import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ForumPostWithMeta } from '../lib/forumDisplay'
import type { ForumCategory, ForumPostInsert } from '../types/database'
import { useAuth } from './useAuth'

export function useForumPosts() {
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState<ForumPostWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const fetchPosts = useCallback(async () => {
    if (!user) {
      setPosts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('forum_posts')
      .select('*, profiles(full_name, boat_name, username)')
      .order('created_at', { ascending: false })

    if (fetchError) {
      const missingTable =
        fetchError.code === 'PGRST205' ||
        (fetchError.code === '42P01' && fetchError.message.includes('forum_posts'))
      setError(
        missingTable
          ? 'Forums are not set up yet. Run supabase/forums-schema.sql in your Supabase project.'
          : fetchError.message,
      )
      setPosts([])
      setLoading(false)
      return
    }

    const rows = (data ?? []) as unknown as ForumPostWithMeta[]
    const postIds = rows.map((p) => p.id)

    let replyCounts: Record<string, number> = {}
    if (postIds.length > 0) {
      const { data: replies, error: replyError } = await supabase
        .from('forum_replies')
        .select('post_id')
        .in('post_id', postIds)

      if (!replyError && replies) {
        for (const row of replies) {
          replyCounts[row.post_id] = (replyCounts[row.post_id] ?? 0) + 1
        }
      }
    }

    setPosts(
      rows.map((row) => ({
        ...row,
        reply_count: replyCounts[row.id] ?? 0,
      })),
    )
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    void fetchPosts()
  }, [authLoading, fetchPosts])

  const createPost = useCallback(
    async (input: { category: ForumCategory; title: string; body: string }) => {
      if (!user) {
        throw new Error('Sign in to start a discussion.')
      }

      setCreating(true)
      setError(null)

      const payload: ForumPostInsert = {
        user_id: user.id,
        category: input.category,
        title: input.title.trim(),
        body: input.body.trim(),
      }

      const { data, error: insertError } = await supabase
        .from('forum_posts')
        .insert(payload)
        .select('*, profiles(full_name, boat_name, username)')
        .single()

      setCreating(false)

      if (insertError) {
        throw new Error(insertError.message)
      }

      const withMeta = {
        ...(data as unknown as ForumPostWithMeta),
        reply_count: 0,
      }
      setPosts((prev) => [withMeta, ...prev])
      return withMeta
    },
    [user],
  )

  return {
    posts,
    loading: authLoading || loading,
    error,
    creating,
    createPost,
    refetch: fetchPosts,
    isAuthenticated: Boolean(user),
  }
}
