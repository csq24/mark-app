import { useEffect } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { SEAMARK_LAYER_ID, SEAMARK_SOURCE_ID } from '../lib/mapStyles'

const SEAMARK_TILES = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'

export function useSeamarkOverlay(
  mapRef: React.RefObject<MapRef | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return

    const map = mapRef.current?.getMap()
    if (!map) return

    function attach() {
      const m = mapRef.current?.getMap()
      if (!m || !enabled) return

      if (!m.getSource(SEAMARK_SOURCE_ID)) {
        m.addSource(SEAMARK_SOURCE_ID, {
          type: 'raster',
          tiles: [SEAMARK_TILES],
          tileSize: 256,
          attribution: '© OpenSeaMap',
          maxzoom: 18,
        })
      }

      if (!m.getLayer(SEAMARK_LAYER_ID)) {
        m.addLayer({
          id: SEAMARK_LAYER_ID,
          type: 'raster',
          source: SEAMARK_SOURCE_ID,
          minzoom: 7,
          paint: { 'raster-opacity': 0.92 },
        })
      }
    }

    if (map.isStyleLoaded()) {
      attach()
    } else {
      map.once('load', attach)
    }

    return () => {
      const m = mapRef.current?.getMap()
      if (!m) return
      if (m.getLayer(SEAMARK_LAYER_ID)) m.removeLayer(SEAMARK_LAYER_ID)
      if (m.getSource(SEAMARK_SOURCE_ID)) m.removeSource(SEAMARK_SOURCE_ID)
    }
  }, [mapRef, enabled])
}
