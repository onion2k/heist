import { describe, expect, it } from 'vitest';
import { metals } from 'artshape-render/render/materials';
import { baseColour, colourChoices, colouredMaterial, diamondGradeColour, graded, VARIETIES } from '../colours';
import { speciesKeys } from '../gems';

describe('colour grades', () => {
  it('D to F are one colour to the eye, and Z is a light yellow', () => {
    const d = diamondGradeColour('D'), f = diamondGradeColour('F'), z = diamondGradeColour('Z');
    expect(Math.abs(d[2] - f[2])).toBeLessThan(0.01);
    expect(z[2]).toBeLessThan(0.7);
    expect(z[0]).toBeGreaterThan(z[2]);
  });

  it('every species but diamond has varieties, and the first is the renderer\'s own colour', () => {
    for (const k of speciesKeys.filter((s) => s !== 'diamond')) {
      expect(VARIETIES[k]?.length, k).toBeGreaterThan(0);
      expect(VARIETIES[k][0].colour, k).toEqual(metals[k].colour);
      expect(colourChoices(k).length, k).toBe(VARIETIES[k].length);
    }
    expect(colourChoices('diamond').length).toBeGreaterThan(23);
  });

  it('tone darkens by a power and saturation leaves the grey of the same brightness alone', () => {
    const base: [number, number, number] = [0.05, 0.13, 0.62];
    const dark = graded(base, 1.5, 1), light = graded(base, 0.6, 1);
    expect(dark[2]).toBeLessThan(base[2]);
    expect(light[2]).toBeGreaterThan(base[2]);
    const grey = graded(base, 1, 0);
    expect(grey[0]).toBeCloseTo(grey[1], 6);
    expect(grey[1]).toBeCloseTo(grey[2], 6);
    expect(graded(base, 1, 1)).toEqual(base);
  });

  it('a graded material keeps the species\' optics and takes the colour, under one name per species', () => {
    const name = colouredMaterial('sapphire', 'padparadscha');
    expect(name).toBe('sapphire (graded)');
    expect(metals[name].ior).toBe(metals.sapphire.ior);
    expect(metals[name].model).toBe('gem');
    expect(metals[name].colour).toEqual(baseColour('sapphire', 'padparadscha'));
    colouredMaterial('sapphire', 'royal blue', 1.2, 1);
    expect(metals[name].colour![2]).toBeLessThan(baseColour('sapphire', 'royal blue')[2]);
    expect(Object.keys(metals).filter((k) => k.startsWith('sapphire')).length).toBe(2);
  });
});
