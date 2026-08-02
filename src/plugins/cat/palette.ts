import { hslToHex } from "../../core/index";
import type { CatValues } from "./config";

export interface Palette {
  coatLight: string;
  coat: string;
  ink: string;
  belly: string;
  line: string;
  earInner: string;
  nose: string;
  blush: string;
  irisL: string;
  irisR: string;
}

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);

const hex = (h: number, s: number, l: number): string =>
  "#" +
  hslToHex(((h % 360) + 360) % 360, clamp(s, 0, 1), clamp(l, 0, 1))
    .toString(16)
    .padStart(6, "0");

export function buildPalette(v: CatValues): Palette {
  const h = v.coat.hue;
  let s = v.coat.saturation;
  let l = v.coat.lightness;

  if (v.coat.pattern === "masked") l = Math.min(0.78, l + 0.14);
  if (v.coat.pattern === "patched") s = Math.min(1, s + 0.06);

  const oddEye = v.eyes.odd > 0.85;
  const eyeR = oddEye ? v.eyes.hue + 150 : v.eyes.hue;

  return {
    coatLight: hex(h, Math.min(1, s + 0.04), Math.min(0.86, l + 0.13)),
    coat: hex(h, s, l),
    ink: hex(h, Math.min(1, s + 0.16), l * 0.46),
    belly: hex(h, s * 0.24, Math.min(0.97, l + 0.34)),
    line: hex(h, s * 0.45, l * 0.24),
    earInner: hex(346, 0.6, 0.85),
    nose: hex(349, 0.64, 0.71),
    blush: hex(352, 0.72, 0.8),
    irisL: hex(v.eyes.hue, 0.74, 0.52),
    irisR: hex(eyeR, 0.74, 0.52),
  };
}
