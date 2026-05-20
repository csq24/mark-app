import { AlertCircle, Loader2, MapPin } from 'lucide-react'
import { useState } from 'react'

type ShareSpotsSettingProps = {
  enabled: boolean
  disabled?: boolean
  saving?: boolean
  onChange: (enabled: boolean) => Promise<void>
}

export function ShareSpotsSetting({
  enabled,
  disabled = false,
  saving = false,
  onChange,
}: ShareSpotsSettingProps) {
  const [error, setError] = useState<string | null>(null)

  async function handleToggle(next: boolean) {
    setError(null)
    try {
      await onChange(next)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update sharing.',
      )
    }
  }

  return (
    <section className="rounded-2xl border-2 border-ocean-600 bg-ocean-900 px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foam">
            <MapPin className="h-5 w-5 shrink-0 text-action" aria-hidden />
            Share spots
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-spray">
            When on, other signed-in anglers can see your mark locations on the
            map. Your catch log and photos stay private. Default is off.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Share my fishing spots with other users"
          disabled={disabled || saving}
          onClick={() => void handleToggle(!enabled)}
          className={[
            'relative mt-1 h-8 w-14 shrink-0 rounded-full border-2 transition-colors',
            'focus-visible:outline focus-visible:outline-3 focus-visible:outline-spray/40',
            disabled || saving ? 'opacity-50' : '',
            enabled
              ? 'border-action bg-action'
              : 'border-ocean-500 bg-ocean-800',
          ].join(' ')}
        >
          <span
            className={[
              'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-foam shadow transition-transform',
              enabled ? 'translate-x-6' : 'translate-x-0',
            ].join(' ')}
          />
          {saving ? (
            <Loader2
              className="absolute inset-0 m-auto h-4 w-4 animate-spin text-action-text"
              aria-hidden
            />
          ) : null}
        </button>
      </div>

      <p className="mt-3 text-xs font-medium text-spray/80">
        {enabled
          ? 'Sharing on — your marks are visible to the community.'
          : 'Sharing off — only you can see your marks.'}
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 text-sm text-red-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </section>
  )
}
