import { createSVGWindow } from "svgdom";
import { SVG, registerWindow, type Svg } from "@svgdotjs/svg.js";
import { resolveFox, type FoxOverrides } from "./config";
import { drawFox } from "./draw";

/** Renders a fox to an SVG string using svgdom. */
export function renderFox(seed: string, overrides?: FoxOverrides): string {
  const window = createSVGWindow();
  registerWindow(window, window.document);
  const canvas = SVG(window.document.documentElement) as Svg;
  canvas.viewbox(0, 0, 256, 256).attr({ width: "100%", height: "100%" });
  drawFox(canvas, resolveFox(seed, overrides));
  return canvas.svg();
}
