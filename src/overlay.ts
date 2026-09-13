/**
 * The information laid over the picture: the cards down the right, and the
 * callouts that point into the stone. Everything here is built from the
 * analysis and the reference sheets; nothing is typed in for a particular
 * stone.
 */
import type { Vec3 } from 'artshape-render/geom/types';
import type { Viewer } from 'artshape-render/render/viewer';
import { carats, criticalAngle, fmt, fresnel, type Analysis, type Facet, type Zone } from './analysis';
import type { CutInfo } from './cuts';
import { planDiagram, profileDiagram, facetColour } from './diagrams';
import { clarityScale, clarityTypeNote, DIAMOND_COLOUR, type ClarityGrade, type Species } from './gems';
import { el } from './ui';

export interface Specimen {
  species: Species;
  cut: CutInfo;
  analysis: Analysis;
  clarity: ClarityGrade;
  /** Diamond only: a letter on the D–Z scale. */
  colour: string;
  /** The renderer's material record for the species, as it traces with it. */
  material: { ior: number; dispersion: number; colour: [number, number, number]; sparkle: number };
}

export type Tab = 'cut' | 'facets' | 'stone' | 'optics' | 'grading';
export const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'cut', label: 'Cut' }, { key: 'facets', label: 'Facets' }, { key: 'stone', label: 'Stone' },
  { key: 'optics', label: 'Optics' }, { key: 'grading', label: 'Grading' },
];

const ZONE_NAMES: Record<Zone, string> = { table: 'table', crown: 'crown', girdle: 'girdle', pavilion: 'pavilion', culet: 'culet', back: 'back' };

function rows(pairs: Array<[string, string, string?]>): HTMLTableElement {
  const t = el('table');
  for (const [k, v, cls] of pairs) {
    const tr = el('tr');
    if (k === '') { tr.className = 'head'; tr.innerHTML = `<td colspan="2">${v}</td>`; }
    else tr.innerHTML = `<td>${k}</td><td class="${cls ?? ''}">${v}</td>`;
    t.append(tr);
  }
  return t;
}

/** Within a trade range like "52–62 %" or "31.5–36.5°": good, or a warning either side. */
function judge(value: number | null, range: string | undefined): string {
  if (value === null || !range) return '';
  const m = range.match(/([\d.]+)\s*[–-]\s*([\d.]+)/);
  if (!m) return '';
  const lo = Number(m[1]), hi = Number(m[2]);
  return value >= lo && value <= hi ? 'good' : 'warn';
}

function card(title: string, aside = ''): HTMLDivElement {
  const c = el('div', 'card');
  c.append(el('h2', '', `${title}<span>${aside}</span>`));
  return c;
}

export function headerCard(s: Specimen): HTMLDivElement {
  const a = s.analysis, m = a.measure;
  const ct = carats(a.volume, s.species.gravity);
  const c = el('div', 'card');
  c.append(el('h3', '', `${s.species.name} · ${s.cut.name.toLowerCase()}`));
  c.append(el('p', 'dim', `${fmt.mm(m.length)} × ${fmt.mm(m.width)} × ${fmt.mm(m.depth)} · ${s.species.mineral}`));
  const stats = el('div', 'stats');
  stats.append(
    el('div', 'stat', `${fmt.ct(ct)}<small>estimated weight</small>`),
    el('div', 'stat', `${a.faceted ? a.facets.length : 0}<small>facets in the model</small>`),
    el('div', 'stat', `${s.material.ior.toFixed(3)}<small>refractive index</small>`),
  );
  c.append(stats);
  c.append(el('p', 'small dim', `Weight is the model's volume, ${a.volume.toFixed(1)} mm³, at a specific gravity of ${s.species.gravity} — the cutter's estimate before the scales.`));
  return c;
}

export function cutCard(s: Specimen): HTMLDivElement {
  const a = s.analysis, m = a.measure, g = s.cut.guide;
  const c = card(s.cut.name, s.cut.aka);
  c.append(el('p', '', s.cut.description));
  c.append(el('p', 'small dim', s.cut.history));
  const fig = el('div', 'figures');
  const f = el('div', 'figure');
  f.append(profileDiagram(a, 300), document.createTextNode('side elevation, across the width, in millimetres'));
  fig.append(f);
  c.append(fig);
  const pairs: Array<[string, string, string?]> = [
    ['', 'proportions, measured off the model'],
    ['table', `${fmt.pct(m.tablePct)}${g.table ? ` <span class="dim">· guide ${g.table}</span>` : ''}`, judge(m.tablePct, g.table)],
    ['total depth', `${fmt.pct(m.depthPct)}${g.depth ? ` <span class="dim">· guide ${g.depth}</span>` : ''}`, judge(m.depthPct, g.depth)],
    ['crown height', fmt.pct(m.crownPct)],
    ['pavilion depth', fmt.pct(m.pavilionPct)],
    ['girdle', `${fmt.pct(m.girdlePct)}${g.girdle ? ` <span class="dim">· ${g.girdle}</span>` : ''}`],
    ['crown angle', `${fmt.deg(m.crownAngle)}${g.crownAngle ? ` <span class="dim">· guide ${g.crownAngle}</span>` : ''}`, judge(m.crownAngle, g.crownAngle)],
    ['pavilion angle', `${fmt.deg(m.pavilionAngle)}${g.pavilionAngle ? ` <span class="dim">· guide ${g.pavilionAngle}</span>` : ''}`, judge(m.pavilionAngle, g.pavilionAngle)],
    ['length : width', `${m.ratio.toFixed(2)} : 1${g.ratio ? ` <span class="dim">· guide ${g.ratio}</span>` : ''}`, judge(m.ratio, g.ratio)],
    ['culet', m.culetWidth > 1e-3 ? `${fmt.mm(m.culetWidth)} keel` : a.measure.pavilionDepth > 0 ? 'pointed (none)' : '—'],
    ['', 'in millimetres'],
    ['width × length', `${fmt.mm(m.width)} × ${fmt.mm(m.length)}`],
    ['table', m.tableWidth > 0 ? `${fmt.mm(m.tableWidth)} × ${fmt.mm(m.tableLength)}` : 'none'],
    ['crown · girdle · pavilion', `${m.crownHeight.toFixed(2)} · ${m.girdleThickness.toFixed(2)} · ${m.pavilionDepth.toFixed(2)}`],
    ['total depth', fmt.mm(m.depth)],
    ['surface', fmt.area(a.surface)],
    ['volume', `${a.volume.toFixed(2)} mm³`],
  ];
  c.append(rows(pairs));
  c.append(el('p', 'small dim', g.note + '. Green is within the guide, amber outside it.'));
  c.append(el('p', 'small', `<b>Suits:</b> ${s.cut.suits}`));
  return c;
}

export interface FacetHandlers { onHover: (f: Facet | null) => void; onPick: (f: Facet | null) => void }

export function facetsCard(s: Specimen, h: FacetHandlers): { card: HTMLDivElement; note: HTMLDivElement; highlight: (f: Facet | null) => void } {
  const a = s.analysis;
  const c = card('Facets', `${a.faceted ? `${a.facets.length} in the model` : 'none'} · ${s.cut.canonical.split(':')[0]} in the trade's`);
  const note = el('div', 'facetNote', 'Hover a facet in the diagrams to read it; click to hold it.');
  if (!a.faceted) {
    c.append(el('p', '', 'A cabochon has no facets: a polished dome over a flat base. The dome is a revolve of a quarter-ellipse, smooth-shaded, and the tracer treats its surface as one curved face rather than a set of planes.'));
    const fig = el('div', 'figures');
    const f = el('div', 'figure');
    f.append(planDiagram(a, 'crown', {}, 160), document.createTextNode('plan'));
    fig.append(f);
    c.append(fig);
    return { card: c, note, highlight: () => {} };
  }
  const fig = el('div', 'figures');
  const crownFig = el('div', 'figure'), pavFig = el('div', 'figure');
  const crown = planDiagram(a, 'crown', h, 150);
  const pav = planDiagram(a, 'pavilion', h, 150);
  crownFig.append(crown, document.createTextNode('crown, from above'));
  pavFig.append(pav, document.createTextNode(a.counts.pavilion ? 'pavilion, from below' : 'back, from below'));
  fig.append(crownFig, pavFig);
  c.append(fig);
  const legend = el('div', 'legend');
  const seen = new Set<string>();
  for (const f of a.facets) {
    const key = `${f.zone}:${f.zone === 'crown' || f.zone === 'pavilion' ? f.band : 0}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const band = a.bands.find((b) => b.zone === f.zone && b.index === f.band);
    legend.append(el('span', '', `<i style="background:${facetColour(f.zone, f.band)}"></i>${band ? band.label : ZONE_NAMES[f.zone]}`));
  }
  c.append(legend);
  c.append(note);
  const pairs: Array<[string, string, string?]> = [['', 'by zone']];
  for (const z of ['table', 'crown', 'girdle', 'pavilion', 'culet', 'back'] as Zone[]) {
    if (a.counts[z]) pairs.push([ZONE_NAMES[z], `${a.counts[z]}`]);
  }
  pairs.push(['', 'by band, from the girdle']);
  for (const b of a.bands) {
    const angles = b.angles.length > 3
      ? `${b.angles[0].toFixed(1)}–${b.angles[b.angles.length - 1].toFixed(1)}°, mean ${b.angle.toFixed(1)}°`
      : b.angles.map((x) => `${x.toFixed(1)}°`).join(' / ');
    pairs.push([`${b.label}`, `${b.count} at ${angles}`]);
  }
  pairs.push(['', 'the trade\'s count']);
  pairs.push(['canonical', s.cut.canonical, 'l']);
  pairs.push(['', 'the model']);
  pairs.push(['planes the tracer bends light through', `${a.planes}`]);
  pairs.push(['triangles · vertices', `${a.triangles} · ${a.vertices}`]);
  c.append(rows(pairs));
  c.append(el('p', 'small dim', s.cut.key === 'brilliant' || s.cut.key === 'oval'
    ? 'The round and the oval are built as the trade cuts them: the bezel plane is set by the crown angle, the star tips and upper-half apexes lie on it, and the mains and lower halves the same way under the girdle. The count above includes the girdle facets, which the trade leaves out.'
    : 'The fancy outlines and the step cuts are built from an outline and a stack of tiers, so a pear\'s bezels and upper halves come out as one band of triangles rather than the trade\'s kites and halves; the counts above are the model\'s own, and the canonical line is the real cut\'s.'));
  const highlight = (f: Facet | null) => {
    for (const p of [...crown.querySelectorAll('.facet'), ...pav.querySelectorAll('.facet')]) p.classList.remove('on');
    if (!f) return;
    const paths = [...crown.querySelectorAll('.facet'), ...pav.querySelectorAll('.facet')];
    // paths were appended in the diagram's own order; find by matching the facet's index through data
    const owned = paths.filter((p) => (p as SVGPathElement & { facet?: Facet }).facet === f);
    for (const p of owned) p.classList.add('on');
  };
  // tag each path with its facet so the highlight can find it
  const tag = (svg: SVGSVGElement, side: 'crown' | 'pavilion') => {
    const list = a.facets.filter((f) => (side === 'crown' ? f.normal[2] > -0.02 : f.normal[2] < 0.02))
      .sort((x, y) => (side === 'crown' ? x.centroid[2] - y.centroid[2] : y.centroid[2] - x.centroid[2]));
    svg.querySelectorAll('.facet').forEach((p, i) => { (p as SVGPathElement & { facet?: Facet }).facet = list[i]; });
  };
  tag(crown, 'crown');
  tag(pav, 'pavilion');
  return { card: c, note, highlight };
}

export function describeFacet(a: Analysis, f: Facet): string {
  const band = a.bands.find((b) => b.zone === f.zone && b.index === f.band);
  const kind = f.points.length === 3 ? 'triangle' : f.points.length === 4 ? 'quadrilateral' : `${f.points.length}-sided`;
  const share = ((f.area / a.surface) * 100).toFixed(1);
  return `<b>Facet ${f.index + 1}</b> · ${band ? band.label : ZONE_NAMES[f.zone]} · ${kind}<br>`
    + `${f.angle.toFixed(1)}° to the girdle plane · ${fmt.area(f.area)} (${share} % of the surface) · centre ${f.centroid[2] >= 0 ? '+' : ''}${f.centroid[2].toFixed(2)} mm from the girdle`;
}

export function stoneCard(s: Specimen): HTMLDivElement {
  const sp = s.species;
  const c = card(sp.name, sp.mineral);
  c.append(el('p', '', sp.history));
  c.append(rows([
    ['', 'composition'],
    ['formula', sp.formula, 'hi'],
    ['mineral', sp.mineral, 'l'],
    ['chromophore', sp.chromophore, 'l'],
    ['colour range', sp.colourRange, 'l'],
    ['', 'crystal'],
    ['system', sp.system],
    ['habit', sp.habit, 'l'],
    ['cleavage', sp.cleavage, 'l'],
    ['fracture', sp.fracture],
    ['', 'physical'],
    ['hardness (Mohs)', sp.hardness],
    ['specific gravity', `${sp.gravity} <span class="dim">(${sp.gravityRange})</span>`],
    ['lustre', sp.lustre],
  ]));
  c.append(el('p', 'small', `<b>Sources:</b> ${sp.sources.join(' · ')}`));
  c.append(el('p', 'small', `<b>Treatments:</b> ${sp.treatments}`));
  if (sp.birthstone) c.append(el('p', 'small dim', `Birthstone for ${sp.birthstone}.`));
  return c;
}

export function opticsCard(s: Specimen): HTMLDivElement {
  const sp = s.species, mat = s.material;
  const c = card('Optics', 'as published, and as traced');
  const crit = criticalAngle(mat.ior);
  const f0 = fresnel(mat.ior);
  const lin = (v: number) => Math.round(Math.pow(Math.max(v, 0), 1 / 2.2) * 255);
  const swatch = `rgb(${lin(mat.colour[0])}, ${lin(mat.colour[1])}, ${lin(mat.colour[2])})`;
  c.append(rows([
    ['', 'published'],
    ['refractive index', sp.ri],
    ['birefringence', sp.birefringence, 'l'],
    ['dispersion (B–G)', sp.dispersion.toFixed(3)],
    ['pleochroism', sp.pleochroism, 'l'],
    ['lustre', sp.lustre],
    ['', 'derived'],
    ['critical angle', `${crit.toFixed(1)}°`],
    ['reflectance at normal incidence', `${(f0 * 100).toFixed(1)} %`],
    ['light kept inside a facet', `${(100 - f0 * 100).toFixed(1)} % enters; anything striking a back facet steeper than ${(90 - crit).toFixed(1)}° from its normal is thrown back`, 'l'],
    ['', 'what the tracer uses'],
    ['ior', mat.ior.toFixed(3)],
    ['dispersion', mat.dispersion.toFixed(3)],
    ['sparkle', mat.sparkle.toFixed(2)],
    ['body colour', `<i style="display:inline-block;width:14px;height:11px;border-radius:2px;vertical-align:-1px;background:${swatch};border:1px solid var(--line)"></i> linear ${mat.colour.map((v) => v.toFixed(2)).join(', ')}`],
  ]));
  c.append(el('p', 'small dim',
    'The tracer sends a ray through the stone by its facets as planes: at every face the index decides how much is mirrored and how far the rest bends, and the dispersion splits the three channels apart so a stone with fire throws colour. The body colour is what survives one trip through a stone of this width, so a wider stone runs darker along a longer path. A single refractive index is used; birefringence and pleochroism are not modelled.'));
  return c;
}

export function gradingCard(s: Specimen, onClarity: (code: string) => void, onColour: (code: string) => void): HTMLDivElement {
  const sp = s.species;
  const c = card('Grading', sp.clarityType === 'diamond' ? 'GIA scale' : `Type ${sp.clarityType === 'I' || sp.clarityType === 'II' || sp.clarityType === 'III' ? sp.clarityType : '—'}`);
  c.append(el('p', 'small dim', clarityTypeNote(sp.clarityType)));
  if (sp.clarityType !== 'opaque') {
    const scale = clarityScale(sp);
    const tabs = el('div', 'tabs');
    for (const g of scale) {
      const b = el('button', `tab${g.code === s.clarity.code ? ' on' : ''}`, g.code);
      b.title = g.name;
      b.addEventListener('click', () => onClarity(g.code));
      tabs.append(b);
    }
    c.append(tabs);
    c.append(el('p', '', `<b>${s.clarity.code} — ${s.clarity.name}.</b> Under the loupe: ${s.clarity.loupe}. To the eye: ${s.clarity.eye}.`));
    c.append(el('p', 'small dim', `Typical inclusions in ${sp.name.toLowerCase()}: ${sp.inclusions}.`));
    c.append(el('p', 'small dim', sp.clarityNote));
    c.append(el('p', 'note', 'The render is of a flawless stone; the grade describes what a real one would show.'));
  } else {
    c.append(el('p', 'small dim', sp.clarityNote));
  }
  if (sp.clarityType === 'diamond') {
    c.append(el('p', '', '<b>Colour.</b>'));
    const tabs = el('div', 'tabs');
    for (const g of DIAMOND_COLOUR) {
      const b = el('button', `tab${g.code === s.colour ? ' on' : ''}`, g.code);
      b.title = g.band;
      b.addEventListener('click', () => onColour(g.code));
      tabs.append(b);
    }
    c.append(tabs);
    const g = DIAMOND_COLOUR.find((x) => x.code === s.colour) ?? DIAMOND_COLOUR[0];
    c.append(el('p', '', `<b>${g.code} — ${g.band}.</b> ${g.note}.`));
  } else {
    c.append(el('p', '', `<b>Colour.</b> A coloured stone is graded on hue, tone and saturation rather than a letter: ${sp.colourRange}. The cause is ${sp.chromophore}.`));
  }
  return c;
}

/** A place on the stone to draw a line to: any of several points, each with the way its face looks, so the one that faces the camera is used. */
export interface Callout { label: string; detail?: string; at: Array<{ point: Vec3; normal: Vec3 }> }
const one = (point: Vec3, normal: Vec3) => [{ point, normal }];

/** Where the callouts should point, from the analysis: the parts of a cut a jeweller names. */
export function calloutsFor(a: Analysis): Callout[] {
  const m = a.measure;
  const out: Callout[] = [];
  const top = Math.max(...a.levels.map((l) => l.z));
  const bottom = Math.min(...a.levels.map((l) => l.z));
  if (m.tableWidth > 0) out.push({ label: 'table', detail: `${fmt.pct(m.tablePct)} of the width`, at: one([0, 0, top], [0, 0, 1]) });
  else if (a.faceted) out.push({ label: 'apex', detail: 'the facets meet at a point', at: one([0, 0, top], [0, 0, 1]) });
  else out.push({ label: 'dome', detail: `${fmt.mm(m.depth)} high`, at: one([0, 0, top], [0, 0, 1]) });
  // the girdle: its own facets where the cut has them, else points round the widest level
  const girdleFacets = a.facets.filter((f) => f.zone === 'girdle');
  const girdleLevel = a.levels.reduce((best, l) => (l.halfWidth > best.halfWidth ? l : best), a.levels[0]);
  const girdleAt = girdleFacets.length
    ? girdleFacets.map((f) => ({ point: f.centroid, normal: f.normal }))
    : [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const t = (i / 8) * Math.PI * 2;
      return { point: [Math.cos(t) * girdleLevel.halfLength, Math.sin(t) * girdleLevel.halfWidth, girdleLevel.z] as Vec3, normal: [Math.cos(t), Math.sin(t), 0] as Vec3 };
    });
  out.push({ label: 'girdle', detail: m.girdleThickness > 1e-3 ? `${fmt.mm(m.girdleThickness)} thick` : 'the widest edge', at: girdleAt });
  if (m.pavilionDepth > 1e-3) {
    out.push({ label: m.culetWidth > 1e-3 ? 'keel' : 'culet', detail: m.culetWidth > 1e-3 ? `${fmt.mm(m.culetWidth)} long` : 'pointed', at: one([0, 0, bottom], [0, 0, -1]) });
  } else if (a.faceted) {
    out.push({ label: 'back', detail: 'flat', at: one([0, 0, bottom], [0, 0, -1]) });
  } else {
    out.push({ label: 'base', detail: 'flat', at: one([0, 0, bottom], [0, 0, -1]) });
  }
  // every facet of a band is a candidate; whichever faces the camera is pointed at
  for (const b of a.bands) {
    const at = a.facets.filter((f) => f.zone === b.zone && f.band === b.index).map((f) => ({ point: f.centroid, normal: f.normal }));
    if (!at.length) continue;
    out.push({ label: b.label, detail: `${b.count} facets at ${b.angle.toFixed(1)}°`, at });
  }
  return out;
}


/**
 * The callouts, drawn each frame: a dot on the point, a line to a tag
 * pushed out from the stone's centre, hidden when the face looks away.
 */
export class Callouts {
  private items: Callout[] = [];
  private tags: HTMLDivElement[] = [];
  private lines: SVGLineElement[] = [];
  private dots: SVGCircleElement[] = [];
  /** The pose matrix, part space to world. */
  matrix: Float32Array = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  visible = true;

  constructor(private svg: SVGSVGElement, private host: HTMLElement, private viewer: Viewer) {}

  set(items: Callout[]) {
    this.items = items;
    this.svg.innerHTML = '';
    this.host.innerHTML = '';
    this.tags = []; this.lines = []; this.dots = [];
    for (const it of items) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '2.5');
      this.svg.append(line, dot);
      const tag = el('div', 'tag', `${it.label}${it.detail ? `<small>${it.detail}</small>` : ''}`);
      this.host.append(tag);
      this.lines.push(line); this.dots.push(dot); this.tags.push(tag);
    }
    this.update();
  }

  private world(p: Vec3): Vec3 {
    const m = this.matrix;
    return [
      m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
      m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
      m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
    ];
  }
  private worldDir(n: Vec3): Vec3 {
    const m = this.matrix;
    return [m[0] * n[0] + m[4] * n[1] + m[8] * n[2], m[1] * n[0] + m[5] * n[1] + m[9] * n[2], m[2] * n[0] + m[6] * n[1] + m[10] * n[2]];
  }

  /** How much of the right of the picture the notes cover, so the tags keep out from under them. */
  reserveRight = 0;

  update() {
    const eye = this.viewer.camera.position;
    const w = this.host.clientWidth - this.reserveRight, h = this.host.clientHeight;
    // which points can be seen: on the page, and on a face turned toward the camera
    const shown: Array<{ i: number; s: [number, number] }> = [];
    this.items.forEach((it, i) => {
      // of the places this could point at, the one whose face is turned
      // most squarely to the camera and is on the page
      let best: [number, number] | null = null, bestFacing = 0;
      if (this.visible) {
        for (const c of it.at) {
          const p = this.world(c.point);
          const n = this.worldDir(c.normal);
          const toEye: Vec3 = [eye[0] - p[0], eye[1] - p[1], eye[2] - p[2]];
          const d = Math.hypot(toEye[0], toEye[1], toEye[2]) || 1;
          const facing = (n[0] * toEye[0] + n[1] * toEye[1] + n[2] * toEye[2]) / d;
          if (facing <= bestFacing) continue;
          const s = this.viewer.project(p);
          if (s && s[0] > 0 && s[0] < w && s[1] > 0 && s[1] < h) { best = s; bestFacing = facing; }
        }
      }
      if (best) shown.push({ i, s: best });
      else { this.tags[i].hidden = true; this.lines[i].setAttribute('visibility', 'hidden'); this.dots[i].setAttribute('visibility', 'hidden'); }
    });
    // The tags stand in a column down the left of the picture, in the
    // order their points fall down the screen, spaced so none overlaps;
    // each is joined to its point by a line, as an anatomical plate is.
    shown.sort((a, b) => a.s[1] - b.s[1]);
    const gap = 34, x = 16;
    const total = shown.length * gap;
    let y = Math.max(20, Math.min(h - total, (shown.reduce((acc, e) => acc + e.s[1], 0) / (shown.length || 1)) - total / 2));
    for (const { i, s } of shown) {
      const tag = this.tags[i], line = this.lines[i], dot = this.dots[i];
      tag.hidden = false;
      tag.style.transform = `translate(${x}px, ${y.toFixed(0)}px) translate(0, -50%)`;
      const tw = tag.offsetWidth;
      line.setAttribute('visibility', 'visible');
      line.setAttribute('x1', s[0].toFixed(1)); line.setAttribute('y1', s[1].toFixed(1));
      line.setAttribute('x2', (x + tw).toFixed(1)); line.setAttribute('y2', y.toFixed(1));
      dot.setAttribute('visibility', 'visible');
      dot.setAttribute('cx', s[0].toFixed(1)); dot.setAttribute('cy', s[1].toFixed(1));
      y += gap;
    }
  }
}
