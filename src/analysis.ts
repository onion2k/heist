/**
 * What the model of a stone actually is, measured off its mesh.
 *
 * The renderer builds a cut stone facet by facet, each with its own vertices
 * and normal, and fans each facet from its first vertex; that pattern is
 * what lets the facets be read back out of the triangles here. From them
 * come the counts, the angles, the areas, the proportions the trade quotes
 * — table, depth, crown and pavilion angles — and, by the divergence
 * theorem over the closed surface, a volume the specific gravity turns
 * into carats. Nothing is taken from the part's spec that could be measured
 * instead, so what is shown is what is drawn.
 */
import type { Vec3 } from 'artshape-render/geom/types';
import type { Mesh } from 'artshape-render/mesh/types';
import type { Part } from 'artshape-render/parts/types';

export type Zone = 'table' | 'crown' | 'girdle' | 'pavilion' | 'culet' | 'back';

export interface Facet {
  index: number;
  /** The corners, in order, in the part's own millimetres. */
  points: Vec3[];
  normal: Vec3;
  centroid: Vec3;
  /** Square millimetres. */
  area: number;
  /** Degrees from the girdle plane: 0 is a table, 90 a girdle facet. */
  angle: number;
  zone: Zone;
  /** Which band of its zone, counted from the girdle: 0 nearest it. */
  band: number;
}

/** A row of facets between two heights. */
export interface Band {
  zone: 'crown' | 'pavilion';
  index: number;
  label: string;
  count: number;
  /** Distinct facet angles in the band, degrees, rounded. */
  angles: number[];
  /** Area-weighted mean angle. */
  angle: number;
  area: number;
  /** Heights the band spans, from the girdle plane. */
  zFrom: number;
  zTo: number;
}

/** One height the outline is sampled at, for the side elevation. */
export interface Level { z: number; halfWidth: number; halfLength: number }

export interface Measurements {
  width: number;
  length: number;
  depth: number;
  crownHeight: number;
  pavilionDepth: number;
  girdleThickness: number;
  tableWidth: number;
  tableLength: number;
  culetWidth: number;
  /** As the trade quotes them: percentages of the width. */
  tablePct: number;
  depthPct: number;
  crownPct: number;
  pavilionPct: number;
  girdlePct: number;
  ratio: number;
  crownAngle: number | null;
  pavilionAngle: number | null;
}

export interface Analysis {
  faceted: boolean;
  facets: Facet[];
  bands: Band[];
  levels: Level[];
  counts: Record<Zone, number>;
  /** Distinct planes the renderer traces light through. */
  planes: number;
  triangles: number;
  vertices: number;
  /** Cubic millimetres. */
  volume: number;
  /** Square millimetres. */
  surface: number;
  measure: Measurements;
}

export interface BandNames { crown: string[]; pavilion: string[] }

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);

function vertex(mesh: Mesh, i: number): Vec3 {
  return [mesh.positions[i * 3], mesh.positions[i * 3 + 1], mesh.positions[i * 3 + 2]];
}

/**
 * The facets, read back from the fans. Each facet was emitted as triangles
 * (base, base+i, base+i+1), so a triangle whose first index is the running
 * base and whose second is the last corner so far extends the polygon, and
 * anything else begins a new one.
 */
export function readFacets(mesh: Mesh): number[][] {
  const idx = mesh.indices;
  const out: number[][] = [];
  let cur: number[] | null = null;
  for (let i = 0; i + 2 < idx.length; i += 3) {
    const a = idx[i], b = idx[i + 1], c = idx[i + 2];
    if (cur && cur[0] === a && cur[cur.length - 1] === b) cur.push(c);
    else { cur = [a, b, c]; out.push(cur); }
  }
  return out;
}

/** Newell's normal and the polygon's area at once. */
function polygonNormal(points: Vec3[]): { normal: Vec3; area: number } {
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    nx += (a[1] - b[1]) * (a[2] + b[2]);
    ny += (a[2] - b[2]) * (a[0] + b[0]);
    nz += (a[0] - b[0]) * (a[1] + b[1]);
  }
  const l = Math.hypot(nx, ny, nz);
  return { normal: l > 0 ? [nx / l, ny / l, nz / l] : [0, 0, 1], area: l / 2 };
}

/** Signed volume by the divergence theorem, and the surface area, over every triangle. */
export function volumeAndSurface(mesh: Mesh): { volume: number; surface: number } {
  const idx = mesh.indices;
  let volume = 0, surface = 0;
  for (let i = 0; i + 2 < idx.length; i += 3) {
    const a = vertex(mesh, idx[i]), b = vertex(mesh, idx[i + 1]), c = vertex(mesh, idx[i + 2]);
    volume += dot(a, cross(b, c)) / 6;
    surface += len(cross(sub(b, a), sub(c, a))) / 2;
  }
  return { volume, surface };
}

/** Carats from cubic millimetres and a specific gravity: a carat is a fifth of a gram. */
export function carats(volumeMm3: number, gravity: number): number {
  return (volumeMm3 / 1000) * gravity / 0.2;
}

/** The angle past which light inside cannot get out, degrees. */
export function criticalAngle(ior: number): number {
  return (Math.asin(1 / ior) * 180) / Math.PI;
}

/** Reflectance at normal incidence from air, a fraction. */
export function fresnel(ior: number): number {
  return ((ior - 1) / (ior + 1)) ** 2;
}

const round = (v: number, places = 4) => Math.round(v * 10 ** places) / 10 ** places;

export function analyse(part: Part, names: BandNames): Analysis {
  const mesh = part.mesh;
  const { volume, surface } = volumeAndSurface(mesh);
  const vertexCount = mesh.positions.length / 3;

  // the extents, from the vertices themselves
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  const byZ = new Map<number, { hw: number; hl: number }>();
  for (let i = 0; i < vertexCount; i++) {
    const [x, y, z] = vertex(mesh, i);
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    const key = round(z);
    const level = byZ.get(key) ?? { hw: 0, hl: 0 };
    level.hw = Math.max(level.hw, Math.abs(y));
    level.hl = Math.max(level.hl, Math.abs(x));
    byZ.set(key, level);
  }
  const levels: Level[] = [...byZ.entries()].map(([z, l]) => ({ z, halfWidth: l.hw, halfLength: l.hl })).sort((a, b) => a.z - b.z);
  const width = maxY - minY, length = maxX - minX, depth = maxZ - minZ;

  const faceted = !!part.gemPlanes;
  const facets: Facet[] = [];
  const counts: Record<Zone, number> = { table: 0, crown: 0, girdle: 0, pavilion: 0, culet: 0, back: 0 };
  const girdleArea = Math.PI * (width / 2) * (length / 2);

  if (faceted) {
    for (const ids of readFacets(mesh)) {
      const points = ids.map((i) => vertex(mesh, i));
      const { normal, area } = polygonNormal(points);
      if (area < 1e-9) continue;
      const centroid: Vec3 = [0, 0, 0];
      for (const p of points) { centroid[0] += p[0] / points.length; centroid[1] += p[1] / points.length; centroid[2] += p[2] / points.length; }
      const nz = normal[2];
      const angle = (Math.acos(Math.min(1, Math.abs(nz))) * 180) / Math.PI;
      let zone: Zone;
      if (nz > 0.9999) zone = 'table';
      else if (nz < -0.9999) zone = area > girdleArea * 0.3 ? 'back' : 'culet';
      else if (Math.abs(nz) < 0.02) zone = 'girdle';
      else zone = nz > 0 ? 'crown' : 'pavilion';
      facets.push({ index: facets.length, points, normal, centroid, area, angle, zone, band: 0 });
    }
  }

  // the bands: facets of a zone grouped by the heights they span, ordered away from the girdle
  const bands: Band[] = [];
  for (const zone of ['crown', 'pavilion'] as const) {
    const groups = new Map<string, Facet[]>();
    for (const f of facets) {
      if (f.zone !== zone) continue;
      const zs = f.points.map((p) => round(p[2], 3));
      const key = `${Math.min(...zs)}:${Math.max(...zs)}`;
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(f);
    }
    const ordered = [...groups.values()].sort((a, b) => {
      const za = a[0].centroid[2], zb = b[0].centroid[2];
      return zone === 'crown' ? za - zb : zb - za;
    });
    const labels = names[zone];
    ordered.forEach((group, k) => {
      let area = 0, weighted = 0;
      const angleSet = new Set<number>();
      for (const f of group) { f.band = k; area += f.area; weighted += f.angle * f.area; angleSet.add(Math.round(f.angle * 10) / 10); }
      const zs = group.flatMap((f) => f.points.map((p) => p[2]));
      bands.push({
        zone, index: k,
        label: labels[k] ?? `${zone} band ${k + 1}`,
        count: group.length, angles: [...angleSet].sort((a, b) => a - b), angle: weighted / area, area,
        zFrom: zone === 'crown' ? Math.min(...zs) : Math.max(...zs),
        zTo: zone === 'crown' ? Math.max(...zs) : Math.min(...zs),
      });
    });
  }
  for (const f of facets) counts[f.zone]++;

  // the girdle: where its facets are, or the origin plane where a cut has none
  const girdleFacets = facets.filter((f) => f.zone === 'girdle');
  const girdleZs = girdleFacets.flatMap((f) => f.points.map((p) => p[2]));
  const girdleTop = girdleZs.length ? Math.max(...girdleZs) : 0;
  const girdleBottom = girdleZs.length ? Math.min(...girdleZs) : Math.min(0, minZ);
  const top = levels[levels.length - 1];
  const bottom = levels[0];
  const crownHeight = maxZ - girdleTop;
  const pavilionDepth = girdleBottom - minZ;
  const table = facets.find((f) => f.zone === 'table');
  const tableWidth = table ? 2 * top.halfWidth : 0;
  const tableLength = table ? 2 * top.halfLength : 0;
  const culetWidth = bottom.halfWidth > 1e-4 && pavilionDepth > 0 ? 2 * bottom.halfWidth : 0;

  const crownBand = bands.find((b) => b.zone === 'crown' && b.index === 0);
  const pavilionBands = bands.filter((b) => b.zone === 'pavilion');
  const mains = pavilionBands.length ? pavilionBands[pavilionBands.length - 1] : undefined;

  const measure: Measurements = {
    width, length, depth, crownHeight, pavilionDepth, girdleThickness: girdleTop - girdleBottom,
    tableWidth, tableLength, culetWidth,
    tablePct: (tableWidth / width) * 100,
    depthPct: (depth / width) * 100,
    crownPct: (crownHeight / width) * 100,
    pavilionPct: (pavilionDepth / width) * 100,
    girdlePct: ((girdleTop - girdleBottom) / width) * 100,
    ratio: length / width,
    crownAngle: crownBand ? crownBand.angle : null,
    pavilionAngle: mains ? mains.angle : null,
  };

  return {
    faceted, facets, bands, levels, counts,
    planes: part.gemPlanes ? part.gemPlanes.length / 4 : 0,
    triangles: mesh.indices.length / 3, vertices: vertexCount,
    volume, surface, measure,
  };
}

/** The whole-number and the trade's "%" formats, for the cards. */
export const fmt = {
  mm: (v: number, places = 2) => `${v.toFixed(places)} mm`,
  pct: (v: number) => `${v.toFixed(1)} %`,
  deg: (v: number | null) => (v === null ? '—' : `${v.toFixed(1)}°`),
  ct: (v: number) => (v < 0.1 ? `${v.toFixed(3)} ct` : `${v.toFixed(2)} ct`),
  area: (v: number) => `${v.toFixed(2)} mm²`,
};
