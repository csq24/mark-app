import { Loader2, MapPin, X } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'

type DropMarkModalProps = {
  open: boolean
  latitude: number
  longitude: number
  title?: string
  saving: boolean
  error: string | null
  onClose: () => void
  onSave: (payload: { name: string; description: string }) => void
}

export function DropMarkModal({
  open,
  latitude,
  longitude,
  title = 'New Mark',
  saving,
  error,
  onClose,
  onSave,
}: DropMarkModalProps) {
  if (!open) return null

  return (
    <DropMarkModalForm
      key={`${latitude.toFixed(5)}-${longitude.toFixed(5)}`}
      latitude={latitude}
      longitude={longitude}
      title={title}
      saving={saving}
      error={error}
      onClose={onClose}
      onSave={onSave}
    />
  )
}

function DropMarkModalForm({
  latitude,
  longitude,
  title,
  saving,
  error,
  onClose,
  onSave,
}: Omit<DropMarkModalProps, 'open'>) {
  const titleId = useId()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || saving) return
    onSave({ name: name.trim(), description: description.trim() })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ocean-950/80 p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:items-center sm:pb-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ocean-800 text-action">
            <MapPin className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 id={titleId} className="text-xl font-bold text-foam">
              {title}
            </h2>
            <p className="mt-1 text-sm text-spray">
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foam">
              Mark name <span className="text-catch">*</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="North Reef"
              required
              autoFocus
              disabled={saving}
              className="min-h-12 w-full rounded-xl border-2 border-ocean-600 bg-ocean-950 px-4 text-lg text-foam placeholder:text-spray/50 focus:border-ocean-500 focus:outline-none disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foam">
              Description
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Outgoing tide, grouper on the ledge…"
              rows={3}
              disabled={saving}
              className="w-full resize-none rounded-xl border-2 border-ocean-600 bg-ocean-950 px-4 py-3 text-base text-foam placeholder:text-spray/50 focus:border-ocean-500 focus:outline-none disabled:opacity-60"
            />
          </label>

          {error ? (
            <p className="rounded-lg bg-red-950/80 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-action text-lg font-bold text-action-text transition-colors hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              'Drop Mark'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
