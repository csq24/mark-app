import { AlertCircle, ArrowLeft, Loader2, Send } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { getCategoryLabel } from '../data/forumCategories'
import { useForumThread, type ForumReplyWithAuthor } from '../hooks/useForumThread'
import { displayAuthorName, formatForumWhen } from '../lib/forumDisplay'

export function ForumThreadPage() {
  const { postId } = useParams<{ postId: string }>()
  const { post, replies, loading, error, replying, addReply, isAuthenticated } =
    useForumThread(postId)
  const [replyBody, setReplyBody] = useState('')
  const [replyError, setReplyError] = useState<string | null>(null)

  async function handleReply(event: React.FormEvent) {
    event.preventDefault()
    setReplyError(null)
    try {
      await addReply(replyBody)
      setReplyBody('')
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Could not post reply.')
    }
  }

  return (
    <div>
      <PageHeader
        title={post?.title ?? 'Discussion'}
        subtitle={post ? getCategoryLabel(post.category) : 'Forums'}
        action={
          <Link
            to="/forums"
            className="flex h-12 items-center gap-2 rounded-xl border-2 border-ocean-600 px-4 font-semibold text-foam hover:bg-ocean-800"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            <span className="hidden sm:inline">Back</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        {loading ? (
          <p className="flex items-center justify-center gap-2 py-16 text-spray">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading thread…
          </p>
        ) : null}

        {error && !post ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border-2 border-red-400/50 bg-red-950/40 px-4 py-3 text-foam"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
            {error}
          </p>
        ) : null}

        {post ? (
          <>
            <article className="rounded-2xl border-2 border-ocean-700 bg-ocean-900 px-5 py-5">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-mark-blue/15 px-2.5 py-0.5 font-semibold text-mark-blue">
                  {getCategoryLabel(post.category)}
                </span>
                <span className="text-spray/70">{formatForumWhen(post.created_at)}</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-foam">{post.title}</h2>
              <p className="mt-1 text-sm text-spray">
                {displayAuthorName(post.profiles)}
                {post.profiles?.boat_name ? ` · ${post.profiles.boat_name}` : ''}
              </p>
              <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-foam">
                {post.body}
              </p>
            </article>

            <section aria-labelledby="replies-heading">
              <h2
                id="replies-heading"
                className="text-lg font-bold text-foam"
              >
                {replies.length} repl{replies.length === 1 ? 'y' : 'ies'}
              </h2>

              {replies.length === 0 ? (
                <p className="mt-3 text-spray">No replies yet — be the first.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {replies.map((reply) => (
                    <ReplyCard key={reply.id} reply={reply} />
                  ))}
                </ul>
              )}
            </section>

            {isAuthenticated ? (
              <form
                onSubmit={(e) => void handleReply(e)}
                className="rounded-2xl border-2 border-ocean-700 bg-ocean-900 p-5"
              >
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-foam">
                    Your reply
                  </span>
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Add advice, ask a follow-up, or share what worked…"
                    disabled={replying}
                    rows={4}
                    required
                    className="w-full resize-y rounded-xl border-2 border-ocean-600 bg-ocean-800 px-4 py-3 text-base text-foam placeholder:text-spray/50 focus:border-mark-blue focus:outline-none disabled:opacity-50"
                  />
                </label>

                {replyError ? (
                  <p role="alert" className="mt-2 text-sm text-red-300">
                    {replyError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={replying || !replyBody.trim()}
                  className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-action px-6 font-bold text-action-text hover:bg-action-hover disabled:opacity-50"
                >
                  {replying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" aria-hidden />
                      Post reply
                    </>
                  )}
                </button>
              </form>
            ) : (
              <p className="text-center text-spray">
                <Link to="/login" className="font-semibold text-mark-blue hover:underline">
                  Sign in
                </Link>{' '}
                to reply.
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

function ReplyCard({ reply }: { reply: ForumReplyWithAuthor }) {
  return (
    <li
      className={[
        'rounded-2xl border-2 border-ocean-700 bg-ocean-950/60 px-4 py-3',
        reply.parent_id ? 'ml-6 sm:ml-10' : '',
      ].join(' ')}
    >
      <p className="text-sm font-semibold text-foam">
        {displayAuthorName(reply.profiles)}
        <span className="ml-2 font-normal text-spray/70">
          {formatForumWhen(reply.created_at)}
        </span>
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-spray">
        {reply.body}
      </p>
    </li>
  )
}
