import { definePlugin, mountString } from "../../core/index.js";
import {
  catTraits,
  resolveCat,
  type CatTraits,
  type CatOverrides,
  type CatConfig,
} from "./config.js";
import { drawCat } from "./draw.js";

export const cat = definePlugin<CatTraits, CatConfig>({
  id: "cat",
  name: "Cat",
  traits: catTraits,
  mount: (container, seed, options = {}) =>
    mountString<CatConfig, CatOverrides>(container, seed, resolveCat, drawCat, options),
});
