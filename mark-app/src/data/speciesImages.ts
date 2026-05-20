/**
 * Real-life fish photographs (Wikimedia Commons).
 * Filenames resolve via Special:FilePath → full-size photo URLs.
 * Regenerate / verify: node scripts/verify-commons-files.mjs
 */

export type SpeciesImageMeta = {
  src: string
  alt: string
  credit?: string
}

const CREDIT = 'Photo: Wikimedia Commons'

/** Commons file title (real photo; no illustrations). */
function photo(file: string, alt: string): SpeciesImageMeta {
  return {
    src: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1280`,
    alt,
    credit: CREDIT,
  }
}

const SPECIES_IMAGES: Record<string, SpeciesImageMeta> = {
  'arctic-char': photo('Salvelinusalpinus.jpg', 'Arctic char'),
  barracuda: photo('Barracuda_laban.jpg', 'Great barracuda'),
  barramundi: photo('Lates_calcarifer, 2014-09-19a.jpg', 'Barramundi'),
  'black-drum': photo('Black_drum.jpg', 'Black drum'),
  blackfish: photo(
    'Tautog (Tautoga onitis), United States imported from iNaturalist photo 442131359.jpg',
    'Blackfish (tautog)',
  ),
  'blue-crab': photo('Blue_crab.jpg', 'Blue crab'),
  bluefish: photo('Pomatomus_saltatrix.jpg', 'Bluefish'),
  bonefish: photo('Bonefish Albula vulpes.jpg', 'Bonefish'),
  bonito: photo('Sarda_sarda.jpg', 'Atlantic bonito'),
  cobia: photo(
    'Cobia, Kwale County, Kenia imported from iNaturalist photo 19249056.jpg',
    'Cobia',
  ),
  cod: photo('Atlantic Cod, Atlantischer Kabeljau (Gadus morhua).jpg', 'Atlantic cod'),
  'dungeness-crab': photo('DungenessCrab.jpg', 'Dungeness crab'),
  eel: photo('Anguilla_anguilla.jpg', 'European eel'),
  flounder: photo('Pseudopleuronectes_americanus.jpg', 'Flounder'),
  grouper: photo('Epinephelus_striatus.jpg', 'Nassau grouper'),
  gt: photo('Caranx_ignobilis.jpg', 'Giant trevally'),
  haddock: photo('Melanogrammus_aeglefinus.jpg', 'Haddock'),
  halibut: photo('Hippoglossus_hippoglossus_196509307.jpg', 'Atlantic halibut'),
  'jack-crevalle': photo(
    'Atlantic Crevalle Jack, Gulf State Park, Gulf Shores, AL, US imported from iNaturalist photo 122719283.jpg',
    'Crevalle jack',
  ),
  kingfish: photo('King mackerel ( Scomberomorus cavalla ).jpg', 'King mackerel'),
  'largemouth-bass': photo(
    'Largemouth Bass (Micropterus salmoides) June 2023 (cropped).jpg',
    'Largemouth bass',
  ),
  lingcod: photo('Lingcod.jpg', 'Lingcod'),
  lobster: photo('Panulirus_argus.jpg', 'Spiny lobster'),
  mackerel: photo('Scomber_scombrus_217326414.jpg', 'Atlantic mackerel'),
  mahi: photo('Common Dolphinfish Monterey Bay.jpg', 'Mahi-mahi'),
  marlin: photo('Atlantic_blue_marlin.jpg', 'Atlantic blue marlin'),
  'peacock-bass': photo('Cichla ocellaris_185311182.jpg', 'Peacock bass'),
  permit: photo('Trachinotus_falcatus.jpg', 'Permit'),
  pike: photo('Esox lucius - Northern pike.jpg', 'Northern pike'),
  piranha: photo(
    'Characiformes in the Munim River Basin.jpg',
    'Red-bellied piranha',
  ),
  plaice: photo('Pleuronectes_platessa.jpg', 'European plaice'),
  pollock: photo('Pollachius_pollachius.jpg', 'Atlantic pollock'),
  'red-emperor': photo('Lutjanus sebae in UShaka Sea World 0862a.jpg', 'Red emperor snapper'),
  redfish: photo('Sciaenops_ocellatus.jpg', 'Red drum (redfish)'),
  roosterfish: photo('Roosterfish.jpg', 'Roosterfish'),
  sailfish: photo('Two men holding a freshly caught sailfish.jpg', 'Atlantic sailfish'),
  salmon: photo('Chinook Salmon Adult Male.jpg', 'Chinook salmon'),
  'sea-bream': photo('Sparus_aurata.jpg', 'Gilthead sea bream'),
  sheepshead: photo('Archosargus_probatocephalus.jpg', 'Sheepshead'),
  snapper: photo('Lutjanus_campechanus.jpg', 'Red snapper'),
  snook: photo('Centropomus_undecimalis.jpg', 'Common snook'),
  'speckled-trout': photo('Cynoscion_nebulosus.jpg', 'Spotted seatrout'),
  'striped-bass': photo('Morone_saxatilis_SI2.jpg', 'Striped bass'),
  swordfish: photo('Xiphias gladius Linnaeus, 1758 2599925021.jpg', 'Swordfish'),
  tambaqui: photo('Tambaqui Brésil (cropped).JPG', 'Tambaqui'),
  tarpon: photo('Megalops_atlanticus.jpg', 'Atlantic tarpon'),
  tautog: photo(
    'Tautog (Tautoga onitis), United States imported from iNaturalist photo 442131359.jpg',
    'Tautog',
  ),
  trout: photo(
    'Close up of rainbow trout fish underwater oncorhynchus mykiss.jpg',
    'Rainbow trout',
  ),
  tuna: photo('Thunnus_albacares.jpg', 'Yellowfin tuna'),
  wahoo: photo('Acanthocybium_solandri_Canary.jpg', 'Wahoo'),
  walleye: photo('Walleye (Sander vitreus) (1).jpg', 'Walleye'),
  weakfish: photo('Cynoscion_regalis.jpg', 'Weakfish'),
  yellowtail: photo('Seriola_quinqueradiata.jpg', 'Yellowtail amberjack'),
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
