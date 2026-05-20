import { useEffect, useRef, useState } from 'react'

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

const DEFAULT_ERROR =
  'Location unavailable. Enable GPS or move to an open area on deck.'

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
          setError(geoError.message || DEFAULT_ERROR)
          setResolved(true)
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20_000,
      },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [enabled, unsupportedError])

  const loading = enabled && !resolved

  return { position: enabled ? position : null, error: enabled ? error : null, loading }
}
