/**
 * seedstone — public entry point.
 *
 * Build any seed-driven visual with `create(plugin, el, seed)`. Gem, cat, and
 * fox implementations are bundled; add your own with `definePlugin`.
 */

// Core engine
export {
  constant,
  seeded,
  pick,
  derive,
  merge,
  isConstant,
  isSeeded,
  isPick,
  sampleUnit,
  mulberry32,
  hash2D,
  hslToHex,
} from "./core/index";

export type {
  Trait,
  ConstantTrait,
  SeededTrait,
  PickTrait,
  Traits,
  Config,
  Override,
} from "./core/index";

// Plugin framework
export { definePlugin, create } from "./core/index";
export type { Plugin, View, CreateOptions } from "./core/index";

// Gem plugin
export { gem, gemTraits, buildGeometry, listCuts } from "./plugins/gem/index";
export type { GemConfig, GemTraits, GemOverrides, GemCut, GemCutModule } from "./plugins/gem/index";

// Cat plugin
export { cat, catTraits, renderCat } from "./plugins/cat/index";
export type { CatConfig, CatTraits, CatOverrides, CatValues, Palette } from "./plugins/cat/index";

// Fox plugin (SVG via svg.js)
export { fox } from "./plugins/fox/index";
export type {
  FoxConfig,
  FoxTraits,
  FoxOverrides,
  FoxValues,
  FoxPalette,
} from "./plugins/fox/index";
