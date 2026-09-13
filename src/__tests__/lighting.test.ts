import { describe, expect, it } from 'vitest';
import { meanRadiance } from 'artshape-render/render/hdr';
import { LIGHTINGS, lightingByKey } from '../lighting';

const at = (img: { width: number; height: number; data: Float32Array }, elevation: number) => {
  const y = Math.min(img.height - 1, Math.floor(((90 - elevation) / 180) * img.height));
  const o = (y * img.width + (img.width >> 1)) * 4;
  return [img.data[o], img.data[o + 1], img.data[o + 2]];
};

describe('the gemmologist\'s lights', () => {
  it('the ASET map is blue overhead, red at the high angles, green low, and dark below the horizon', () => {
    const img = lightingByKey('aset')!.image();
    expect(at(img, 85)[2]).toBeGreaterThan(at(img, 85)[0]);
    expect(at(img, 60)[0]).toBeGreaterThan(at(img, 60)[1]);
    expect(at(img, 20)[1]).toBeGreaterThan(at(img, 20)[0]);
    expect(at(img, -30)).toEqual([0, 0, 0]);
  });

  it('the ideal-scope is red with a black hole for the eye; the dark-field a ring at the girdle', () => {
    const scope = lightingByKey('ideal-scope')!.image();
    expect(at(scope, 88)).toEqual([0, 0, 0]);
    expect(at(scope, 40)[0]).toBeGreaterThan(0.9);
    const dark = lightingByKey('dark-field')!.image();
    expect(at(dark, 20)[0]).toBeGreaterThan(1);
    expect(at(dark, 60)).toEqual([0, 0, 0]);
    expect(at(dark, 80)).toEqual([0, 0, 0]);
  });

  it('every light has a mean the renderer can scale by, and the analysis ones carry a note', () => {
    for (const l of LIGHTINGS) {
      expect(meanRadiance(l.image()), l.key).toBeGreaterThan(0);
      if (l.analysis) expect(l.note.length, l.key).toBeGreaterThan(40);
    }
  });
});
