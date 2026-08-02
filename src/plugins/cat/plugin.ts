import { definePlugin, mountString } from "../../core/index";
import { catTraits, resolveCat, type CatTraits, type CatOverrides } from "./config";
import { drawCat, type CatConfig } from "./draw";

export const cat = definePlugin<CatTraits, CatConfig>({
  id: "cat",
  name: "Cat",
  traits: catTraits,
  mount: (container, seed, options = {}) =>
    mountString<CatConfig, CatOverrides>(container, seed, resolveCat, drawCat, options),
});
