import { describe, expect, it } from 'vitest';
import { gem, type GemCut } from 'artshape-render/parts/gem';
import { analyse, carats, criticalAngle, fresnel, readFacets, volumeAndSurface } from '../analysis';
import { CUTS, cutKeys } from '../cuts';

const stone = (cut: GemCut, width = 6.5) => gem({ cut, width });

describe('reading facets back from the mesh', () => {
  it('finds every triangle once, in polygons that are planar', () => {
    for (const cut of cutKeys.filter((c) => c !== 'cabochon')) {
      const part = stone(cut);
      const facets = readFacets(part.mesh);
      const triangles = facets.reduce((n, f) => n + f.length - 2, 0);
      expect(triangles, cut).toBe(part.mesh.indices.length / 3);
      // every corner of a facet shares the facet's normal: they were emitted with it
      for (const ids of facets) {
        const n0 = ids.map((i) => [...part.mesh.normals.subarray(i * 3, i * 3 + 3)]);
        for (const n of n0) for (let k = 0; k < 3; k++) expect(Math.abs(n[k] - n0[0][k]), cut).toBeLessThan(1e-5);
      }
    }
  });

  it('counts as many facets as the renderer has planes', () => {
    for (const cut of cutKeys.filter((c) => c !== 'cabochon')) {
      const part = stone(cut);
      const a = analyse(part, CUTS[cut].bands);
      // the renderer dedups planes; a facet count that matched exactly would
      // mean no two facets are coplanar, which the table and a girdle facet never are
      expect(a.facets.length, cut).toBeGreaterThanOrEqual(a.planes);
      expect(a.counts.table, cut).toBe(cut === 'rose' ? 0 : 1);
    }
  });
});

describe('measurements', () => {
  it('a brilliant comes out as the trade would describe one', () => {
    const a = analyse(stone('brilliant'), CUTS.brilliant.bands);
    const m = a.measure;
    expect(m.width).toBeCloseTo(6.5, 3);
    expect(m.ratio).toBeCloseTo(1, 2);
    expect(m.tablePct).toBeGreaterThan(50);
    expect(m.tablePct).toBeLessThan(62);
    expect(m.depthPct).toBeGreaterThan(55);
    expect(m.depthPct).toBeLessThan(66);
    expect(m.crownAngle).toBeGreaterThan(28);
    expect(m.crownAngle).toBeLessThan(42);
    expect(m.pavilionAngle).toBeGreaterThan(36);
    expect(m.pavilionAngle).toBeLessThan(46);
    expect(m.culetWidth).toBe(0);
    expect(a.counts.girdle).toBe(16);
    expect(a.bands.map((b) => b.zone)).toEqual(['crown', 'crown', 'pavilion', 'pavilion']);
  });

  it('a step cut has a keel, not a point, and only quadrilaterals', () => {
    const a = analyse(stone('step'), CUTS.step.bands);
    expect(a.measure.culetWidth).toBeGreaterThan(0);
    for (const f of a.facets) expect(f.points.length === 4 || f.zone === 'table' || f.zone === 'culet').toBe(true);
    expect(a.bands.filter((b) => b.zone === 'crown').length).toBe(2);
    expect(a.bands.filter((b) => b.zone === 'pavilion').length).toBe(3);
  });

  it('a rose has a flat back and no pavilion', () => {
    const a = analyse(stone('rose'), CUTS.rose.bands);
    expect(a.counts.back).toBe(1);
    expect(a.counts.pavilion).toBe(0);
    expect(a.measure.pavilionDepth).toBe(0);
  });

  it('a cabochon has no facets but still a volume', () => {
    const a = analyse(stone('cabochon'), CUTS.cabochon.bands);
    expect(a.faceted).toBe(false);
    expect(a.facets.length).toBe(0);
    expect(a.volume).toBeGreaterThan(0);
  });

  it('volume is positive and inside the bounding box, and a 6.5 mm diamond is about a carat', () => {
    for (const cut of cutKeys) {
      const part = stone(cut);
      const { volume } = volumeAndSurface(part.mesh);
      const b = part.bounds;
      const box = (b.max[0] - b.min[0]) * (b.max[1] - b.min[1]) * (b.max[2] - b.min[2]);
      expect(volume, cut).toBeGreaterThan(0);
      expect(volume, cut).toBeLessThan(box);
    }
    const ct = carats(volumeAndSurface(stone('brilliant').mesh).volume, 3.52);
    expect(ct).toBeGreaterThan(0.7);
    expect(ct).toBeLessThan(1.3);
  });
});

describe('optics', () => {
  it('diamond keeps light in past 24.4° and reflects 17 % at the surface', () => {
    expect(criticalAngle(2.417)).toBeCloseTo(24.4, 1);
    expect(fresnel(2.417)).toBeCloseTo(0.172, 3);
  });
});
