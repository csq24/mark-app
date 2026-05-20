import { Loader2, MapPin, X } from 'lucide-react'

type MarkQuickChoiceModalProps = {
  open: boolean
  latitude: number
  longitude: number
  saving: boolean
  error: string | null
  onAddDetails: () => void
  onMarkOnly: () => void
  onClose: () => void
}

export function MarkQuickChoiceModal({
  open,
  latitude,
  longitude,
  saving,
  error,
  onAddDetails,
  onMarkOnly,
  onClose,
}: MarkQuickChoiceModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ocean-950/80 p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:items-center sm:pb-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mark-quick-choice-title"
        className="relative w-full max-w-md rounded-2xl border-2 border-ocean-600 bg-ocean-900 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg text-spray hover:bg-ocean-800 disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3 pr-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mark-blue text-mark-950">
            <MapPin className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2
              id="mark-quick-choice-title"
              className="text-xl font-bold text-foam"
            >
              Mark your location
            </h2>
            <p className="mt-1 text-sm text-spray">
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </p>
          </div>
        </div>

        <p className="mt-5 text-base leading-relaxed text-foam">
          Would you like to add more details besides the name?
        </p>

        {error ? (
          <p className="mt-3 rounded-lg bg-red-950/80 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onMarkOnly}
            disabled={saving}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-mark-blue text-lg font-bold text-mark-950 transition-colors hover:bg-mark-blue-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Marking…
              </>
            ) : (
              'No — just mark it'
            )}
          </button>
          <button
            type="button"
            onClick={onAddDetails}
            disabled={saving}
            className="flex min-h-14 w-full items-center justify-center rounded-xl border-2 border-ocean-500 bg-ocean-800 text-lg font-bold text-foam transition-colors hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Yes — add details
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-12 text-center text-sm font-medium text-spray hover:text-foam disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
