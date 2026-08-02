/**
 * @seedstone/gem — the gem plugin: render a 3D rotating gem from a string seed.
 */

export { gem } from "./plugin";

export { gemTraits } from "./config";
export type { GemTraits, GemConfig, GemOverrides } from "./config";

export { buildGeometry, listCuts } from "./geometries/index";
export type { GemCutModule, GemCut } from "./geometries/index";
