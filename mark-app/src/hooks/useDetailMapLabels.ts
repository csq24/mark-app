import { useEffect } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { applyDetailMapLabels } from '../lib/detailMapTheme'

export function useDetailMapLabels(
  mapRef: React.RefObject<MapRef | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return

    const map = mapRef.current?.getMap()
    if (!map) return

    function apply() {
      const m = mapRef.current?.getMap()
      if (!m?.isStyleLoaded()) return
      applyDetailMapLabels(m)
    }

    apply()
    map.on('styledata', apply)
    map.on('zoomend', apply)

    return () => {
      map.off('styledata', apply)
      map.off('zoomend', apply)
    }
  }, [mapRef, enabled])
}
