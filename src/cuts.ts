/**
 * The cuts: what each is, where it came from, what a cutter aims for in it,
 * and what its rows of facets are called. The keys are the renderer's own
 * cut names, so choosing one here is choosing the tiers the part is built
 * from; the proportions the model actually comes out with are measured off
 * the mesh in analysis.ts and set beside the trade's figures below.
 */
import type { GemCut } from 'artshape-render/parts/gem';

export type CutFamily = 'brilliant' | 'step' | 'rose' | 'cabochon';

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
}

const BRILLIANT_BANDS = {
  crown: ['bezel (kite) and upper-girdle facets', 'star facets'],
  pavilion: ['lower-girdle facets', 'pavilion mains'],
};

export const CUTS: Record<GemCut, CutInfo> = {
  brilliant: {
    key: 'brilliant', name: 'Round brilliant', family: 'brilliant', aka: 'round, RBC, "diamond cut"',
    description: 'The cut that returns the most light: a round girdle, a crown of kites and stars over it, and a pavilion of mains and halves under it meeting at a point. Every facet is angled so that light entering the table is reflected off both sides of the pavilion and sent back out through the crown.',
    history: 'Worked out by trial in Venice and Antwerp through the seventeenth century, and by calculation in Marcel Tolkowsky\'s 1919 thesis, which set the angles the trade still quotes. Ninety per cent of the diamonds sold are round brilliants.',
    canonical: '57 facets, 58 with a culet: 1 table, 8 stars, 8 bezels, 16 upper halves; 16 lower halves, 8 mains',
    guide: { table: '52–62 %', depth: '57.5–63 %', crownAngle: '31.5–36.5°', pavilionAngle: '40.6–41.8°', girdle: 'thin to slightly thick', ratio: '1.00–1.02', note: 'the GIA\'s "Excellent" ranges for a round diamond' },
    bands: BRILLIANT_BANDS,
    suits: 'Diamond above all, and any stone with fire to show. In a coloured stone it lightens the colour, which suits a dark garnet and can wash out a pale aquamarine.',
  },
  oval: {
    key: 'oval', name: 'Oval brilliant', family: 'brilliant', aka: 'oval',
    description: 'A round brilliant\'s facets stretched over an elliptical girdle. It faces up larger than a round of the same weight and flatters a hand, and it pays for the stretch with a bow-tie: a dark band across the middle where the pavilion facets no longer return light to the eye.',
    history: 'Lazare Kaplan\'s cut, from 1957, though ovals of a sort were cut for centuries before the facets were worked out.',
    canonical: '57 or 58 facets, arranged as a round\'s over an oval girdle',
    guide: { table: '53–63 %', depth: '58–66 %', ratio: '1.30–1.50', girdle: 'thin to slightly thick', note: 'trade-typical ranges; the bow-tie is the fault to look for' },
    bands: BRILLIANT_BANDS,
    suits: 'Sapphire and ruby, where the rough is often elongated; diamond, where it makes a carat look larger.',
  },
  pear: {
    key: 'pear', name: 'Pear brilliant', family: 'brilliant', aka: 'teardrop, pendeloque',
    description: 'One round end and one pointed, with brilliant facets over both. The point is fragile and is the reason for a V-prong; the shoulders should be full and even, and the bow-tie is watched for as in an oval.',
    history: 'The pendeloque of the fifteenth century, from Lodewyk van Berquem of Bruges, who is credited with the first symmetrical faceting. The Cullinan I, at 530 carats, is a pear.',
    canonical: '58 facets, typically: the round\'s arrangement, with the pavilion mains gathered toward the point',
    guide: { table: '53–63 %', depth: '58–66 %', ratio: '1.45–1.75', girdle: 'thin to slightly thick, thicker at the point', note: 'trade-typical ranges' },
    bands: BRILLIANT_BANDS,
    suits: 'Anything worn hanging: drops, pendants. Aquamarine and the paler beryls take the shape well because the point does not go dark.',
  },
  marquise: {
    key: 'marquise', name: 'Marquise brilliant', family: 'brilliant', aka: 'navette',
    description: 'Pointed at both ends, the longest outline for its weight, cut with brilliant facets. The two points are the most fragile things in gem cutting and are set in V-prongs; a stone this long shows a bow-tie unless the pavilion is cut for it.',
    history: 'Ordered by Louis XV, the story goes, to match the smile of the Marquise de Pompadour; navette is the French for a little boat.',
    canonical: '58 facets, typically',
    guide: { table: '53–63 %', depth: '58–65 %', ratio: '1.75–2.25', girdle: 'thin to slightly thick, thicker at the points', note: 'trade-typical ranges' },
    bands: BRILLIANT_BANDS,
    suits: 'Diamond, for the spread; ruby and sapphire, for elongated rough. A poor choice for a soft or cleavable stone because of the points.',
  },
  trillion: {
    key: 'trillion', name: 'Trillion', family: 'brilliant', aka: 'trilliant, trillian',
    description: 'A triangle with curved or straight sides and brilliant-style facets, shallow for its width, so it faces up large and bright. The three corners are as fragile as a marquise\'s points and are set in corner prongs.',
    history: 'An Amsterdam cut of 1962, from the Asscher family, and trademarked as the "Trilliant" in America by Leon Finker in the 1970s; it became the standard side stone of the 1980s.',
    canonical: '31 to 50 facets depending on the maker; 44 is common',
    guide: { table: '55–65 %', depth: '32–48 %', ratio: '1.00 (equilateral)', girdle: 'medium to thick at the corners', note: 'trade-typical ranges; a trillion is cut shallow on purpose' },
    bands: BRILLIANT_BANDS,
    suits: 'Side stones beside a centre stone; any brightly coloured stone that can afford to be shallow — garnet, sapphire, tourmaline.',
  },
  step: {
    key: 'step', name: 'Emerald (step) cut', family: 'step', aka: 'emerald cut, step cut, octagon',
    description: 'A rectangle with the corners cut off and rows of long, parallel facets running round it like steps, on the crown and on the pavilion, meeting a keel rather than a point. No brilliance to speak of, and no fire: what it shows is the colour, the clarity, and a hall-of-mirrors flash as the stone turns.',
    history: 'The oldest faceting there is — the table cut of the fifteenth century is a step cut with one step — refined for emerald because the cut corners protect a brittle stone and the long facets show a clean one. Named for the stone, then applied to every other.',
    canonical: '57 facets in the classic form: the table, 3 rows of 8 on the crown, 3 rows of 8 on the pavilion, and the keel',
    guide: { table: '61–69 %', depth: '61–67 %', ratio: '1.30–1.50', girdle: 'thin to slightly thick', note: 'trade-typical ranges for an emerald-cut diamond; emerald itself is cut deeper to hold colour' },
    bands: { crown: ['crown step 1', 'crown step 2', 'crown step 3'], pavilion: ['pavilion step 1', 'pavilion step 2', 'pavilion step 3 (to the keel)'] },
    suits: 'Emerald, for which it was made; any stone whose colour is the point and whose clarity can stand a window into it. Unforgiving of inclusions, which the open table shows plainly.',
  },
  baguette: {
    key: 'baguette', name: 'Baguette', family: 'step', aka: 'baguette, bar',
    description: 'A long narrow rectangle, square-cornered, with a single row of step facets on the crown and one or two on the pavilion; the simplest cut still made. Small and set in rows, channels and halos; it shows nothing but colour and a bar of light.',
    history: 'The French for a little rod or a loaf. Cartier made it the signature of Art Deco from the 1920s, set in lines between the geometry of platinum.',
    canonical: '14 facets: the table, 4 crown, 4 girdle, 4 pavilion and the keel; 24 in a tapered form',
    guide: { table: '65–80 %', depth: '55–70 %', ratio: '1.50–2.50 (longer in a tapered baguette)', girdle: 'thin', note: 'trade-typical ranges; baguettes are graded loosely, in lots' },
    bands: { crown: ['crown bevel'], pavilion: ['pavilion step', 'keel facets'] },
    suits: 'Diamond as an accent stone; onyx, ruby and sapphire in channel-set lines. Rarely cut in a soft stone because the corners chip.',
  },
  rose: {
    key: 'rose', name: 'Rose cut', family: 'rose', aka: 'rosette, Antwerp rose, Dutch rose',
    description: 'A flat back and a dome of triangular facets rising to a point, with no pavilion at all. It sits low on the hand, glints rather than blazes, and shows the colour of whatever it is set over, which is why the old ones are foiled.',
    history: 'Antwerp, about 1520, and the standard diamond cut for two centuries until the brilliant; Georgian jewellery is full of them. Revived in the last twenty years for the softer sparkle.',
    canonical: '24 facets in the full Dutch rose: 6 star facets round the apex and 18 cross facets to the edge; 12 and 6 in the half-rose',
    guide: { depth: '30–50 % of the width, all of it crown', table: 'none — the facets meet at the apex', note: 'a rose has no standard proportions; what is judged is symmetry and the meeting of the facets at the point' },
    bands: { crown: ['cross facets', 'star facets (to the apex)'], pavilion: [] },
    suits: 'Diamond in period and revival work; garnet, ruby and sapphire in flat settings; any stone whose rough is too thin for a pavilion.',
  },
  cabochon: {
    key: 'cabochon', name: 'Cabochon', family: 'cabochon', aka: 'cab, en cabochon',
    description: 'No facets at all: a polished dome over a flat base. What is shown is colour, translucency and any phenomenon — a star, a cat\'s eye, adularescence — which a dome collects and a facet would break up. The height of the dome is the cutter\'s only decision.',
    history: 'The oldest way to shape a stone, older than faceting by millennia; the French caboche is a little head. Every gem in a medieval crown is a cabochon.',
    canonical: '0 facets: a dome and a base',
    guide: { depth: '30–60 % of the width for a low to high dome', note: 'a cabochon is judged on the evenness of its dome and the polish' },
    bands: { crown: [], pavilion: [] },
    suits: 'Moonstone, star sapphire and ruby, opal, jade, onyx, turquoise; any stone with a phenomenon to show or too included to facet. Faceting moonstone, as the other cuts here do, is done but unusual.',
  },
};

export const cutKeys = Object.keys(CUTS) as GemCut[];
