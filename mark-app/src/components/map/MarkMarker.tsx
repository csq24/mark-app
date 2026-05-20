import { Fish } from 'lucide-react'
import { Marker } from 'react-map-gl/maplibre'
import { displayMarkOwner, sharedByLabel } from '../../lib/markOwnerDisplay'
import type { MarkWithOwner } from '../../types/database'

type MarkMarkerProps = {
  mark: MarkWithOwner
  selected: boolean
  isOwn: boolean
  onSelect: (mark: MarkWithOwner) => void
}

export function MarkMarker({ mark, selected, isOwn, onSelect }: MarkMarkerProps) {
  const ownerName = displayMarkOwner(mark.profiles)
  const sharedLabel = !isOwn ? sharedByLabel(mark.profiles) : null

  return (
    <Marker
      longitude={mark.longitude}
      latitude={mark.latitude}
      anchor="bottom"
      onClick={(event) => {
        event.originalEvent.stopPropagation()
        onSelect(mark)
      }}
    >
      <button
        type="button"
        aria-label={
          isOwn
            ? `Mark: ${mark.name}`
            : `${mark.name}, ${sharedLabel ?? 'shared mark'}`
        }
        aria-pressed={selected}
        className={[
          'flex flex-col items-center transition-transform',
          selected ? 'scale-110' : 'hover:scale-105',
        ].join(' ')}
      >
        <span
          className={[
            'flex h-11 w-11 items-center justify-center rounded-full border-[3px] shadow-lg active:scale-95',
            isOwn
              ? 'border-mark-950 bg-mark-blue text-mark-950'
              : 'border-sky-300/80 bg-sky-600 text-foam',
            selected ? 'ring-2 ring-foam/80' : '',
          ].join(' ')}
        >
          <Fish className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        </span>
        <span
          className={[
            'mt-1 max-w-[8rem] truncate rounded-md px-1.5 py-0.5 text-center text-[10px] font-bold leading-tight shadow-md',
            isOwn
              ? 'bg-mark-950/90 text-foam'
              : 'bg-sky-950/90 text-sky-100',
          ].join(' ')}
        >
          {mark.name}
        </span>
        {!isOwn ? (
          <span className="mt-0.5 max-w-[8rem] truncate text-center text-[9px] font-semibold text-sky-300/95">
            {ownerName}
          </span>
        ) : null}
      </button>
    </Marker>
  )
}
