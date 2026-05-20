import { Fish, Waves } from 'lucide-react'
import { Marker } from 'react-map-gl/maplibre'
import {
  atlasEntriesForZoom,
  type FishingAtlasEntry,
} from '../../data/fishingAtlas'
import { FlagImage } from './FlagImage'
import { flagEmoji } from '../../lib/flagUrl'

type FishingAtlasMarkersProps = {
  zoom: number
  selectedId: string | null
  onSelect: (entry: FishingAtlasEntry) => void
}

export function FishingAtlasMarkers({
  zoom,
  selectedId,
  onSelect,
}: FishingAtlasMarkersProps) {
  const entries = atlasEntriesForZoom(zoom)

  return (
    <>
      {entries.map((entry) => {
        const isCountry = entry.kind === 'country'
        const isCoast = entry.kind === 'coast'
        const selected = selectedId === entry.id

        return (
          <Marker
            key={entry.id}
            longitude={entry.longitude}
            latitude={entry.latitude}
            anchor="bottom"
            onClick={(event) => {
              event.originalEvent.stopPropagation()
              onSelect(entry)
            }}
          >
            <button
              type="button"
              className={[
                'flex flex-col items-center transition-transform',
                selected ? 'scale-110' : 'hover:scale-105',
              ].join(' ')}
              aria-label={`${entry.name} fishing guide`}
            >
              {isCountry ? (
                <span
                  className={[
                    'overflow-hidden rounded-md border-2 bg-white shadow-lg',
                    selected ? 'border-action' : 'border-white',
                  ].join(' ')}
                >
                  <FlagImage
                    countryCode={entry.countryCode}
                    width={56}
                    height={40}
                    className="block h-8 w-11 object-cover"
                  />
                </span>
              ) : (
                <span
                  className={[
                    'flex items-center justify-center rounded-full border-2 bg-ocean-900/95 shadow-lg',
                    isCoast ? 'h-9 w-9' : 'h-10 w-10',
                    selected ? 'border-action' : 'border-catch/60',
                  ].join(' ')}
                >
                  {isCoast ? (
                    <Waves className="h-4 w-4 text-sky-300" aria-hidden />
                  ) : (
                    <Fish className="h-5 w-5 text-catch" aria-hidden />
                  )}
                </span>
              )}
              <span
                className={[
                  'mt-1 truncate rounded-md px-1.5 py-0.5 text-center text-[10px] font-bold leading-tight shadow-md',
                  isCountry ? 'max-w-[7rem]' : 'max-w-[9rem]',
                  isCountry
                    ? 'bg-ocean-950/90 text-foam'
                    : isCoast
                      ? 'bg-sky-900/90 text-sky-100'
                      : 'bg-catch/90 text-catch-text',
                ].join(' ')}
              >
                {isCountry ? (
                  <>
                    <span className="mr-0.5">{flagEmoji(entry.countryCode)}</span>
                    {entry.name}
                  </>
                ) : (
                  entry.name
                )}
              </span>
            </button>
          </Marker>
        )
      })}
    </>
  )
}
