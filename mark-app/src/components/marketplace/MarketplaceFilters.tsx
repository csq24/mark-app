import { Search } from 'lucide-react'
import { MARKETPLACE_CATEGORIES } from '../../data/marketplaceCategories'

type MarketplaceFiltersProps = {
  query: string
  category: string
  onQueryChange: (value: string) => void
  onCategoryChange: (value: string) => void
}

export function MarketplaceFilters({
  query,
  category,
  onQueryChange,
  onCategoryChange,
}: MarketplaceFiltersProps) {
  return (
    <div className="space-y-4">
      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-spray"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search tackle, engines, electronics…"
          className="w-full min-h-12 rounded-xl border-2 border-ocean-600 bg-ocean-800 py-3 pl-12 pr-4 text-base text-foam placeholder:text-spray/50 focus:border-mark-blue focus:outline-none"
        />
      </label>

      <div
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Categories"
      >
        {MARKETPLACE_CATEGORIES.map((item) => {
          const active = category === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onCategoryChange(item.id)}
              className={[
                'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                active
                  ? 'bg-mark-blue text-white'
                  : 'border-2 border-ocean-600 text-spray hover:border-spray hover:text-foam',
              ].join(' ')}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
