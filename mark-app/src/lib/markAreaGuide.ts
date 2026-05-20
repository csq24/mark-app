import {
  FISHING_ATLAS,
  type AtlasEntryKind,
  type FishingAtlasEntry,
} from '../data/fishingAtlas'
import { distanceKm } from './geo'

const MAX_RADIUS_KM: Record<AtlasEntryKind, number> = {
  coast: 140,
  region: 450,
  country: 2800,
}

const KIND_ORDER: Record<AtlasEntryKind, number> = {
  coast: 0,
  region: 1,
  country: 2,
}

export type AreaSpotRef = {
  id: string
  name: string
  kind: AtlasEntryKind
  distanceKm: number
}

export type MarkAreaGuide = {
  scope: 'coast' | 'region' | 'country' | 'area'
  scopeLabel: string
  entry: FishingAtlasEntry
  expectedSpecies: string[]
  famousAreas: string[]
  spotTypes: string[]
  summary: string
  distanceKm: number
  /** Other named fishing areas in the same country when local match is weak */
  areaSpots: AreaSpotRef[]
  usingRegionalFallback: boolean
}

function scopeLabelFor(entry: FishingAtlasEntry, distance: number): string {
  if (entry.kind === 'coast') {
    return distance <= 40 ? `${entry.name} area` : `Near ${entry.name}`
  }
  if (entry.kind === 'region') {
    return `${entry.name} region`
  }
  return entry.name
}

export function findMarkAreaGuide(
  latitude: number,
  longitude: number,
): MarkAreaGuide {
  const ranked = FISHING_ATLAS.map((entry) => ({
    entry,
    distanceKm: distanceKm(latitude, longitude, entry.latitude, entry.longitude),
  })).sort((a, b) => {
    const kindDiff = KIND_ORDER[a.entry.kind] - KIND_ORDER[b.entry.kind]
    if (kindDiff !== 0) return kindDiff
    return a.distanceKm - b.distanceKm
  })

  let best = ranked.find(
    (row) => row.distanceKm <= MAX_RADIUS_KM[row.entry.kind],
  )

  if (!best) {
    best =
      ranked.find((row) => row.entry.kind === 'country') ??
      ranked[0]
  }

  const usingRegionalFallback =
    best.entry.kind === 'country' &&
    best.distanceKm > MAX_RADIUS_KM.country * 0.35

  const areaSpots = ranked
    .filter(
      (row) =>
        row.entry.countryCode === best.entry.countryCode &&
        row.entry.id !== best.entry.id,
    )
    .slice(0, 8)
    .map((row) => ({
      id: row.entry.id,
      name: row.entry.name,
      kind: row.entry.kind,
      distanceKm: Math.round(row.distanceKm),
    }))

  const scope: MarkAreaGuide['scope'] =
    best.entry.kind === 'coast'
      ? 'coast'
      : best.entry.kind === 'region'
        ? 'region'
        : usingRegionalFallback
          ? 'area'
          : 'country'

  return {
    scope,
    scopeLabel: scopeLabelFor(best.entry, best.distanceKm),
    entry: best.entry,
    expectedSpecies: best.entry.commonSpecies,
    famousAreas: best.entry.famousAreas,
    spotTypes: best.entry.spotTypes,
    summary: best.entry.summary,
    distanceKm: Math.round(best.distanceKm),
    areaSpots,
    usingRegionalFallback,
  }
}
