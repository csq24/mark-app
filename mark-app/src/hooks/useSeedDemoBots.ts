import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

export type DemoBotSummary = {
  id: string
  email: string
  full_name: string
  boat_name: string
  marks: number
}

export type SeedDemoBotsResult = {
  bots_created: number
  marks_created: number
  bots: DemoBotSummary[]
}

export function useSeedDemoBots() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<SeedDemoBotsResult | null>(null)

  const seedDemoBots = useCallback(async (count = 3) => {
    setLoading(true)
    setError(null)

    const { data, error: rpcError } = await supabase.rpc('seed_demo_bots', {
      bot_count: count,
    })

    setLoading(false)

    if (rpcError) {
      const message =
        rpcError.code === 'PGRST202'
          ? 'Demo bots are not set up yet. Run supabase/seed-demo-bots.sql in the Supabase SQL Editor.'
          : rpcError.message
      setError(message)
      throw new Error(message)
    }

    const result = data as SeedDemoBotsResult
    setLastResult(result)
    window.dispatchEvent(new CustomEvent('mark-app:refetch-marks'))
    window.dispatchEvent(new CustomEvent('mark-app:refetch-friends'))
    return result
  }, [])

  return { seedDemoBots, loading, error, lastResult, clearError: () => setError(null) }
}
