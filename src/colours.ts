/**
 * The colour a stone is: the trade's varieties of each species, the
 * diamond's D–Z letters, and a tone and a saturation over them, made into
 * materials the renderer traces with. The renderer's material table is a
 * record heist may add to, so a grade here is a real body colour in the
 * picture and not only a word on the card.
 *
 * Body colours are linear RGB, "what survives a trip through a stone of
 * ordinary size", as the renderer's own are, and are judged by eye against
 * the trade's names rather than measured; the species' own colour from the
 * renderer is always the first variety.
 */
import { metals, type Metal } from 'artshape-render/render/materials';
import { DIAMOND_COLOUR } from './gems';

export type Rgb = [number, number, number];

export interface Variety {
  key: string;
  name: string;
  colour: Rgb;
  note: string;
}

const own = (key: string): Rgb => (metals[key]?.colour ?? [1, 1, 1]) as Rgb;

/** A diamond's letter as a body colour: the Cape series is nitrogen, and nitrogen takes the blue. */
export function diamondGradeColour(code: string): Rgb {
  const i = Math.max(0, DIAMOND_COLOUR.findIndex((g) => g.code === code));
  // D to F look the same to a grader; the curve keeps the first letters together and opens out past J
  const t = Math.pow(i / (DIAMOND_COLOUR.length - 1), 1.5);
  return [0.97, 0.97 - 0.04 * t, 0.98 - 0.34 * t];
}

export const DIAMOND_FANCIES: Variety[] = [
  { key: 'fancy yellow', name: 'fancy vivid yellow', colour: [0.95, 0.80, 0.10], note: 'nitrogen in quantity; the canary of the trade, graded past Z by how much colour it holds' },
  { key: 'fancy pink', name: 'fancy pink', colour: [0.92, 0.55, 0.65], note: 'plastic deformation of the lattice, Argyle\'s signature; no chromophore at all' },
  { key: 'fancy blue', name: 'fancy blue', colour: [0.45, 0.62, 0.92], note: 'boron, a few atoms in a million; the Hope is a Type IIb blue' },
  { key: 'champagne', name: 'champagne (fancy brown)', colour: [0.85, 0.68, 0.45], note: 'brown from deformation; cheap by the carat and warm on the hand' },
];

/** The trade's varieties, the species' own colour first. */
export const VARIETIES: Record<string, Variety[]> = {
  ruby: [
    { key: 'pigeon\'s blood', name: 'pigeon\'s blood', colour: own('ruby'), note: 'pure red with a touch of blue, fluorescing under daylight: Mogok\'s' },
    { key: 'pinkish red', name: 'pinkish red', colour: [0.80, 0.18, 0.24], note: 'lighter in tone; where ruby shades into pink sapphire is a matter of argument' },
    { key: 'purplish red', name: 'purplish red', colour: [0.62, 0.05, 0.20], note: 'more blue in the mix; Mozambique and much Burmese material' },
    { key: 'orangey red', name: 'orangey red (Thai)', colour: [0.70, 0.12, 0.06], note: 'iron alongside the chromium quenches the fluorescence and warms the red' },
  ],
  sapphire: [
    { key: 'blue', name: 'blue', colour: own('sapphire'), note: 'iron and titanium; the blue everything else is measured against' },
    { key: 'cornflower', name: 'cornflower (Kashmir)', colour: [0.12, 0.25, 0.75], note: 'a velvet blue from fine silk scattering the light; the most prized of all' },
    { key: 'royal blue', name: 'royal blue', colour: [0.03, 0.06, 0.45], note: 'deep and saturated, Burmese and Sri Lankan at their best; too dark and it goes inky' },
    { key: 'teal', name: 'teal (Montana)', colour: [0.10, 0.40, 0.45], note: 'blue with green, from more iron; Montana\'s and Australia\'s' },
    { key: 'padparadscha', name: 'padparadscha', colour: [0.92, 0.45, 0.35], note: 'the lotus blossom: pink and orange in one, rare enough to be argued over' },
    { key: 'pink', name: 'pink', colour: [0.90, 0.35, 0.50], note: 'chromium in less than a ruby\'s quantity; Madagascar\'s in abundance' },
    { key: 'yellow', name: 'yellow', colour: [0.92, 0.75, 0.15], note: 'iron alone, or beryllium diffused in; Sri Lanka\'s' },
    { key: 'green', name: 'green', colour: [0.15, 0.40, 0.20], note: 'blue and yellow zoning too fine to resolve; Australian and Thai' },
    { key: 'purple', name: 'purple', colour: [0.45, 0.15, 0.60], note: 'chromium with the iron and titanium' },
    { key: 'white', name: 'white (colourless)', colour: [0.95, 0.95, 0.97], note: 'corundum with nothing in it; Sri Lanka\'s geuda before heating' },
  ],
  emerald: [
    { key: 'bluish green', name: 'bluish green (Colombia)', colour: own('emerald'), note: 'chromium with a little vanadium; Muzo\'s warm green, Chivor\'s cooler' },
    { key: 'pure green', name: 'pure green (Zambia)', colour: [0.05, 0.48, 0.18], note: 'iron alongside the chromium, cooler and often cleaner' },
    { key: 'yellowish green', name: 'yellowish green (Brazil)', colour: [0.25, 0.60, 0.15], note: 'lighter and yellower; where it fades to pale it is a green beryl' },
  ],
  amethyst: [
    { key: 'purple', name: 'purple', colour: own('amethyst'), note: 'the ordinary fine colour, Uruguay and Zambia' },
    { key: 'lilac', name: 'lilac (rose de France)', colour: [0.62, 0.45, 0.78], note: 'pale and pinkish; plentiful and cheap' },
    { key: 'siberian', name: 'Siberian (deep, with red and blue flashes)', colour: [0.30, 0.08, 0.45], note: 'the Uralian ideal, rarely from the Urals now' },
  ],
  aquamarine: [
    { key: 'aquamarine', name: 'aquamarine', colour: own('aquamarine'), note: 'the ordinary greenish blue after heating' },
    { key: 'pale', name: 'pale', colour: [0.60, 0.85, 0.88], note: 'most of what is dug; the colour builds only in a large stone' },
    { key: 'santa maria', name: 'Santa Maria (deep blue)', colour: [0.18, 0.55, 0.80], note: 'the saturated blue of Santa Maria de Itabira, and of Mozambique\'s best' },
  ],
  topaz: [
    { key: 'imperial', name: 'imperial (orange)', colour: own('topaz'), note: 'Ouro Preto\'s; the only topaz the trade calls precious' },
    { key: 'sherry', name: 'sherry (pinkish orange)', colour: [0.85, 0.40, 0.25], note: 'imperial with chromium; heated it goes pink' },
    { key: 'pink', name: 'pink', colour: [0.90, 0.50, 0.60], note: 'chromium; Katlang\'s natural pink, or heated sherry' },
    { key: 'swiss blue', name: 'Swiss blue', colour: [0.25, 0.70, 0.92], note: 'irradiated and heated colourless topaz; bright and cheap' },
    { key: 'london blue', name: 'London blue', colour: [0.08, 0.35, 0.55], note: 'the same treatment run further, to an inky steel blue' },
    { key: 'colourless', name: 'colourless', colour: [0.95, 0.95, 0.96], note: 'as most of it comes out; sold as a diamond stand-in once' },
  ],
  garnet: [
    { key: 'almandine', name: 'almandine', colour: own('garnet'), note: 'iron; the dark red of Victorian jewellery' },
    { key: 'pyrope', name: 'pyrope (Bohemian)', colour: [0.60, 0.05, 0.04], note: 'magnesium with chromium; a purer, fierier red, small stones by the hundred' },
    { key: 'rhodolite', name: 'rhodolite', colour: [0.62, 0.15, 0.35], note: 'pyrope and almandine mixed, to a raspberry purple' },
    { key: 'spessartine', name: 'spessartine (mandarin)', colour: [0.95, 0.40, 0.05], note: 'manganese; Namibia\'s orange, as bright as the group gets' },
    { key: 'tsavorite', name: 'tsavorite', colour: [0.10, 0.55, 0.20], note: 'grossular with vanadium; Kenya and Tanzania, an emerald green without the jardin' },
    { key: 'demantoid', name: 'demantoid', colour: [0.25, 0.65, 0.15], note: 'andradite with chromium; more fire than a diamond, the Urals\' horsetails inside' },
  ],
  peridot: [
    { key: 'peridot', name: 'peridot', colour: own('peridot'), note: 'the ordinary olive' },
    { key: 'yellowish', name: 'yellowish (Arizona)', colour: [0.65, 0.75, 0.12], note: 'San Carlos\', small and yellow-green' },
    { key: 'deep', name: 'deep (Pakistan)', colour: [0.35, 0.60, 0.06], note: 'Sapat\'s, large enough to hold a saturated green' },
  ],
  citrine: [
    { key: 'golden', name: 'golden', colour: own('citrine'), note: 'the ordinary heated colour' },
    { key: 'lemon', name: 'lemon', colour: [0.92, 0.80, 0.25], note: 'pale natural citrine, or lightly heated' },
    { key: 'madeira', name: 'Madeira (reddish)', colour: [0.80, 0.35, 0.08], note: 'amethyst heated hard, to the colour of the wine' },
  ],
  onyx: [
    { key: 'black', name: 'black', colour: own('onyx'), note: 'dyed, almost always; an even black is the whole of the grade' },
    { key: 'chalcedony', name: 'chalcedony (grey-blue)', colour: [0.55, 0.62, 0.70], note: 'undyed; the material as it comes' },
  ],
  moonstone: [
    { key: 'white', name: 'white', colour: own('moonstone'), note: 'the ordinary body; the sheen is not modelled' },
    { key: 'peach', name: 'peach', colour: [0.85, 0.70, 0.55], note: 'India\'s; a warm body under a white sheen' },
    { key: 'grey', name: 'grey', colour: [0.55, 0.56, 0.60], note: 'the smoky sort, with a blue sheen' },
    { key: 'green', name: 'green', colour: [0.65, 0.78, 0.60], note: 'pale green body; less common' },
  ],
};

/** A colour under a tone and a saturation: tone as a power, since a darker stone is a longer path; saturation toward and away from the grey of the same brightness. */
export function graded(base: Rgb, tone: number, saturation: number): Rgb {
  const toned = base.map((v) => Math.pow(Math.min(Math.max(v, 1e-3), 1), tone)) as Rgb;
  const lum = 0.2126 * toned[0] + 0.7152 * toned[1] + 0.0722 * toned[2];
  return toned.map((v) => Math.min(Math.max(lum + (v - lum) * saturation, 0), 1)) as Rgb;
}

/** The choices for a species: letters and fancies for diamond, varieties for the rest. */
export function colourChoices(species: string): Array<{ value: string; label: string }> {
  if (species === 'diamond') {
    return [
      ...DIAMOND_COLOUR.map((g) => ({ value: g.code, label: `${g.code} — ${g.band}` })),
      ...DIAMOND_FANCIES.map((f) => ({ value: f.key, label: f.name })),
    ];
  }
  return (VARIETIES[species] ?? []).map((v) => ({ value: v.key, label: v.name }));
}

export function colourNote(species: string, key: string): { name: string; note: string } {
  if (species === 'diamond') {
    const fancy = DIAMOND_FANCIES.find((f) => f.key === key);
    if (fancy) return { name: fancy.name, note: fancy.note };
    const g = DIAMOND_COLOUR.find((x) => x.code === key) ?? DIAMOND_COLOUR[0];
    return { name: `${g.code}, ${g.band}`, note: g.note };
  }
  const v = (VARIETIES[species] ?? []).find((x) => x.key === key) ?? VARIETIES[species]?.[0];
  return v ? { name: v.name, note: v.note } : { name: species, note: '' };
}

/** The body colour of a choice, before tone and saturation. */
export function baseColour(species: string, key: string): Rgb {
  if (species === 'diamond') {
    const fancy = DIAMOND_FANCIES.find((f) => f.key === key);
    return fancy ? fancy.colour : diamondGradeColour(key);
  }
  const v = (VARIETIES[species] ?? []).find((x) => x.key === key);
  return v ? v.colour : own(species);
}

/**
 * The material for a species in a colour, at a tone and a saturation:
 * written into the renderer's table under its own name — the species'
 * optics, this body colour — and the name returned for the part to wear.
 * One name per species, rewritten as the choice changes, so the table does
 * not fill with every grade that was ever looked at.
 */
export function colouredMaterial(species: string, key: string, tone = 1, saturation = 1): string {
  const parent = metals[species];
  if (!parent) return species;
  const name = `${species} (graded)`;
  const m: Metal = { ...parent, name, measured: false, colour: graded(baseColour(species, key), tone, saturation) };
  metals[name] = m;
  return name;
}
