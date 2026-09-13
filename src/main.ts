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
import { CUTS, cutKeys } from './cuts';
import { clarityScale, SPECIES, speciesKeys } from './gems';
import { calloutsFor, Callouts, cutCard, describeFacet, facetsCard, gradingCard, headerCard, opticsCard, stoneCard, TABS, type Specimen, type Tab } from './overlay';
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
  pose: 'standing' as Pose,
  clarity: 'VS1',
  colour: 'F',
  tab: 'cut' as Tab,
  overlay: true,
  callouts: true,
  quality: 'traced' as Quality,
  environment: 'studio' as EnvPreset,
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
const callouts = new Callouts(document.getElementById('callouts') as unknown as SVGSVGElement, document.getElementById('calloutTags')!, viewer);
let held: Facet | null = null;
let piece = { span: 10, top: 2 };

function specimen(): Specimen {
  const species = SPECIES[state.species];
  const mat = metals[species.key];
  const scale = clarityScale(species);
  return {
    species, cut: CUTS[state.cut], analysis,
    clarity: scale.find((g) => g.code === state.clarity) ?? scale[Math.min(3, scale.length - 1)],
    colour: state.colour,
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
  };
  part = gem(spec);
  part.material = { metal: state.species, finish: 'polished' };
  analysis = analyse(part, CUTS[state.cut].bands);

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
    case 'optics': overlayEl.append(opticsCard(s)); break;
    case 'grading':
      overlayEl.append(gradingCard(s, (code) => { state.clarity = code; renderOverlay(); }, (code) => { state.colour = code; renderOverlay(); }));
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
const facetsApplies = (cut: GemCut) => !['step', 'baguette', 'cabochon'].includes(cut);

/** Put the proportion sliders back to what the cut gives on its own. */
function resetProportions() {
  state.length = state.depth = state.table = state.facets = null;
  const n = natural(state.cut, state.width);
  lengthSlider.set(n.length);
  depthSlider.set(n.depth);
  tableSlider.set(n.table * 100);
  facetsSlider.set(n.facets);
  facetsSlider.hidden = !facetsApplies(state.cut);
  tableSlider.hidden = state.cut === 'rose' || state.cut === 'cabochon';
}

const stoneSet = section('Stone',
  picker('species', speciesKeys.map((k) => ({ value: k, label: SPECIES[k].name })), state.species, (v) => {
    state.species = v;
    const scale = clarityScale(SPECIES[v]);
    if (!scale.some((g) => g.code === state.clarity)) state.clarity = scale[Math.min(3, scale.length - 1)].code;
    build();
  }),
  picker('cut', cutKeys.map((k) => ({ value: k, label: CUTS[k].name })), state.cut, (v) => {
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
const proportionSet = section('Proportions', lengthSlider, depthSlider, tableSlider, facetsSlider, resetRow);

const applyKey = () => {
  viewer.setKeyLight({ elevation: state.keyElevation, azimuth: state.keyAzimuth, strength: state.keyStrength, warmth: state.keyWarmth, size: state.keySize });
  viewer.setRig(RIGS[state.rig](state.keyAzimuth, state.keyStrength, piece));
};
const lightSet = section('Light',
  picker('environment', ['studio', 'daylight', 'dusk', 'gallery'], state.environment, (v) => { state.environment = v as EnvPreset; viewer.setEnvironment(state.environment); }),
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
controlsEl.append(stoneSet, proportionSet, viewSet, lightSet);

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
viewer.setEnvironment(state.environment);
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
