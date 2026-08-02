import { definePlugin } from "../../core/index.js";
import { GemRenderer, type GemOptions, type GemView } from "./renderer.js";
import { gemTraits, type GemTraits, type GemConfig } from "./config.js";

export const gem = definePlugin<GemTraits, GemConfig, GemOptions, GemView>({
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
      autoRotate: options.autoRotate,
      pixelRatio: options.pixelRatio,
      targetFPS: options.targetFPS,
      preserveDrawingBuffer: options.preserveDrawingBuffer,
      onReady: options.onReady,
    }),
});
