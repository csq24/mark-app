import { useEffect } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { applyAquaticTheme } from '../lib/aquaticMapTheme'

export function useAquaticMapTheme(
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
      applyAquaticTheme(m)
    }

    apply()
    map.on('styledata', apply)

    return () => {
      map.off('styledata', apply)
    }
  }, [mapRef, enabled])
}
