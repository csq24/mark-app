import type { StyleSpecification } from 'maplibre-gl'

export type MapStyleId = 'aquatic' | 'satellite' | 'nautical' | 'detail'

/** User choice — `auto` picks satellite vs detail from zoom. */
export type MapStylePreference = 'auto' | MapStyleId

export type MapStyleOption = {
  id: MapStylePreference
  label: string
  description: string
}

/** Zoom thresholds for auto mode (hysteresis avoids flicker at the boundary). */
export const AUTO_ZOOM_TO_DETAIL = 8
export const AUTO_ZOOM_TO_SATELLITE = 7.25

export const MAP_STYLE_OPTIONS: MapStyleOption[] = [
  {
    id: 'auto',
    label: 'Auto',
    description: 'Satellite zoomed out · cities & lakes when zoomed in',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    description: 'Aerial coastlines & reefs',
  },
  {
    id: 'detail',
    label: 'Streets',
    description: 'Cities, lakes & state labels',
  },
  {
    id: 'aquatic',
    label: 'Aquatic',
    description: 'Ocean blues — no roads or airports',
  },
  {
    id: 'nautical',
    label: 'Nautical',
    description: 'Aquatic base + harbors & seamarks',
  },
]

/** Dark OSM vector base — cities, lakes, roads (Lovable-style when zoomed in). */
export const DETAIL_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

const ESRI_SATELLITE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

const OPEN_SEAMARK =
  'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'

/** Vector base — filtered at runtime to hide streets & airports. */
export const OPENFREEMAP_AQUATIC_BASE =
  'https://tiles.openfreemap.org/styles/positron'

export const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    satellite: {
      type: 'raster',
      tiles: [ESRI_SATELLITE],
      tileSize: 256,
      attribution: '© Esri',
      maxzoom: 19,
    },
    seamark: {
      type: 'raster',
      tiles: [OPEN_SEAMARK],
      tileSize: 256,
      attribution: '© OpenSeaMap',
      maxzoom: 18,
    },
  },
  layers: [
    {
      id: 'satellite-base',
      type: 'raster',
      source: 'satellite',
    },
    {
      id: 'seamark-overlay',
      type: 'raster',
      source: 'seamark',
      minzoom: 8,
      paint: { 'raster-opacity': 0.85 },
    },
  ],
}

export function resolveMapStyle(id: MapStyleId): string | StyleSpecification {
  switch (id) {
    case 'satellite':
      return SATELLITE_STYLE
    case 'detail':
      return DETAIL_STYLE_URL
    case 'nautical':
    case 'aquatic':
    default:
      return OPENFREEMAP_AQUATIC_BASE
  }
}

export function resolveAutoMapStyle(zoom: number, previous: MapStyleId): MapStyleId {
  if (zoom >= AUTO_ZOOM_TO_DETAIL) return 'detail'
  if (zoom <= AUTO_ZOOM_TO_SATELLITE) return 'satellite'
  return previous
}

export function resolveEffectiveMapStyle(
  preference: MapStylePreference,
  zoom: number,
  previousEffective: MapStyleId,
): MapStyleId {
  if (preference === 'auto') {
    return resolveAutoMapStyle(zoom, previousEffective)
  }
  return preference
}

export function mapStyleAttribution(id: MapStyleId): string {
  switch (id) {
    case 'satellite':
      return '© Esri'
    case 'detail':
      return '© CARTO © OpenStreetMap'
    case 'aquatic':
    case 'nautical':
      return '© OpenFreeMap © OpenStreetMap'
    default:
      return '© OpenStreetMap'
  }
}

export function usesAquaticTheme(id: MapStyleId): boolean {
  return id === 'aquatic' || id === 'nautical'
}

export function usesDetailMapLabels(id: MapStyleId): boolean {
  return id === 'detail'
}

export function usesSeamarkOverlay(id: MapStyleId): boolean {
  return id === 'aquatic' || id === 'nautical' || id === 'detail'
}

export const SEAMARK_SOURCE_ID = 'mark-app-seamark'
export const SEAMARK_LAYER_ID = 'mark-app-seamark-layer'
