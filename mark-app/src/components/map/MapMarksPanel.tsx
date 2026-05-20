import { Fish, MapPin } from 'lucide-react'
import { isOwnMark } from '../../lib/markOwnership'
import { displayMarkOwner } from '../../lib/markOwnerDisplay'
import type { MarkWithOwner } from '../../types/database'

type MapMarksPanelProps = {
  marks: MarkWithOwner[]
  currentUserId?: string
  selectedMarkId: string | null
  onSelect: (mark: MarkWithOwner) => void
  loading?: boolean
}

export function MapMarksPanel({
  marks,
  currentUserId,
  selectedMarkId,
  onSelect,
  loading = false,
}: MapMarksPanelProps) {
  return (
    <aside
      className="pointer-events-auto hidden h-full w-72 shrink-0 flex-col border-r border-mark-700/80 bg-mark-950/95 backdrop-blur-md lg:flex"
      aria-label="Your marks"
    >
      <div className="border-b border-mark-700/80 px-4 py-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foam">
          <Fish className="h-5 w-5 text-mark-blue" aria-hidden />
          Marks
        </h2>
        <p className="mt-1 text-xs text-spray/80">
          Yours and shared spots · zoom in to drop a mark
        </p>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto p-2">
        {loading ? (
          <li className="px-3 py-6 text-center text-sm text-spray/70">
            Loading marks…
          </li>
        ) : marks.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-spray/70">
            No marks in this time range
          </li>
        ) : (
          marks.map((mark) => {
            const selected = mark.id === selectedMarkId
            const own = isOwnMark(mark, currentUserId)
            return (
              <li key={mark.id}>
                <button
                  type="button"
                  onClick={() => onSelect(mark)}
                  className={[
                    'flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                    selected
                      ? 'bg-mark-blue/15 ring-1 ring-mark-blue/50'
                      : 'hover:bg-mark-800/80',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                      selected
                        ? 'bg-mark-blue text-mark-950'
                        : 'bg-mark-800 text-mark-blue',
                    ].join(' ')}
                  >
                    <MapPin className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foam">
                      {mark.name}
                    </span>
                    {!own ? (
                      <span className="mt-0.5 block truncate text-xs text-sky-400">
                        {displayMarkOwner(mark.profiles)}
                      </span>
                    ) : null}
                    <span className="mt-0.5 block font-mono text-[10px] text-spray/60">
                      {mark.latitude.toFixed(4)}, {mark.longitude.toFixed(4)}
                    </span>
                  </span>
                </button>
              </li>
            )
          })
        )}
      </ul>
    </aside>
  )
}
