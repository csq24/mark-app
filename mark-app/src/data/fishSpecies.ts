/**
 * Species reference — educational only; verify regulations locally.
 */

export const FISH_HABITATS = [
  { id: 'saltwater', label: 'Saltwater' },
  { id: 'freshwater', label: 'Freshwater' },
  { id: 'brackish', label: 'Brackish' },
  { id: 'flats', label: 'Flats' },
  { id: 'inshore', label: 'Inshore' },
  { id: 'reef', label: 'Reef' },
  { id: 'offshore', label: 'Offshore' },
] as const

export type FishHabitatId = (typeof FISH_HABITATS)[number]['id']

export type FishSpeciesProfile = {
  id: string
  name: string
  habitats: FishHabitatId[]
  summary: string
  gearTips: string[]
  aliases?: string[]
}

/** Curated profiles for common game fish (matches New Catch quick picks + atlas). */
export const SPECIES_PROFILES: FishSpeciesProfile[] = [
  {
    id: 'grouper',
    name: 'Grouper',
    habitats: ['saltwater', 'reef', 'inshore'],
    summary:
      'Heavy reef dwellers — gag, black, and red grouper are staples on structure from the Gulf to the Caribbean.',
    gearTips: [
      'Live pinfish or grunts on bottom rigs near ledges',
      'Heavy tackle — they dive straight into rocks',
      'Peak bite often around tide changes on wrecks',
    ],
    aliases: ['Goliath grouper'],
  },
  {
    id: 'snapper',
    name: 'Snapper',
    habitats: ['saltwater', 'reef', 'offshore'],
    summary:
      'Mangrove, yellowtail, and red snapper school on reefs and wrecks; a top table fish in warm seas.',
    gearTips: [
      'Light fluorocarbon leaders for wary mangrove snapper',
      'Chum the slick on offshore humps for muttons and yellowtail',
      'Match hook size to bait — pilchards and sardines work well',
    ],
    aliases: ['Red snapper', 'Mangrove snapper'],
  },
  {
    id: 'mahi',
    name: 'Mahi',
    habitats: ['saltwater', 'offshore'],
    summary:
      'Fast pelagic also called dorado or dolphinfish — brilliant colors, acrobatic fights, often under floating debris.',
    gearTips: [
      'Trolling skirted baits or ballyhoo along weed lines',
      'Keep a pitch bait ready when fish follow the spread',
      'Leave one hooked fish in the water to keep the school',
    ],
    aliases: ['Dorado', 'Dolphinfish'],
  },
  {
    id: 'lobster',
    name: 'Lobster',
    habitats: ['saltwater', 'reef', 'inshore'],
    summary:
      'Spiny lobster live in reef crevices and grass edges; season and bag limits vary sharply by state.',
    gearTips: [
      'Check local season, gauge size, and permit rules before diving',
      'Tickle sticks and nets for legal harvest only where allowed',
      'Night dives in season — know your reef and currents',
    ],
    aliases: ['Spiny lobster'],
  },
  {
    id: 'tarpon',
    name: 'Tarpon',
    habitats: ['saltwater', 'brackish', 'inshore', 'flats'],
    summary:
      'Silver kings migrate along coasts and stack in passes; iconic jumps and long runs on light tackle.',
    gearTips: [
      'Live mullet or crabs at bridges and passes at night',
      'Fly anglers: black death, toads, and baitfish patterns on 10–12 wt',
      'Bow to the fish when jumping — leaders are often rubbed through',
    ],
  },
  {
    id: 'bonefish',
    name: 'Bonefish',
    habitats: ['saltwater', 'flats'],
    summary:
      'Ghost of the flats — tailing fish on white sand and grass in inches of water from the Keys to the Bahamas.',
    gearTips: [
      'Small shrimp and crab flies; lead the fish and strip slowly',
      'Polarized glasses and quiet wading are essential',
      'Wind at your back helps casting distance on open flats',
    ],
  },
  {
    id: 'permit',
    name: 'Permit',
    habitats: ['saltwater', 'flats', 'reef'],
    summary:
      'One of the toughest flats fish — schools on wrecks and tailing singles on shallow banks.',
    gearTips: [
      'Crab patterns and live crabs on spinning gear',
      'Cast ahead of cruising fish — they spook easily',
      'Often found with bonefish and barracuda on the same flat',
    ],
  },
  {
    id: 'redfish',
    name: 'Redfish',
    habitats: ['saltwater', 'brackish', 'inshore'],
    summary:
      'Red drum patrol grass flats, oyster bars, and marsh edges — bronze backs and a black spot near the tail.',
    gearTips: [
      'Gold spoons and soft plastics on grass flats',
      'Live shrimp under a popping cork in marshes',
      'Look for tailing fish on low, clear tides',
    ],
    aliases: ['Red drum'],
  },
  {
    id: 'snook',
    name: 'Snook',
    habitats: ['saltwater', 'brackish', 'inshore'],
    summary:
      'Linesiders hug mangroves, docks, and passes — strong strikes and structure-breaking runs.',
    gearTips: [
      'Live pilchards and threadfins at night lights',
      'Topwater walkers at dawn along mangrove shorelines',
      'Fluorocarbon leader — sharp gill plates cut mono',
    ],
  },
  {
    id: 'striped-bass',
    name: 'Striped bass',
    habitats: ['saltwater', 'brackish', 'inshore'],
    summary:
      'Striper run estuaries and surf zones along the Atlantic and Gulf — seasonal migrations drive the bite.',
    gearTips: [
      'Metal lips and needlefish in the surf at dawn',
      'Live eels and bunker chunks in rips and channels',
      'Follow bird activity over bait balls',
    ],
    aliases: ['Striped bass', 'Striper', 'Rockfish'],
  },
  {
    id: 'speckled-trout',
    name: 'Speckled trout',
    habitats: ['saltwater', 'brackish', 'inshore'],
    summary:
      'Spotted seatrout on grass flats and channel edges — gator trout over slot size are prized catch-and-release.',
    gearTips: [
      'Topwater plugs at first light on calm flats',
      'Soft plastics on jig heads along drop-offs',
      'Live shrimp under a cork in winter deep holes',
    ],
    aliases: ['Speckled trout', 'Spotted seatrout', 'Trout'],
  },
  {
    id: 'flounder',
    name: 'Flounder',
    habitats: ['saltwater', 'inshore'],
    summary:
      'Flatfish lie camouflaged on sandy bottoms — drag baits slowly or gig where legal in season.',
    gearTips: [
      'Drag minnows or gulp on bottom along channel edges',
      'Work bucktail jigs with short hops near structure',
      'Night flounder gigging where regulations allow',
    ],
    aliases: ['Fluke', 'Summer flounder'],
  },
  {
    id: 'cobia',
    name: 'Cobia',
    habitats: ['saltwater', 'inshore', 'offshore'],
    summary:
      'Brown bombers follow rays, turtles, and buoys — powerful runs and excellent table fare.',
    gearTips: [
      'Cast live eels or large jigs to rays on calm days',
      'Chum wrecks in spring migration along the Atlantic',
      'Heavy tackle — they wrap structure fast',
    ],
  },
  {
    id: 'kingfish',
    name: 'Kingfish',
    habitats: ['saltwater', 'offshore', 'inshore'],
    summary:
      'King mackerel slash bait schools near beaches and reefs — wire leaders mandatory for their teeth.',
    gearTips: [
      'Slow-troll live blue runners or cigar minnows',
      'Stinger rigs with wire trace for cut bait',
      'Look for diving birds and bait showers',
    ],
    aliases: ['King mackerel', 'Kingfish', 'Spanish mackerel'],
  },
  {
    id: 'sailfish',
    name: 'Sailfish',
    habitats: ['saltwater', 'offshore'],
    summary:
      'Billfish royalty — aerial displays and fast runs; catch-and-release is standard in most fisheries.',
    gearTips: [
      'Live bait slow-trolled or kite-fished in blue water',
      'Circle hooks for safer releases',
      'Keep boats ready for greyhounding runs',
    ],
  },
  {
    id: 'yellowtail',
    name: 'Yellowtail',
    habitats: ['saltwater', 'reef', 'offshore'],
    summary:
      'Yellowtail snapper and California yellowtail are different species — both love structure and current.',
    gearTips: [
      'Chum heavily on reef edges for Caribbean yellowtail snapper',
      'Iron jigs and live sardines for SoCal yellowtail on kelp',
      'Light line and small hooks for wary reef fish',
    ],
    aliases: ['Yellowtail snapper'],
  },
  {
    id: 'barracuda',
    name: 'Barracuda',
    habitats: ['saltwater', 'flats', 'reef'],
    summary:
      'Cuda patrol flats and reef edges — lightning strikes on fast retrieves; handle teeth with care.',
    gearTips: [
      'Wire leader essential — they slice mono instantly',
      'Fast-retrieved tube lures and shiny spoons',
      'Often follow hooked fish to the boat',
    ],
  },
  {
    id: 'halibut',
    name: 'Halibut',
    habitats: ['saltwater', 'offshore', 'inshore'],
    summary:
      'Pacific halibut on deep banks; California halibut in sandy bays — both demand bottom presentations.',
    gearTips: [
      'Large herring or salmon heads on spreader bars (Pacific)',
      'Live squid or swimbaits on sandy SoCal flats',
      'Drift slowly — feel for subtle bites',
    ],
  },
  {
    id: 'salmon',
    name: 'Salmon',
    habitats: ['saltwater', 'freshwater', 'brackish'],
    summary:
      'Pacific and Atlantic salmon — river runs and salt feeding grounds define seasonal opportunity.',
    gearTips: [
      'Troll herring or flashers in salt; swing flies in rivers',
      'Match lure color to water clarity and light',
      'Know run timing for your river system',
    ],
  },
  {
    id: 'trout',
    name: 'Trout',
    habitats: ['freshwater'],
    summary:
      'Rainbow, brown, and brook trout in cold streams and lakes — technical dry-fly and nymph fisheries.',
    gearTips: [
      'Match the hatch — observe rising fish and insect activity',
      'Indicator nymphing in riffles and runs',
      'Stealth approach — trout see movement on banks',
    ],
    aliases: ['Rainbow trout', 'Brown trout', 'Brook trout'],
  },
  {
    id: 'largemouth-bass',
    name: 'Largemouth bass',
    habitats: ['freshwater', 'brackish'],
    summary:
      'America’s favorite freshwater game fish — lily pads, docks, and submerged timber.',
    gearTips: [
      'Texas-rigged worms and jigs around cover',
      'Topwater frogs in heavy vegetation at dawn',
      'Spinnerbaits along grass lines on windy days',
    ],
    aliases: ['Largemouth bass', 'Bass'],
  },
  {
    id: 'pike',
    name: 'Pike',
    habitats: ['freshwater'],
    summary:
      'Northern pike ambush weed edges and cool lakes — razor teeth and explosive strikes.',
    gearTips: [
      'Steel leaders for all presentations',
      'Large spoons, swimbaits, and jerkbaits',
      'Early season in shallow bays warming first',
    ],
    aliases: ['Northern pike'],
  },
  {
    id: 'walleye',
    name: 'Walleye',
    habitats: ['freshwater'],
    summary:
      'Glass-eyed predators — low-light feeders on Great Lakes reefs and river tailwaters.',
    gearTips: [
      'Jig and minnow on wind-blown points',
      'Trolling crankbaits at dusk and after dark',
      'Live leeches and crawlers on slip bobbers',
    ],
  },
  {
    id: 'tuna',
    name: 'Tuna',
    habitats: ['saltwater', 'offshore'],
    summary:
      'Bluefin to yellowfin — open-ocean speed and endurance; regulated seasons and quotas apply widely.',
    gearTips: [
      'Troll spreader bars and cedar plugs where legal',
      'Chunking and live bait on temperature breaks',
      'Heavy drag and harness belts for stand-up gear',
    ],
    aliases: ['Yellowfin tuna', 'Bluefin tuna'],
  },
  {
    id: 'cod',
    name: 'Cod',
    habitats: ['saltwater', 'offshore', 'inshore'],
    summary:
      'Groundfish on rocky Atlantic structure — classic jig-and-bait fisheries with strict quotas in many areas.',
    gearTips: [
      'Jigging metals with teaser flies on wrecks',
      'Clam and squid strips on chicken rigs',
      'Watch depth and closed areas on charts',
    ],
    aliases: ['Atlantic cod', 'Pacific cod'],
  },
  {
    id: 'peacock-bass',
    name: 'Peacock bass',
    habitats: ['freshwater', 'brackish'],
    summary:
      'Explosive South Florida and Amazon imports — ambush predators on urban canals and jungle rivers.',
    gearTips: [
      'Topwater prop baits at dawn on canal edges',
      'Bright jerkbaits and live shiners',
      'Target shade under bridges and laydowns',
    ],
  },
  {
    id: 'roosterfish',
    name: 'Roosterfish',
    habitats: ['saltwater', 'inshore'],
    summary:
      'Pacific showpiece with a distinctive comb — patrols sandy beaches chasing bait schools.',
    gearTips: [
      'Live mullet and poppers along surf zones',
      'Heavy tackle — they charge the beach and cut off',
      'Baja and Central America peak fisheries',
    ],
  },
  {
    id: 'wahoo',
    name: 'Wahoo',
    habitats: ['saltwater', 'offshore'],
    summary:
      'Fastest strike in the ocean — razor teeth, blistering runs, often on high-speed trolling.',
    gearTips: [
      'High-speed troll horse ballyhoo with wire leaders',
      'Planer spreads at 12–18 knots in winter',
      'Gloves and pliers — teeth and gill rakers are sharp',
    ],
  },
  {
    id: 'sheepshead',
    name: 'Sheepshead',
    habitats: ['saltwater', 'inshore', 'reef'],
    summary:
      'Convict fish nibble barnacles on pilings — subtle bites and precise hook sets.',
    gearTips: [
      'Fiddler crabs and sand fleas on small hooks',
      'Fish vertically on bridge pilings',
      'Set hook on the slightest tap — they steal bait',
    ],
  },
  {
    id: 'black-drum',
    name: 'Black drum',
    habitats: ['saltwater', 'brackish', 'inshore'],
    summary:
      'Large drum grunt on oyster bars — bulls over 40 lb are common in passes and channels.',
    gearTips: [
      'Blue crabs and fresh clams on bottom rigs',
      'Fish deep holes near bridges in winter',
      'Let them eat — drum mouth differently than reds',
    ],
    aliases: ['Black drum'],
  },
]
