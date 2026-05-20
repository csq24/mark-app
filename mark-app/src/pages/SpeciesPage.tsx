import { Fish, Loader2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { FishSpeciesBarChart } from '../components/map/FishSpeciesBarChart'
import { SpeciesCard } from '../components/species/SpeciesCard'
import { SpeciesDetailPanel } from '../components/species/SpeciesDetailPanel'
import { FISH_HABITATS } from '../data/fishSpecies'
import type { FishHabitatId } from '../data/fishSpecies'
import { useAuth } from '../hooks/useAuth'
import { useCatches } from '../hooks/useCatches'
import { aggregateFishCounts } from '../lib/catchStats'
import {
  aggregateCatchStatsBySpecies,
  buildSpeciesIndex,
  filterSpeciesList,
  findSpeciesById,
} from '../lib/speciesIndex'

export function SpeciesPage() {
  const { user, loading: authLoading } = useAuth()
  const { catches, loading: catchesLoading, isAuthenticated } = useCatches()
  const [searchParams, setSearchParams] = useSearchParams()

  const [query, setQuery] = useState('')
  const [habitat, setHabitat] = useState<FishHabitatId | 'all'>('all')

  const selectedId = searchParams.get('id')
  const allSpecies = useMemo(() => buildSpeciesIndex(), [])
  const catchStatsBySpecies = useMemo(
    () => aggregateCatchStatsBySpecies(catches),
    [catches],
  )

  const filtered = useMemo(
    () => filterSpeciesList(allSpecies, { query, habitat }),
    [allSpecies, query, habitat],
  )

  const selected = selectedId ? findSpeciesById(selectedId) : undefined
  const selectedStats = selected ? catchStatsBySpecies.get(selected.id) : undefined

  const yourSpeciesCounts = useMemo(() => {
    if (!isAuthenticated || catches.length === 0) return []
    return aggregateFishCounts(catches).slice(0, 6)
  }, [catches, isAuthenticated])

  function selectSpecies(id: string) {
    setSearchParams({ id }, { replace: true })
  }

  function clearSelection() {
    setSearchParams({}, { replace: true })
  }

  const loading = authLoading || (isAuthenticated && catchesLoading)

  return (
    <div>
      <PageHeader
        title="Species"
        subtitle="Fish ID, habitat notes, and gear tips — tied to your log book"
      />

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <p className="text-sm text-spray">
          Reference data is for learning only. Always verify size and bag limits
          with local regulations.
        </p>

        {isAuthenticated && yourSpeciesCounts.length > 0 ? (
          <section
            className="rounded-2xl border-2 border-ocean-700 bg-ocean-900 p-5"
            aria-labelledby="your-species-heading"
          >
            <h2
              id="your-species-heading"
              className="flex items-center gap-2 text-lg font-bold text-foam"
            >
              <Fish className="h-5 w-5 text-mark-blue" aria-hidden />
              Your catches by species
            </h2>
            <div className="mt-4 max-w-md">
              <FishSpeciesBarChart data={yourSpeciesCounts} />
            </div>
          </section>
        ) : !authLoading && !user ? (
          <div className="rounded-2xl border-2 border-dashed border-ocean-600 bg-ocean-900/50 px-6 py-8 text-center">
            <p className="text-lg font-semibold text-foam">Sign in to see your species stats</p>
            <p className="mt-2 text-spray">
              Log catches and they will show up here and on the map.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-action px-6 font-bold text-action-text hover:bg-action-hover"
            >
              Sign in
            </Link>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search species</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-spray"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fish, habitat, region…"
              className="w-full min-h-12 rounded-xl border-2 border-ocean-600 bg-ocean-800 py-3 pl-12 pr-4 text-base text-foam placeholder:text-spray/50 focus:border-mark-blue focus:outline-none"
            />
          </label>
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by habitat"
        >
          <HabitatChip
            label="All"
            active={habitat === 'all'}
            onClick={() => setHabitat('all')}
          />
          {FISH_HABITATS.map((item) => (
            <HabitatChip
              key={item.id}
              label={item.label}
              active={habitat === item.id}
              onClick={() => setHabitat(item.id)}
            />
          ))}
        </div>

        <p className="text-sm text-spray">
          {filtered.length} species
          {query || habitat !== 'all' ? ' matching filters' : ''}
        </p>

        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(280px,360px)]">
          <ul className="grid gap-3 sm:grid-cols-2">
            {filtered.map((species) => (
              <li key={species.id}>
                <SpeciesCard
                  species={species}
                  catchCount={catchStatsBySpecies.get(species.id)?.count ?? 0}
                  selected={selected?.id === species.id}
                  onSelect={() => selectSpecies(species.id)}
                />
              </li>
            ))}
          </ul>

          {selected ? (
            <div className="hidden lg:block">
              <SpeciesDetailPanel
                species={selected}
                stats={selectedStats}
                onClose={clearSelection}
              />
            </div>
          ) : (
            <div className="hidden rounded-2xl border-2 border-dashed border-ocean-700 bg-ocean-900/40 p-8 text-center lg:flex lg:flex-col lg:items-center lg:justify-center">
              <Fish className="h-12 w-12 text-ocean-600" aria-hidden />
              <p className="mt-4 text-lg font-semibold text-foam">Select a species</p>
              <p className="mt-2 max-w-xs text-sm text-spray">
                Tap a fish card for habitat info, gear tips, and your log book stats.
              </p>
            </div>
          )}
        </div>

        {selected ? (
          <div className="lg:hidden">
            <SpeciesDetailPanel
              species={selected}
              stats={selectedStats}
              onClose={clearSelection}
            />
          </div>
        ) : null}

        {loading ? (
          <p className="flex items-center justify-center gap-2 text-sm text-spray">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading your catches…
          </p>
        ) : null}

        {filtered.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-ocean-600 px-6 py-10 text-center text-spray">
            No species match your search. Try another habitat or keyword.
          </p>
        ) : null}
      </div>
    </div>
  )
}

type HabitatChipProps = {
  label: string
  active: boolean
  onClick: () => void
}

function HabitatChip({ label, active, onClick }: HabitatChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'min-h-10 rounded-full border-2 px-4 text-sm font-semibold transition-colors',
        active
          ? 'border-mark-blue bg-mark-blue/15 text-mark-blue'
          : 'border-ocean-600 bg-ocean-900 text-spray hover:border-ocean-500',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
