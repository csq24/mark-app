import { useEffect, useRef, useState } from 'react'
import { formatGeolocationError } from '../lib/geolocationMessage'

export type GeoPosition = {
  latitude: number
  longitude: number
  accuracy?: number
}

type UseGeolocationResult = {
  position: GeoPosition | null
  error: string | null
  loading: boolean
}

function getUnsupportedError(): string | null {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'Geolocation is not supported on this device.'
  }
  return null
}

export function useGeolocation(enabled = true): UseGeolocationResult {
  const unsupportedError = enabled ? getUnsupportedError() : null
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [error, setError] = useState<string | null>(unsupportedError)
  const [resolved, setResolved] = useState(() => !enabled || Boolean(unsupportedError))
  const hasFixRef = useRef(false)
  const [prevEnabled, setPrevEnabled] = useState(enabled)

  if (prevEnabled !== enabled) {
    setPrevEnabled(enabled)
    if (!enabled) {
      setResolved(true)
    } else {
      setPosition(null)
      setError(getUnsupportedError())
      setResolved(Boolean(getUnsupportedError()))
    }
  }

  useEffect(() => {
    if (!enabled || unsupportedError) return

    hasFixRef.current = false

    const watchId = navigator.geolocation.watchPosition(
      (geoPosition) => {
        hasFixRef.current = true
        setPosition({
          latitude: geoPosition.coords.latitude,
          longitude: geoPosition.coords.longitude,
          accuracy: geoPosition.coords.accuracy,
        })
        setError(null)
        setResolved(true)
      },
      (geoError) => {
        if (!hasFixRef.current) {
          setError(formatGeolocationError(geoError.message))
          setResolved(true)
        }
      },
      {
        enableHighAccuracy: false,
        maximumAge: 120_000,
        timeout: 45_000,
      },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [enabled, unsupportedError])

  const loading = enabled && !resolved

  return { position: enabled ? position : null, error: enabled ? error : null, loading }
}
