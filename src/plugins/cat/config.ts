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
import type { CatConfig } from "./draw";

const PATTERNS = ["plain", "striped", "masked", "patched", "speckled", "blaze"] as const;
const MOODS = ["calm", "smug", "wide", "sleepy", "derp"] as const;
const EAR_SHAPES = ["upright", "folded"] as const;

export const catTraits = {
  coat: {
    hue: seeded(0, 360),
    saturation: seeded(0.48, 0.92),
    lightness: seeded(0.5, 0.72),
    pattern: pick(() => [...PATTERNS]),
  },

  face: {
    width: seeded(0.9, 1.16),
    floof: seeded(0, 1),
  },

  ears: {
    size: seeded(0.85, 1.22),
    shape: pick(() => [...EAR_SHAPES]),
    tuft: seeded(0, 1),
  },

  eyes: {
    hue: seeded(40, 210),
    aperture: seeded(0.5, 1),
    odd: seeded(0, 1),
  },

  whiskers: {
    spread: seeded(0.82, 1.2),
  },

  mood: pick(() => [...MOODS]),
};

export type CatTraits = typeof catTraits;
export type CatValues = Config<CatTraits>;
export type CatOverrides = Override<CatTraits>;

export function resolveCat(seed: string, overrides?: CatOverrides): CatConfig {
  const values: CatValues = derive(merge<CatTraits>(catTraits, overrides), seed);
  const rngSeed = Math.floor(sampleUnit(seed, "cat.marks") * 4294967296);
  return { ...values, palette: buildPalette(values), name: nameFor(seed), rngSeed };
}

export default resolveCat;
