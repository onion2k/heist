/**
 * The diagrams a cutter draws: the crown seen from above, the pavilion
 * from below, and the side elevation with its proportions marked. All are
 * built from the analysis, so they are of the stone on screen and not of
 * an ideal one.
 */
import type { Analysis, Facet, Zone } from './analysis';
import type { P2, Ray } from './rays';

const NS = 'http://www.w3.org/2000/svg';

function svg(tag: string, attrs: Record<string, string | number>): SVGElement {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

/** The fills, by zone and band, as CSS variables the page defines in both themes. */
export function facetColour(zone: Zone, band: number): string {
  switch (zone) {
    case 'table': return 'var(--f-table)';
    case 'crown': return band === 0 ? 'var(--f-crown0)' : 'var(--f-crown1)';
    case 'girdle': return 'var(--f-girdle)';
    case 'pavilion': return band === 0 ? 'var(--f-pav0)' : band === 1 ? 'var(--f-pav1)' : 'var(--f-pav2)';
    case 'culet': case 'back': return 'var(--f-culet)';
  }
}

export interface DiagramHandlers {
  onHover?: (facet: Facet | null) => void;
  onPick?: (facet: Facet | null) => void;
}

/**
 * The crown or the pavilion, plan view. The crown is seen from the table
 * side, the pavilion from the culet side — mirrored, so the stone is
 * turned over rather than seen through.
 */
export function planDiagram(a: Analysis, side: 'crown' | 'pavilion', h: DiagramHandlers = {}, size = 220): SVGSVGElement {
  const m = a.measure;
  const half = Math.max(m.length, m.width) / 2 * 1.06;
  const s = svg('svg', { viewBox: `${-half} ${-half} ${2 * half} ${2 * half}`, width: size, height: size, class: 'plan' }) as SVGSVGElement;
  const facets = a.facets.filter((f) => (side === 'crown' ? f.normal[2] > -0.02 : f.normal[2] < 0.02))
    // far facets first, so the near ones draw over the girdle band
    .sort((x, y) => (side === 'crown' ? x.centroid[2] - y.centroid[2] : y.centroid[2] - x.centroid[2]));
  const flip = side === 'pavilion' ? -1 : 1;
  for (const f of facets) {
    const d = f.points.map((p, i) => `${i ? 'L' : 'M'}${(p[0] * flip).toFixed(3)} ${(-p[1]).toFixed(3)}`).join(' ') + ' Z';
    const path = svg('path', { d, fill: facetColour(f.zone, f.band), stroke: 'var(--f-line)', 'stroke-width': half / 120, 'vector-effect': 'non-scaling-stroke', class: 'facet' });
    path.addEventListener('pointerenter', () => h.onHover?.(f));
    path.addEventListener('pointerleave', () => h.onHover?.(null));
    path.addEventListener('click', () => h.onPick?.(f));
    s.append(path);
  }
  if (!facets.length) {
    // a cabochon: the outline alone
    s.append(svg('ellipse', { cx: 0, cy: 0, rx: m.length / 2, ry: m.width / 2, fill: 'var(--f-crown1)', stroke: 'var(--f-line)', 'stroke-width': half / 120 }));
  }
  return s;
}

/**
 * The side elevation, across the width, with the trade's dimensions drawn
 * on: table, crown, girdle, pavilion, depth, and the two angles.
 */
export function profileDiagram(a: Analysis, size = 260): SVGSVGElement {
  const m = a.measure;
  const levels = a.levels;
  const hw = m.width / 2;
  const top = Math.max(...levels.map((l) => l.z)), bottom = Math.min(...levels.map((l) => l.z));
  const padX = hw * 0.9, padY = m.depth * 0.25 + 0.6;
  const x0 = -hw - padX, x1 = hw + padX, y0 = -top - padY, y1 = -bottom + padY;
  const s = svg('svg', { viewBox: `${x0} ${y0} ${x1 - x0} ${y1 - y0}`, width: size, class: 'profile', preserveAspectRatio: 'xMidYMid meet' }) as SVGSVGElement;
  s.style.height = `${(size * (y1 - y0)) / (x1 - x0)}px`;

  // the silhouette: right side down, left side up
  const right = levels.map((l) => [l.halfWidth, -l.z] as const).reverse();
  const left = levels.map((l) => [-l.halfWidth, -l.z] as const);
  const d = [...right, ...left].map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(3)} ${y.toFixed(3)}`).join(' ') + ' Z';
  s.append(svg('path', { d, fill: 'var(--f-crown1)', stroke: 'var(--f-line)', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }));
  // the facet rows as lines across
  for (const l of levels) {
    s.append(svg('line', { x1: -l.halfWidth, y1: -l.z, x2: l.halfWidth, y2: -l.z, stroke: 'var(--f-line)', 'stroke-width': 0.6, 'vector-effect': 'non-scaling-stroke', opacity: 0.6 }));
  }

  const fs = (x1 - x0) / 34;
  const dim = (x: number, za: number, zb: number, label: string, side: 'l' | 'r') => {
    const ya = -za, yb = -zb;
    const g = svg('g', { class: 'dim' });
    g.append(svg('line', { x1: x, y1: ya, x2: x, y2: yb, stroke: 'var(--f-dim)', 'stroke-width': 0.8, 'vector-effect': 'non-scaling-stroke' }));
    g.append(svg('line', { x1: x - fs * 0.3, y1: ya, x2: x + fs * 0.3, y2: ya, stroke: 'var(--f-dim)', 'stroke-width': 0.8, 'vector-effect': 'non-scaling-stroke' }));
    g.append(svg('line', { x1: x - fs * 0.3, y1: yb, x2: x + fs * 0.3, y2: yb, stroke: 'var(--f-dim)', 'stroke-width': 0.8, 'vector-effect': 'non-scaling-stroke' }));
    const t = svg('text', { x: x + (side === 'r' ? fs * 0.45 : -fs * 0.45), y: (ya + yb) / 2, 'font-size': fs, fill: 'var(--f-text)', 'dominant-baseline': 'middle', 'text-anchor': side === 'r' ? 'start' : 'end' });
    t.textContent = label;
    g.append(t);
    s.append(g);
  };
  const across = (z: number, w: number, label: string, above: boolean) => {
    const y = -z;
    const g = svg('g', { class: 'dim' });
    g.append(svg('line', { x1: -w / 2, y1: y, x2: w / 2, y2: y, stroke: 'var(--f-dim)', 'stroke-width': 0.8, 'vector-effect': 'non-scaling-stroke' }));
    const t = svg('text', { x: 0, y: y + (above ? -fs * 0.5 : fs * 1.2), 'font-size': fs, fill: 'var(--f-text)', 'text-anchor': 'middle' });
    t.textContent = label;
    g.append(t);
    s.append(g);
  };

  const gTop = m.girdleThickness / 2, gBot = -m.girdleThickness / 2;
  dim(hw + padX * 0.28, bottom, top, `depth ${m.depth.toFixed(2)} (${m.depthPct.toFixed(1)} %)`, 'r');
  if (m.crownHeight > 1e-3) dim(-hw - padX * 0.28, gTop, top, `crown ${m.crownHeight.toFixed(2)}`, 'l');
  if (m.pavilionDepth > 1e-3) dim(-hw - padX * 0.28, bottom, gBot, `pavilion ${m.pavilionDepth.toFixed(2)}`, 'l');
  if (m.tableWidth > 1e-3) across(top + fs * 0.3, m.tableWidth, `table ${m.tableWidth.toFixed(2)} (${m.tablePct.toFixed(0)} %)`, true);
  across(bottom - fs * 0.3, m.width, `width ${m.width.toFixed(2)}`, false);
  if (m.culetWidth > 1e-3) across(bottom, m.culetWidth, '', false);

  const angle = (z: number, deg: number | null, label: string) => {
    if (deg === null) return;
    const t = svg('text', { x: hw * 0.55, y: -z, 'font-size': fs * 0.9, fill: 'var(--f-text)', 'text-anchor': 'middle', 'dominant-baseline': 'middle' });
    t.textContent = `${label} ${deg.toFixed(1)}°`;
    s.append(t);
  };
  angle((top + gTop) / 2, m.crownAngle, 'crown');
  angle((bottom + gBot) / 2, m.pavilionAngle, 'pavilion');
  return s;
}

/**
 * Light through the section: the profile as the plane through the axis
 * cuts it, and rays followed through by the species' index. Green came
 * back through the crown, red left through the pavilion, amber through
 * the girdle, grey was given up.
 */
export function rayDiagram(poly: P2[], rays: Ray[], size = 300): SVGSVGElement {
  const ys = poly.map((p) => p[0]), zs = poly.map((p) => p[1]);
  const halfW = Math.max(...ys.map(Math.abs)) || 1;
  const top = Math.max(...zs), bottom = Math.min(...zs);
  const padX = halfW * 0.7, padTop = (top - bottom) * 0.55, padBottom = (top - bottom) * 0.35;
  const x0 = -halfW - padX, x1 = halfW + padX, y0 = -top - padTop, y1 = -bottom + padBottom;
  const s = svg('svg', { viewBox: `${x0} ${y0} ${x1 - x0} ${y1 - y0}`, width: size, class: 'rays', preserveAspectRatio: 'xMidYMid meet' }) as SVGSVGElement;
  s.style.height = `${(size * (y1 - y0)) / (x1 - x0)}px`;
  const d = poly.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(4)} ${(-p[1]).toFixed(4)}`).join(' ') + ' Z';
  s.append(svg('path', { d, fill: 'var(--f-crown1)', stroke: 'var(--f-line)', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke', opacity: 0.85 }));
  const colour: Record<Ray['outcome'], string> = { crown: 'var(--good)', pavilion: 'var(--bad)', girdle: 'var(--warn)', lost: 'var(--dim)' };
  for (const r of rays) {
    const pts = r.points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(4)} ${(-p[1]).toFixed(4)}`).join(' ');
    s.append(svg('path', { d: pts, fill: 'none', stroke: colour[r.outcome], 'stroke-width': 1.2, 'vector-effect': 'non-scaling-stroke', opacity: 0.9 }));
    const last = r.points[r.points.length - 1];
    s.append(svg('circle', { cx: last[0], cy: -last[1], r: halfW * 0.025, fill: colour[r.outcome] }));
  }
  return s;
}
