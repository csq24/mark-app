import { MapPin, PlusCircle, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getHabitatLabel } from '../../lib/speciesIndex'
import type { SpeciesCatchStats, SpeciesListItem } from '../../lib/speciesIndex'
import { SpeciesHeroImage } from './SpeciesHeroImage'

type SpeciesDetailPanelProps = {
  species: SpeciesListItem
  stats?: SpeciesCatchStats
  onClose: () => void
}

export function SpeciesDetailPanel({
  species,
  stats,
  onClose,
}: SpeciesDetailPanelProps) {
  const catchCount = stats?.count ?? 0

  return (
    <aside
      className="rounded-2xl border-2 border-mark-blue/40 bg-ocean-900 p-5 shadow-lg lg:sticky lg:top-4"
      aria-labelledby="species-detail-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id="species-detail-heading" className="text-2xl font-bold text-foam">
          {species.name}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ocean-600 text-spray hover:border-spray hover:text-foam lg:hidden"
          aria-label="Close species details"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <SpeciesHeroImage
        key={species.id}
        speciesId={species.id}
        speciesName={species.name}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {species.habitats.map((habitat) => (
          <span
            key={habitat}
            className="rounded-full border border-mark-blue/30 bg-mark-blue/10 px-3 py-1 text-xs font-semibold text-mark-blue"
          >
            {getHabitatLabel(habitat)}
          </span>
        ))}
      </div>

      <p className="mt-4 text-base leading-relaxed text-spray">{species.summary}</p>

      <section className="mt-6" aria-labelledby="gear-tips-heading">
        <h3
          id="gear-tips-heading"
          className="text-sm font-bold uppercase tracking-wider text-foam/80"
        >
          Gear & tactics
        </h3>
        <ul className="mt-2 space-y-2">
          {species.gearTips.map((tip) => (
            <li
              key={tip}
              className="flex gap-2 text-sm text-spray before:mt-1.5 before:shrink-0 before:content-['•']"
            >
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {species.regions.length > 0 ? (
        <section className="mt-6" aria-labelledby="regions-heading">
          <h3
            id="regions-heading"
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foam/80"
          >
            <MapPin className="h-4 w-4 text-mark-blue" aria-hidden />
            Common in
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {species.regions.map((region) => (
              <span
                key={region}
                className="rounded-lg bg-ocean-800 px-2.5 py-1 text-xs font-medium text-foam"
              >
                {region}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-spray/70">
            <Link to="/map" className="font-semibold text-mark-blue hover:underline">
              Open the map
            </Link>{' '}
            to explore these areas on the fishing atlas.
          </p>
        </section>
      ) : null}

      {catchCount > 0 && stats ? (
        <section className="mt-6 rounded-xl border-2 border-ocean-700 bg-ocean-950/50 p-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foam/80">
            Your log book
          </h3>
          <p className="mt-1 text-lg font-semibold text-foam">
            {catchCount} catch{catchCount === 1 ? '' : 'es'}
            {stats.totalWeightLbs > 0
              ? ` · ${stats.totalWeightLbs.toFixed(1)} lb total logged`
              : ''}
          </p>
          <Link
            to="/logbook"
            className="mt-3 inline-block text-sm font-semibold text-mark-blue hover:underline"
          >
            View all catches →
          </Link>
        </section>
      ) : (
        <p className="mt-6 text-sm text-spray">
          No catches logged for {species.name} yet.
        </p>
      )}

      <Link
        to={`/new-catch?fish=${encodeURIComponent(species.name)}`}
        className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-action font-bold text-action-text hover:bg-action-hover"
      >
        <PlusCircle className="h-5 w-5" aria-hidden />
        Log a {species.name} catch
      </Link>

      <p className="mt-4 text-xs text-spray/60">
        Reference only — always verify size, season, and bag limits with local
        regulations.
      </p>
    </aside>
  )
}
