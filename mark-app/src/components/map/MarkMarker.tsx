import { Fish } from 'lucide-react'
import { Marker } from 'react-map-gl/maplibre'
import type { Mark } from '../../types/database'

type MarkMarkerProps = {
  mark: Mark
  selected: boolean
  isOwn: boolean
  onSelect: (mark: Mark) => void
}

export function MarkMarker({ mark, selected, isOwn, onSelect }: MarkMarkerProps) {
  return (
    <Marker
      longitude={mark.longitude}
      latitude={mark.latitude}
      anchor="center"
      onClick={(event) => {
        event.originalEvent.stopPropagation()
        onSelect(mark)
      }}
    >
      <button
        type="button"
        aria-label={
          isOwn ? `Mark: ${mark.name}` : `Shared mark: ${mark.name}`
        }
        aria-pressed={selected}
        className={[
          'flex h-11 w-11 items-center justify-center rounded-full border-[3px] shadow-lg transition-transform active:scale-95',
          isOwn
            ? 'border-mark-950 bg-mark-blue text-mark-950 hover:bg-mark-blue-hover'
            : 'border-sky-300/80 bg-sky-600 text-foam hover:bg-sky-500',
          selected
            ? 'scale-110 ring-2 ring-foam/80'
            : 'hover:scale-105',
        ].join(' ')}
      >
        <Fish className="h-5 w-5" strokeWidth={2.5} aria-hidden />
      </button>
    </Marker>
  )
}
