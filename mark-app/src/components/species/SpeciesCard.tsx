import { ChevronRight, Fish } from 'lucide-react'
import { getHabitatLabel } from '../../lib/speciesIndex'
import type { SpeciesListItem } from '../../lib/speciesIndex'

type SpeciesCardProps = {
  species: SpeciesListItem
  catchCount?: number
  selected?: boolean
  onSelect: () => void
}

export function SpeciesCard({
  species,
  catchCount = 0,
  selected = false,
  onSelect,
}: SpeciesCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'flex w-full flex-col rounded-2xl border-2 px-4 py-4 text-left transition-colors',
        'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mark-blue',
        selected
          ? 'border-mark-blue bg-mark-blue/10'
          : 'border-ocean-700 bg-ocean-900 hover:border-ocean-500 hover:bg-ocean-800/80',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-2 text-lg font-bold text-foam">
          <Fish className="h-5 w-5 shrink-0 text-mark-blue" aria-hidden />
          {species.name}
        </span>
        <ChevronRight
          className={[
            'h-5 w-5 shrink-0 text-spray',
            selected ? 'text-mark-blue' : '',
          ].join(' ')}
          aria-hidden
        />
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-spray">{species.summary}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {species.habitats.slice(0, 3).map((habitat) => (
          <span
            key={habitat}
            className="rounded-full bg-ocean-800 px-2 py-0.5 text-xs font-medium text-spray"
          >
            {getHabitatLabel(habitat)}
          </span>
        ))}
      </div>

      {catchCount > 0 ? (
        <p className="mt-3 text-xs font-semibold text-mark-blue">
          {catchCount} in your log book
        </p>
      ) : null}
    </button>
  )
}
