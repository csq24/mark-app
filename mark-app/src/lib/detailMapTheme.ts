import type {
  ExpressionSpecification,
  Map as MapLibreMap,
} from 'maplibre-gl'

const LABEL_TEXT = '#e8f4fc'
const WATER_LABEL_TEXT = '#8ed4f8'
const LABEL_HALO = '#0a0e14'
const LAKE_FILL = '#1a4a6e'

const PLACE_LABEL_LAYER = /^place_/
const WATER_LABEL_LAYER = /^watername_|^waterway_label/

/** Prefer local `name` over `name_en` so US lakes/cities always show a label. */
const LABEL_FIELD: ExpressionSpecification = [
  'coalesce',
  ['get', 'name'],
  ['get', 'name_en'],
]

const CITY_TEXT_SIZE: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  7,
  12,
  9,
  14,
  11,
  16,
  13,
  18,
  16,
  20,
]

const TOWN_TEXT_SIZE: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  7,
  10,
  9,
  12,
  11,
  14,
  13,
  16,
]

const WATER_TEXT_SIZE: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  7,
  10,
  9,
  11,
  11,
  12,
  13,
  14,
  16,
  16,
]

function loweredMinZoom(layerMin: number | undefined, target: number): number {
  const current = layerMin ?? 0
  return Math.min(current, target)
}

export function applyDetailMapLabels(map: MapLibreMap) {
  const layers = map.getStyle()?.layers
  if (!layers) return

  for (const layer of layers) {
    const id = layer.id
    const idLower = id.toLowerCase()

    try {
      if (layer.type === 'fill' && idLower === 'water') {
        map.setPaintProperty(id, 'fill-color', LAKE_FILL)
        map.setPaintProperty(id, 'fill-opacity', 0.95)
        continue
      }

      if (layer.type !== 'symbol') continue

      const isPlace = PLACE_LABEL_LAYER.test(id)
      const isWaterLabel = WATER_LABEL_LAYER.test(id)
      if (!isPlace && !isWaterLabel) continue

      map.setLayoutProperty(id, 'visibility', 'visible')
      map.setPaintProperty(
        id,
        'text-color',
        isWaterLabel ? WATER_LABEL_TEXT : LABEL_TEXT,
      )
      map.setPaintProperty(id, 'text-halo-color', LABEL_HALO)
      map.setPaintProperty(id, 'text-halo-width', 1.5)
      map.setLayoutProperty(id, 'text-field', LABEL_FIELD)

      if (isWaterLabel) {
        map.setLayerZoomRange(id, loweredMinZoom(layer.minzoom, 6), 24)
        map.setLayoutProperty(id, 'text-size', WATER_TEXT_SIZE)
        map.setLayoutProperty(id, 'text-allow-overlap', true)
        map.setLayoutProperty(id, 'text-optional', false)
        continue
      }

      if (idLower.includes('continent') || idLower.includes('country')) {
        continue
      }

      if (idLower.includes('state')) {
        map.setLayerZoomRange(id, loweredMinZoom(layer.minzoom, 4), 24)
        map.setLayoutProperty(id, 'text-size', TOWN_TEXT_SIZE)
      } else if (idLower.includes('city') && !idLower.includes('dot')) {
        map.setLayerZoomRange(id, loweredMinZoom(layer.minzoom, 6), 24)
        map.setLayoutProperty(id, 'text-size', CITY_TEXT_SIZE)
      } else if (idLower.includes('city') && idLower.includes('dot')) {
        map.setLayerZoomRange(id, loweredMinZoom(layer.minzoom, 5), 24)
      } else if (idLower.includes('town')) {
        map.setLayerZoomRange(id, loweredMinZoom(layer.minzoom, 7), 24)
        map.setLayoutProperty(id, 'text-size', TOWN_TEXT_SIZE)
      } else if (
        idLower.includes('village') ||
        idLower.includes('hamlet') ||
        idLower.includes('suburb')
      ) {
        map.setLayerZoomRange(id, loweredMinZoom(layer.minzoom, 9), 24)
        map.setLayoutProperty(id, 'text-size', TOWN_TEXT_SIZE)
      }
    } catch {
      // Layer may not support the property we tried.
    }
  }
}
