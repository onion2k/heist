/**
 * The lights a gemmologist looks under, as environment images the renderer
 * bakes like any photographed sky. Latitude runs down the image with the
 * zenith on the top row and the horizon in the middle; every band below is
 * an elevation above the girdle plane of a stone lying face up.
 *
 * The ASET and the ideal-scope are not lights at all but maps: each
 * direction light can come from is painted a colour, so where the stone
 * returns that colour it is returning light from that direction. The trade
 * reads the image for cut quality — red is light from high angles, the
 * brightest a stone can return; green from low ones; blue is where the
 * viewer's own head blocks the light; and a place where the table shows
 * through the stone is a leak, light that went out of the pavilion instead
 * of coming back.
 */
import type { HdrImage } from 'artshape-render/render/hdr';

export interface Lighting {
  key: string;
  name: string;
  /** What the colours mean, for the note over the picture; empty for a plain light. */
  note: string;
  /** Read face up, with no other light: the key and the rig are put out while it is on. */
  analysis: boolean;
  image: () => HdrImage;
}

type Rgb = [number, number, number];

/** An image painted by elevation: the colour for a direction so many degrees above the horizon. */
function byElevation(paint: (elevation: number) => Rgb, width = 256, height = 128): HdrImage {
  const data = new Float32Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const elevation = 90 - ((y + 0.5) / height) * 180;
    const [r, g, b] = paint(elevation);
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = 1;
    }
  }
  return { width, height, data };
}

export const LIGHTINGS: Lighting[] = [
  {
    key: 'aset', name: 'ASET',
    note: 'ASET: red is light returned from 45° to 75° above the girdle, the brightest there is; green from below 45°; blue from overhead, where the viewer\'s head would be. Where the table shows through, light is leaking out of the pavilion.',
    analysis: true,
    image: () => byElevation((e) => (e >= 75 ? [0.15, 0.25, 1.0] : e >= 45 ? [1.0, 0.10, 0.08] : e >= 0 ? [0.10, 0.90, 0.20] : [0, 0, 0])),
  },
  {
    key: 'ideal-scope', name: 'ideal-scope',
    note: 'Ideal-scope: a red reflector round the stone and a black hole for the eye. Red is light returned, black is the arrows of the viewer\'s own obstruction, and the table showing through is leakage. Hearts appear the same way from the pavilion side.',
    analysis: true,
    image: () => byElevation((e) => (e >= 80 ? [0, 0, 0] : e >= 0 ? [1.0, 0.30, 0.40] : [0, 0, 0])),
  },
  {
    key: 'dark-field', name: 'dark-field loupe',
    note: 'Dark-field: a ring of light in at the girdle and black above, so the stone is lit from the sides and shows what is inside it. This is how inclusions are found, and a clean model shows only facets.',
    analysis: true,
    image: () => byElevation((e) => (e >= 5 && e <= 35 ? [1.6, 1.6, 1.6] : [0, 0, 0])),
  },
  {
    key: 'grading lamp', name: 'grading lamp',
    note: '',
    analysis: false,
    image: () => byElevation((e) => (e >= 55 ? [1.0, 1.0, 1.0] : e >= 20 ? [0.25, 0.25, 0.25] : e >= 0 ? [0.10, 0.10, 0.10] : [0, 0, 0])),
  },
];

export const lightingByKey = (key: string) => LIGHTINGS.find((l) => l.key === key);
