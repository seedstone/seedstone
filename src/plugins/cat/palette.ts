/**
 * Colour derivation — every swatch is computed from the coat hue, so the whole
 * cat shifts along one axis. The coat carries a light/base pair for a gentle
 * top-down gradient. Pattern choice nudges saturation/lightness so each marking
 * reads correctly. Uses the core `hslToHex` primitive — no local colour maths.
 */

import { hslToHex } from "../../core/index";
import type { CatValues } from "./config";

/** Every fill the drawing needs, as `#rrggbb` strings. */
export interface Palette {
  /** Coat gradient — lit top, base bottom (head, ears, body). */
  coatLight: string;
  coat: string;
  /** Marking ink — stripes, speckles, mask, patch. */
  ink: string;
  /** Muzzle + chest bib — pale, near-white tint. */
  belly: string;
  /** Contour outline. */
  line: string;
  /** Inner-ear pink. */
  earInner: string;
  /** Nose pink. */
  nose: string;
  /** Cheek blush. */
  blush: string;
  /** Left / right iris (right differs when an odd eye lands). */
  irisL: string;
  irisR: string;
}

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);

/** HSL → `#rrggbb` (core's `hslToHex` returns a packed int). */
const hex = (h: number, s: number, l: number): string =>
  "#" +
  hslToHex(((h % 360) + 360) % 360, clamp(s, 0, 1), clamp(l, 0, 1))
    .toString(16)
    .padStart(6, "0");

/** Build the full palette from resolved coat + eye traits. */
export function buildPalette(v: CatValues): Palette {
  const h = v.coat.hue;
  let s = v.coat.saturation;
  let l = v.coat.lightness;

  // Pattern nudges so each marking has contrast to land on.
  if (v.coat.pattern === "masked") l = Math.min(0.78, l + 0.14); // pale body, dark points
  if (v.coat.pattern === "patched") s = Math.min(1, s + 0.06);

  const oddEye = v.eyes.odd > 0.85;
  const eyeR = oddEye ? v.eyes.hue + 150 : v.eyes.hue;

  return {
    coatLight: hex(h, Math.min(1, s + 0.04), Math.min(0.86, l + 0.13)),
    coat: hex(h, s, l),
    ink: hex(h, Math.min(1, s + 0.16), l * 0.46),
    belly: hex(h, s * 0.24, Math.min(0.97, l + 0.34)),
    line: hex(h, s * 0.45, l * 0.24),
    earInner: hex(346, 0.6, 0.85),
    nose: hex(349, 0.64, 0.71),
    blush: hex(352, 0.72, 0.8),
    irisL: hex(v.eyes.hue, 0.74, 0.52),
    irisR: hex(eyeR, 0.74, 0.52),
  };
}
