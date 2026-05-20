import { Loader2, X } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { FORUM_CATEGORIES, type ForumCategoryId } from '../../data/forumCategories'
import type { ForumCategory } from '../../types/database'

const POST_CATEGORIES = FORUM_CATEGORIES.filter((c) => c.id !== 'all')

type CreateForumPostModalProps = {
  open: boolean
  saving: boolean
  error: string | null
  onClose: () => void
  onSubmit: (input: {
    category: ForumCategory
    title: string
    body: string
  }) => void | Promise<void>
}

export function CreateForumPostModal({
  open,
  saving,
  error,
  onClose,
  onSubmit,
}: CreateForumPostModalProps) {
  if (!open) return null

  return (
    <CreateForumPostForm
      key={open ? 'open' : 'closed'}
      saving={saving}
      error={error}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}

function CreateForumPostForm({
  saving,
  error,
  onClose,
  onSubmit,
}: Omit<CreateForumPostModalProps, 'open'>) {
  const titleId = useId()
  const [category, setCategory] = useState<ForumCategoryId>('general')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim() || !body.trim() || saving) return
    await onSubmit({
      category,
      title: title.trim(),
      body: body.trim(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ocean-950/80 p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:items-center sm:pb-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl border-2 border-ocean-600 bg-ocean-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg text-spray hover:bg-ocean-800 disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 id={titleId} className="pr-10 text-xl font-bold text-foam">
          New discussion
        </h2>
        <p className="mt-1 text-sm text-spray">
          Pick a board, add a clear title, and share what you know.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-foam">Board</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ForumCategoryId)}
              disabled={saving}
              className={inputClass}
            >
              {POST_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-foam">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best leader for windy inshore days?"
              disabled={saving}
              required
              minLength={3}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-foam">Message</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share conditions, gear, or questions…"
              disabled={saving}
              required
              rows={5}
              className={[inputClass, 'resize-y min-h-28'].join(' ')}
            />
          </label>

          {error ? (
            <p role="alert" className="text-sm font-medium text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving || title.trim().length < 3 || !body.trim()}
            className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-action font-bold text-action-text hover:bg-action-hover disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Posting…
              </>
            ) : (
              'Post to forum'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputClass =
  'w-full min-h-12 rounded-xl border-2 border-ocean-600 bg-ocean-800 px-4 text-base text-foam placeholder:text-spray/50 focus:border-mark-blue focus:outline-none disabled:opacity-50'
