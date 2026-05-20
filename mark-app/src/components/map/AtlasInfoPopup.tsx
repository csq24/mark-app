import { Anchor, Fish, MapPin, X } from 'lucide-react'
import type { FishingAtlasEntry } from '../../data/fishingAtlas'
import { FlagImage } from './FlagImage'
import { flagEmoji } from '../../lib/flagUrl'

type AtlasInfoPopupProps = {
  entry: FishingAtlasEntry
  onClose: () => void
}

export function AtlasInfoPopup({ entry, onClose }: AtlasInfoPopupProps) {
  const isCountry = entry.kind === 'country'
  const kindLabel =
    entry.kind === 'country'
      ? 'Country guide'
      : entry.kind === 'coast'
        ? 'Coast guide'
        : 'Fishing region'

  return (
    <article className="relative w-[min(20rem,calc(100vw-2.5rem))] p-1 text-foam">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-lg text-spray hover:bg-mark-800 hover:text-foam"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        {isCountry ? (
          <FlagImage
            countryCode={entry.countryCode}
            className="h-10 w-14 shrink-0 rounded border border-mark-600 object-cover shadow-sm"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mark-800 text-xl">
            {flagEmoji(entry.countryCode)}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-action">
            {kindLabel}
          </p>
          <h3 className="text-lg font-bold leading-tight text-foam">
            {entry.name}
          </h3>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-spray">{entry.summary}</p>

      <section className="mt-4">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-action">
          <Fish className="h-3.5 w-3.5" aria-hidden />
          Commonly caught
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {entry.commonSpecies.map((species) => (
            <li
              key={species}
              className="rounded-lg border border-mark-600 bg-mark-800 px-2 py-1 text-xs font-semibold text-foam"
            >
              {species}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-3">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-action">
          <Anchor className="h-3.5 w-3.5" aria-hidden />
          Water types
        </p>
        <p className="text-sm text-spray">{entry.spotTypes.join(' · ')}</p>
      </section>

      <section className="mt-3">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-action">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          Famous areas
        </p>
        <p className="text-sm text-spray">{entry.famousAreas.join(' · ')}</p>
      </section>

      <p className="mt-4 rounded-lg border border-mark-700 bg-mark-800 px-2.5 py-2 text-xs leading-snug text-spray">
        Reference only — always check local laws, seasons, and protected zones before
        fishing.
      </p>
    </article>
  )
}
