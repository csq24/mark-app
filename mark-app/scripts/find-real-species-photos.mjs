/**
 * Finds real-life fish photos on Wikimedia Commons (prefers iNaturalist / caught fish).
 * Run: node scripts/find-real-species-photos.mjs
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** id → [commons search queries, best first] */
const SEARCH = {
  'arctic-char': ['Salvelinus alpinus iNaturalist', 'Arctic char fish caught'],
  barracuda: ['Sphyraena barracuda iNaturalist', 'great barracuda underwater photo'],
  barramundi: ['Lates calcarifer iNaturalist', 'barramundi fish photo'],
  'black-drum': ['Pogonias cromis iNaturalist', 'black drum fish caught'],
  blackfish: ['Tautoga onitis iNaturalist', 'tautog fish caught'],
  'blue-crab': ['Callinectes sapidus iNaturalist', 'blue crab photo'],
  bluefish: ['Pomatomus saltatrix iNaturalist', 'bluefish caught'],
  bonefish: ['Albula vulpes iNaturalist', 'bonefish flats photo'],
  bonito: ['Sarda sarda iNaturalist', 'atlantic bonito fish'],
  cobia: ['Rachycentron canadum iNaturalist', 'cobia fish caught'],
  cod: ['Gadus morhua iNaturalist', 'atlantic cod fish photo'],
  'dungeness-crab': ['Metacarcinus magister iNaturalist', 'dungeness crab photo'],
  eel: ['Anguilla anguilla iNaturalist', 'eel fish photo'],
  flounder: ['flounder fish iNaturalist Pseudopleuronectes', 'summer flounder photo'],
  grouper: ['grouper fish iNaturalist Epinephelus', 'gag grouper caught'],
  gt: ['Caranx ignobilis iNaturalist', 'giant trevally photo'],
  haddock: ['Melanogrammus aeglefinus iNaturalist', 'haddock fish photo'],
  halibut: ['Hippoglossus hippoglossus iNaturalist', 'halibut fish photo'],
  'jack-crevalle': ['Caranx hippos iNaturalist', 'crevalle jack fish'],
  kingfish: ['Scomberomorus cavalla iNaturalist', 'king mackerel caught fish'],
  'largemouth-bass': ['Micropterus salmoides iNaturalist', 'largemouth bass caught'],
  lingcod: ['Ophiodon elongatus iNaturalist', 'lingcod fish photo'],
  lobster: ['Panulirus argus iNaturalist', 'spiny lobster photo'],
  mackerel: ['Scomber scombrus iNaturalist', 'atlantic mackerel fish'],
  mahi: ['Coryphaena hippurus iNaturalist', 'mahi mahi caught fish'],
  marlin: ['Makaira nigricans iNaturalist', 'blue marlin fish'],
  'peacock-bass': ['Cichla ocellaris iNaturalist', 'peacock bass fish'],
  permit: ['Trachinotus falcatus iNaturalist', 'permit fish flats'],
  pike: ['Esox lucius iNaturalist', 'northern pike caught'],
  piranha: ['Pygocentrus nattereri iNaturalist', 'piranha fish river'],
  plaice: ['Pleuronectes platessa iNaturalist', 'plaice fish'],
  pollock: ['Pollachius pollachius iNaturalist', 'pollock fish photo'],
  'red-emperor': ['Lutjanus sebae iNaturalist', 'red emperor snapper'],
  redfish: ['Sciaenops ocellatus iNaturalist', 'red drum fish caught'],
  roosterfish: ['Nematistius pectoralis iNaturalist', 'roosterfish caught'],
  sailfish: ['Istiophorus platypterus iNaturalist', 'sailfish caught'],
  salmon: ['Oncorhynchus tshawytscha iNaturalist', 'chinook salmon fish'],
  'sea-bream': ['Sparus aurata iNaturalist', 'gilthead seabream'],
  sheepshead: ['Archosargus probatocephalus iNaturalist', 'sheepshead fish'],
  snapper: ['Lutjanus campechanus iNaturalist', 'red snapper fish'],
  snook: ['Centropomus undecimalis iNaturalist', 'snook fish caught'],
  'speckled-trout': ['Cynoscion nebulosus iNaturalist', 'spotted seatrout'],
  'striped-bass': ['Morone saxatilis iNaturalist', 'striped bass caught'],
  swordfish: ['Xiphias gladius iNaturalist', 'swordfish caught'],
  tambaqui: ['Colossoma macropomum iNaturalist', 'tambaqui fish'],
  tarpon: ['Megalops atlanticus iNaturalist', 'tarpon fish jumping'],
  tautog: ['Tautoga onitis iNaturalist'],
  trout: ['Oncorhynchus mykiss iNaturalist', 'rainbow trout river'],
  tuna: ['Thunnus albacares iNaturalist', 'yellowfin tuna fish'],
  wahoo: ['Acanthocybium solandri iNaturalist', 'wahoo fish caught', 'wahoo ono fish'],
  walleye: ['Sander vitreus iNaturalist', 'walleye fish caught'],
  weakfish: ['Cynoscion regalis iNaturalist', 'weakfish'],
  yellowtail: ['Seriola quinqueradiata iNaturalist', 'yellowtail amberjack fish'],
}

const DISPLAY = {
  'arctic-char': 'Arctic char',
  barracuda: 'Great barracuda',
  barramundi: 'Barramundi',
  'black-drum': 'Black drum',
  blackfish: 'Blackfish (tautog)',
  'blue-crab': 'Blue crab',
  bluefish: 'Bluefish',
  bonefish: 'Bonefish',
  bonito: 'Atlantic bonito',
  cobia: 'Cobia',
  cod: 'Atlantic cod',
  'dungeness-crab': 'Dungeness crab',
  eel: 'European eel',
  flounder: 'Flounder',
  grouper: 'Grouper',
  gt: 'Giant trevally',
  haddock: 'Haddock',
  halibut: 'Atlantic halibut',
  'jack-crevalle': 'Crevalle jack',
  kingfish: 'King mackerel',
  'largemouth-bass': 'Largemouth bass',
  lingcod: 'Lingcod',
  lobster: 'Spiny lobster',
  mackerel: 'Atlantic mackerel',
  mahi: 'Mahi-mahi',
  marlin: 'Atlantic blue marlin',
  'peacock-bass': 'Peacock bass',
  permit: 'Permit',
  pike: 'Northern pike',
  piranha: 'Red-bellied piranha',
  plaice: 'European plaice',
  pollock: 'Atlantic pollock',
  'red-emperor': 'Red emperor snapper',
  redfish: 'Red drum (redfish)',
  roosterfish: 'Roosterfish',
  sailfish: 'Atlantic sailfish',
  salmon: 'Chinook salmon',
  'sea-bream': 'Gilthead sea bream',
  sheepshead: 'Sheepshead',
  snapper: 'Red snapper',
  snook: 'Common snook',
  'speckled-trout': 'Spotted seatrout',
  'striped-bass': 'Striped bass',
  swordfish: 'Swordfish',
  tambaqui: 'Tambaqui',
  tarpon: 'Atlantic tarpon',
  tautog: 'Tautog',
  trout: 'Rainbow trout',
  tuna: 'Yellowfin tuna',
  wahoo: 'Wahoo',
  walleye: 'Walleye',
  weakfish: 'Weakfish',
  yellowtail: 'Yellowtail amberjack',
}

const UA = 'MarkApp/1.0 (educational species guide; local dev)'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function rejectName(name) {
  const n = name.toLowerCase()
  if (/\.(png|svg|gif)$/.test(n)) return true
  if (/illustration|drawing|diagram|plate|stamp|logo|icon|map|chart|sketch|clipart|vector/.test(n))
    return true
  if (/aquarium.*logo|museum.*logo/.test(n)) return true
  return false
}

function score(name, title) {
  const n = `${name} ${title}`.toLowerCase()
  let s = 0
  if (n.includes('inaturalist')) s += 50
  if (n.includes('caught') || n.includes('fishing') || n.includes('angler')) s += 20
  if (n.includes('underwater') || n.includes('reef') || n.includes('ocean')) s += 10
  if (/\.jpe?g$|\.webp$/.test(name.toLowerCase())) s += 15
  if (n.includes('zoo') && !n.includes('inaturalist')) s -= 5
  if (n.includes('aquarium') && !n.includes('inaturalist')) s -= 3
  if (n.includes('robertson') || n.includes('illustration')) s -= 40
  return s
}

async function commonsSearch(query) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: '6',
    gsrlimit: '12',
    prop: 'imageinfo',
    iiurlwidth: '1280',
  })
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { 'User-Agent': UA },
  })
  if (!res.ok) return []
  const data = await res.json()
  const pages = data?.query?.pages
  if (!pages) return []
  return Object.values(pages)
    .map((p) => ({
      title: p.title?.replace(/^File:/, '') ?? '',
      url: p.imageinfo?.[0]?.thumburl || p.imageinfo?.[0]?.url,
    }))
    .filter((x) => x.url && x.title)
}

async function pickBest(id, queries) {
  let best = null
  let bestScore = -999
  for (const q of queries) {
    const hits = await commonsSearch(q)
    for (const hit of hits) {
      if (rejectName(hit.title)) continue
      const s = score(hit.title, hit.title)
      if (s > bestScore) {
        bestScore = s
        best = hit
      }
    }
    if (bestScore >= 50) break
    await sleep(600)
  }
  return best
}

async function main() {
  const resolved = {}
  const failed = []

  for (const [id, queries] of Object.entries(SEARCH)) {
    process.stderr.write(`… ${id}\n`)
    const hit = await pickBest(id, queries)
    if (hit?.url) {
      resolved[id] = { src: hit.url, alt: DISPLAY[id] ?? id, file: hit.title }
    } else {
      failed.push(id)
    }
    await sleep(900)
  }

  const lines = Object.entries(resolved).map(
    ([id, { src, alt }]) =>
      `  '${id}': img(\n    ${JSON.stringify(src)},\n    ${JSON.stringify(alt)},\n  ),`,
  )

  const header = `/**
 * Real-life fish photographs (Wikimedia Commons; mostly iNaturalist).
 * Regenerate: node scripts/find-real-species-photos.mjs
 */

export type SpeciesImageMeta = {
  src: string
  alt: string
  credit?: string
}

const CREDIT = 'Photo: Wikimedia Commons'

function img(src: string, alt: string): SpeciesImageMeta {
  return { src, alt, credit: CREDIT }
}

const SPECIES_IMAGES: Record<string, SpeciesImageMeta> = {
`

  const footer = `
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getSpeciesImage(id: string, name: string): SpeciesImageMeta | null {
  const byId = SPECIES_IMAGES[id]
  if (byId) return byId
  const bySlug = SPECIES_IMAGES[slugify(name)]
  if (bySlug) return { ...bySlug, alt: name }
  return null
}
`

  writeFileSync(join(__dirname, '../src/data/speciesImages.ts'), header + lines.join('\n') + footer)

  console.log(`Resolved ${Object.keys(resolved).length}/${Object.keys(SEARCH).length}`)
  if (failed.length) console.log('Failed:', failed.join(', '))

  writeFileSync(
    join(__dirname, '../species-images-debug.json'),
    JSON.stringify(resolved, null, 2),
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
