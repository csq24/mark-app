import { Fish, Loader2, MapPin, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { CatchWithMark } from '../../hooks/useCatches'
import { formatCatchDate, formatCatchDetails } from '../../lib/formatCatch'

type CatchCardProps = {
  entry: CatchWithMark
  onDelete: (catchId: string, photoUrl: string | null) => Promise<void>
  deleting?: boolean
}

export function CatchCard({ entry, onDelete, deleting = false }: CatchCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const markName = entry.marks?.name ?? null
  const details = formatCatchDetails(
    entry.weight_lbs,
    entry.water_depth_ft,
    null,
  )
  const when = formatCatchDate(entry.created_at)

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      setDeleteError(null)
      return
    }

    try {
      await onDelete(entry.id, entry.photo_url)
      setConfirming(false)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete catch.')
      setConfirming(false)
    }
  }

  function handleCancelDelete() {
    setConfirming(false)
    setDeleteError(null)
  }

  return (
    <li className="overflow-hidden rounded-2xl border-2 border-ocean-700 bg-ocean-900 shadow-md shadow-black/20">
      <div className="flex">
        {entry.photo_url ? (
          <div className="relative w-28 shrink-0 sm:w-32">
            <img
              src={entry.photo_url}
              alt={`Photo of ${entry.fish_type}`}
              className="h-full min-h-[5.5rem] w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div
            className="flex w-20 shrink-0 items-center justify-center bg-ocean-800 sm:w-24"
            aria-hidden
          >
            <Fish className="h-10 w-10 text-ocean-500" />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-4">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-lg font-bold text-foam">{entry.fish_type}</p>
            <div className="flex shrink-0 items-center gap-1">
              {confirming ? (
                <>
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={deleting}
                    className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      'Delete'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    disabled={deleting}
                    className="rounded-lg border border-ocean-500 px-2 py-1.5 text-xs font-semibold text-spray hover:text-foam disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-spray transition-colors hover:bg-ocean-800 hover:text-red-300 disabled:opacity-50"
                  aria-label={`Delete ${entry.fish_type} catch`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          </div>
          <p className="mt-0.5 text-base text-spray">{details}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-medium text-spray/80">
            {markName ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-ocean-500" />
                {markName}
              </span>
            ) : null}
            {markName ? <span className="text-spray/40">·</span> : null}
            <span>{when}</span>
          </p>
          {deleteError ? (
            <p role="alert" className="mt-2 text-sm text-red-300">
              {deleteError}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  )
}