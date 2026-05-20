import type { Map as MapLibreMap } from 'maplibre-gl'
import type { Mark } from '../types/database'

type LatLng = { latitude: number; longitude: number }

export function fitMapToMarks(
  map: MapLibreMap,
  marks: Mark[],
  options?: {
    padding?: number
    userPosition?: LatLng | null
    maxZoom?: number
  },
) {
  const coords: [number, number][] = marks.map((m) => [m.longitude, m.latitude])

  if (options?.userPosition) {
    coords.push([
      options.userPosition.longitude,
      options.userPosition.latitude,
    ])
  }

  if (coords.length === 0) return

  if (coords.length === 1) {
    map.flyTo({
      center: coords[0],
      zoom: options?.maxZoom ?? 13,
      duration: 1000,
    })
    return
  }

  const lngs = coords.map((c) => c[0])
  const lats = coords.map((c) => c[1])

  map.fitBounds(
    [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ],
    {
      padding: options?.padding ?? 72,
      maxZoom: options?.maxZoom ?? 14,
      duration: 1000,
    },
  )
}

export function flyToMark(map: MapLibreMap, mark: Mark, zoom = 13) {
  map.flyTo({
    center: [mark.longitude, mark.latitude],
    zoom: Math.max(map.getZoom(), zoom),
    duration: 800,
  })
}
