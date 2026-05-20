const FILES = {
  'arctic-char': 'Salvelinusalpinus.jpg',
  barracuda: 'Barracuda_laban.jpg',
  barramundi: 'Lates_calcarifer, 2014-09-19a.jpg',
  'black-drum': 'Black_drum.jpg',
  blackfish:
    'Tautog (Tautoga onitis), United States imported from iNaturalist photo 442131359.jpg',
  'blue-crab': 'Blue_crab.jpg',
  bluefish: 'Pomatomus_saltatrix.jpg',
  bonefish: 'Bonefish Albula vulpes.jpg',
  bonito: 'Sarda_sarda.jpg',
  cobia: 'Cobia, Kwale County, Kenia imported from iNaturalist photo 19249056.jpg',
  cod: 'Atlantic Cod, Atlantischer Kabeljau (Gadus morhua).jpg',
  'dungeness-crab': 'DungenessCrab.jpg',
  eel: 'Anguilla_anguilla.jpg',
  flounder: 'Pseudopleuronectes_americanus.jpg',
  grouper: 'Epinephelus_striatus.jpg',
  gt: 'Caranx_ignobilis.jpg',
  haddock: 'Haddock, Boston Aquarium.JPG',
  halibut: 'Hippoglossus_hippoglossus_196509307.jpg',
  'jack-crevalle':
    'Atlantic Crevalle Jack, Gulf State Park, Gulf Shores, AL, US imported from iNaturalist photo 122719283.jpg',
  kingfish: 'King mackerel ( Scomberomorus cavalla ).jpg',
  'largemouth-bass': 'Largemouth Bass (Micropterus salmoides) June 2023 (cropped).jpg',
  lingcod: 'Lingcod.jpg',
  lobster: 'Panulirus_argus.jpg',
  mackerel: 'Scomber_scombrus_217326414.jpg',
  mahi: 'Common Dolphinfish Monterey Bay.jpg',
  marlin: 'Atlantic_blue_marlin.jpg',
  'peacock-bass': 'Cichla ocellaris_185311182.jpg',
  permit: 'Trachinotus_falcatus.jpg',
  pike: 'Esox lucius ZOO 1.jpg',
  piranha: 'Characiformes in the Munim River Basin.jpg',
  plaice: 'Pleuronectes_platessa.jpg',
  pollock: 'Pollachius_pollachius.jpg',
  'red-emperor': 'Lutjanus sebae in UShaka Sea World 0862a.jpg',
  redfish: 'Sciaenops_ocellatus.jpg',
  roosterfish: 'Roosterfish.jpg',
  sailfish: 'Two men holding a freshly caught sailfish.jpg',
  salmon: 'Chinook Salmon Adult Male.jpg',
  'sea-bream': 'Sparus_aurata.jpg',
  sheepshead: 'Archosargus_probatocephalus.jpg',
  snapper: 'Lutjanus_campechanus.jpg',
  snook: 'Centropomus_undecimalis.jpg',
  'speckled-trout': 'Cynoscion_nebulosus.jpg',
  'striped-bass': 'Morone_saxatilis_SI2.jpg',
  swordfish: 'Xiphias gladius Linnaeus, 1758 2599925021.jpg',
  tambaqui: 'Tambaqui Brésil (cropped).JPG',
  tarpon: 'Megalops_atlanticus.jpg',
  tautog:
    'Tautog (Tautoga onitis), United States imported from iNaturalist photo 442131359.jpg',
  trout: 'Close up of rainbow trout fish underwater oncorhynchus mykiss.jpg',
  tuna: 'Thunnus_albacares.jpg',
  wahoo: 'Acanthocybium_solandri_Canary.jpg',
  walleye: 'Walleye (Sander vitreus) (1).jpg',
  weakfish: 'Cynoscion_regalis.jpg',
  yellowtail: 'Seriola_quinqueradiata.jpg',
}

const UA = 'MarkApp/1.0'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

for (const [id, file] of Object.entries(FILES)) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1280`
  const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA } })
  const ok = res.ok && res.url.includes('upload.wikimedia.org')
  console.log(ok ? 'OK' : `FAIL ${res.status}`, id)
  if (!ok) console.log('  ', file)
  await sleep(1200)
}
