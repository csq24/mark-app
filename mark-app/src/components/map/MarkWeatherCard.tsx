import { Droplets, Loader2, Thermometer, Wind } from 'lucide-react'
import type { MarkWeatherSnapshot } from '../../lib/markWeather'

type MarkWeatherCardProps = {
  latitude: number
  longitude: number
  weather: MarkWeatherSnapshot | null
  loading: boolean
  error: string | null
}

export function MarkWeatherCard({
  latitude,
  longitude,
  weather,
  loading,
  error,
}: MarkWeatherCardProps) {
  const Icon = weather?.icon

  return (
    <div
      className="rounded-2xl border border-mark-700/80 bg-mark-900/90 px-4 py-3"
      aria-live="polite"
      aria-label="Current weather at this mark"
    >
      {loading ? (
        <p className="flex items-center gap-2 text-sm text-spray/80">
          <Loader2 className="h-4 w-4 animate-spin text-mark-blue" aria-hidden />
          Loading weather…
        </p>
      ) : error ? (
        <p className="text-sm text-spray/70">{error}</p>
      ) : weather && Icon ? (
        <>
          <div className="flex items-center gap-2">
            <Icon
              className="h-6 w-6 shrink-0 text-mark-blue"
              strokeWidth={2}
              aria-hidden
            />
            <p className="text-lg font-bold text-foam">{weather.condition}</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-foam">
            <p className="flex items-center gap-2">
              <Thermometer
                className="h-4 w-4 shrink-0 text-mark-blue"
                aria-hidden
              />
              <span>{weather.temperatureC}°C</span>
            </p>
            <p className="flex items-center gap-2">
              <Wind className="h-4 w-4 shrink-0 text-mark-blue" aria-hidden />
              <span>{weather.windSpeedKmh} km/h</span>
            </p>
            <p className="col-span-2 flex items-center gap-2">
              <Droplets
                className="h-4 w-4 shrink-0 text-mark-blue"
                aria-hidden
              />
              <span>{weather.humidityPercent}% humidity</span>
            </p>
          </div>

          <p className="mt-3 font-mono text-xs text-spray/50">
            {latitude.toFixed(2)}°, {longitude.toFixed(2)}°
          </p>
        </>
      ) : null}
    </div>
  )
}
