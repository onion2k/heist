/**
 * Light through the stone, in section.
 *
 * The mesh is cut by the plane through its axis across the width, which
 * gives the profile a cutter draws: the table, the bezel, the girdle, the
 * main, the culet, as edges. Rays are then followed through that polygon
 * by Snell's law with the species' own index: in at the crown, reflected
 * off the pavilion where the angle beats the critical angle, out again —
 * through the crown, which is light returned to the eye, or through the
 * pavilion or girdle, which is light leaked. The diagram is two-
 * dimensional and follows only the refracted path where one exists, so it
 * says where a cut sends its light and not how much; the tracer says the
 * rest.
 */
import type { Mesh } from 'artshape-render/mesh/types';

export type P2 = [number, number];

/**
 * The closed outline of the mesh cut by the plane x = offset, as a polygon
 * in (y, z). Every triangle crossing the plane gives a segment; the
 * segments are chained by their shared ends. A hair off the axis, so the
 * plane does not pass through the vertices that lie on it.
 */
export function section(mesh: Mesh, offset = 1e-3): P2[] {
  const pos = mesh.positions, idx = mesh.indices;
  const segs: Array<[P2, P2]> = [];
  const v = (i: number): [number, number, number] => [pos[i * 3] - offset, pos[i * 3 + 1], pos[i * 3 + 2]];
  for (let t = 0; t < idx.length; t += 3) {
    const tri = [v(idx[t]), v(idx[t + 1]), v(idx[t + 2])];
    const hits: P2[] = [];
    for (let k = 0; k < 3; k++) {
      const a = tri[k], b = tri[(k + 1) % 3];
      if ((a[0] < 0) === (b[0] < 0)) continue;
      const s = a[0] / (a[0] - b[0]);
      hits.push([a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s]);
    }
    if (hits.length === 2 && Math.hypot(hits[0][0] - hits[1][0], hits[0][1] - hits[1][1]) > 1e-7) segs.push([hits[0], hits[1]]);
  }
  if (!segs.length) return [];
  // chain: from each segment's end, the segment that starts or ends there
  const key = (p: P2) => `${p[0].toFixed(5)}:${p[1].toFixed(5)}`;
  const byEnd = new Map<string, number[]>();
  segs.forEach((s, i) => { for (const p of s) { const k = key(p); (byEnd.get(k) ?? byEnd.set(k, []).get(k)!).push(i); } });
  const used = new Set<number>();
  const poly: P2[] = [segs[0][0]];
  let cur = segs[0][1];
  used.add(0);
  const near = (a: P2, b: P2) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-4;
  for (let guard = 0; guard < segs.length; guard++) {
    poly.push(cur);
    // by key first; failing that, the nearest loose end, since the fan
    // round a dome's apex meets the plane at points that differ by less
    // than a rounding and land either side of it
    let next = (byEnd.get(key(cur)) ?? []).find((i) => !used.has(i));
    if (next === undefined) {
      let bestD = 1e-4;
      for (let i = 0; i < segs.length; i++) {
        if (used.has(i)) continue;
        for (const q of segs[i]) { const d = Math.hypot(q[0] - cur[0], q[1] - cur[1]); if (d < bestD) { bestD = d; next = i; } }
      }
    }
    if (next === undefined) break;
    used.add(next);
    const s = segs[next];
    cur = near(s[0], cur) ? s[1] : s[0];
  }
  // closed: the last point is the first again
  if (poly.length > 1 && key(poly[poly.length - 1]) === key(poly[0])) poly.pop();
  // merge runs of collinear points, so an edge is a facet and not a triangle's share of one
  const out: P2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[(i + poly.length - 1) % poly.length], b = poly[i], c = poly[(i + 1) % poly.length];
    const cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
    if (Math.abs(cross) > 1e-7) out.push(b);
  }
  return out;
}

export type Outcome = 'crown' | 'girdle' | 'pavilion' | 'lost';

export interface Ray {
  /** The path, from where it set out above the stone to where it left it, and one step beyond. */
  points: P2[];
  outcome: Outcome;
  /** Internal reflections before it left. */
  bounces: number;
  /** Where it entered, along the width, as a fraction of the half-width. */
  entry: number;
}

export interface RayOptions {
  /** Rays across the stone. */
  count?: number;
  /** Degrees off the vertical the light comes in at. */
  tilt?: number;
  /** After this many internal reflections a ray is given up as lost. */
  maxBounces?: number;
  /** Heights of the girdle's top and bottom, to say which face a ray left by. */
  girdle: [number, number];
}

const norm = (v: P2): P2 => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const dot = (a: P2, b: P2) => a[0] * b[0] + a[1] * b[1];

/** The nearest edge a ray meets, past a hair from where it stands. */
function hit(poly: P2[], p: P2, d: P2): { t: number; edge: number; point: P2; normal: P2 } | null {
  let best: { t: number; edge: number; point: P2; normal: P2 } | null = null;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const e: P2 = [b[0] - a[0], b[1] - a[1]];
    const denom = d[0] * e[1] - d[1] * e[0];
    if (Math.abs(denom) < 1e-12) continue;
    const ap: P2 = [a[0] - p[0], a[1] - p[1]];
    const t = (ap[0] * e[1] - ap[1] * e[0]) / denom;
    const u = (ap[0] * d[1] - ap[1] * d[0]) / denom;
    if (t <= 1e-6 || u < -1e-9 || u > 1 + 1e-9) continue;
    if (!best || t < best.t) {
      let n = norm([e[1], -e[0]]);
      // the normal against the ray, whichever side it comes from
      if (dot(n, d) > 0) n = [-n[0], -n[1]];
      best = { t, edge: i, point: [p[0] + d[0] * t, p[1] + d[1] * t], normal: n };
    }
  }
  return best;
}

/** Snell's law as vectors: the refracted direction, or null past the critical angle. `eta` is n_from / n_to. */
function refract(d: P2, n: P2, eta: number): P2 | null {
  const cosI = -dot(n, d);
  const k = 1 - eta * eta * (1 - cosI * cosI);
  if (k < 0) return null;
  const s = eta * cosI - Math.sqrt(k);
  return norm([eta * d[0] + s * n[0], eta * d[1] + s * n[1]]);
}

const reflect = (d: P2, n: P2): P2 => { const k = 2 * dot(d, n); return [d[0] - k * n[0], d[1] - k * n[1]]; };

/** Follow rays from above through the section, by the index given. */
export function traceRays(poly: P2[], ior: number, opts: RayOptions): Ray[] {
  const count = opts.count ?? 9, tilt = ((opts.tilt ?? 0) * Math.PI) / 180, maxBounces = opts.maxBounces ?? 12;
  if (poly.length < 3) return [];
  const ys = poly.map((p) => p[0]), zs = poly.map((p) => p[1]);
  const halfW = Math.max(...ys.map(Math.abs));
  const top = Math.max(...zs), bottom = Math.min(...zs);
  const height = top - bottom;
  const d0: P2 = norm([Math.sin(tilt), -Math.cos(tilt)]);
  const rays: Ray[] = [];
  for (let i = 0; i < count; i++) {
    // across the stone, but never quite at its edges, and aimed so tilted light still lands on it
    const entry = count === 1 ? 0 : -0.85 + (1.7 * i) / (count - 1);
    const start: P2 = [entry * halfW - d0[0] * height * 0.6, top + 0.6 * height];
    const path: P2[] = [start];
    let p = start, d = d0;
    const first = hit(poly, p, d);
    if (!first) continue;
    const inward = refract(d, first.normal, 1 / ior)!;   // from air, always possible
    path.push(first.point);
    p = first.point; d = inward;
    let outcome: Outcome = 'lost', bounces = 0;
    for (let b = 0; b <= maxBounces; b++) {
      const h = hit(poly, p, d);
      if (!h) break;
      path.push(h.point);
      const out = refract(d, h.normal, ior);
      if (out) {
        // it leaves: one step beyond, to show which way
        path.push([h.point[0] + out[0] * halfW * 0.5, h.point[1] + out[1] * halfW * 0.5]);
        outcome = h.point[1] > opts.girdle[0] - 1e-6 ? 'crown' : h.point[1] < opts.girdle[1] + 1e-6 ? 'pavilion' : 'girdle';
        break;
      }
      d = reflect(d, h.normal);
      p = h.point;
      bounces++;
    }
    rays.push({ points: path, outcome, bounces, entry });
  }
  return rays;
}

/** How much of the light from above comes back through the crown: counted over many rays across the stone. */
export function lightReturn(poly: P2[], ior: number, girdle: [number, number], tilt = 0, count = 61): { crown: number; pavilion: number; girdle: number; lost: number } {
  const tally = { crown: 0, pavilion: 0, girdle: 0, lost: 0 };
  const rays = traceRays(poly, ior, { count, tilt, girdle });
  for (const r of rays) tally[r.outcome]++;
  const n = rays.length || 1;
  return { crown: tally.crown / n, pavilion: tally.pavilion / n, girdle: tally.girdle / n, lost: tally.lost / n };
}
