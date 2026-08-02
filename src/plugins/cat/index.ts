/**
 * A deterministic, fully-procedural SVG cat avatar from any string.
 *
 * The same string always yields the same cat. Every trait is drawn from SVG
 * primitives — no image or texture assets. `renderCat` runs anywhere a
 * string does (browser, server, build step). `cat` implements the plugin
 * contract; mount it into a container with `create(cat, el, seed)`.
 */

import { resolveCat } from "./config";
import { drawCat } from "./draw";
import type { CatOverrides } from "./config";

/** Render a cat to an SVG string — no DOM needed. Ideal for SSR, static export,
 *  or tests. The same pipeline `cat.mount` uses. */
export function renderCat(seed: string, overrides?: CatOverrides): string {
  return drawCat(resolveCat(seed, overrides));
}

export { cat } from "./plugin";

export { catTraits } from "./config";
export type { CatTraits, CatValues, CatOverrides } from "./config";
export type { Palette } from "./palette";
export type { CatConfig } from "./draw";
