import { resolveCat } from "./config";
import { drawCat } from "./draw";
import type { CatOverrides } from "./config";

/** Renders a cat to an SVG string without a DOM. */
export function renderCat(seed: string, overrides?: CatOverrides): string {
  return drawCat(resolveCat(seed, overrides));
}

export { cat } from "./plugin";

export { catTraits } from "./config";
export type { CatTraits, CatValues, CatOverrides } from "./config";
export type { Palette } from "./palette";
export type { CatConfig } from "./draw";
