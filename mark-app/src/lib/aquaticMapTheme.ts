import type { Map as MapLibreMap } from 'maplibre-gl'

/** Layers to hide — roads, airports, urban POIs, buildings. */
const HIDE_LAYER_ID =
  /road|street|highway|motorway|trunk|primary|secondary|tertiary|path|track|bridge|tunnel|rail|transit|aeroway|airport|runway|taxiway|heliport|parking|building|housenum|address|entrance|poi-|golf|stadium|school|hospital|commercial|retail|industrial|supermarket|fuel|bus|ferry-terminal|barrier(?!_)/i

const HIDE_SYMBOL_LABEL =
  /road|street|highway|ref-|shield|junction|housenum|addr|poi|airport|aeroway|rail|transit|motorway|oneway|surface|bicycle|footway|path/i

const COLORS = {
  background: '#041f33',
  water: '#0c5a8a',
  waterDeep: '#083d5e',
  land: '#0c2822',
  landCoast: '#123830',
  waterway: '#1a8fc4',
  coast: '#3dd6c6',
  label: '#b8e8f5',
  labelHalo: '#041f33',
}

export function applyAquaticTheme(map: MapLibreMap) {
  const layers = map.getStyle()?.layers
  if (!layers) return

  for (const layer of layers) {
    const id = layer.id
    const idLower = id.toLowerCase()

    try {
      if (HIDE_LAYER_ID.test(id)) {
        map.setLayoutProperty(id, 'visibility', 'none')
        continue
      }

      if (layer.type === 'symbol' && HIDE_SYMBOL_LABEL.test(id)) {
        map.setLayoutProperty(id, 'visibility', 'none')
        continue
      }

      if (layer.type === 'background') {
        map.setPaintProperty(id, 'background-color', COLORS.background)
        continue
      }

      if (layer.type === 'fill') {
        if (/water|ocean|sea|lake|reservoir|basin/.test(idLower)) {
          map.setPaintProperty(
            id,
            'fill-color',
            /ocean|sea/.test(idLower) ? COLORS.waterDeep : COLORS.water,
          )
          map.setPaintProperty(id, 'fill-opacity', 1)
        } else if (
          /land|park|grass|wood|forest|sand|beach|wetland|mud/.test(idLower)
        ) {
          map.setPaintProperty(
            id,
            'fill-color',
            /sand|beach|wetland/.test(idLower) ? COLORS.landCoast : COLORS.land,
          )
          map.setPaintProperty(id, 'fill-opacity', 0.9)
        }
        continue
      }

      if (layer.type === 'line') {
        if (/waterway|river|stream|canal/.test(idLower)) {
          map.setPaintProperty(id, 'line-color', COLORS.waterway)
          map.setPaintProperty(id, 'line-opacity', 0.85)
        } else if (/coast|shore|water/.test(idLower)) {
          map.setPaintProperty(id, 'line-color', COLORS.coast)
          map.setPaintProperty(id, 'line-width', 1.5)
        } else if (/border|boundary|admin/.test(idLower)) {
          map.setPaintProperty(id, 'line-color', '#1e6b8a')
          map.setPaintProperty(id, 'line-opacity', 0.35)
        }
        continue
      }

      if (layer.type === 'symbol' && /label|place|country|state|city|town|water|marine|sea|lake|bay|island/.test(idLower)) {
        map.setPaintProperty(id, 'text-color', COLORS.label)
        map.setPaintProperty(id, 'text-halo-color', COLORS.labelHalo)
        map.setPaintProperty(id, 'text-halo-width', 1.25)
      }
    } catch {
      // Some layers do not support the paint/layout property we tried.
    }
  }
}

export function isVectorMapStyle(
  style: string | import('maplibre-gl').StyleSpecification,
): boolean {
  return typeof style === 'string'
}
