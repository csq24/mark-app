import { MapPin } from 'lucide-react'
import { isOwnMark } from '../../lib/markOwnership'
import { displayMarkOwner } from '../../lib/markOwnerDisplay'
import type { MarkWithOwner } from '../../types/database'

type MapMarksTrayProps = {
  marks: MarkWithOwner[]
  currentUserId?: string
  selectedMarkId: string | null
  onSelect: (mark: MarkWithOwner) => void
}

export function MapMarksTray({
  marks,
  currentUserId,
  selectedMarkId,
  onSelect,
}: MapMarksTrayProps) {
  if (marks.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-10 px-3 lg:hidden">
      <div
        className="pointer-events-auto mx-auto max-w-lg rounded-2xl border border-mark-700 bg-mark-950/95 p-2 shadow-xl backdrop-blur-md"
        role="list"
        aria-label="Your saved marks"
      >
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-spray/80">
          {marks.length} mark{marks.length === 1 ? '' : 's'}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {marks.map((mark) => {
            const selected = mark.id === selectedMarkId
            const own = isOwnMark(mark, currentUserId)
            return (
              <button
                key={mark.id}
                type="button"
                role="listitem"
                onClick={() => onSelect(mark)}
                className={[
                  'flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors',
                  selected
                    ? 'border-mark-blue bg-mark-blue/20 text-mark-blue'
                    : 'border-mark-700 bg-mark-800 text-foam',
                ].join(' ')}
              >
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                <span className="max-w-[10rem] truncate">
                  {mark.name}
                  {!own ? (
                    <span className="block truncate text-[10px] font-normal text-sky-300/90">
                      {displayMarkOwner(mark.profiles)}
                    </span>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
