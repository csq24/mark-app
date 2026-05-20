import type { ForumPost } from '../types/database'

export type ForumAuthor = {
  full_name: string | null
  boat_name?: string | null
  username?: string | null
}

export function displayAuthorName(
  author: ForumAuthor | null | undefined,
  fallback = 'Captain',
): string {
  if (!author) return fallback
  const name = author.full_name?.trim() || author.username?.trim()
  return name || fallback
}

export type ForumPostWithMeta = ForumPost & {
  profiles: ForumAuthor | null
  reply_count: number
}

export function filterForumPosts(
  posts: ForumPostWithMeta[],
  options: {
    category?: string
    query?: string
    sort?: 'newest' | 'active'
  },
): ForumPostWithMeta[] {
  const q = options.query?.trim().toLowerCase() ?? ''
  const category = options.category ?? 'all'
  const sort = options.sort ?? 'newest'

  let list = posts

  if (category !== 'all') {
    list = list.filter((p) => p.category === category)
  }

  if (q) {
    list = list.filter((p) => {
      const haystack = [
        p.title,
        p.body,
        displayAuthorName(p.profiles),
        p.profiles?.boat_name ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }

  list = [...list].sort((a, b) => {
    if (sort === 'active') {
      const diff = b.reply_count - a.reply_count
      if (diff !== 0) return diff
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  return list
}

export function formatForumWhen(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}
