import { resolveCat } from "./config.js";
import { drawCat } from "./draw.js";
import type { CatOverrides } from "./config.js";

/** Renders a cat to an SVG string without a DOM. */
export function renderCat(seed: string, overrides?: CatOverrides): string {
  return drawCat(resolveCat(seed, overrides));
}

export { cat } from "./plugin.js";

export { catTraits } from "./config.js";
export type { CatTraits, CatValues, CatOverrides, CatConfig } from "./config.js";
export type { Palette } from "./palette.js";
