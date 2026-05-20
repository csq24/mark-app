import { AlertCircle, Bot, CheckCircle2, Loader2, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSeedDemoBots } from '../../hooks/useSeedDemoBots'

type DemoBotsPanelProps = {
  disabled?: boolean
}

export function DemoBotsPanel({ disabled = false }: DemoBotsPanelProps) {
  const { seedDemoBots, loading, error, lastResult, clearError } = useSeedDemoBots()
  const [localMessage, setLocalMessage] = useState<string | null>(null)

  async function handleAddBots() {
    clearError()
    setLocalMessage(null)
    try {
      const result = await seedDemoBots(3)
      setLocalMessage(
        `Added ${result.bots_created} demo anglers with ${result.marks_created} shared marks.`,
      )
    } catch {
      // error state set in hook
    }
  }

  return (
    <section className="rounded-2xl border-2 border-dashed border-ocean-500/60 bg-ocean-900/80 px-4 py-4 sm:px-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foam">
        <Bot className="h-5 w-5 shrink-0 text-action" aria-hidden />
        Demo anglers
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-spray">
        Creates random captain profiles with <strong className="text-foam">Share spots</strong>{' '}
        turned on and dummy marks around Florida. Use this to test the map with other
        people&apos;s pins.
      </p>

      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => void handleAddBots()}
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-ocean-500 bg-ocean-800 px-4 text-base font-bold text-foam transition-colors hover:border-action hover:bg-ocean-700 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Adding demo bots…
          </>
        ) : (
          <>
            <Bot className="h-5 w-5" aria-hidden />
            Add 3 demo bots
          </>
        )}
      </button>

      {localMessage ? (
        <p
          role="status"
          className="mt-3 flex items-start gap-2 text-sm text-foam"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden />
          <span>
            {localMessage}{' '}
            <Link to="/map" className="font-semibold text-action hover:underline">
              Open map
            </Link>{' '}
            to see teal shared pins.
          </span>
        </p>
      ) : null}

      {lastResult && lastResult.bots.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-xs text-spray">
          {lastResult.bots.map((bot) => (
            <li key={bot.id} className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-400" aria-hidden />
              <span>
                <span className="font-semibold text-foam">{bot.full_name}</span>
                {bot.boat_name ? ` · ${bot.boat_name}` : ''} — {bot.marks} marks
              </span>
            </li>
          ))}
        </ul>
      ) : null}

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
