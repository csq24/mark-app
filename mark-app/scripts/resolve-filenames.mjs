/** Resolve Commons FilePath → direct upload URL. */
const FILES = {
  'arctic-char': 'Salvelinus_alpinus_-_Arctic_char.jpg',
  barracuda:
    'Great_Barracuda,_Sphyraena_barracuda_-_Fish_-_GRB_0001_(13921320163).jpg',
  barramundi: 'Lates_calcarifer%2C_2014-09-19a.jpg',
  'black-drum': 'Black_drum.jpg',
  blackfish:
    'Tautog_(Tautoga_onitis),_United_States_imported_from_iNaturalist_photo_442131359.jpg',
  'blue-crab': 'Blue_crab.jpg',
  bluefish: 'Pomatomus_saltatrix.jpg',
  bonefish: 'Bonefish_Albula_vulpes.jpg',
  bonito: 'Sarda_sarda.jpg',
  cobia:
    'Cobia,_Rachycentron_canadum_-_Fish_-_GRB_0002_(13921320164).jpg',
  cod: 'Atlantic_Cod,_Atlantischer_Kabeljau_(Gadus_morhua).jpg',
  'dungeness-crab': 'DungenessCrab.jpg',
  eel: 'Anguilla_anguilla.jpg',
  flounder: 'Pseudopleuronectes_americanus.jpg',
  grouper:
    'Gag_grouper,_Mycteroperca_microlepis_-_Fish_-_GRB_0003_(13921320165).jpg',
  gt: 'Caranx_ignobilis.jpg',
  haddock: 'Melanogrammus_aeglefinus.jpg',
  halibut: 'Hippoglossus_hippoglossus_196509307.jpg',
  'jack-crevalle':
    'Atlantic_Crevalle_Jack,_Gulf_State_Park,_Gulf_Shores,_AL,_US_imported_from_iNaturalist_photo_122719283.jpg',
  kingfish: 'King_mackerel_catch.jpg',
  'largemouth-bass':
    'Largemouth_Bass_(Micropterus_salmoides)_June_2023_(cropped).jpg',
  lingcod: 'Lingcod.jpg',
  lobster: 'Panulirus_argus.jpg',
  mackerel: 'Scomber_scombrus_217326414.jpg',
  mahi: 'Common_Dolphinfish_Monterey_Bay.jpg',
  marlin: 'Atlantic_blue_marlin.jpg',
  'peacock-bass':
    'Peacock_bass_(Cichla_ocellaris),_United_States_imported_from_iNaturalist_photo_58190464.jpg',
  permit: 'Trachinotus_falcatus.jpg',
  pike: 'Esox_lucius_-_Northern_pike.jpg',
  piranha:
    'Red-bellied_piranha_(Pygocentrus_nattereri),_Karlsruhe_Zoo_-_Fish_-_GRB_0004_(13921320166).jpg',
  plaice: 'Pleuronectes_platessa.jpg',
  pollock: 'Pollachius_pollachius.jpg',
  'red-emperor': 'Lutjanus_sebae_in_UShaka_Sea_World_0862a.jpg',
  redfish: 'Sciaenops_ocellatus.jpg',
  roosterfish: 'Roosterfish.jpg',
  sailfish: 'Two_men_holding_a_freshly_caught_sailfish.jpg',
  salmon: 'Chinook_Salmon_Adult_Male.jpg',
  'sea-bream': 'Sparus_aurata.jpg',
  sheepshead: 'Archosargus_probatocephalus.jpg',
  snapper: 'Lutjanus_campechanus.jpg',
  snook: 'Centropomus_undecimalis.jpg',
  'speckled-trout': 'Cynoscion_nebulosus.jpg',
  'striped-bass': 'Morone_saxatilis_SI2.jpg',
  swordfish: 'Xiphias_gladius_Linnaeus,_1758_2599925021.jpg',
  tambaqui: 'Tambaqui_Brésil_(cropped).JPG',
  tarpon: 'Megalops_atlanticus.jpg',
  tautog:
    'Tautog_(Tautoga_onitis),_United_States_imported_from_iNaturalist_photo_442131359.jpg',
  trout: 'Close_up_of_rainbow_trout_fish_underwater_oncorhynchus_mykiss.jpg',
  tuna: 'Thunnus_albacares.jpg',
  wahoo: 'Acanthocybium_solandri_Canary.jpg',
  walleye: 'Walleye_(Sander_vitreus)_(1).jpg',
  weakfish: 'Cynoscion_regalis.jpg',
  yellowtail: 'Seriola_quinqueradiata.jpg',
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const UA = 'MarkApp/1.0'

async function resolve(file) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=1280`
  const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA } })
  return { ok: res.ok, final: res.url, status: res.status }
}

const results = {}
for (const [id, file] of Object.entries(FILES)) {
  const r = await resolve(encodeURIComponent(file).replace(/%2C/g, ',').replace(/%28/g, '(').replace(/%29/g, ')'))
  // fix: encode properly
  const enc = encodeURIComponent(decodeURIComponent(file.replace(/%2C/g, ',').replace(/%28/g, '(').replace(/%29/g, ')')))
  const r2 = await resolve(enc)
  results[id] = { file, ...r2 }
  console.log(id, r2.status, r2.ok ? 'OK' : 'FAIL', r2.final?.slice(0, 80))
  await sleep(1500)
}

console.log(JSON.stringify(results, null, 2))
