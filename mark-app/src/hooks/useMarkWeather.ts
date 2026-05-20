import { useEffect, useState } from 'react'
import { fetchMarkWeather, type MarkWeatherSnapshot } from '../lib/markWeather'

export function useMarkWeather(latitude: number, longitude: number) {
  const [weather, setWeather] = useState<MarkWeatherSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setWeather(null)

    void fetchMarkWeather(latitude, longitude, controller.signal)
      .then((snapshot) => {
        if (!controller.signal.aborted) {
          setWeather(snapshot)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setWeather(null)
        setError(
          err instanceof Error ? err.message : 'Could not load weather.',
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [latitude, longitude])

  return { weather, loading, error }
}
