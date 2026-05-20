import type { LucideIcon } from 'lucide-react'
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from 'lucide-react'

export type MarkWeatherSnapshot = {
  condition: string
  temperatureC: number
  windSpeedKmh: number
  humidityPercent: number
  icon: LucideIcon
}

type OpenMeteoCurrent = {
  temperature_2m: number
  relative_humidity_2m: number
  wind_speed_10m: number
  weather_code: number
}

type OpenMeteoResponse = {
  current?: OpenMeteoCurrent
}

function weatherFromCode(code: number): { condition: string; icon: LucideIcon } {
  if (code === 0) return { condition: 'Clear', icon: Sun }
  if (code === 1) return { condition: 'Mostly clear', icon: CloudSun }
  if (code === 2) return { condition: 'Partly cloudy', icon: CloudSun }
  if (code === 3) return { condition: 'Overcast', icon: Cloud }
  if (code === 45 || code === 48) return { condition: 'Fog', icon: CloudFog }
  if (code >= 51 && code <= 57) return { condition: 'Drizzle', icon: CloudRain }
  if (code >= 61 && code <= 67) return { condition: 'Rain', icon: CloudRain }
  if (code >= 71 && code <= 77) return { condition: 'Snow', icon: CloudSnow }
  if (code >= 80 && code <= 82) return { condition: 'Rain showers', icon: CloudRain }
  if (code >= 85 && code <= 86) return { condition: 'Snow showers', icon: CloudSnow }
  if (code === 95) return { condition: 'Thunderstorm', icon: CloudLightning }
  if (code >= 96) return { condition: 'Thunderstorm', icon: CloudLightning }
  return { condition: 'Cloudy', icon: Cloud }
}

export async function fetchMarkWeather(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<MarkWeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'wind_speed_10m',
      'weather_code',
    ].join(','),
    wind_speed_unit: 'kmh',
    temperature_unit: 'celsius',
  })

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    { signal },
  )

  if (!response.ok) {
    throw new Error('Weather unavailable right now.')
  }

  const data = (await response.json()) as OpenMeteoResponse
  const current = data.current

  if (!current) {
    throw new Error('No weather data for this location.')
  }

  const { condition, icon } = weatherFromCode(current.weather_code)

  return {
    condition,
    icon,
    temperatureC: Math.round(current.temperature_2m),
    windSpeedKmh: Math.round(current.wind_speed_10m * 10) / 10,
    humidityPercent: Math.round(current.relative_humidity_2m),
  }
}
