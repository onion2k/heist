/**
 * The page: a stone chosen by species and cut, built by the renderer's own
 * gem part, drawn by its path tracer, and read back off the mesh for the
 * cards and callouts laid over it.
 */
import { Assembly } from 'artshape-render/assembly/assembly';
import { groupByMesh } from 'artshape-render/assembly/groups';
import { identity, multiply, rotationAbout } from 'artshape-render/geom/transform';
import { gem, type GemCut } from 'artshape-render/parts/gem';
import type { Part } from 'artshape-render/parts/types';
import type { EnvPreset } from 'artshape-render/render/env';
import { metals } from 'artshape-render/render/materials';
import { Viewer, tableNames, type Quality, type TableName } from 'artshape-render/render/viewer';
import { analyse, carats, type Analysis, type Facet } from './analysis';
import { CUTS, cutKeys, FAMILIES } from './cuts';
import { colourChoices, colourNote, colouredMaterial } from './colours';
import { clarityScale, SPECIES, speciesKeys } from './gems';
import { meanRadiance } from 'artshape-render/render/hdr';
import { LIGHTINGS, lightingByKey } from './lighting';
import { calloutsFor, Callouts, cutCard, describeFacet, facetsCard, gradingCard, headerCard, opticsCard, stoneCard, TABS, type Specimen, type Tab } from './overlay';
import { section as sectionOf } from './rays';
import { RIGS, rigNames } from './rigs';
import { el, picker, section, slider, toggle } from './ui';

const stage = document.getElementById('stage')!;
const controlsEl = document.getElementById('controls')!;
const overlayEl = document.getElementById('overlay')!;
const loading = document.getElementById('loading') as HTMLElement;
const waitingOn = (what: string) => { loading.querySelector('.what')!.textContent = what; };

let viewer: Viewer;
try {
  viewer = await Viewer.create(stage, (info) => {
    waitingOn(`GPU device lost (${info.reason}): ${info.message || 'the GPU timed out'} — reload the page`);
    loading.classList.remove('done');
  }, {
    // a stone's paths run to sixteen bounces here, where the renderer's own
    // six leave a diamond's pavilion dark: a fifth more a sample, and this
    // is the one page that looks at nothing but the stone
    gemBounces: 16,
  });
} catch (err) {
  waitingOn(`The renderer is unavailable: ${(err as Error).message}. This needs WebGPU — a current Chrome, Edge or Safari.`);
  loading.querySelector('.ring')?.remove();
  throw err;
}
viewer.onFirstFrame = () => {
  loading.classList.add('done');
  setTimeout(() => loading.remove(), 500);
};

// ---- state ----

type Pose = 'standing' | 'table down' | 'on its side';
const POSES: Record<Pose, () => Float32Array> = {
  standing: () => identity(),
  'table down': () => rotationAbout([1, 0, 0], Math.PI),
  'on its side': () => multiply(rotationAbout([0, 0, 1], Math.PI / 2), rotationAbout([1, 0, 0], Math.PI / 2)),
};

const state = {
  species: 'diamond',
  cut: 'brilliant' as GemCut,
  width: 6.5,
  /** Overrides, null for the cut's own. */
  length: null as number | null,
  depth: null as number | null,
  table: null as number | null,
  facets: null as number | null,
  /** The brilliant's own, for the round and the oval; null for the trade's ideals. */
  crownAngle: null as number | null,
  pavilionAngle: null as number | null,
  star: null as number | null,
  lowerHalf: null as number | null,
  culet: null as number | null,
  pose: 'standing' as Pose,
  clarity: 'VS1',
  colour: 'F',
  tone: 1,
  saturation: 1,
  /** A baked preset, or one of the gemmologist's lights. */
  lighting: 'studio',
  tab: 'cut' as Tab,
  rayTilt: 0,
  overlay: true,
  callouts: true,
  quality: 'traced' as Quality,
  table_: 'slate' as TableName,
  exposure: 1,
  envStrength: 0.35,
  keyStrength: 1.2,
  keyElevation: 0.95,
  keyAzimuth: -0.8,
  keyWarmth: 0.15,
  keySize: 0.05,
  rig: 'jeweller\'s case',
  lens: 60,
  turntable: false,
};

/** The cut's own proportions, measured off a stone built with no overrides. */
function natural(cut: GemCut, width: number) {
  const part = gem({ cut, width });
  const a = analyse(part, CUTS[cut].bands);
  return { length: a.measure.length, depth: a.measure.depth, table: a.measure.tablePct / 100, facets: a.counts.girdle || 16 };
}

let part: Part;
let analysis: Analysis;
let sectionPoly: ReturnType<typeof sectionOf> = [];
const callouts = new Callouts(document.getElementById('callouts') as unknown as SVGSVGElement, document.getElementById('calloutTags')!, viewer);
let held: Facet | null = null;
let piece = { span: 10, top: 2 };

function specimen(): Specimen {
  const species = SPECIES[state.species];
  const mat = metals[part.material?.metal ?? species.key] ?? metals[species.key];
  const scale = clarityScale(species);
  const lighting = lightingByKey(state.lighting);
  return {
    species, cut: CUTS[state.cut], analysis,
    clarity: scale.find((g) => g.code === state.clarity) ?? scale[Math.min(3, scale.length - 1)],
    colour: { key: state.colour, ...colourNote(state.species, state.colour) },
    lightingNote: lighting?.analysis ? lighting.note : undefined,
    section: sectionPoly,
    material: { ior: mat.ior ?? 1.5, dispersion: mat.dispersion ?? 0, colour: mat.colour ?? [1, 1, 1], sparkle: mat.sparkle ?? 0 },
  };
}

// ---- building ----

let framed = '';
function build(reframe = false) {
  const spec = {
    cut: state.cut, width: state.width,
    length: state.length ?? undefined, depth: state.depth ?? undefined, table: state.table ?? undefined,
    facets: state.facets ?? undefined,
    crownAngle: state.crownAngle ?? undefined, pavilionAngle: state.pavilionAngle ?? undefined,
    star: state.star ?? undefined, lowerHalf: state.lowerHalf ?? undefined, culet: state.culet ?? undefined,
  };
  part = gem(spec);
  // the species' optics in the colour chosen, registered with the renderer under its own name
  part.material = { metal: colouredMaterial(state.species, state.colour, state.tone, state.saturation), finish: 'polished' };
  analysis = analyse(part, CUTS[state.cut].bands);
  sectionPoly = sectionOf(part.mesh);

  const assembly = new Assembly('stone');
  const pose = POSES[state.pose]();
  assembly.place(part, pose);
  viewer.setInstanced(groupByMesh(assembly));
  const b = assembly.bounds();
  piece = { span: Math.max(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]), top: b.max[2] };
  if (RIGS[state.rig].length > 2) applyKey();
  const key = `${state.cut}:${state.pose}`;
  if (reframe || framed !== key) {
    viewer.frameBounds(b);
    // a stone is looked at from a few widths away, whatever the lens: close
    // enough to fill the frame, far enough that the callouts have room
    viewer.setView({ distance: state.width * 5 });
    framed = key;
  }
  callouts.matrix = pose;
  callouts.set(calloutsFor(analysis));
  held = null;
  renderOverlay();
  updateStatus();
}

// ---- the overlay ----

let facetNote: HTMLDivElement | null = null;
let highlightFacet: ((f: Facet | null) => void) | null = null;

function showFacet(f: Facet | null) {
  const shown = f ?? held;
  if (facetNote) facetNote.innerHTML = shown ? describeFacet(analysis, shown) : 'Hover a facet in the diagrams to read it; click to hold it.';
  highlightFacet?.(shown);
  const base = calloutsFor(analysis);
  if (shown) base.push({ label: `facet ${shown.index + 1}`, detail: `${shown.angle.toFixed(1)}° · ${shown.area.toFixed(2)} mm²`, at: [{ point: shown.centroid, normal: shown.normal }] });
  callouts.set(base);
}

function renderOverlay() {
  overlayEl.classList.toggle('hidden', !state.overlay);
  callouts.reserveRight = state.overlay ? overlayEl.offsetWidth : 0;
  overlayEl.innerHTML = '';
  const s = specimen();
  overlayEl.append(headerCard(s));
  const tabs = el('div', 'tabs');
  for (const t of TABS) {
    const b = el('button', `tab${t.key === state.tab ? ' on' : ''}`, t.label);
    b.addEventListener('click', () => { state.tab = t.key; renderOverlay(); });
    tabs.append(b);
  }
  const tabCard = el('div', 'card');
  tabCard.append(tabs);
  overlayEl.append(tabCard);
  facetNote = null;
  highlightFacet = null;
  switch (state.tab) {
    case 'cut': overlayEl.append(cutCard(s)); break;
    case 'facets': {
      const f = facetsCard(s, { onHover: (x) => showFacet(x), onPick: (x) => { held = held === x ? null : x; showFacet(null); } });
      facetNote = f.note;
      highlightFacet = f.highlight;
      overlayEl.append(f.card);
      if (held) showFacet(null);
      break;
    }
    case 'stone': overlayEl.append(stoneCard(s)); break;
    case 'optics': overlayEl.append(opticsCard(s, state.rayTilt, (v) => { state.rayTilt = v; })); break;
    case 'grading':
      overlayEl.append(gradingCard(s, (code) => { state.clarity = code; renderOverlay(); }, (code) => { state.colour = code; colourHost.replaceChildren(colourPicker()); build(); }));
      break;
  }
}

// ---- the status line under the picture ----

const status = el('div', 'trace');
Object.assign(status.style, { position: 'absolute', left: '12px', bottom: '10px', zIndex: '3', pointerEvents: 'none' });
stage.append(status);
function updateStatus() {
  const ct = carats(analysis.volume, SPECIES[state.species].gravity);
  let trace = '';
  if (state.quality === 'traced') {
    const n = viewer.traceSamples, limit = viewer.traceLimit;
    trace = n >= limit && limit > 0 ? `<b>traced · ${n} samples, converged</b>` : n > 0 ? `<b>tracing · ${n} / ${limit} samples</b>` : '<b>tracing when the view is still</b>';
    status.classList.toggle('busy', n < limit);
  } else {
    trace = `<b>${state.quality}</b>`;
  }
  status.innerHTML = `${trace} · ${SPECIES[state.species].name.toLowerCase()} ${CUTS[state.cut].name.toLowerCase()} ${state.width.toFixed(1)} mm · ${ct.toFixed(2)} ct · drag to orbit, wheel to zoom · <kbd>h</kbd> hides the notes`;
}

// ---- controls ----

const degrees = (v: number) => `${Math.round((v * 180) / Math.PI)}°`;
let lengthSlider: ReturnType<typeof slider>, depthSlider: ReturnType<typeof slider>, tableSlider: ReturnType<typeof slider>, facetsSlider: ReturnType<typeof slider>;
/** The count of facets round the girdle applies where the outline is a curve sampled round; a polygon's corners are its corners. */
const facetsApplies = (cut: GemCut) => CUTS[cut].curved;
const isBrilliant = (cut: GemCut) => cut === 'brilliant' || cut === 'oval';
let brilliantSet: HTMLFieldSetElement;
let crownAngleSlider: ReturnType<typeof slider>, pavilionAngleSlider: ReturnType<typeof slider>, starSlider: ReturnType<typeof slider>, lowerHalfSlider: ReturnType<typeof slider>, culetSlider: ReturnType<typeof slider>;

/** Put the proportion sliders back to what the cut gives on its own. */
function resetProportions() {
  state.length = state.depth = state.table = state.facets = null;
  state.crownAngle = state.pavilionAngle = state.star = state.lowerHalf = state.culet = null;
  crownAngleSlider.set(34.5); pavilionAngleSlider.set(40.75); starSlider.set(50); lowerHalfSlider.set(78); culetSlider.set(0);
  brilliantSet.hidden = !isBrilliant(state.cut);
  const n = natural(state.cut, state.width);
  lengthSlider.set(n.length);
  depthSlider.set(n.depth);
  tableSlider.set(n.table * 100);
  facetsSlider.set(n.facets);
  facetsSlider.hidden = !facetsApplies(state.cut);
  tableSlider.hidden = !CUTS[state.cut].hasTable;
}

const colourHost = el('div');
const colourPicker = () => picker('colour', colourChoices(state.species), state.colour, (v) => { state.colour = v; build(); });
colourHost.append(colourPicker());
const toneSlider = slider('tone', 0.5, 1.6, 0.02, 1, (v) => (v < 0.98 ? `lighter ×${(1 / v).toFixed(2)}` : v > 1.02 ? `darker ×${v.toFixed(2)}` : 'as graded'), (v) => { state.tone = v; build(); });
const saturationSlider = slider('saturation', 0, 1.6, 0.02, 1, (v) => (Math.abs(v - 1) < 0.02 ? 'as graded' : `${v.toFixed(2)}×`), (v) => { state.saturation = v; build(); });

const stoneSet = section('Stone',
  picker('species', speciesKeys.map((k) => ({ value: k, label: SPECIES[k].name })), state.species, (v) => {
    state.species = v;
    const scale = clarityScale(SPECIES[v]);
    if (!scale.some((g) => g.code === state.clarity)) state.clarity = scale[Math.min(3, scale.length - 1)].code;
    state.colour = v === 'diamond' ? 'F' : colourChoices(v)[0]?.value ?? '';
    state.tone = 1; state.saturation = 1;
    toneSlider.set(1); saturationSlider.set(1);
    colourHost.replaceChildren(colourPicker());
    build();
  }),
  picker('cut', FAMILIES.map((f) => ({ group: f.name, options: cutKeys.filter((k) => CUTS[k].family === f.key).map((k) => ({ value: k, label: CUTS[k].name })) })), state.cut, (v) => {
    state.cut = v as GemCut;
    resetProportions();
    build(true);
  }),
  slider('width', 2, 20, 0.1, state.width, (v) => `${v.toFixed(1)} mm`, (v) => {
    // the other dimensions follow the width unless they were set by hand
    const scale = v / state.width;
    state.width = v;
    if (state.length !== null) state.length *= scale;
    if (state.depth !== null) state.depth *= scale;
    resetIfNatural();
    build(true);
  }),
  picker('pose', Object.keys(POSES), state.pose, (v) => { state.pose = v as Pose; build(true); }),
  colourHost, toneSlider, saturationSlider,
);
function resetIfNatural() {
  if (state.length === null && state.depth === null && state.table === null && state.facets === null) resetProportions();
  else { const n = natural(state.cut, state.width); if (state.length === null) lengthSlider.set(n.length); if (state.depth === null) depthSlider.set(n.depth); }
}

lengthSlider = slider('length', 2, 40, 0.1, 6.5, (v) => `${v.toFixed(1)} mm`, (v) => { state.length = v; build(); });
depthSlider = slider('depth', 1, 20, 0.05, 4, (v) => `${v.toFixed(2)} mm`, (v) => { state.depth = v; build(); });
tableSlider = slider('table', 30, 85, 1, 56, (v) => `${v.toFixed(0)} %`, (v) => { state.table = v / 100; build(); });
facetsSlider = slider('facets round', 6, 32, 2, 16, (v) => `${v}`, (v) => { state.facets = v; build(); });
const resetRow = el('div', 'actions');
const resetBtn = el('button', '', 'the cut\'s own proportions');
resetBtn.addEventListener('click', () => { resetProportions(); build(); });
resetRow.append(resetBtn);
crownAngleSlider = slider('crown angle', 20, 45, 0.25, 34.5, (v) => `${v.toFixed(2)}°`, (v) => { state.crownAngle = v; state.depth = null; depthSlider.set(natural(state.cut, state.width).depth); build(); });
pavilionAngleSlider = slider('pavilion angle', 35, 46, 0.25, 40.75, (v) => `${v.toFixed(2)}°`, (v) => { state.pavilionAngle = v; state.depth = null; build(); });
starSlider = slider('star length', 30, 75, 1, 50, (v) => `${v} %`, (v) => { state.star = v / 100; build(); });
lowerHalfSlider = slider('lower half length', 55, 90, 1, 78, (v) => `${v} %`, (v) => { state.lowerHalf = v / 100; build(); });
culetSlider = slider('culet', 0, 12, 0.5, 0, (v) => (v === 0 ? 'none' : `${v} %`), (v) => { state.culet = v / 100; build(); });
brilliantSet = section('The brilliant', crownAngleSlider, pavilionAngleSlider, starSlider, lowerHalfSlider, culetSlider);
const proportionSet = section('Proportions', lengthSlider, depthSlider, tableSlider, facetsSlider, resetRow);

const applyKey = () => {
  // under an analysis map the map is the only light, or its colours would mean nothing
  const analysis = !!lightingByKey(state.lighting)?.analysis;
  viewer.setKeyLight({ elevation: state.keyElevation, azimuth: state.keyAzimuth, strength: analysis ? 0 : state.keyStrength, warmth: state.keyWarmth, size: state.keySize });
  viewer.setRig(analysis ? [] : RIGS[state.rig](state.keyAzimuth, state.keyStrength, piece));
};
const applyLighting = () => {
  const l = lightingByKey(state.lighting);
  if (l) {
    const img = l.image();
    viewer.setEnvironmentImage(img, meanRadiance(img));
    if (l.analysis) {
      // read face up, as the instrument is
      viewer.setView({ elevation: 1.55, distance: state.width * 5 });
      viewer.setEnvStrength(1);
    }
  } else {
    viewer.setEnvironment(state.lighting as EnvPreset);
    viewer.setEnvStrength(state.envStrength);
  }
  applyKey();
  renderOverlay();
};
const lightSet = section('Light',
  picker('light', [
    ...['studio', 'daylight', 'dusk', 'gallery'].map((k) => ({ value: k, label: k })),
    ...LIGHTINGS.map((l) => ({ value: l.key, label: `${l.name}${l.analysis ? ' (analysis)' : ''}` })),
  ], state.lighting, (v) => { state.lighting = v; applyLighting(); }),
  picker('rig', rigNames, state.rig, (v) => { state.rig = v; applyKey(); }),
  slider('key', 0, 4, 0.05, state.keyStrength, (v) => `${v.toFixed(2)}×`, (v) => { state.keyStrength = v; applyKey(); }),
  slider('key elevation', 0, 1.55, 0.02, state.keyElevation, degrees, (v) => { state.keyElevation = v; applyKey(); }),
  slider('key azimuth', -3.142, 3.142, 0.02, state.keyAzimuth, degrees, (v) => { state.keyAzimuth = v; applyKey(); }),
  slider('key size', 0, 0.6, 0.01, state.keySize, (v) => (v < 0.005 ? 'point' : degrees(v * 2)), (v) => { state.keySize = v; applyKey(); }),
  slider('ambient', 0, 2, 0.02, state.envStrength, (v) => `${v.toFixed(2)}×`, (v) => { state.envStrength = v; viewer.setEnvStrength(v); }),
  slider('exposure', 0.15, 4, 0.05, state.exposure, (v) => `${v.toFixed(2)}×`, (v) => { state.exposure = v; viewer.setExposure(v); }),
  picker('table', tableNames, state.table_, (v) => { state.table_ = v as TableName; viewer.setTable(state.table_); }),
);

const VIEWS: Record<string, { elevation: number; azimuth: number }> = {
  'three-quarter': { elevation: 0.72, azimuth: 0.87 },
  'face up': { elevation: 1.5, azimuth: 0.87 },
  profile: { elevation: 0.02, azimuth: Math.PI / 2 },
  'end on': { elevation: 0.02, azimuth: 0 },
  low: { elevation: 0.25, azimuth: 0.6 },
};
const traceNote = el('div', 'trace');
const viewSet = section('View',
  picker('quality', ['draft', 'final', 'traced'], state.quality, (v) => { state.quality = v as Quality; viewer.setQuality(state.quality); updateStatus(); }),
  picker('view', Object.keys(VIEWS), 'three-quarter', (v) => viewer.setView({ ...VIEWS[v], distance: state.width * 5 })),
  slider('lens', 24, 135, 1, state.lens, (v) => `${v} mm`, (v) => { state.lens = v; viewer.setLens(v); }),
  toggle('turntable', state.turntable, (v) => { state.turntable = v; }),
  toggle('notes over the picture', state.overlay, (v) => { state.overlay = v; renderOverlay(); }),
  toggle('callouts', state.callouts, (v) => { state.callouts = v; callouts.visible = v; callouts.update(); }),
  traceNote,
);
controlsEl.append(stoneSet, proportionSet, brilliantSet, viewSet, lightSet);

// the notes' width is what the callout column keeps clear of, and it follows the window
new ResizeObserver(() => { callouts.reserveRight = state.overlay ? overlayEl.offsetWidth : 0; callouts.update(); }).observe(overlayEl);

document.addEventListener('keydown', (e) => {
  if (e.key === 'h' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLSelectElement)) {
    state.overlay = !state.overlay;
    state.callouts = state.overlay;
    callouts.visible = state.callouts;
    renderOverlay();
    callouts.update();
  }
});

// ---- go ----

viewer.setQuality(state.quality);
viewer.setEnvironment('studio');
viewer.setEnvStrength(state.envStrength);
viewer.setExposure(state.exposure);
viewer.setTable(state.table_);
viewer.setLens(state.lens);
viewer.setFilm({ tonemap: 1, vignette: 0.18, grain: 0, fringe: 0 });
viewer.setMaterial('platinum', 'polished');
applyKey();
resetProportions();
waitingOn('Cutting the stone…');
build(true);
viewer.setView({ ...VIEWS['three-quarter'], distance: state.width * 5 });
waitingOn('Compiling the shaders…');

let lastTurn = 0;
viewer.onFrame = () => {
  callouts.update();
  updateStatus();
};
// the turntable: a slow spin, which keeps the tracer from ever settling, so it is off by default
const turn = (t: number) => {
  requestAnimationFrame(turn);
  if (!state.turntable) { lastTurn = t; return; }
  const dt = Math.min(t - lastTurn, 50) / 1000;
  lastTurn = t;
  viewer.setView({ azimuth: viewer.viewState().azimuth + dt * 0.35 });
};
requestAnimationFrame(turn);

const calibrate = () => viewer.calibrate().then((v) => {
  if (!v) document.addEventListener('visibilitychange', () => { if (!document.hidden) calibrate(); }, { once: true });
}, (err) => console.warn('calibration failed:', err));
calibrate();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).heist = { state, build, viewer, get analysis() { return analysis; } };
