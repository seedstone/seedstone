/**
 * fox — trait declaration and resolver for a deterministic flat-design fox bust.
 *
 * Like the cat plugin, built on the core engine and rendered to SVG — but drawn with
 * the svg.js element API (see ./draw) rather than string concatenation, so the
 * exact same drawing code runs in the browser against the real DOM and headless
 * in Node via svgdom (see ./render). Flip any trait between fixed and seed-driven
 * by editing its constructor.
 */

import {
  seeded,
  pick,
  derive,
  merge,
  sampleUnit,
  type Config,
  type Override,
} from "../../core/index";
import { buildPalette } from "./palette";
import { nameFor } from "./name";
import type { FoxConfig } from "./draw";

const PATTERNS = ["plain", "blaze", "masked", "sooty", "freckled"] as const;
const EXPRESSIONS = ["sly", "alert", "calm", "sleepy", "playful"] as const;

export const foxTraits = {
  coat: {
    hue: seeded(0, 360),
    saturation: seeded(0.55, 0.95),
    lightness: seeded(0.48, 0.64),
    pattern: pick(() => [...PATTERNS]),
  },

  face: {
    width: seeded(0.92, 1.12),
    ruff: seeded(0, 1),
  },

  ears: {
    size: seeded(0.9, 1.25),
    tuft: seeded(0, 1),
  },

  eyes: {
    hue: seeded(18, 55),
    aperture: seeded(0.5, 1),
    odd: seeded(0, 1),
  },

  snout: {
    length: seeded(0.88, 1.12),
  },

  expression: pick(() => [...EXPRESSIONS]),
};

export type FoxTraits = typeof foxTraits;
export type FoxValues = Config<FoxTraits>;
export type FoxOverrides = Override<FoxTraits>;

export function resolveFox(seed: string, overrides?: FoxOverrides): FoxConfig {
  const values: FoxValues = derive(merge<FoxTraits>(foxTraits, overrides), seed);
  const rngSeed = Math.floor(sampleUnit(seed, "fox.marks") * 4294967296);
  return { ...values, palette: buildPalette(values), name: nameFor(seed), rngSeed };
}

export default resolveFox;
