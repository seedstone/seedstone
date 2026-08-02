import { SVG } from "@svgdotjs/svg.js";
import { definePlugin, type View } from "../../core/index.js";
import {
  foxTraits,
  resolveFox,
  type FoxTraits,
  type FoxOverrides,
  type FoxConfig,
} from "./config.js";
import { drawFox } from "./draw.js";

export const fox = definePlugin<FoxTraits, FoxConfig>({
  id: "fox",
  name: "Fox",
  traits: foxTraits,
  mount: (container, seed, options = {}): View<FoxConfig, FoxOverrides> => {
    const canvas = SVG()
      .addTo(container)
      .viewbox(0, 0, 256, 256)
      .attr({ width: "100%", height: "100%" });

    let currentSeed = seed;
    let overrides = options.overrides ?? {};
    let config = resolveFox(currentSeed, overrides);

    const paint = () => {
      canvas.clear();
      drawFox(canvas, config);
    };
    paint();
    options.onReady?.();

    return {
      get config() {
        return config;
      },
      update(next: string) {
        currentSeed = next;
        config = resolveFox(currentSeed, overrides);
        paint();
      },
      setOverrides(next: FoxOverrides = {}) {
        overrides = next;
        config = resolveFox(currentSeed, overrides);
        paint();
      },
      destroy() {
        canvas.remove();
        container.innerHTML = "";
      },
    };
  },
});
