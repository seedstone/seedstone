import { definePlugin } from "../../core/index";
import { GemRenderer } from "./renderer";
import { gemTraits, type GemTraits, type GemConfig } from "./config";

export const gem = definePlugin<GemTraits, GemConfig>({
  id: "gem",
  name: "Gemstone",
  traits: gemTraits,
  mount: (container, seed, options = {}) =>
    new GemRenderer(seed, {
      container,
      overrides: options.overrides,
      width: options.width,
      height: options.height,
      background: options.background,
      targetFPS: options.targetFPS,
      onReady: options.onReady,
    }),
});
