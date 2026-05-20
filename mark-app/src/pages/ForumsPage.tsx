import { AlertCircle, Loader2, MessageSquarePlus, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreateForumPostModal } from '../components/forums/CreateForumPostModal'
import { ForumFilters } from '../components/forums/ForumFilters'
import { ForumPostCard } from '../components/forums/ForumPostCard'
import { PageHeader } from '../components/layout/PageHeader'
import type { ForumSort } from '../data/forumCategories'
import { useForumPosts } from '../hooks/useForumPosts'
import { filterForumPosts } from '../lib/forumDisplay'
import { isSupabaseConfigured } from '../lib/supabase'

export function ForumsPage() {
  const {
    posts,
    loading,
    error,
    creating,
    createPost,
    refetch,
    isAuthenticated,
  } = useForumPosts()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState<ForumSort>('newest')
  const [modalOpen, setModalOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const filtered = useMemo(
    () => filterForumPosts(posts, { query, category, sort }),
    [posts, query, category, sort],
  )

  async function handleCreate(input: {
    category: import('../types/database').ForumCategory
    title: string
    body: string
  }) {
    setCreateError(null)
    try {
      const created = await createPost(input)
      setModalOpen(false)
      if (created) {
        setCategory(created.category)
        setSort('newest')
        setQuery('')
      }
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Could not create your post.',
      )
    }
  }

  return (
    <div>
      <PageHeader
        title="Forums"
        subtitle="Offshore, inshore, charters, gear, and beginner questions"
        action={
          isAuthenticated ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={loading}
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ocean-600 text-spray hover:border-spray hover:text-foam disabled:opacity-50"
                aria-label="Refresh forums"
              >
                <RefreshCw
                  className={['h-5 w-5', loading ? 'animate-spin' : ''].join(' ')}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreateError(null)
                  setModalOpen(true)
                }}
                className="flex min-h-12 items-center gap-2 rounded-xl bg-action px-4 font-bold text-action-text hover:bg-action-hover"
              >
                <MessageSquarePlus className="h-5 w-5" aria-hidden />
                <span className="hidden sm:inline">New post</span>
              </button>
            </div>
          ) : null
        }
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        <p className="text-sm text-spray">
          Be kind, cite your sources, and never share exact secret spots without
          permission.
        </p>

        {!isSupabaseConfigured ? (
          <SetupBanner message="Add Supabase keys to .env to enable forums." />
        ) : null}

        {!loading && !isAuthenticated ? (
          <div className="rounded-2xl border-2 border-dashed border-ocean-600 bg-ocean-900/50 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-foam">Sign in to join the crew</p>
            <p className="mt-2 text-spray">
              Read and post on offshore, inshore, gear, and beginner boards.
            </p>
            <Link
              to="/login"
              className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-action px-6 font-bold text-action-text hover:bg-action-hover"
            >
              Sign in
            </Link>
          </div>
        ) : null}

        {isAuthenticated ? (
          <>
            <ForumFilters
              query={query}
              category={category}
              sort={sort}
              onQueryChange={setQuery}
              onCategoryChange={setCategory}
              onSortChange={setSort}
            />

            {error ? (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border-2 border-red-400/50 bg-red-950/40 px-4 py-3 text-foam"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
                {error}
              </p>
            ) : null}

            <p className="text-sm text-spray">
              {filtered.length} discussion{filtered.length === 1 ? '' : 's'}
              {query || category !== 'all' ? ' matching filters' : ''}
            </p>

            {loading && posts.length === 0 ? (
              <p className="flex items-center justify-center gap-2 py-12 text-spray">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Loading discussions…
              </p>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-ocean-600 px-6 py-12 text-center">
                <p className="text-lg font-semibold text-foam">No posts yet</p>
                <p className="mt-2 text-spray">
                  {posts.length === 0
                    ? 'Start the first thread on the water.'
                    : 'Try another filter or search term.'}
                </p>
                {posts.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-action px-5 font-bold text-action-text hover:bg-action-hover"
                  >
                    <MessageSquarePlus className="h-5 w-5" aria-hidden />
                    New post
                  </button>
                ) : null}
              </div>
            ) : (
              <ul className="space-y-3">
                {filtered.map((post) => (
                  <ForumPostCard key={post.id} post={post} />
                ))}
              </ul>
            )}
          </>
        ) : null}
      </div>

      <CreateForumPostModal
        open={modalOpen}
        saving={creating}
        error={createError}
        onClose={() => {
          if (!creating) setModalOpen(false)
        }}
        onSubmit={handleCreate}
      />
    </div>
  )
}

function SetupBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl border-2 border-amber-400/40 bg-amber-950/30 px-4 py-3 text-foam"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
      {message}
    </p>
  )
}
