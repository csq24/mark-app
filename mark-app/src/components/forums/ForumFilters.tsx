import { Search } from 'lucide-react'
import { FORUM_CATEGORIES, type ForumSort } from '../../data/forumCategories'

type ForumFiltersProps = {
  query: string
  category: string
  sort: ForumSort
  onQueryChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSortChange: (value: ForumSort) => void
}

export function ForumFilters({
  query,
  category,
  sort,
  onQueryChange,
  onCategoryChange,
  onSortChange,
}: ForumFiltersProps) {
  return (
    <div className="space-y-4">
      <label className="relative block">
        <span className="sr-only">Search discussions</span>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-spray"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search titles and posts…"
          className="w-full min-h-12 rounded-xl border-2 border-ocean-600 bg-ocean-800 py-3 pl-12 pr-4 text-base text-foam placeholder:text-spray/50 focus:border-mark-blue focus:outline-none"
        />
      </label>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by board"
      >
        {FORUM_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onCategoryChange(item.id)}
            className={[
              'min-h-10 rounded-full border-2 px-4 text-sm font-semibold transition-colors',
              category === item.id
                ? 'border-mark-blue bg-mark-blue/15 text-mark-blue'
                : 'border-ocean-600 bg-ocean-900 text-spray hover:border-ocean-500',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-spray">Sort:</span>
        {(
          [
            { id: 'newest' as const, label: 'Newest' },
            { id: 'active' as const, label: 'Most replies' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSortChange(item.id)}
            className={[
              'min-h-9 rounded-full border-2 px-3 text-sm font-semibold transition-colors',
              sort === item.id
                ? 'border-mark-blue bg-mark-blue/15 text-mark-blue'
                : 'border-ocean-600 text-spray hover:border-ocean-500',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
