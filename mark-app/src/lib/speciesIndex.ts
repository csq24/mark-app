import { FISHING_ATLAS } from '../data/fishingAtlas'
import {
  FISH_HABITATS,
  SPECIES_PROFILES,
  type FishHabitatId,
  type FishSpeciesProfile,
} from '../data/fishSpecies'
import type { Catch } from '../types/database'

export type SpeciesListItem = FishSpeciesProfile & {
  /** Atlas region names where this fish is commonly listed */
  regions: string[]
  /** True if built from atlas only (no curated profile) */
  isStub: boolean
}

export type SpeciesCatchStats = {
  count: number
  totalWeightLbs: number
  recent: Catch[]
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeFishLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Strip parentheticals like "Sailfish (offshore)" for matching. */
function canonicalName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, '').trim()
}

function profileMatchesLabel(profile: FishSpeciesProfile, label: string): boolean {
  const norm = normalizeFishLabel(canonicalName(label))
  const names = [profile.name, ...(profile.aliases ?? [])].map((n) =>
    normalizeFishLabel(canonicalName(n)),
  )

  if (names.includes(norm)) return true

  return names.some((n) => {
    if (n.length < 4) return false
    return norm === n || norm.startsWith(`${n} `) || norm.endsWith(` ${n}`)
  })
}

function inferHabitatsFromRegions(regionNames: string[]): FishHabitatId[] {
  const joined = regionNames.join(' ').toLowerCase()
  const habitats = new Set<FishHabitatId>(['saltwater'])

  if (
    joined.includes('lake') ||
    joined.includes('river') ||
    joined.includes('great lakes')
  ) {
    habitats.add('freshwater')
  }
  if (joined.includes('flats') || joined.includes('keys')) {
    habitats.add('flats')
  }
  if (joined.includes('reef') || joined.includes('coral')) {
    habitats.add('reef')
  }
  if (joined.includes('gulf') || joined.includes('bay') || joined.includes('marsh')) {
    habitats.add('inshore')
    habitats.add('brackish')
  }
  if (joined.includes('pacific') || joined.includes('offshore') || joined.includes('atlantic')) {
    habitats.add('offshore')
  }

  return [...habitats]
}

function buildAtlasSpeciesMap(): Map<string, Set<string>> {
  const byName = new Map<string, Set<string>>()

  for (const entry of FISHING_ATLAS) {
    for (const raw of entry.commonSpecies) {
      const name = canonicalName(raw)
      const key = normalizeFishLabel(name)
      const regions = byName.get(key) ?? new Set<string>()
      regions.add(entry.name)
      byName.set(key, regions)
    }
  }

  return byName
}

let cachedIndex: SpeciesListItem[] | null = null

export function buildSpeciesIndex(): SpeciesListItem[] {
  if (cachedIndex) return cachedIndex

  const atlasMap = buildAtlasSpeciesMap()
  const byId = new Map<string, SpeciesListItem>()

  for (const profile of SPECIES_PROFILES) {
    const regions = new Set<string>()
    for (const [key, regionSet] of atlasMap) {
      if (profileMatchesLabel(profile, key)) {
        for (const r of regionSet) regions.add(r)
      }
    }
    byId.set(profile.id, {
      ...profile,
      regions: [...regions].sort((a, b) => a.localeCompare(b)),
      isStub: false,
    })
  }

  for (const [key, regionSet] of atlasMap) {
    const displayName = key
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

    const existing = [...byId.values()].find((item) =>
      profileMatchesLabel(item, displayName),
    )
    if (existing) continue

    const id = slugify(displayName)
    if (byId.has(id)) continue

    const regions = [...regionSet].sort((a, b) => a.localeCompare(b))
    byId.set(id, {
      id,
      name: displayName,
      habitats: inferHabitatsFromRegions(regions),
      summary: `Commonly targeted in ${regions.slice(0, 3).join(', ')}${regions.length > 3 ? ` and ${regions.length - 3} more areas` : ''}.`,
      gearTips: [
        'Check local regulations for size, season, and bag limits',
        'Ask at a local tackle shop for current bait and tide tips',
      ],
      regions,
      isStub: true,
    })
  }

  cachedIndex = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
  return cachedIndex
}

export function findSpeciesById(id: string): SpeciesListItem | undefined {
  return buildSpeciesIndex().find((item) => item.id === id)
}

export function findSpeciesForCatchLabel(fishType: string): SpeciesListItem | undefined {
  const label = fishType.trim()
  if (!label) return undefined
  const items = buildSpeciesIndex()
  const sorted = [...items].sort((a, b) => b.name.length - a.name.length)
  return sorted.find((item) => profileMatchesLabel(item, label))
}

export function filterSpeciesList(
  items: SpeciesListItem[],
  options: { query?: string; habitat?: FishHabitatId | 'all' },
): SpeciesListItem[] {
  const q = options.query?.trim().toLowerCase() ?? ''
  const habitat = options.habitat ?? 'all'

  return items.filter((item) => {
    if (habitat !== 'all' && !item.habitats.includes(habitat)) return false
    if (!q) return true

    const haystack = [
      item.name,
      item.summary,
      ...item.gearTips,
      ...item.regions,
      ...(item.aliases ?? []),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
}

export function aggregateCatchStatsBySpecies(
  catches: Catch[],
): Map<string, SpeciesCatchStats> {
  const stats = new Map<string, SpeciesCatchStats>()

  for (const entry of catches) {
    const species = findSpeciesForCatchLabel(entry.fish_type)
    const key = species?.id ?? `custom:${normalizeFishLabel(entry.fish_type)}`

    const row = stats.get(key) ?? { count: 0, totalWeightLbs: 0, recent: [] }
    row.count += 1
    if (entry.weight_lbs != null) {
      row.totalWeightLbs += entry.weight_lbs
    }
    row.recent.push(entry)
    stats.set(key, row)
  }

  for (const row of stats.values()) {
    row.recent.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    row.recent = row.recent.slice(0, 3)
  }

  return stats
}

export function getHabitatLabel(id: FishHabitatId): string {
  return FISH_HABITATS.find((h) => h.id === id)?.label ?? id
}
