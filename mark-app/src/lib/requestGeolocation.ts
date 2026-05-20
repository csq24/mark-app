import type { GeoPosition } from '../hooks/useGeolocation'

const DEFAULT_ERROR =
  'Location unavailable. Enable GPS or move to an open area on deck.'

export function requestGeolocation(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (geo) => {
        resolve({
          latitude: geo.coords.latitude,
          longitude: geo.coords.longitude,
          accuracy: geo.coords.accuracy,
        })
      },
      (err) => reject(new Error(err.message || DEFAULT_ERROR)),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20_000 },
    )
  })
}
