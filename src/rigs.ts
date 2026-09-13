/**
 * The studio rig, as presets set round the key: after the sketchbook's,
 * in artshape/src/rigs.ts. A fill is broad, low and cool on the far side;
 * a rim is small and behind, opposite the key; the lamps stand in the
 * scene and hang against the stone's own size.
 */
import type { RigLight } from 'artshape-render/render/viewer';

export interface Piece { span: number; top: number }

function spherical(azimuth: number, elevation: number, distance: number, z: number): [number, number, number] {
  const ce = Math.cos(elevation);
  return [Math.cos(azimuth) * ce * distance, Math.sin(azimuth) * ce * distance, Math.sin(elevation) * distance + z];
}

export const RIGS: Record<string, (azimuth: number, strength: number, piece: Piece) => RigLight[]> = {
  none: () => [],
  fill: (a, k) => [{ elevation: 0.35, azimuth: a + 2.0, strength: 0.3 * k, warmth: -0.25, size: 0.45 }],
  rim: (a, k) => [{ elevation: 0.65, azimuth: a + Math.PI, strength: 0.9 * k, warmth: 0.1, size: 0.05 }],
  'three point': (a, k) => [
    { elevation: 0.35, azimuth: a + 2.0, strength: 0.3 * k, warmth: -0.25, size: 0.45 },
    { elevation: 0.65, azimuth: a + Math.PI, strength: 0.9 * k, warmth: 0.1, size: 0.05 },
  ],
  clamshell: (a, k) => [
    { elevation: 0.15, azimuth: a, strength: 0.4 * k, warmth: 0, size: 0.5 },
    { elevation: 0.7, azimuth: a - 2.4, strength: 0.6 * k, warmth: 0.15, size: 0.08 },
    { elevation: 0.7, azimuth: a + 2.4, strength: 0.6 * k, warmth: 0.15, size: 0.08 },
  ],
  /** Pinpoints round the stone: what a jeweller's case does, and what makes a brilliant flash. */
  'jeweller\'s case': (a, k) => [0, 1, 2, 3, 4].map((i) => ({
    elevation: 0.9 - (i % 2) * 0.35, azimuth: a + (i + 1) * (Math.PI * 2 / 6), strength: 0.55 * k, warmth: 0.05, size: 0.02,
  })),
  'bench lamp': (a, k, piece) => [{
    elevation: 0, azimuth: 0, warmth: 0.35, strength: 1.2 * k, size: Math.max(piece.span * 0.3, 4),
    at: spherical(a + 0.45, 0.85, Math.max(piece.span * 2.1, 60), piece.top), aim: [0, 0, piece.top * 0.45], cone: [26, 46],
  }],
  'case spot': (a, k, piece) => [{
    elevation: 0, azimuth: 0, warmth: -0.1, strength: 1.5 * k, size: Math.max(piece.span * 0.12, 1.5),
    at: spherical(a + 0.2, 1.24, Math.max(piece.span * 2.6, 80), piece.top), aim: [0, 0, piece.top * 0.4], cone: [11, 19],
  }],
};
export const rigNames = Object.keys(RIGS);
