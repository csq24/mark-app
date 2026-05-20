import { useEffect, useRef, useState } from 'react'
import { zoomExplorerTier } from '../data/fishingAtlas'

export type PlaceHierarchy = {
  continent: string | null
  country: string | null
  region: string | null
  locality: string | null
}

const EMPTY_PLACE: PlaceHierarchy = {
  continent: null,
  country: null,
  region: null,
  locality: null,
}

type UseMapPlaceHierarchyArgs = {
  latitude: number
  longitude: number
  zoom: number
  enabled?: boolean
}

export function useMapPlaceHierarchy({
  latitude,
  longitude,
  zoom,
  enabled = true,
}: UseMapPlaceHierarchyArgs) {
  const [place, setPlace] = useState<PlaceHierarchy>(EMPTY_PLACE)
  const [loading, setLoading] = useState(false)
  const requestId = useRef(0)

  const tier = zoomExplorerTier(zoom)

  const breadcrumb = [
    tier.label,
    place.country,
    place.region ?? place.locality,
  ]
    .filter((part): part is string => Boolean(part))
    .join(' · ')

  useEffect(() => {
    if (!enabled || zoom < 4) {
      setPlace(EMPTY_PLACE)
      return
    }

    const id = ++requestId.current
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true)
        try {
          const params = new URLSearchParams({
            lat: String(latitude),
            lon: String(longitude),
            format: 'json',
            zoom: zoom >= 11 ? '14' : zoom >= 8 ? '10' : '6',
          })

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?${params}`,
            {
              headers: {
                Accept: 'application/json',
                'Accept-Language': 'en',
              },
            },
          )

          if (!response.ok || id !== requestId.current) return

          const data = (await response.json()) as {
            address?: Record<string, string>
          }

          if (id !== requestId.current) return

          const address = data.address ?? {}
          setPlace({
            continent: null,
            country: address.country ?? null,
            region:
              address.state ??
              address.region ??
              address.county ??
              address.island ??
              null,
            locality:
              address.city ??
              address.town ??
              address.village ??
              address.hamlet ??
              address.suburb ??
              null,
          })
        } catch {
          if (id === requestId.current) setPlace(EMPTY_PLACE)
        } finally {
          if (id === requestId.current) setLoading(false)
        }
      })()
    }, 650)

    return () => window.clearTimeout(timer)
  }, [latitude, longitude, zoom, enabled])

  return { place, breadcrumb, tier, loading }
}
