/**
 * The drawing — builds a flat-design fox bust onto an svg.js canvas.
 *
 * Unlike the cat renderer (string concatenation), the fox is drawn with the svg.js
 * element API: the same `drawFox(canvas, config)` runs against a browser <svg>
 * (real DOM) or a headless svgdom document (see ./render). A face-forward bust
 * with pointed ears, a white muzzle mask, slanted eyes, and a gradiented coat;
 * the seed scales the silhouette and swaps colour, markings, ear size, eye
 * colour, and expression — so every output is a valid fox.
 */

import type { Svg } from "@svgdotjs/svg.js";
import { mulberry32 } from "../../core/index";
import type { FoxValues } from "./config";
import type { Palette } from "./palette";

/** A fox ready to draw: resolved traits, palette, name, and a placement seed. */
export interface FoxConfig extends FoxValues {
  palette: Palette;
  name: string;
  /** Integer seed for marking placement (freckles). */
  rngSeed: number;
}

const CX = 128;
const r = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);

/** Draw a resolved fox onto an svg.js canvas (viewBox/size set by the caller). */
export function drawFox(canvas: Svg, cfg: FoxConfig): void {
  const { coat, face, ears, eyes, snout, expression, palette: p } = cfg;
  const rng = mulberry32(cfg.rngSeed);

  const fw = face.width;
  const es = ears.size;
  const sl = snout.length;
  const hw = 78 * fw; // forehead half-width
  const crownY = 82;
  const foreheadY = 118;
  const cheekY = 152;
  const snoutTopY = 168;
  const snoutTipY = 206 + (sl - 1) * 18;
  const snoutHalf = 22;
  const eyeY = 138;
  const eyeDX = hw * 0.4;
  const exL = CX - eyeDX;
  const exR = CX + eyeDX;

  // Pin the gradient id to the seed so output is byte-stable (svg.js otherwise
  // assigns a global auto-incrementing id) and collision-free across foxes.
  const uid = (cfg.rngSeed >>> 0).toString(36);
  const coatGrad = canvas
    .gradient("linear", (add) => {
      add.stop(0, p.coatLight);
      add.stop(1, p.coat);
    })
    .from(0, 0)
    .to(0, 1)
    .attr("id", `fxg${uid}`);

  const edge = (w: number) => ({ color: p.line, width: w, linejoin: "round", linecap: "round" });

  // ── Ears (behind the head) ──────────────────────────────────────────────────
  const earPts = (s: 1 | -1) => ({
    ox: CX + s * hw * 0.96,
    oy: foreheadY - 4,
    ix: CX + s * hw * 0.32,
    iy: crownY + 4,
    tx: CX + s * hw * 0.74,
    ty: crownY - 58 * es,
  });

  for (const s of [-1, 1] as const) {
    const e = earPts(s);
    canvas
      .polygon(`${r(e.ox)},${r(e.oy)} ${r(e.tx)},${r(e.ty)} ${r(e.ix)},${r(e.iy)}`)
      .fill(p.coat)
      .stroke(edge(3.5));
  }
  for (const s of [-1, 1] as const) {
    const e = earPts(s);
    const ox = CX + s * hw * 0.8;
    const ix = CX + s * hw * 0.44;
    canvas
      .polygon(`${r(ox)},${r(foreheadY - 8)} ${r(e.tx)},${r(e.ty + 26)} ${r(ix)},${r(crownY + 8)}`)
      .fill(p.earInner);
  }
  for (const s of [-1, 1] as const) {
    const e = earPts(s);
    const p1x = e.tx + (e.ox - e.tx) * 0.4;
    const p1y = e.ty + (e.oy - e.ty) * 0.4;
    const p2x = e.tx + (e.ix - e.tx) * 0.4;
    const p2y = e.ty + (e.iy - e.ty) * 0.4;
    canvas.polygon(`${r(e.tx)},${r(e.ty)} ${r(p1x)},${r(p1y)} ${r(p2x)},${r(p2y)}`).fill(p.dark);
  }
  if (ears.tuft >= 0.4) {
    const len = 7 + ears.tuft * 11;
    for (const s of [-1, 1] as const) {
      const e = earPts(s);
      const bx = CX + s * hw * 0.58;
      const by = (e.iy + e.ty) / 2 + 12;
      canvas
        .path(`M ${r(bx)},${r(by)} q ${r(s * -4)},${r(-len)} ${r(s * -1)},${r(-len * 1.5)}`)
        .fill("none")
        .stroke({ color: p.belly, width: 2.4, linecap: "round" });
    }
  }

  // ── Head ────────────────────────────────────────────────────────────────────
  const head =
    `M ${CX},${crownY} ` +
    `C ${r(CX + hw * 0.66)},${crownY} ${r(CX + hw)},${r(foreheadY - 16)} ${r(CX + hw)},${foreheadY} ` +
    `L ${r(CX + hw)},${cheekY} ` +
    `C ${r(CX + hw)},${r(cheekY + 14)} ${r(CX + snoutHalf + 20)},${r(snoutTopY - 4)} ${r(CX + snoutHalf + 6)},${snoutTopY} ` +
    `C ${r(CX + snoutHalf)},${r(snoutTopY + 20)} ${r(CX + 12)},${r(snoutTipY - 8)} ${CX},${r(snoutTipY)} ` +
    `C ${r(CX - 12)},${r(snoutTipY - 8)} ${r(CX - snoutHalf)},${r(snoutTopY + 20)} ${r(CX - snoutHalf - 6)},${snoutTopY} ` +
    `C ${r(CX - snoutHalf - 20)},${r(snoutTopY - 4)} ${r(CX - hw)},${r(cheekY + 14)} ${r(CX - hw)},${cheekY} ` +
    `L ${r(CX - hw)},${foreheadY} ` +
    `C ${r(CX - hw)},${r(foreheadY - 16)} ${r(CX - hw * 0.66)},${crownY} ${CX},${crownY} Z`;
  canvas.path(head).fill(coatGrad).stroke(edge(4));

  // ── Markings under the muzzle mask ───────────────────────────────────────────
  if (coat.pattern === "blaze") {
    canvas
      .polygon(
        `${r(CX - 8)},${r(crownY + 12)} ${r(CX + 8)},${r(crownY + 12)} ${r(CX + 5)},${r(eyeY + 6)} ${r(CX - 5)},${r(eyeY + 6)}`,
      )
      .fill(p.belly);
  }

  if (face.ruff >= 0.2) {
    for (const s of [-1, 1] as const) {
      const x0 = CX + s * hw * 0.6;
      const y0 = cheekY - 4;
      const e = 8 + face.ruff * 16;
      canvas
        .polygon(
          `${r(x0)},${r(y0)} ${r(x0 + s * e)},${r(y0 + 9)} ${r(x0 + s * e * 0.35)},${r(y0 + 17)} ` +
            `${r(x0 + s * e * 0.95)},${r(y0 + 25)} ${r(x0 + s * e * 0.18)},${r(y0 + 31)} ${r(x0 - s * 3)},${r(y0 + 22)}`,
        )
        .fill(p.belly)
        .stroke(edge(2));
    }
  }

  // ── White muzzle + cheek mask ────────────────────────────────────────────────
  const mask =
    `M ${CX},${r(eyeY + 2)} ` +
    `C ${r(CX + hw * 0.52)},${r(eyeY - 2)} ${r(CX + hw * 0.72)},${r(cheekY - 6)} ${r(CX + hw * 0.62)},${r(cheekY + 16)} ` +
    `C ${r(CX + hw * 0.5)},${r(snoutTopY + 6)} ${r(CX + 16)},${r(snoutTipY - 12)} ${CX},${r(snoutTipY - 4)} ` +
    `C ${r(CX - 16)},${r(snoutTipY - 12)} ${r(CX - hw * 0.5)},${r(snoutTopY + 6)} ${r(CX - hw * 0.62)},${r(cheekY + 16)} ` +
    `C ${r(CX - hw * 0.72)},${r(cheekY - 6)} ${r(CX - hw * 0.52)},${r(eyeY - 2)} ${CX},${r(eyeY + 2)} Z`;
  canvas.path(mask).fill(p.belly);

  if (coat.pattern === "sooty") {
    canvas
      .ellipse(hw * 0.8, 60)
      .center(CX, snoutTopY + 8)
      .fill({ color: p.ink, opacity: 0.26 });
  }
  if (coat.pattern === "masked") {
    for (const ex of [exL, exR]) {
      canvas.ellipse(40, 30).center(ex, eyeY).fill({ color: p.ink, opacity: 0.5 });
    }
  }
  if (coat.pattern === "freckled") {
    for (let i = 0; i < 14; i++) {
      const s = i < 7 ? -1 : 1;
      const cx = CX + s * (hw * 0.4 + rng() * hw * 0.3);
      const cy = cheekY + rng() * 34 - 6;
      canvas
        .circle(2 + rng() * 2.4)
        .center(cx, cy)
        .fill({ color: p.ink, opacity: 0.5 });
    }
  }

  // ── Eyes ────────────────────────────────────────────────────────────────────
  const exprMul =
    expression === "alert" ? 1.2 : expression === "sly" ? 0.5 : expression === "playful" ? 0.85 : 1;

  const drawEye = (ex: number, s: 1 | -1, iris: string): void => {
    if (expression === "sleepy") {
      canvas
        .path(
          `M ${r(ex - s * 14)},${r(eyeY - 1)} Q ${ex},${r(eyeY + 7)} ${r(ex + s * 15)},${r(eyeY - 8)}`,
        )
        .fill("none")
        .stroke({ color: p.line, width: 3, linecap: "round" });
      return;
    }
    const open = clamp(eyes.aperture * exprMul, 0.32, 1.2);
    const inX = ex - s * 13;
    const inY = eyeY + 4;
    const outX = ex + s * 15;
    const outY = eyeY - 7;
    const topY = eyeY - 9 * open;
    const botY = eyeY + 7 * open;
    canvas
      .path(
        `M ${r(inX)},${r(inY)} Q ${ex},${r(topY)} ${r(outX)},${r(outY)} Q ${ex},${r(botY)} ${r(inX)},${r(inY)} Z`,
      )
      .fill(iris)
      .stroke({ color: p.line, width: 1.6, linejoin: "round" });
    const prx = expression === "alert" ? 5.4 : 3.8;
    const pry = ((botY - topY) / 2) * 0.86;
    canvas
      .ellipse(prx * 2, Math.max(prx * 2, pry * 2))
      .center(ex + s, eyeY)
      .fill("#1a1422");
    canvas
      .circle(5)
      .center(ex - s * 4, topY + 4)
      .fill({ color: "#ffffff", opacity: 0.95 });
    canvas
      .circle(2.4)
      .center(ex + s * 4, botY - 4)
      .fill({ color: "#ffffff", opacity: 0.6 });
  };
  drawEye(exL, -1, p.irisL);
  drawEye(exR, 1, p.irisR);

  if (expression === "sly") {
    for (const s of [-1, 1] as const) {
      const ex = CX + s * eyeDX;
      canvas
        .path(`M ${r(ex - s * 16)},${r(eyeY - 14)} L ${r(ex + s * 10)},${r(eyeY - 18)}`)
        .fill("none")
        .stroke({ color: p.line, width: 2.4, linecap: "round" });
    }
  }

  // ── Nose, mouth, whiskers ────────────────────────────────────────────────────
  const noseY = snoutTipY - 6;
  canvas
    .path(
      `M ${r(CX - 9)},${r(noseY)} Q ${CX},${r(noseY - 3)} ${r(CX + 9)},${r(noseY)} ` +
        `Q ${r(CX + 5)},${r(noseY + 8)} ${CX},${r(noseY + 9)} Q ${r(CX - 5)},${r(noseY + 8)} ${r(CX - 9)},${r(noseY)} Z`,
    )
    .fill(p.dark);

  const my = noseY + 9;
  if (expression === "playful") {
    canvas
      .path(
        `M ${CX},${r(my)} v3 M ${r(CX - 12)},${r(my + 3)} Q ${CX},${r(my + 16)} ${r(CX + 12)},${r(my + 3)} Z`,
      )
      .fill("#b65a6e")
      .stroke({ color: p.line, width: 1.4, linejoin: "round" });
  } else {
    canvas
      .path(
        `M ${CX},${r(my)} v4 M ${CX},${r(my + 4)} Q ${r(CX - 8)},${r(my + 11)} ${r(CX - 15)},${r(my + 6)} ` +
          `M ${CX},${r(my + 4)} Q ${r(CX + 8)},${r(my + 11)} ${r(CX + 15)},${r(my + 6)}`,
      )
      .fill("none")
      .stroke({ color: p.line, width: 1.8, linecap: "round" });
  }

  for (const s of [-1, 1] as const) {
    const ox = CX + s * 16;
    const tx = CX + s * 54;
    for (const [dy1, dy2] of [
      [-2, -6],
      [2, 2],
      [6, 12],
    ]) {
      canvas
        .path(
          `M ${r(ox)},${r(noseY + 2 + dy1)} Q ${r((ox + tx) / 2)},${r(noseY + 2 + dy1 + (dy2 - dy1) * 0.3)} ${r(tx)},${r(noseY + 2 + dy2)}`,
        )
        .fill("none")
        .stroke({ color: p.line, width: 1, linecap: "round" })
        .opacity(0.4);
    }
  }
}
