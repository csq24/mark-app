import { MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCategoryLabel } from '../../data/forumCategories'
import { displayAuthorName, formatForumWhen, type ForumPostWithMeta } from '../../lib/forumDisplay'

type ForumPostCardProps = {
  post: ForumPostWithMeta
}

export function ForumPostCard({ post }: ForumPostCardProps) {
  const author = displayAuthorName(post.profiles)
  const preview =
    post.body.length > 160 ? `${post.body.slice(0, 160).trim()}…` : post.body

  return (
    <li>
      <Link
        to={`/forums/${post.id}`}
        className="block rounded-2xl border-2 border-ocean-700 bg-ocean-900 px-5 py-4 transition-colors hover:border-ocean-500 hover:bg-ocean-800/80"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-mark-blue/15 px-2.5 py-0.5 text-xs font-semibold text-mark-blue">
            {getCategoryLabel(post.category)}
          </span>
          <span className="text-xs text-spray/70">{formatForumWhen(post.updated_at)}</span>
        </div>

        <h3 className="mt-2 text-lg font-bold text-foam">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-spray">{preview}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-spray">
          <span>{author}</span>
          {post.profiles?.boat_name ? (
            <span className="text-spray/60">· {post.profiles.boat_name}</span>
          ) : null}
          <span className="ml-auto flex items-center gap-1 font-semibold text-mark-blue">
            <MessageSquare className="h-4 w-4" aria-hidden />
            {post.reply_count}
          </span>
        </div>
      </Link>
    </li>
  )
}
