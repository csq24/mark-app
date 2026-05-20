import { Compass, Fish, MapPin, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  aggregateFishCounts,
  getCatchesForMark,
} from '../../lib/catchStats'
import { formatCatchDate, formatCatchDetails } from '../../lib/formatCatch'
import type { MarkAreaGuide } from '../../lib/markAreaGuide'
import type { CatchWithMark } from '../../hooks/useCatches'
import type { Mark } from '../../types/database'
import { FishSpeciesBarChart } from './FishSpeciesBarChart'

type MarkDetailPanelProps = {
  mark: Mark
  isOwn: boolean
  catches: CatchWithMark[]
  catchesLoading: boolean
  areaGuide: MarkAreaGuide
  onClose: () => void
}

function kindLabel(kind: MarkAreaGuide['scope']): string {
  switch (kind) {
    case 'coast':
      return 'Coast / bay'
    case 'region':
      return 'Region'
    case 'country':
      return 'Country'
    default:
      return 'Area'
  }
}

export function MarkDetailPanel({
  mark,
  isOwn,
  catches,
  catchesLoading,
  areaGuide,
  onClose,
}: MarkDetailPanelProps) {
  const markCatches = getCatchesForMark(catches, mark.id)
  const fishCounts = aggregateFishCounts(markCatches)
  const showPersonalChart = markCatches.length >= 2

  return (
    <section
      className="pointer-events-auto absolute inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-20 mx-auto flex max-h-[min(72vh,32rem)] w-full max-w-2xl flex-col rounded-t-2xl border border-mark-700 bg-mark-950/98 shadow-2xl backdrop-blur-md lg:bottom-6 lg:max-w-3xl lg:rounded-2xl"
      aria-label={`Details for ${mark.name}`}
    >
      <header className="flex shrink-0 items-start gap-3 border-b border-mark-700 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mark-blue text-mark-950">
          <MapPin className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-foam">{mark.name}</h2>
          {!isOwn ? (
            <p className="text-xs font-semibold text-sky-400">Shared spot</p>
          ) : null}
          <p className="font-mono text-[10px] text-spray/60">
            {mark.latitude.toFixed(4)}, {mark.longitude.toFixed(4)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-spray hover:bg-mark-800 hover:text-foam"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-mark-700 overflow-y-auto md:grid-cols-2 md:divide-x md:divide-y-0">
        {/* Personal — your catches at this mark */}
        <div className="flex min-h-0 flex-col p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foam">
            <Fish className="h-4 w-4 text-mark-blue" aria-hidden />
            {isOwn ? 'Your catches here' : 'Catch history'}
          </h3>
          <p className="mt-0.5 text-xs text-spray/70">
            {isOwn
              ? 'Logged at this mark only'
              : 'Only the spot owner can see their catch log'}
          </p>

          {catchesLoading ? (
            <p className="mt-4 text-sm text-spray/70">Loading catches…</p>
          ) : !isOwn ? (
            <p className="mt-4 text-sm text-spray/80">
              This angler chose to share the spot location, not their private
              catches.
            </p>
          ) : markCatches.length === 0 ? (
            <p className="mt-4 text-sm text-spray/80">
              No fish logged at this Mark yet. Log a catch to build your personal
              chart.
            </p>
          ) : (
            <>
              {showPersonalChart ? (
                <div className="mt-4">
                  <FishSpeciesBarChart data={fishCounts} />
                </div>
              ) : null}

              <ul className="mt-4 space-y-2">
                {markCatches.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex gap-3 rounded-xl border border-mark-700 bg-mark-900/80 p-2.5"
                  >
                    {entry.photo_url ? (
                      <img
                        src={entry.photo_url}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-mark-800 text-mark-blue">
                        <Fish className="h-6 w-6" aria-hidden />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-foam">{entry.fish_type}</p>
                      <p className="text-xs text-spray/80">
                        {formatCatchDetails(
                          entry.weight_lbs,
                          entry.water_depth_ft,
                          null,
                        )}
                      </p>
                      <p className="mt-0.5 text-[10px] text-spray/60">
                        {formatCatchDate(entry.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          <Link
            to={`/new-catch?markId=${mark.id}&markName=${encodeURIComponent(mark.name)}`}
            onClick={onClose}
            className="mt-4 flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-catch text-sm font-bold text-catch-text hover:bg-catch-hover"
          >
            <Fish className="h-4 w-4" aria-hidden />
            Log catch here
          </Link>
        </div>

        {/* Regional — expected species & area guide */}
        <div className="flex min-h-0 flex-col p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foam">
            <Compass className="h-4 w-4 text-mark-blue" aria-hidden />
            Expected in this area
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-spray/70">
            <span className="rounded-md bg-mark-800 px-1.5 py-0.5 font-medium text-mark-blue">
              {kindLabel(areaGuide.scope)}
            </span>
            <span>{areaGuide.scopeLabel}</span>
            <span className="text-spray/50">· ~{areaGuide.distanceKm} km</span>
          </p>

          <p className="mt-3 text-sm leading-relaxed text-spray/90">
            {areaGuide.summary}
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-spray/70">
              Common species
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {areaGuide.expectedSpecies.map((species) => (
                <li
                  key={species}
                  className="rounded-lg border border-mark-700 bg-mark-800/80 px-2 py-1 text-xs font-medium text-foam"
                >
                  {species}
                </li>
              ))}
            </ul>
          </div>

          {areaGuide.usingRegionalFallback || areaGuide.areaSpots.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-spray/70">
                {areaGuide.usingRegionalFallback
                  ? `Fishing areas in ${areaGuide.entry.name}`
                  : 'Nearby named areas'}
              </p>
              <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-sm text-spray/90">
                {areaGuide.famousAreas.map((area) => (
                  <li
                    key={area}
                    className="flex items-center gap-2 rounded-lg px-1 py-0.5"
                  >
                    <MapPin className="h-3 w-3 shrink-0 text-mark-blue" />
                    {area}
                  </li>
                ))}
                {areaGuide.areaSpots.map((spot) => (
                  <li
                    key={spot.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-mark-900/50 px-2 py-1"
                  >
                    <span className="truncate text-foam">{spot.name}</span>
                    <span className="shrink-0 text-[10px] capitalize text-spray/60">
                      {spot.kind} · {spot.distanceKm} km
                    </span>
                  </li>
                ))}
              </ul>
              {areaGuide.spotTypes.length > 0 ? (
                <p className="mt-2 text-xs text-spray/60">
                  Spot types: {areaGuide.spotTypes.join(' · ')}
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="mt-3 text-[10px] leading-snug text-spray/50">
            Reference only — not regulations or real-time conditions.
          </p>
        </div>
      </div>

      <footer className="shrink-0 border-t border-mark-700 px-4 py-2 text-center text-[10px] text-spray/50 lg:hidden">
        Tap the map to close
      </footer>
    </section>
  )
}
