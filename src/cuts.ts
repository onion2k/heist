/**
 * The cuts: what each is, where it came from, what a cutter aims for in it,
 * and what its rows of facets are called. The keys are the renderer's own
 * cut names, so choosing one here is choosing the outline and the tiers the
 * part is built from; the proportions the model actually comes out with are
 * measured off the mesh in analysis.ts and set beside the trade's figures.
 */
import type { GemCut } from 'artshape-render/parts/gem';

export type CutFamily = 'brilliant' | 'old' | 'step' | 'shape' | 'other';

export const FAMILIES: Array<{ key: CutFamily; name: string }> = [
  { key: 'brilliant', name: 'Brilliants' },
  { key: 'old', name: 'Old and single cuts' },
  { key: 'step', name: 'Step cuts' },
  { key: 'shape', name: 'Calibrated shapes, cut in steps' },
  { key: 'other', name: 'Roses, drops and domes' },
];

export interface Guide {
  /** Trade-typical ranges, as text: "52–62 %". */
  table?: string;
  depth?: string;
  crownAngle?: string;
  pavilionAngle?: string;
  ratio?: string;
  girdle?: string;
  /** A one-line source or caveat. */
  note: string;
}

export interface CutInfo {
  key: GemCut;
  name: string;
  family: CutFamily;
  aka: string;
  description: string;
  history: string;
  /** The facet count of the real cut, as the trade counts it. */
  canonical: string;
  guide: Guide;
  /**
   * Names for the bands of facets the model comes out with, from the girdle
   * outward: the crown's rows going up to the table, the pavilion's going
   * down to the culet. A model with more bands than names gets numbered.
   */
  bands: { crown: string[]; pavilion: string[] };
  /** Which species it suits, and why. */
  suits: string;
  /** The outline is a curve sampled round, so the count of facets can be chosen. */
  curved: boolean;
  hasTable: boolean;
}

/** The trade's rows, as the round and the oval are built. */
const LAYOUT_BANDS = {
  crown: ['upper-girdle facets', 'bezel (kite) facets', 'star facets'],
  pavilion: ['lower-girdle facets', 'pavilion mains'],
};
/** The fancy outlines are built from tiers and come out as bands of triangles. */
const TIERED_BANDS = {
  crown: ['bezel and upper-girdle facets', 'star facets'],
  pavilion: ['lower-girdle facets', 'pavilion mains'],
};
const STEP_BANDS = (crown: number, pavilion: number) => ({
  crown: Array.from({ length: crown }, (_, i) => `crown step ${i + 1}`),
  pavilion: Array.from({ length: pavilion }, (_, i) => (i === pavilion - 1 ? `pavilion step ${i + 1} (to the keel)` : `pavilion step ${i + 1}`)),
});
const STEP_GUIDE = (ratio: string, note = 'trade-typical ranges for a step-cut accent stone'): Guide =>
  ({ table: '55–70 %', depth: '55–68 %', ratio, girdle: 'thin to medium', note });

const cut = (c: Omit<CutInfo, 'curved' | 'hasTable'> & Partial<Pick<CutInfo, 'curved' | 'hasTable'>>): CutInfo =>
  ({ curved: false, hasTable: true, ...c });

export const CUTS: Record<GemCut, CutInfo> = {
  brilliant: cut({
    key: 'brilliant', name: 'Round brilliant', family: 'brilliant', aka: 'round, RBC, "diamond cut"', curved: true,
    description: 'The cut that returns the most light: a round girdle, a crown of kites and stars over it, and a pavilion of mains and halves under it meeting at a point. Every facet is angled so that light entering the table is reflected off both sides of the pavilion and sent back out through the crown.',
    history: 'Worked out by trial in Venice and Antwerp through the seventeenth century, and by calculation in Marcel Tolkowsky\'s 1919 thesis, which set the angles the trade still quotes. Ninety per cent of the diamonds sold are round brilliants.',
    canonical: '57 facets, 58 with a culet: 1 table, 8 stars, 8 bezels, 16 upper halves; 16 lower halves, 8 mains — and 16 round the girdle, which the trade does not count',
    guide: { table: '52–62 %', depth: '57.5–63 %', crownAngle: '31.5–36.5°', pavilionAngle: '40.6–41.8°', girdle: 'thin to slightly thick', ratio: '1.00–1.02', note: 'the GIA\'s "Excellent" ranges for a round diamond' },
    bands: LAYOUT_BANDS,
    suits: 'Diamond above all, and any stone with fire to show. In a coloured stone it lightens the colour, which suits a dark garnet and can wash out a pale aquamarine.',
  }),
  oval: cut({
    key: 'oval', name: 'Oval brilliant', family: 'brilliant', aka: 'oval', curved: true,
    description: 'A round brilliant\'s facets stretched over an elliptical girdle. It faces up larger than a round of the same weight and flatters a hand, and it pays for the stretch with a bow-tie: a dark band across the middle where the pavilion facets no longer return light to the eye.',
    history: 'Lazare Kaplan\'s cut, from 1957, though ovals of a sort were cut for centuries before the facets were worked out.',
    canonical: '57 or 58 facets, arranged as a round\'s over an oval girdle',
    guide: { table: '53–63 %', depth: '58–66 %', ratio: '1.30–1.50', girdle: 'thin to slightly thick', note: 'trade-typical ranges; the bow-tie is the fault to look for' },
    bands: LAYOUT_BANDS,
    suits: 'Sapphire and ruby, where the rough is often elongated; diamond, where it makes a carat look larger.',
  }),
  pear: cut({
    key: 'pear', name: 'Pear brilliant', family: 'brilliant', aka: 'teardrop, pendeloque', curved: true,
    description: 'One round end and one pointed, with brilliant facets over both. The point is fragile and is the reason for a V-prong; the shoulders should be full and even, and the bow-tie is watched for as in an oval.',
    history: 'The pendeloque of the fifteenth century, from Lodewyk van Berquem of Bruges, who is credited with the first symmetrical faceting. The Cullinan I, at 530 carats, is a pear.',
    canonical: '58 facets, typically: the round\'s arrangement, with the pavilion mains gathered toward the point',
    guide: { table: '53–63 %', depth: '58–66 %', ratio: '1.45–1.75', girdle: 'thin to slightly thick, thicker at the point', note: 'trade-typical ranges' },
    bands: TIERED_BANDS,
    suits: 'Anything worn hanging: drops, pendants. Aquamarine and the paler beryls take the shape well because the point does not go dark.',
  }),
  marquise: cut({
    key: 'marquise', name: 'Marquise brilliant', family: 'brilliant', aka: 'navette', curved: true,
    description: 'Pointed at both ends, the longest outline for its weight, cut with brilliant facets. The two points are the most fragile things in gem cutting and are set in V-prongs; a stone this long shows a bow-tie unless the pavilion is cut for it.',
    history: 'Ordered by Louis XV, the story goes, to match the smile of the Marquise de Pompadour; navette is the French for a little boat.',
    canonical: '58 facets, typically',
    guide: { table: '53–63 %', depth: '58–65 %', ratio: '1.75–2.25', girdle: 'thin to slightly thick, thicker at the points', note: 'trade-typical ranges' },
    bands: TIERED_BANDS,
    suits: 'Diamond, for the spread; ruby and sapphire, for elongated rough. A poor choice for a soft or cleavable stone because of the points.',
  }),
  heart: cut({
    key: 'heart', name: 'Heart brilliant', family: 'brilliant', aka: 'heart', curved: true,
    description: 'A pear with a cleft cut into its round end, faceted as a brilliant. The two lobes must match and the cleft must be sharp and reach a third of the way down, which wastes rough; the point is set in a V-prong and the cleft is the first place a careless cutter leaves a window.',
    history: 'Hearts appear in the sixteenth century — Mary Queen of Scots sent Elizabeth a heart-shaped diamond in 1562 — and were a favourite of the Georgian jeweller. The modern brilliant heart dates from the same work as the pear and marquise.',
    canonical: '56 to 59 facets, typically',
    guide: { table: '53–63 %', depth: '56–66 %', ratio: '0.90–1.10', girdle: 'thin to slightly thick, thicker at the point and the cleft', note: 'trade-typical ranges; symmetry of the lobes is the whole judgement' },
    bands: TIERED_BANDS,
    suits: 'Diamond and ruby for sentiment\'s sake; rarely cut under a carat because the shape needs size to read.',
  }),
  trillion: cut({
    key: 'trillion', name: 'Trillion', family: 'brilliant', aka: 'trilliant, trillian', curved: true,
    description: 'A triangle with curved or straight sides and brilliant-style facets, shallow for its width, so it faces up large and bright. The three corners are as fragile as a marquise\'s points and are set in corner prongs.',
    history: 'An Amsterdam cut of 1962, from the Asscher family, and trademarked as the "Trilliant" in America by Leon Finker in the 1970s; it became the standard side stone of the 1980s.',
    canonical: '31 to 50 facets depending on the maker; 44 is common',
    guide: { table: '55–65 %', depth: '32–48 %', ratio: '1.00 (equilateral)', girdle: 'medium to thick at the corners', note: 'trade-typical ranges; a trillion is cut shallow on purpose' },
    bands: TIERED_BANDS,
    suits: 'Side stones beside a centre stone; any brightly coloured stone that can afford to be shallow — garnet, sapphire, tourmaline.',
  }),
  cushion: cut({
    key: 'cushion', name: 'Cushion brilliant', family: 'brilliant', aka: 'pillow cut, cushion modified brilliant', curved: true,
    description: 'A square or slightly long outline with rounded corners and brilliant facets over it, softer in outline than a princess and warmer in light than a round. The modern "modified" cushion adds a row of facets to the pavilion for a crushed-ice look; the classic keeps the round\'s arrangement.',
    history: 'The old mine cut\'s outline brought forward with modern angles; revived in the 1990s and now the second most popular diamond shape.',
    canonical: '58 facets in the classic cushion; 64 and more in the modified',
    guide: { table: '58–65 %', depth: '61–68 %', ratio: '1.00–1.05 square, 1.15–1.30 elongated', girdle: 'thin to slightly thick', note: 'trade-typical ranges' },
    bands: TIERED_BANDS,
    suits: 'Diamond, sapphire and ruby; the shape most sapphire rough falls into naturally.',
  }),
  princess: cut({
    key: 'princess', name: 'Princess', family: 'brilliant', aka: 'square modified brilliant',
    description: 'A square with sharp corners and a brilliant-style pavilion of chevrons under a bevelled crown, meeting at a point. It keeps more of an octahedral crystal than any other cut, which is why a princess is cheaper per carat than a round; the four corners are its weakness and are always set under prongs.',
    history: 'Arpad Nagy\'s "profile cut" of 1961 and Basil Watermeyer\'s Barion of 1971 led to it; the princess proper was cut and named by Betzalel Ambar and Israel Itzkowitz in 1980. The second most common diamond cut of the 2000s.',
    canonical: '57 to 76 facets: the table, a bevelled crown, and two, three or four chevrons on each pavilion main',
    guide: { table: '62–75 %', depth: '64–75 %', ratio: '1.00–1.05', girdle: 'thin to thick at the corners', note: 'trade-typical ranges; the model has two chevrons a side' },
    bands: { crown: ['crown bevel'], pavilion: ['chevron facets', 'pavilion mains'] },
    suits: 'Diamond, for which it was designed; too fragile at the corners for a soft stone.',
  }),
  radiant: cut({
    key: 'radiant', name: 'Radiant', family: 'brilliant', aka: 'cut-cornered rectangular modified brilliant',
    description: 'An emerald cut\'s outline — a rectangle with the corners cut off — with a brilliant\'s facets under it instead of steps. The crushed-ice sparkle hides inclusions and colour where a step cut would show them; it was invented to make yellow diamonds look yellower.',
    history: 'Henry Grossbard, New York, 1977: the first cut to put brilliant faceting on a square outline, and the ancestor of the princess.',
    canonical: '70 facets in Grossbard\'s design',
    guide: { table: '61–69 %', depth: '61–67 %', ratio: '1.00–1.05 square, 1.20–1.50 rectangular', girdle: 'thin to slightly thick', note: 'trade-typical ranges' },
    bands: { crown: ['crown bevel'], pavilion: ['chevron facets', 'pavilion mains'] },
    suits: 'Fancy yellow diamond, which the cut concentrates; any stone whose colour wants deepening.',
  }),
  oldEuropean: cut({
    key: 'oldEuropean', name: 'Old European cut', family: 'old', aka: 'OEC, old Euro', curved: true,
    description: 'The brilliant before Tolkowsky: round, with a small table, a high crown, short star facets and a pavilion that ends in an open culet you can see through the table as a dark circle. Cut for candlelight, it throws broad flashes of colour rather than the modern cut\'s pinpoint sparkle.',
    history: 'The standard round diamond from about 1890 to the 1930s, cut with the new bruting machine that made a true circle possible. Superseded by the modern brilliant, and now sought out for the character the new cut lost.',
    canonical: '58 facets: the modern brilliant\'s, but the culet is a facet you can see',
    guide: { table: '38–48 %', depth: '60–70 %', crownAngle: '35–45°', pavilionAngle: '40–45°', girdle: 'very thin to medium, often frosted', ratio: '1.00–1.04', note: 'ranges of surviving stones; no standard was ever set' },
    bands: { crown: ['bezel and upper-girdle facets', 'star facets'], pavilion: ['lower-girdle facets', 'pavilion mains (to the culet)'] },
    suits: 'Diamond in period settings, and in new work that wants the old fire.',
  }),
  oldMine: cut({
    key: 'oldMine', name: 'Old mine cut', family: 'old', aka: 'miner\'s cut, cushion old cut', curved: true,
    description: 'The old European\'s ancestor and the cushion\'s: a squarish, rounded outline following the rough, a high crown, a small table and a large open culet, cut by hand and eye so no two are alike. Chunky, deep and bright in low light.',
    history: 'The cut of the eighteenth and nineteenth centuries, before bruting made a round girdle easy; "old mine" was the trade\'s name for stones from the Brazilian and Indian mines as against the new South African ones.',
    canonical: '58 facets, arranged as a brilliant\'s over a cushion girdle',
    guide: { table: '35–45 %', depth: '62–72 %', crownAngle: '38–45°', pavilionAngle: '40–46°', girdle: 'thin to thick, uneven', ratio: '1.00–1.10', note: 'ranges of surviving stones; every one was cut to its rough' },
    bands: { crown: ['bezel and upper-girdle facets', 'star facets'], pavilion: ['lower-girdle facets', 'pavilion mains (to the culet)'] },
    suits: 'Diamond; the cut Georgian and Victorian jewellery is full of.',
  }),
  eight: cut({
    key: 'eight', name: 'Single cut', family: 'old', aka: 'eight cut, huit-huit', curved: true,
    description: 'The simplest brilliant: a table, eight crown facets running from it to the girdle, and eight pavilion facets to a point. Cut on stones too small for anything more, it shows a plain sparkle rather than fire.',
    history: 'The seventeenth-century "single cut" that the full brilliant grew from, and still the way melee under a millimetre or two was cut until laser and automated cutting made full brilliants cheap at that size.',
    canonical: '17 facets, 18 with a culet',
    guide: { table: '50–60 %', depth: '55–62 %', note: 'melee is not graded for proportions' },
    bands: { crown: ['crown facets'], pavilion: ['pavilion facets'] },
    suits: 'Diamond melee in pavé and watch bezels; the stones you do not look at one at a time.',
  }),
  swiss: cut({
    key: 'swiss', name: 'Swiss cut', family: 'old', aka: 'Swiss brilliant', curved: true,
    description: 'Halfway between the single cut and the full brilliant: the eight cut\'s crown and pavilion, each with a second row of facets added, over an eight-sided girdle. More sparkle than a single cut for small stones, at less work than a brilliant.',
    history: 'A nineteenth-century compromise for the small-stone trade, named for the Swiss watch-jewel cutters who used it.',
    canonical: '33 facets, 34 with a culet',
    guide: { table: '50–60 %', depth: '55–63 %', note: 'melee is not graded for proportions' },
    bands: { crown: ['bezel facets', 'star facets'], pavilion: ['lower facets', 'pavilion mains'] },
    suits: 'Diamond melee, a little larger than the single cut\'s.',
  }),
  step: cut({
    key: 'step', name: 'Emerald (step) cut', family: 'step', aka: 'emerald cut, step cut, octagon',
    description: 'A rectangle with the corners cut off and rows of long, parallel facets running round it like steps, on the crown and on the pavilion, meeting a keel rather than a point. No brilliance to speak of, and no fire: what it shows is the colour, the clarity, and a hall-of-mirrors flash as the stone turns.',
    history: 'The oldest faceting there is — the table cut of the fifteenth century is a step cut with one step — refined for emerald because the cut corners protect a brittle stone and the long facets show a clean one. Named for the stone, then applied to every other.',
    canonical: '57 facets in the classic form: the table, 3 rows of 8 on the crown, 3 rows of 8 on the pavilion, and the keel',
    guide: { table: '61–69 %', depth: '61–67 %', ratio: '1.30–1.50', girdle: 'thin to slightly thick', note: 'trade-typical ranges for an emerald-cut diamond; emerald itself is cut deeper to hold colour' },
    bands: STEP_BANDS(2, 3),
    suits: 'Emerald, for which it was made; any stone whose colour is the point and whose clarity can stand a window into it. Unforgiving of inclusions, which the open table shows plainly.',
  }),
  asscher: cut({
    key: 'asscher', name: 'Asscher', family: 'step', aka: 'square emerald cut, Royal Asscher',
    description: 'A square step cut with wide cut corners, a small table, a high crown and three rows of steps each side, so that through the table one sees the steps of the pavilion meeting in a windmill of concentric squares. Deeper and more architectural than an emerald cut.',
    history: 'Joseph Asscher\'s cut of 1902, patented in Amsterdam; the firm that cleaved the Cullinan. The Royal Asscher of 2001 added a row of facets to the original.',
    canonical: '58 facets in the 1902 cut; 74 in the Royal Asscher',
    guide: { table: '55–65 %', depth: '60–68 %', ratio: '1.00–1.04', girdle: 'thin to slightly thick', note: 'trade-typical ranges' },
    bands: STEP_BANDS(3, 3),
    suits: 'Diamond of high clarity, which the cut demands and rewards; Art Deco settings.',
  }),
  baguette: cut({
    key: 'baguette', name: 'Baguette', family: 'step', aka: 'baguette, bar',
    description: 'A long narrow rectangle, square-cornered, with a single row of step facets on the crown and one or two on the pavilion; the simplest cut still made. Small and set in rows, channels and halos; it shows nothing but colour and a bar of light.',
    history: 'The French for a little rod or a loaf. Cartier made it the signature of Art Deco from the 1920s, set in lines between the geometry of platinum.',
    canonical: '14 facets: the table, 4 crown, 4 girdle, 4 pavilion and the keel; 24 in a tapered form',
    guide: { table: '65–80 %', depth: '55–70 %', ratio: '1.50–2.50', girdle: 'thin', note: 'trade-typical ranges; baguettes are graded loosely, in lots' },
    bands: { crown: ['crown bevel'], pavilion: ['pavilion step', 'keel facets'] },
    suits: 'Diamond as an accent stone; onyx, ruby and sapphire in channel-set lines. Rarely cut in a soft stone because the corners chip.',
  }),
  tapered: cut({
    key: 'tapered', name: 'Tapered baguette', family: 'step', aka: 'tapered baguette, taper',
    description: 'A baguette narrower at one end than the other, so that a row of them can follow a curve or flank a centre stone and draw the eye toward it. Cut and set in matched pairs.',
    history: 'Art Deco again: the shape that let platinum settings of the 1920s taper a shoulder of diamonds to nothing.',
    canonical: '14 facets, as the baguette',
    guide: { table: '65–80 %', depth: '55–70 %', ratio: '1.50–2.50, the narrow end 55–75 % of the wide', girdle: 'thin', note: 'trade-typical ranges' },
    bands: { crown: ['crown bevel'], pavilion: ['pavilion step', 'keel facets'] },
    suits: 'Diamond beside a centre stone, in pairs.',
  }),
  carre: cut({
    key: 'carre', name: 'Carré', family: 'step', aka: 'square step cut, carré',
    description: 'A square step cut with the corners left sharp: the emerald cut\'s steps without its cut corners, small and made to sit edge to edge in a line with no metal showing between. The sharp corners make it the most fragile of the step cuts.',
    history: 'French for square; a calibrated accent shape of the Art Deco workshops, and again of invisible settings since the 1930s.',
    canonical: '25 facets, typically: the table, two rows of 4 each side, the girdle and the keel',
    guide: STEP_GUIDE('1.00'),
    bands: STEP_BANDS(2, 3),
    suits: 'Diamond, ruby and sapphire in invisible and channel settings.',
  }),
  tableCut: cut({
    key: 'tableCut', name: 'Table cut', family: 'step', aka: 'table-cut, tafelstein',
    description: 'The first cut with a flat top: an octahedral crystal with one point ground off to a table and the other to a small flat culet, and its four faces polished. What it shows is the stone\'s own crystal shape; there is almost no light return, and old table cuts read black in the middle.',
    history: 'The cut of the fourteenth and fifteenth centuries, before the rose: the "point cut" was a polished octahedron and the table cut sawed its tip off. Every diamond in a portrait before 1600 is one.',
    canonical: '9 facets: the table, 4 crown, 4 pavilion, and the culet',
    guide: { table: '50–70 %', depth: '55–65 %', note: 'a period cut; there was never a standard' },
    bands: { crown: ['crown bevel'], pavilion: ['pavilion bevel (to the culet)'] },
    suits: 'Diamond in reproduction and period work; the cut of the Renaissance.',
  }),
  french: cut({
    key: 'french', name: 'French cut', family: 'step', aka: 'French-cut square',
    description: 'A square whose table is turned through forty-five degrees, so the crown is eight triangles rising to a diamond-shaped table, over a four-sided pavilion to a point. A cross of light through the table; the shape of choice for calibrated Art Deco borders.',
    history: 'A seventeenth-century cut, revived by the Art Deco houses of Paris for the small stones between the big ones, and named for them.',
    canonical: '13 facets, with the table: 8 crown, 4 pavilion',
    guide: STEP_GUIDE('1.00', 'trade-typical ranges; the cut is judged on the cross through the table'),
    bands: { crown: ['crown triangles'], pavilion: ['pavilion facets'] },
    suits: 'Diamond and sapphire in calibrated lines.',
  }),
  hexagon: cut({
    key: 'hexagon', name: 'Hexagon', family: 'shape', aka: 'hexagonal step cut',
    description: 'Six sides, cut in steps, a little longer than it is wide. A geometric accent that has come back with the taste for Art Deco lines; the six corners are more robust than a square\'s four.',
    history: 'Cut for salt-and-pepper and rough diamonds in the last decade, where the outline shows the crystal; a calibrated shape in the 1920s before that.',
    canonical: '37 facets, typically',
    guide: STEP_GUIDE('1.05–1.25'),
    bands: STEP_BANDS(2, 3),
    suits: 'Salt-and-pepper diamond, sapphire, and any included stone the step cut\'s window would flatter.',
  }),
  octagon: cut({
    key: 'octagon', name: 'Octagon', family: 'shape', aka: 'octagonal step cut',
    description: 'A regular octagon cut in steps: an emerald cut made equal on all sides, with the cut corners as long as the sides. Symmetrical in every direction, so it sits well in a halo.',
    history: 'The emerald cut\'s outline taken to its limit; a calibrated shape of the twentieth century.',
    canonical: '49 facets, typically',
    guide: STEP_GUIDE('1.00'),
    bands: STEP_BANDS(2, 3),
    suits: 'Any coloured stone of good clarity; a fine outline for a signet.',
  }),
  kite: cut({
    key: 'kite', name: 'Kite', family: 'shape', aka: 'kite shape',
    description: 'Four sides, two short and two long, meeting at a point at each end, cut in steps. An accent shape whose points are set at the ends of a line of stones, or which is worn alone on its side as a geometric.',
    history: 'A calibrated shape of the Art Deco workshops, and of the contemporary geometric taste since about 2015.',
    canonical: '25 facets, typically',
    guide: STEP_GUIDE('1.40–1.80'),
    bands: STEP_BANDS(2, 3),
    suits: 'Diamond and salt-and-pepper diamond; too pointed for a soft stone.',
  }),
  lozenge: cut({
    key: 'lozenge', name: 'Lozenge', family: 'shape', aka: 'rhombus, diamond shape',
    description: 'A rhombus — the diamond of a playing card — cut in steps, pointed at all four corners. Set as accents in a line, where each fills the gap the next leaves.',
    history: 'One of the calibrated Art Deco shapes; the word is the heraldic one for the same figure.',
    canonical: '25 facets, typically',
    guide: STEP_GUIDE('1.30–1.70'),
    bands: STEP_BANDS(2, 3),
    suits: 'Diamond in geometric settings.',
  }),
  shield: cut({
    key: 'shield', name: 'Shield', family: 'shape', aka: 'shield cut',
    description: 'A straight top edge, two sloping shoulders and a point below: a heraldic shield cut in steps. Worn point-down as a pendant or as the end stone of a line.',
    history: 'An Art Deco calibrated shape, revived with the kite and the lozenge.',
    canonical: '31 facets, typically',
    guide: STEP_GUIDE('1.20–1.45'),
    bands: STEP_BANDS(2, 3),
    suits: 'Diamond and sapphire in geometric work.',
  }),
  halfMoon: cut({
    key: 'halfMoon', name: 'Half-moon', family: 'shape', aka: 'half moon, demi-lune',
    description: 'A straight edge and an arc, cut in steps: half a round or half an oval. Always cut in matched pairs and set with the straight edges toward a centre stone, which they flank like brackets.',
    history: 'A side-stone shape of the twentieth century; the pair of half-moons beside an emerald cut is a classic three-stone ring.',
    canonical: '37 facets, typically',
    guide: STEP_GUIDE('0.45–0.65, the straight edge the longer', 'trade-typical ranges; cut and matched in pairs'),
    bands: STEP_BANDS(2, 3),
    suits: 'Diamond beside a centre stone, in pairs.',
  }),
  bullet: cut({
    key: 'bullet', name: 'Bullet', family: 'shape', aka: 'bullet cut',
    description: 'A rectangle brought to a point at one end, cut in steps. Set in pairs pointing away from a centre stone, or in lines pointing round a band; the point is the fragile part and is set under metal.',
    history: 'An Art Deco calibrated shape, made for the shoulders of a ring.',
    canonical: '31 facets, typically',
    guide: STEP_GUIDE('1.50–2.20', 'trade-typical ranges; cut and matched in pairs'),
    bands: STEP_BANDS(2, 3),
    suits: 'Diamond as a shoulder stone, in pairs.',
  }),
  rose: cut({
    key: 'rose', name: 'Rose cut', family: 'other', aka: 'rosette, Antwerp rose, Dutch rose', curved: true, hasTable: false,
    description: 'A flat back and a dome of triangular facets rising to a point, with no pavilion at all. It sits low on the hand, glints rather than blazes, and shows the colour of whatever it is set over, which is why the old ones are foiled.',
    history: 'Antwerp, about 1520, and the standard diamond cut for two centuries until the brilliant; Georgian jewellery is full of them. Revived in the last twenty years for the softer sparkle.',
    canonical: '24 facets in the full Dutch rose: 6 star facets round the apex and 18 cross facets to the edge; 12 and 6 in the half-rose',
    guide: { depth: '30–50 % of the width, all of it crown', table: 'none — the facets meet at the apex', note: 'a rose has no standard proportions; what is judged is symmetry and the meeting of the facets at the point' },
    bands: { crown: ['cross facets', 'star facets (to the apex)'], pavilion: [] },
    suits: 'Diamond in period and revival work; garnet, ruby and sapphire in flat settings; any stone whose rough is too thin for a pavilion.',
  }),
  doubleRose: cut({
    key: 'doubleRose', name: 'Double rose', family: 'other', aka: 'double Dutch rose, double rosette', curved: true, hasTable: false,
    description: 'A rose cut on both sides: two domes of triangles back to back with a girdle between and no flat anywhere, so it can be worn either way up or hung so it turns. What a briolette is to a pear, the double rose is to a rose.',
    history: 'Cut from the seventeenth century for pendants and earrings that swing; the "pendeloque" of the period was often a double rose.',
    canonical: '48 facets in the full form: two Dutch roses of 24',
    guide: { depth: '55–70 % of the width', table: 'none', note: 'judged on symmetry between the two halves' },
    bands: { crown: ['cross facets', 'star facets (to the apex)'], pavilion: ['cross facets', 'star facets (to the apex)'] },
    suits: 'Diamond in period earrings; any stone worn hanging.',
  }),
  briolette: cut({
    key: 'briolette', name: 'Briolette', family: 'other', aka: 'briolette, drop', curved: true, hasTable: false,
    description: 'A drop covered entirely in triangular facets, round in section, pointed at the top where it is drilled to hang and rounded or pointed below. No table, no girdle, no pavilion: every facet faces some direction, so it sparkles from every angle as it swings.',
    history: 'The Indian cut of the Mughal treasuries, and of the Briolette of India, at 90 carats the largest diamond so cut. Cut in the West from the seventeenth century for earrings and tiaras that move.',
    canonical: '84 facets in a common form; anything from 50 to 100',
    guide: { depth: '1.5–2.2 times the width, as its length', table: 'none', note: 'judged on symmetry and the evenness of the rows' },
    bands: { crown: ['cross facets above the widest', 'upper cross facets', 'facets toward the point', 'facets to the point'], pavilion: ['cross facets below the widest', 'lower cross facets', 'facets toward the end', 'facets to the end'] },
    suits: 'Diamond, sapphire, aquamarine and topaz, hung from a wire. Cut where the rough is long.',
  }),
  checkerboard: cut({
    key: 'checkerboard', name: 'Checkerboard', family: 'other', aka: 'chequerboard, checker cut', curved: true,
    description: 'A cushion with its crown cut as a field of small square-ish facets in rows, turned against each other, over a stepped pavilion. The crown breaks the surface into a grid of small flashes and hides what is under it, which is the point: it is the cut for a stone too included or too pale to show through a table.',
    history: 'A lapidary\'s cut of the last thirty years, from the German and Thai cutting houses, for quartz, chalcedony and the pale beryls.',
    canonical: 'anything from 60 to 150 facets, by the size of the squares',
    guide: { depth: '55–70 %', table: 'small or none', note: 'a lapidary cut, not graded for proportions' },
    bands: { crown: ['checker row 1', 'checker row 2', 'checker row 3', 'checker row 4'], pavilion: ['pavilion step', 'pavilion step (to the keel)'] },
    suits: 'Amethyst, citrine, aquamarine, moonstone, onyx; anything cut for colour rather than clarity.',
  }),
  cabochon: cut({
    key: 'cabochon', name: 'Cabochon', family: 'other', aka: 'cab, en cabochon', curved: true, hasTable: false,
    description: 'No facets at all: a polished dome over a flat base. What is shown is colour, translucency and any phenomenon — a star, a cat\'s eye, adularescence — which a dome collects and a facet would break up. The height of the dome is the cutter\'s only decision.',
    history: 'The oldest way to shape a stone, older than faceting by millennia; the French caboche is a little head. Every gem in a medieval crown is a cabochon.',
    canonical: '0 facets: a dome and a base',
    guide: { depth: '30–60 % of the width for a low to high dome', note: 'a cabochon is judged on the evenness of its dome and the polish' },
    bands: { crown: [], pavilion: [] },
    suits: 'Moonstone, star sapphire and ruby, opal, jade, onyx, turquoise; any stone with a phenomenon to show or too included to facet.',
  }),
  doubleCabochon: cut({
    key: 'doubleCabochon', name: 'Double cabochon', family: 'other', aka: 'lentil, double cab', curved: true, hasTable: false,
    description: 'Domed on both sides: a lens with a sharp equator, deeper than a cabochon and brighter in a transparent stone because the lower dome returns light the flat base would let out. Set in a bezel that grips the equator, or drilled and hung.',
    history: 'Cut wherever cabochons were, for transparent material — garnet "carbuncles" of the Middle Ages were often double cabochons, hollowed underneath when the colour ran too dark.',
    canonical: '0 facets: two domes',
    guide: { depth: '50–80 % of the width', note: 'judged on the domes and the polish' },
    bands: { crown: [], pavilion: [] },
    suits: 'Garnet, moonstone, amber and the transparent quartzes.',
  }),
};

export const cutKeys = Object.keys(CUTS) as GemCut[];
