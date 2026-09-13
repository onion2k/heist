import { describe, expect, it } from 'vitest';
import { gem } from 'artshape-render/parts/gem';
import { lightReturn, section, traceRays } from '../rays';

const girdleOf = (width: number): [number, number] => [0.015 * width, -0.015 * width];

describe('the section', () => {
  it('cuts a brilliant into a closed polygon the width and depth of the stone', () => {
    const p = gem({ cut: 'brilliant', width: 6.5 });
    const poly = section(p.mesh);
    expect(poly.length).toBeGreaterThan(6);
    const ys = poly.map((q) => q[0]), zs = poly.map((q) => q[1]);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(6.5, 2);
    // a hair short at the culet, since the plane is a hair off the axis and the culet is a point
    expect(Math.max(...zs) - Math.min(...zs)).toBeCloseTo(p.bounds.max[2] - p.bounds.min[2], 2);
    // the table is the top edge, flat
    const top = Math.max(...zs);
    expect(poly.filter((q) => Math.abs(q[1] - top) < 1e-6).length).toBe(2);
  });

  it('cuts a step cut into its steps and a cabochon into a dome', () => {
    expect(section(gem({ cut: 'step', width: 6 }).mesh).length).toBeGreaterThanOrEqual(12);
    expect(section(gem({ cut: 'cabochon', width: 6 }).mesh).length).toBeGreaterThan(20);
  });
});

describe('light through the stone', () => {
  it('a diamond brilliant returns most of the light from above through its crown', () => {
    const poly = section(gem({ cut: 'brilliant', width: 6.5 }).mesh);
    const r = lightReturn(poly, 2.417, girdleOf(6.5));
    expect(r.crown).toBeGreaterThan(0.7);
    expect(r.lost).toBe(0);
  });

  it('a pavilion cut too shallow leaks through the bottom, and glass leaks more than diamond', () => {
    const ideal = section(gem({ cut: 'brilliant', width: 6.5 }).mesh);
    const shallow = section(gem({ cut: 'brilliant', width: 6.5, pavilionAngle: 30 }).mesh);
    expect(lightReturn(shallow, 2.417, girdleOf(6.5)).pavilion).toBeGreaterThan(lightReturn(ideal, 2.417, girdleOf(6.5)).pavilion);
    expect(lightReturn(ideal, 1.5, girdleOf(6.5)).crown).toBeLessThan(lightReturn(ideal, 2.417, girdleOf(6.5)).crown);
  });

  it('every ray enters where it was aimed, bends, and ends one step beyond the stone', () => {
    const poly = section(gem({ cut: 'brilliant', width: 6.5 }).mesh);
    const rays = traceRays(poly, 2.417, { count: 9, girdle: girdleOf(6.5) });
    expect(rays.length).toBe(9);
    for (const r of rays) {
      expect(r.points.length).toBeGreaterThanOrEqual(4);
      expect(r.points[0][1]).toBeGreaterThan(Math.max(...poly.map((q) => q[1])));
      // nothing comes back through the crown without at least one reflection off the pavilion
      if (r.outcome === 'crown') expect(r.bounces).toBeGreaterThanOrEqual(1);
    }
  });
});
