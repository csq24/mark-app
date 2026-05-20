import { AlertCircle, Loader2, Users } from 'lucide-react'
import { useState } from 'react'

type ShowFriendSpotsSettingProps = {
  enabled: boolean
  disabled?: boolean
  saving?: boolean
  onChange: (enabled: boolean) => Promise<void>
}

export function ShowFriendSpotsSetting({
  enabled,
  disabled = false,
  saving = false,
  onChange,
}: ShowFriendSpotsSettingProps) {
  const [error, setError] = useState<string | null>(null)

  async function handleToggle(next: boolean) {
    setError(null)
    try {
      await onChange(next)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update this setting.',
      )
    }
  }

  return (
    <section className="rounded-2xl border-2 border-ocean-600 bg-ocean-900 px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foam">
            <Users className="h-5 w-5 shrink-0 text-mark-blue" aria-hidden />
            Friends&apos; spots on map
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-spray">
            When on, you see mark pins from friends who turned on{' '}
            <strong className="text-foam">Share spots</strong>. Your own marks
            always show. Turn off to hide everyone else&apos;s shared spots.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Show friends shared spots on the map"
          disabled={disabled || saving}
          onClick={() => void handleToggle(!enabled)}
          className={[
            'relative mt-1 h-8 w-14 shrink-0 rounded-full border-2 transition-colors',
            'focus-visible:outline focus-visible:outline-3 focus-visible:outline-spray/40',
            disabled || saving ? 'opacity-50' : '',
            enabled
              ? 'border-mark-blue bg-mark-blue'
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
              className="absolute inset-0 m-auto h-4 w-4 animate-spin text-mark-950"
              aria-hidden
            />
          ) : null}
        </button>
      </div>

      <p className="mt-3 text-xs font-medium text-spray/80">
        {enabled
          ? 'Showing friends\' shared spots on your map.'
          : 'Hidden — only your marks appear on the map.'}
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
