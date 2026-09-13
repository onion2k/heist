/**
 * The species: what a gemmologist would write on the stone's card.
 *
 * The keys are the renderer's own material names, so choosing one here is
 * choosing what the tracer bends light with. The index of refraction and
 * the dispersion are the published figures the renderer also uses; the rest
 * — formula, system, hardness, gravity, where it is dug and how it is
 * treated — is the reference sheet, and does not touch the picture except
 * for the specific gravity, which turns the model's volume into carats.
 */

export type ClarityType = 'diamond' | 'I' | 'II' | 'III' | 'opaque' | 'phenomenal';

export interface Species {
  /** The renderer's material name. */
  key: string;
  name: string;
  /** Mineral or group: corundum, beryl, quartz. */
  mineral: string;
  formula: string;
  system: string;
  habit: string;
  /** Mohs. */
  hardness: string;
  /** Specific gravity, a single figure for the weight estimate. */
  gravity: number;
  gravityRange: string;
  /** Refractive index as published, a range for the birefringent. */
  ri: string;
  birefringence: string;
  /** Dispersion, B–G interval. */
  dispersion: number;
  pleochroism: string;
  lustre: string;
  cleavage: string;
  fracture: string;
  /** What gives it its colour. */
  chromophore: string;
  colourRange: string;
  clarityType: ClarityType;
  clarityNote: string;
  /** Typical inclusions, the ones a loupe finds. */
  inclusions: string;
  sources: string[];
  treatments: string;
  history: string;
  birthstone?: string;
}

export const SPECIES: Record<string, Species> = {
  diamond: {
    key: 'diamond', name: 'Diamond', mineral: 'diamond (native carbon)', formula: 'C',
    system: 'cubic (isometric)', habit: 'octahedra, dodecahedra, macles; rounded and etched',
    hardness: '10', gravity: 3.52, gravityRange: '3.50–3.53',
    ri: '2.417', birefringence: 'none — singly refractive (anomalous strain birefringence is common)',
    dispersion: 0.044, pleochroism: 'none', lustre: 'adamantine',
    cleavage: 'perfect octahedral, four directions', fracture: 'conchoidal',
    chromophore: 'nitrogen (yellow, Cape series), boron (blue), lattice defects and plastic deformation (brown, pink, red), hydrogen and irradiation (green)',
    colourRange: 'colourless to yellow and brown; rarely pink, blue, green, orange, red',
    clarityType: 'diamond',
    clarityNote: 'Graded FL to I3 under 10× magnification by a trained grader; the scale is the GIA\'s and is the one the trade quotes.',
    inclusions: 'crystals (often other diamonds, garnet, olivine), feathers, clouds of pinpoints, twinning wisps, graining, knots, cavities',
    sources: ['Botswana', 'Russia (Yakutia)', 'Canada (NWT)', 'South Africa', 'Angola', 'Namibia', 'Australia (Argyle, closed 2020)'],
    treatments: 'laser drilling and fracture filling for clarity; HPHT annealing and irradiation for colour. Synthetics by HPHT and CVD are common and are declared.',
    history: 'Cut and polished only since the fourteenth century; the brilliant was worked out by Venetian and Antwerp cutters and perfected mathematically by Tolkowsky in 1919.',
    birthstone: 'April',
  },
  ruby: {
    key: 'ruby', name: 'Ruby', mineral: 'corundum', formula: 'Al₂O₃ : Cr³⁺',
    system: 'trigonal', habit: 'tabular hexagonal prisms and bipyramids; often twinned',
    hardness: '9', gravity: 4.00, gravityRange: '3.97–4.05',
    ri: '1.762–1.770', birefringence: '0.008–0.010', dispersion: 0.018,
    pleochroism: 'strong: purplish red / orangey red', lustre: 'vitreous to sub-adamantine',
    cleavage: 'none; parting on the basal and rhombohedral planes', fracture: 'conchoidal to uneven',
    chromophore: 'chromium replacing aluminium; iron darkens it, and the red fluorescence under daylight is chromium too',
    colourRange: 'red, from pinkish and orangey through pure red ("pigeon\'s blood") to purplish',
    clarityType: 'II',
    clarityNote: 'Type II: usually included. Fine silk is acceptable and even prized where it softens the colour; a ruby that is eye-clean is the exception.',
    inclusions: 'silk (needles of rutile in three directions at 60°), crystals of calcite, apatite and spinel, fingerprints, colour zoning, twinning lamellae',
    sources: ['Myanmar (Mogok, Mong Hsu)', 'Mozambique (Montepuez)', 'Thailand', 'Sri Lanka', 'Madagascar', 'Vietnam', 'Tanzania'],
    treatments: 'heating is routine and accepted with disclosure; lead-glass filling of fractured stones is common in commercial goods and must be declared; flux-healed and beryllium-diffused stones exist.',
    history: 'The "ratnaraj", king of gems, in Sanskrit; Mogok has been worked since at least the fifteenth century.',
    birthstone: 'July',
  },
  sapphire: {
    key: 'sapphire', name: 'Sapphire', mineral: 'corundum', formula: 'Al₂O₃ : Fe²⁺ + Ti⁴⁺',
    system: 'trigonal', habit: 'barrel-shaped bipyramids, hexagonal prisms',
    hardness: '9', gravity: 4.00, gravityRange: '3.95–4.03',
    ri: '1.762–1.770', birefringence: '0.008–0.010', dispersion: 0.018,
    pleochroism: 'strong: violet-blue / greenish blue', lustre: 'vitreous to sub-adamantine',
    cleavage: 'none; parting on the basal plane', fracture: 'conchoidal to uneven',
    chromophore: 'intervalence charge transfer between iron and titanium; pure corundum is colourless, so every colour but red is a sapphire',
    colourRange: 'blue; also pink, yellow, green, purple, orange, colourless, and the pinkish-orange padparadscha',
    clarityType: 'II',
    clarityNote: 'Type II: usually included. Silk, fingerprints and zoning are expected; Kashmir\'s velvet is fine silk scattering the light.',
    inclusions: 'rutile silk, colour zoning (angular, following the growth faces), fingerprints, zircon haloes, negative crystals, boehmite needles',
    sources: ['Kashmir (historic)', 'Sri Lanka (Ratnapura)', 'Myanmar', 'Madagascar', 'Thailand', 'Australia', 'Montana (USA)', 'Tanzania'],
    treatments: 'heating is routine and accepted with disclosure; beryllium lattice diffusion for orange and yellow; titanium surface diffusion for blue; fracture filling is rarer than in ruby.',
    history: 'The "hyacinth" and "sapphirus" of the ancients was probably lapis; the blue corundum took the name in the Middle Ages.',
    birthstone: 'September',
  },
  emerald: {
    key: 'emerald', name: 'Emerald', mineral: 'beryl', formula: 'Be₃Al₂Si₆O₁₈ : Cr³⁺, V³⁺',
    system: 'hexagonal', habit: 'hexagonal prisms with flat basal terminations',
    hardness: '7½–8', gravity: 2.72, gravityRange: '2.67–2.78',
    ri: '1.577–1.583', birefringence: '0.005–0.009', dispersion: 0.014,
    pleochroism: 'distinct: bluish green / yellowish green', lustre: 'vitreous',
    cleavage: 'indistinct basal', fracture: 'conchoidal; brittle',
    chromophore: 'chromium, and vanadium alone or with it; the same chromium that reds a ruby greens a beryl because the crystal field is weaker',
    colourRange: 'green, from yellowish through pure to bluish; a beryl too pale to hold the colour is a green beryl',
    clarityType: 'III',
    clarityNote: 'Type III: almost always included. The "jardin" — the garden of fissures and crystals — is accepted, and a clean emerald of any size is extraordinary.',
    inclusions: 'three-phase inclusions (liquid, gas bubble, halite cube — Colombia\'s signature), calcite and pyrite crystals, fissures, growth tubes, mica flakes',
    sources: ['Colombia (Muzo, Chivor, Coscuez)', 'Zambia (Kagem)', 'Brazil (Minas Gerais)', 'Zimbabwe (Sandawana)', 'Ethiopia', 'Afghanistan (Panjshir)'],
    treatments: 'nearly every emerald is oiled — cedar oil in the surface fissures — and the trade discloses the degree; resins are more permanent and less accepted; dyed and coated stones exist.',
    history: 'Mined in Egypt for Cleopatra; the Spanish found the Colombian mines in the 1530s and flooded Europe and Mughal India with them.',
    birthstone: 'May',
  },
  amethyst: {
    key: 'amethyst', name: 'Amethyst', mineral: 'quartz', formula: 'SiO₂ : Fe³⁺ + irradiation',
    system: 'trigonal', habit: 'six-sided prisms terminated by rhombohedra; druses in geodes',
    hardness: '7', gravity: 2.65, gravityRange: '2.63–2.66',
    ri: '1.544–1.553', birefringence: '0.009', dispersion: 0.013,
    pleochroism: 'weak: purple / reddish purple', lustre: 'vitreous',
    cleavage: 'none', fracture: 'conchoidal',
    chromophore: 'iron in the lattice, activated by natural irradiation into colour centres; heat undoes it, and turns the stone to citrine',
    colourRange: 'pale lilac to deep purple, often zoned in bands; "Siberian" with red and blue flashes is the ideal',
    clarityType: 'II',
    clarityNote: 'Type II: usually included, though fine amethyst is routinely eye-clean and inclusions cost it more than they would a ruby.',
    inclusions: 'tiger-stripe (thumbprint) twinning, colour zoning, negative crystals, fluid inclusions, needles of goethite',
    sources: ['Brazil (Rio Grande do Sul)', 'Uruguay (Artigas)', 'Zambia', 'Bolivia', 'Russia (Urals)', 'Madagascar'],
    treatments: 'heating to lighten or to make citrine; synthetic hydrothermal amethyst is common and hard to tell.',
    history: 'Greek amethystos, "not drunken": worn against wine. A cardinal\'s stone until the Brazilian finds of the nineteenth century made it common.',
    birthstone: 'February',
  },
  aquamarine: {
    key: 'aquamarine', name: 'Aquamarine', mineral: 'beryl', formula: 'Be₃Al₂Si₆O₁₈ : Fe²⁺',
    system: 'hexagonal', habit: 'long hexagonal prisms, often large and clean',
    hardness: '7½–8', gravity: 2.72, gravityRange: '2.66–2.80',
    ri: '1.577–1.583', birefringence: '0.005–0.009', dispersion: 0.014,
    pleochroism: 'distinct: blue / near colourless', lustre: 'vitreous',
    cleavage: 'indistinct basal', fracture: 'conchoidal',
    chromophore: 'ferrous iron; ferric iron adds the yellow that heating removes to leave the pure blue',
    colourRange: 'pale greenish blue to blue; the saturated "Santa Maria" blue is rare',
    clarityType: 'I',
    clarityNote: 'Type I: usually eye-clean. An inclusion visible without a loupe is a real fault in an aquamarine.',
    inclusions: 'long hollow growth tubes parallel to the prism ("rain"), two-phase inclusions, mica, "chrysanthemum" inclusions',
    sources: ['Brazil (Minas Gerais)', 'Pakistan (Shigar)', 'Nigeria', 'Madagascar', 'Mozambique', 'Zambia'],
    treatments: 'heating to remove the green is routine and undetectable; otherwise untreated.',
    history: 'Latin "sea water"; sailors carried it. The Dom Pedro, at 10,363 carats, is the largest cut aquamarine.',
    birthstone: 'March',
  },
  topaz: {
    key: 'topaz', name: 'Topaz', mineral: 'topaz', formula: 'Al₂SiO₄(F,OH)₂',
    system: 'orthorhombic', habit: 'prisms with a rhombic section and a lozenge-shaped termination',
    hardness: '8', gravity: 3.53, gravityRange: '3.49–3.57',
    ri: '1.619–1.627', birefringence: '0.008–0.010', dispersion: 0.014,
    pleochroism: 'distinct in imperial topaz: yellow / orange / pinkish', lustre: 'vitreous',
    cleavage: 'perfect basal — the cutter keeps the table off the cleavage plane', fracture: 'subconchoidal',
    chromophore: 'colour centres for yellow and brown; chromium for pink and red; the blues are irradiation-and-heat colour centres',
    colourRange: 'colourless, yellow, orange ("imperial"), pink, red, blue; most blue topaz was colourless when mined',
    clarityType: 'I',
    clarityNote: 'Type I: usually eye-clean, and expected to be.',
    inclusions: 'two- and three-phase fluid inclusions, negative crystals, tear-drop cavities',
    sources: ['Brazil (Ouro Preto, for imperial)', 'Pakistan (Katlang, pink)', 'Sri Lanka', 'Russia (Urals)', 'Nigeria', 'Mexico'],
    treatments: 'irradiation followed by heating makes nearly all blue topaz; coatings ("mystic") are surface films; pink from heating brownish material.',
    history: 'Named for Topazios, an island in the Red Sea that produced peridot, not topaz; the confusion is ancient.',
    birthstone: 'November',
  },
  garnet: {
    key: 'garnet', name: 'Garnet', mineral: 'garnet group (pyrope–almandine)', formula: '(Mg,Fe)₃Al₂(SiO₄)₃',
    system: 'cubic (isometric)', habit: 'rhombic dodecahedra and trapezohedra, often perfect',
    hardness: '7–7½', gravity: 3.95, gravityRange: '3.65–4.20 across the series',
    ri: '1.74–1.81 (almandine 1.79)', birefringence: 'none — singly refractive (anomalous in grossular)', dispersion: 0.024,
    pleochroism: 'none', lustre: 'vitreous',
    cleavage: 'none', fracture: 'conchoidal to uneven',
    chromophore: 'iron in almandine; chromium and iron in pyrope; manganese in spessartine; vanadium and chromium in the green grossulars',
    colourRange: 'red through purplish and orangey red for the pyrope–almandine series; the group as a whole spans orange, green, yellow and colour-change',
    clarityType: 'II',
    clarityNote: 'Type II: usually included, though the red garnets are often clean enough that the grader looks past the colour\'s darkness before the clarity.',
    inclusions: 'needles of rutile (four directions, the source of star garnets), zircon crystals with haloes, apatite, "horsetail" byssolite fibres in demantoid',
    sources: ['India', 'Sri Lanka', 'Madagascar', 'Tanzania', 'Mozambique', 'Czech Republic (Bohemian pyrope)'],
    treatments: 'essentially none; garnet is one of the few gems sold as it comes out of the ground.',
    history: 'Latin granatum, the pomegranate, for the seed-like crystals; Bohemian garnets were the jewellery of the nineteenth century.',
    birthstone: 'January',
  },
  peridot: {
    key: 'peridot', name: 'Peridot', mineral: 'olivine (forsterite)', formula: '(Mg,Fe)₂SiO₄',
    system: 'orthorhombic', habit: 'flattened prisms; mostly found as rolled grains',
    hardness: '6½–7', gravity: 3.34, gravityRange: '3.27–3.37',
    ri: '1.654–1.690', birefringence: '0.035–0.038 — strong; the back facets double visibly', dispersion: 0.020,
    pleochroism: 'weak: yellow-green / green', lustre: 'vitreous, oily',
    cleavage: 'imperfect', fracture: 'conchoidal; brittle',
    chromophore: 'ferrous iron, which is part of the mineral rather than a trace — peridot is one of the few gems coloured by its own chemistry',
    colourRange: 'yellowish green to green; more iron gives a browner, darker stone',
    clarityType: 'II',
    clarityNote: 'Type II: usually included; clean stones over a few carats are expected and the "lily pad" is the tell-tale.',
    inclusions: '"lily pads" (discoid stress fractures round a chromite crystal), chromite and spinel crystals, biotite, negative crystals',
    sources: ['Pakistan (Sapat)', 'Myanmar (Mogok)', 'Arizona (San Carlos)', 'China (Changbai)', 'Egypt (Zabargad, historic)', 'Vietnam'],
    treatments: 'none.',
    history: 'Mined on Zabargad in the Red Sea for three thousand years; the "emeralds" in Cologne\'s Shrine of the Three Kings are peridots. Also found in pallasite meteorites.',
    birthstone: 'August',
  },
  citrine: {
    key: 'citrine', name: 'Citrine', mineral: 'quartz', formula: 'SiO₂ : Fe³⁺',
    system: 'trigonal', habit: 'six-sided prisms terminated by rhombohedra',
    hardness: '7', gravity: 2.65, gravityRange: '2.63–2.66',
    ri: '1.544–1.553', birefringence: '0.009', dispersion: 0.013,
    pleochroism: 'weak', lustre: 'vitreous',
    cleavage: 'none', fracture: 'conchoidal',
    chromophore: 'ferric iron as sub-microscopic particles; natural citrine is pale, and the deep orange "Madeira" colours are heated amethyst',
    colourRange: 'pale yellow through golden to reddish orange',
    clarityType: 'I',
    clarityNote: 'Type I: usually eye-clean.',
    inclusions: 'colour zoning, fluid inclusions, tiger-stripe twinning where it was amethyst',
    sources: ['Brazil (Rio Grande do Sul, Minas Gerais)', 'Bolivia (Anahí, with amethyst as ametrine)', 'Zambia', 'Madagascar', 'Spain'],
    treatments: 'most citrine on the market is amethyst heated to about 450 °C; natural citrine is uncommon.',
    history: 'French citron, the lemon; sold as "topaz" for centuries, and the confusion persists in "gold topaz".',
    birthstone: 'November',
  },
  onyx: {
    key: 'onyx', name: 'Onyx', mineral: 'chalcedony (cryptocrystalline quartz)', formula: 'SiO₂',
    system: 'trigonal, as an aggregate of fibres', habit: 'banded masses, nodules, vein fillings',
    hardness: '6½–7', gravity: 2.60, gravityRange: '2.58–2.64',
    ri: '1.535–1.539 (aggregate)', birefringence: 'aggregate — none seen', dispersion: 0.010,
    pleochroism: 'none', lustre: 'waxy to vitreous when polished',
    cleavage: 'none', fracture: 'conchoidal',
    chromophore: 'carbon and iron oxides in the natural banding; the uniform black of the trade is chalcedony soaked in sugar and carbonised in acid',
    colourRange: 'black, and black-and-white banded; sardonyx where the bands are red-brown',
    clarityType: 'opaque',
    clarityNote: 'Opaque: clarity is not graded. What is judged is the evenness of the black and the polish of the surface.',
    inclusions: 'banding, which is the material itself; pits and porosity that take the dye unevenly',
    sources: ['Brazil', 'India', 'Uruguay', 'Madagascar', 'USA'],
    treatments: 'nearly all black onyx is dyed; the treatment is stable and traditional, and is disclosed as such.',
    history: 'Greek onyx, a fingernail, for the banded pink-and-white sort; cameos have been cut from it since antiquity.',
  },
  moonstone: {
    key: 'moonstone', name: 'Moonstone', mineral: 'feldspar (orthoclase with albite lamellae)', formula: '(K,Na)AlSi₃O₈',
    system: 'monoclinic', habit: 'cleavage masses; cut almost always as a cabochon to show the sheen',
    hardness: '6–6½', gravity: 2.58, gravityRange: '2.56–2.59',
    ri: '1.518–1.526', birefringence: '0.005–0.008', dispersion: 0.012,
    pleochroism: 'none', lustre: 'vitreous, pearly on the sheen',
    cleavage: 'perfect in two directions at 90°', fracture: 'uneven; brittle',
    chromophore: 'the adularescence is not a colour at all: light scattered by alternating layers of orthoclase and albite too thin to resolve, blue where the layers are thinnest',
    colourRange: 'colourless to white body with a blue or white sheen; also grey, peach, green, and the rainbow variety (which is a labradorite)',
    clarityType: 'phenomenal',
    clarityNote: 'A phenomenal stone: judged on its adularescence — how blue, how sharp, how it moves — with the body\'s transparency second. Faceting it, as here, trades the sheen for a look through a stone that is rarely faceted.',
    inclusions: '"centipedes" (short parallel stress cracks in two directions), cleavage cracks, fine needles',
    sources: ['Sri Lanka (Meetiyagoda)', 'India (Bihar, Tamil Nadu)', 'Myanmar', 'Madagascar', 'Tanzania'],
    treatments: 'none.',
    history: 'The Romans thought it solid moonlight. The stone of Art Nouveau: Lalique set it in nearly everything.',
    birthstone: 'June',
  },
};

export const speciesKeys = Object.keys(SPECIES);

/** A clarity grade, with what a grader would see and what a buyer would. */
export interface ClarityGrade {
  code: string;
  name: string;
  /** Under the loupe. */
  loupe: string;
  /** With the eye. */
  eye: string;
}

/** The GIA scale, for diamond. */
export const DIAMOND_CLARITY: ClarityGrade[] = [
  { code: 'FL', name: 'Flawless', loupe: 'no inclusions and no blemishes at 10×', eye: 'nothing, at any distance; fewer than one stone in a thousand' },
  { code: 'IF', name: 'Internally Flawless', loupe: 'no inclusions; minor surface blemishes only', eye: 'nothing' },
  { code: 'VVS1', name: 'Very Very Slightly Included 1', loupe: 'inclusions so slight a skilled grader struggles to find them — a pinpoint seen from the pavilion', eye: 'nothing' },
  { code: 'VVS2', name: 'Very Very Slightly Included 2', loupe: 'inclusions difficult to find at 10×, typically seen from the crown', eye: 'nothing' },
  { code: 'VS1', name: 'Very Slightly Included 1', loupe: 'minor inclusions, difficult to see at 10×: a small crystal, a short feather', eye: 'nothing' },
  { code: 'VS2', name: 'Very Slightly Included 2', loupe: 'minor inclusions, somewhat easy to see at 10×', eye: 'nothing in almost every stone; a large VS2 may show a crystal under the table' },
  { code: 'SI1', name: 'Slightly Included 1', loupe: 'noticeable inclusions, easy to see at 10×: clouds, crystals, feathers', eye: 'usually clean face-up; the best value grade' },
  { code: 'SI2', name: 'Slightly Included 2', loupe: 'noticeable inclusions, very easy to see at 10×', eye: 'often something visible, especially through the table in a step cut' },
  { code: 'I1', name: 'Included 1', loupe: 'obvious inclusions at 10×', eye: 'visible to the unaided eye, though the stone still faces up well' },
  { code: 'I2', name: 'Included 2', loupe: 'obvious inclusions that affect transparency', eye: 'plainly visible; brilliance dulled' },
  { code: 'I3', name: 'Included 3', loupe: 'inclusions that affect transparency and durability', eye: 'plainly visible; the stone may be at risk of breaking' },
];

/** What the trade says of a coloured stone, against what its type leads one to expect. */
export const COLOURED_CLARITY: ClarityGrade[] = [
  { code: 'EC', name: 'Eye-clean', loupe: 'minor inclusions found only with the loupe', eye: 'nothing at 15 cm; the top of the scale for a coloured stone' },
  { code: 'SI', name: 'Slightly included', loupe: 'inclusions easy to find', eye: 'something small on close inspection, not at arm\'s length' },
  { code: 'MI', name: 'Moderately included', loupe: 'inclusions prominent', eye: 'visible without effort, though the stone is still lively' },
  { code: 'HI', name: 'Heavily included', loupe: 'inclusions throughout', eye: 'obvious; transparency and brilliance reduced' },
  { code: 'SV', name: 'Severely included', loupe: 'the stone is more inclusion than not', eye: 'translucent at best; sold for the colour alone, or carved' },
];

export function clarityScale(species: Species): ClarityGrade[] {
  return species.clarityType === 'diamond' ? DIAMOND_CLARITY : COLOURED_CLARITY;
}

/** What the type means: the expectation a grade is judged against. */
export function clarityTypeNote(t: ClarityType): string {
  switch (t) {
    case 'diamond': return 'Graded by the GIA scale: eleven grades from Flawless to Included 3, all at 10× magnification.';
    case 'I': return 'Type I: this species grows clean. A grade is held to a high standard; "eye-clean" means no inclusion at all to the unaided eye.';
    case 'II': return 'Type II: this species usually carries some inclusions. Minor ones do not cost it much; a clean stone is a bonus, not the norm.';
    case 'III': return 'Type III: this species is almost always included. The grade allows what would fail a Type I stone outright.';
    case 'opaque': return 'Opaque: no clarity grade. Surface, polish and evenness of colour are what is judged.';
    case 'phenomenal': return 'A phenomenal stone: the optical effect is graded first and the body\'s clarity second.';
  }
}

/** The GIA colour scale for diamond, grouped as the trade speaks of it. */
export interface DiamondColour { code: string; band: string; note: string }
export const DIAMOND_COLOUR: DiamondColour[] = [
  ...['D', 'E', 'F'].map((c) => ({ code: c, band: 'colourless', note: 'no colour a grader can see against a master set; D is the top of the scale' })),
  ...['G', 'H', 'I', 'J'].map((c) => ({ code: c, band: 'near colourless', note: 'a trace of warmth found only against masters, face-down; face-up the stone reads white' })),
  ...['K', 'L', 'M'].map((c) => ({ code: c, band: 'faint', note: 'a faint yellow that shows face-up in a large stone, and flatters a yellow-gold mount' })),
  ...['N', 'O', 'P', 'Q', 'R'].map((c) => ({ code: c, band: 'very light', note: 'a light tint the eye finds without help' })),
  ...['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((c) => ({ code: c, band: 'light', note: 'a plain light yellow or brown; past Z a stone is a fancy colour and graded the other way, by how much colour it has' })),
];
