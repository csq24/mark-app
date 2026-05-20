import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { displayAuthorName, type ForumAuthor } from '../lib/forumDisplay'
import type { ForumPost, ForumReply, ForumReplyInsert } from '../types/database'
import { useAuth } from './useAuth'

export type ForumReplyWithAuthor = ForumReply & {
  profiles: ForumAuthor | null
}

export type ForumThread = ForumPost & {
  profiles: ForumAuthor | null
}

export function useForumThread(postId: string | undefined) {
  const { user, loading: authLoading } = useAuth()
  const [post, setPost] = useState<ForumThread | null>(null)
  const [replies, setReplies] = useState<ForumReplyWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replying, setReplying] = useState(false)

  const fetchThread = useCallback(async () => {
    if (!user || !postId) {
      setPost(null)
      setReplies([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data: postRow, error: postError } = await supabase
      .from('forum_posts')
      .select('*, profiles(full_name, boat_name, username)')
      .eq('id', postId)
      .maybeSingle()

    if (postError) {
      setError(postError.message)
      setPost(null)
      setReplies([])
      setLoading(false)
      return
    }

    if (!postRow) {
      setError('This discussion was not found.')
      setPost(null)
      setReplies([])
      setLoading(false)
      return
    }

    const { data: replyRows, error: replyError } = await supabase
      .from('forum_replies')
      .select('*, profiles(full_name, boat_name, username)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (replyError) {
      setError(replyError.message)
    } else {
      setReplies((replyRows as ForumReplyWithAuthor[]) ?? [])
    }

    setPost(postRow as ForumThread)
    setLoading(false)
  }, [user, postId])

  useEffect(() => {
    if (authLoading) return
    void fetchThread()
  }, [authLoading, fetchThread])

  const addReply = useCallback(
    async (body: string, parentId?: string | null) => {
      if (!user || !postId) {
        throw new Error('Sign in to reply.')
      }

      const trimmed = body.trim()
      if (!trimmed) {
        throw new Error('Write a reply first.')
      }

      setReplying(true)
      setError(null)

      const payload: ForumReplyInsert = {
        post_id: postId,
        user_id: user.id,
        parent_id: parentId ?? null,
        body: trimmed,
      }

      const { data, error: insertError } = await supabase
        .from('forum_replies')
        .insert(payload)
        .select('*, profiles(full_name, boat_name, username)')
        .single()

      setReplying(false)

      if (insertError) {
        throw new Error(insertError.message)
      }

      setReplies((prev) => [...prev, data as ForumReplyWithAuthor])
      setPost((prev) =>
        prev ? { ...prev, updated_at: new Date().toISOString() } : prev,
      )
      return data as ForumReplyWithAuthor
    },
    [user, postId],
  )

  return {
    post,
    replies,
    loading: authLoading || loading,
    error,
    replying,
    addReply,
    refetch: fetchThread,
    isAuthenticated: Boolean(user),
    authorName: displayAuthorName(post?.profiles ?? null),
  }
}
