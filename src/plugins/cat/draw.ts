import { mulberry32 } from "../../core/index";
import type { CatValues } from "./config";
import type { Palette } from "./palette";

export interface CatConfig extends CatValues {
  palette: Palette;
  name: string;
  rngSeed: number;
}

function f(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
}

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);

const CX = 128;

export function drawCat(config: CatConfig): string {
  const { coat, face, ears, eyes, whiskers, mood, palette: p } = config;
  const rng = mulberry32(config.rngSeed);
  const uid = (config.rngSeed >>> 0).toString(36);

  const fw = face.width;
  const es = ears.size;
  const hw = 80 * fw;
  const hh = 76;
  const headCY = 134;
  const upright = ears.shape === "upright";

  const earBaseY = 98;

  const ear = (s: 1 | -1): string => {
    const ox = CX + s * hw * 0.7;
    const ix = CX + s * hw * 0.18;
    if (upright) {
      const tx = CX + s * hw * 0.5;
      const ty = earBaseY - 70 * es;
      return (
        `M ${f(ox)},${f(earBaseY)} ` +
        `Q ${f(CX + s * hw * 0.78)},${f(ty + 10)} ${f(tx)},${f(ty)} ` +
        `Q ${f(CX + s * hw * 0.3)},${f(ty + 22)} ${f(ix)},${f(earBaseY - 18)} Z`
      );
    }
    const tx = CX + s * hw * 0.86;
    const ty = earBaseY - 30 * es;
    return (
      `M ${f(ox)},${f(earBaseY)} ` +
      `Q ${f(CX + s * hw * 0.98)},${f(ty - 6)} ${f(tx)},${f(ty)} ` +
      `Q ${f(CX + s * hw * 0.55)},${f(ty + 16)} ${f(ix)},${f(earBaseY - 18)} Z`
    );
  };

  const innerEar = (s: 1 | -1): string => {
    const ox = CX + s * hw * 0.56;
    const ix = CX + s * hw * 0.28;
    const tx = upright ? CX + s * hw * 0.49 : CX + s * hw * 0.72;
    const ty = upright ? earBaseY - 70 * es + 17 : earBaseY - 30 * es + 8;
    const by = earBaseY - 6;
    return (
      `M ${f(ox)},${f(by)} Q ${f(tx)},${f((by + ty) / 2)} ${f(tx)},${f(ty)} ` +
      `Q ${f((ix + tx) / 2)},${f(by - 4)} ${f(ix)},${f(by - 4)} Z`
    );
  };

  const tuft = (s: 1 | -1): string => {
    if (!upright || ears.tuft < 0.4) return "";
    const tx = CX + s * hw * 0.5;
    const ty = earBaseY - 70 * es;
    const len = 6 + ears.tuft * 11;
    return `<path d="M ${f(tx)},${f(ty)} l ${f(s * -2)},${f(-len)} m 3,${f(len * 0.25)} l ${f(s * -1.5)},${f(-len * 0.85)}" fill="none" stroke="${p.coat}" stroke-width="2.6" stroke-linecap="round"/>`;
  };

  const head =
    `M ${f(CX)},${f(headCY - hh)} ` +
    `C ${f(CX + hw * 0.6)},${f(headCY - hh)} ${f(CX + hw)},${f(headCY - hh * 0.4)} ${f(CX + hw)},${f(headCY)} ` +
    `C ${f(CX + hw)},${f(headCY + hh * 0.64)} ${f(CX + hw * 0.62)},${f(headCY + hh)} ${f(CX)},${f(headCY + hh)} ` +
    `C ${f(CX - hw * 0.62)},${f(headCY + hh)} ${f(CX - hw)},${f(headCY + hh * 0.64)} ${f(CX - hw)},${f(headCY)} ` +
    `C ${f(CX - hw)},${f(headCY - hh * 0.4)} ${f(CX - hw * 0.6)},${f(headCY - hh)} ${f(CX)},${f(headCY - hh)} Z`;

  const body =
    `M ${f(CX - hw * 0.84)},256 ` +
    `C ${f(CX - hw * 0.88)},216 ${f(CX - hw * 0.48)},200 ${f(CX)},200 ` +
    `C ${f(CX + hw * 0.48)},200 ${f(CX + hw * 0.88)},216 ${f(CX + hw * 0.84)},256 Z`;

  const floof = (s: 1 | -1): string => {
    if (face.floof < 0.4) return "";
    const bx = CX + s * (hw - 2);
    const by = headCY + 4;
    const out = s * (8 + face.floof * 9);
    return (
      `<path d="M ${f(bx)},${f(by - 16)} l ${f(out)},6 l ${f(-out * 0.68)},7 l ${f(out * 0.85)},7 l ${f(-out * 0.68)},7 l ${f(out * 0.8)},7" ` +
      `fill="none" stroke="${p.coat}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`
    );
  };

  const foreheadTop = headCY - hh + 14;
  let marks = "";
  if (coat.pattern === "striped") {
    const parts: string[] = [];
    for (const sgn of [-1, 0, 1] as const) {
      const x = CX + sgn * 12 * fw;
      parts.push(`<path d="M ${f(x)},${f(foreheadTop)} L ${f(x + sgn * 4)},${f(headCY - 14)}"/>`);
    }
    for (const sgn of [-1, 1] as const) {
      for (let k = 1; k <= 3; k++) {
        const x = CX + sgn * (16 + k * 12) * fw;
        parts.push(`<path d="M ${f(x)},${f(headCY - 10)} q ${f(sgn * 6)},18 0,38"/>`);
      }
    }
    marks = `<g fill="none" stroke="${p.ink}" stroke-width="5" stroke-linecap="round" opacity="0.5">${parts.join("")}</g>`;
  } else if (coat.pattern === "masked") {
    marks =
      `<g fill="${p.ink}" opacity="0.5">` +
      `<path d="${ear(-1)}"/><path d="${ear(1)}"/>` +
      `<path d="M ${f(CX - hw * 0.82)},${f(headCY + 2)} Q ${f(CX)},${f(headCY - 34)} ${f(CX + hw * 0.82)},${f(headCY + 2)} ` +
      `Q ${f(CX)},${f(headCY + 28)} ${f(CX - hw * 0.82)},${f(headCY + 2)} Z"/>` +
      `</g>`;
  } else if (coat.pattern === "patched") {
    const sign: 1 | -1 = rng() < 0.5 ? -1 : 1;
    marks =
      `<g fill="${p.ink}" opacity="0.8">` +
      `<path d="${ear(sign)}"/>` +
      `<ellipse cx="${f(CX + sign * hw * 0.44)}" cy="${f(headCY - 4)}" rx="${f(hw * 0.5)}" ry="${f(48)}"/>` +
      `</g>`;
  } else if (coat.pattern === "speckled") {
    const parts: string[] = [];
    for (let i = 0; i < 20; i++) {
      const x = CX + (rng() - 0.5) * hw * 1.6;
      const y = foreheadTop + rng() * (hh * 1.5);
      const r = 1.8 + rng() * 2.4;
      parts.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`);
    }
    marks = `<g fill="${p.ink}" opacity="0.55">${parts.join("")}</g>`;
  } else if (coat.pattern === "blaze") {
    marks =
      `<path d="M ${f(CX - 12)},${f(foreheadTop - 4)} Q ${f(CX)},${f(foreheadTop - 10)} ${f(CX + 12)},${f(foreheadTop - 4)} ` +
      `L ${f(CX + 8)},${f(headCY + 28)} Q ${f(CX)},${f(headCY + 34)} ${f(CX - 8)},${f(headCY + 28)} Z" ` +
      `fill="${p.belly}" opacity="0.92"/>`;
  }

  const eyeY = headCY + 6;
  const eyeDX = hw * 0.4;
  const exL = CX - eyeDX;
  const exR = CX + eyeDX;

  const apert = clamp(eyes.aperture, 0.5, 1);
  const moodMul = (side: 1 | -1): number =>
    mood === "wide"
      ? 1.18
      : mood === "smug"
        ? 0.62
        : mood === "derp"
          ? side < 0
            ? 1.12
            : 0.68
          : 1;

  const eye = (ex: number, side: 1 | -1, iris: string): string => {
    if (mood === "sleepy") {
      return (
        `<path d="M ${f(ex - 16)},${f(eyeY)} Q ${f(ex)},${f(eyeY + 11)} ${f(ex + 16)},${f(eyeY)}" fill="none" stroke="${p.line}" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M ${f(ex - 14)},${f(eyeY + 3)} l -3,3 M ${f(ex)},${f(eyeY + 7)} l 0,4 M ${f(ex + 14)},${f(eyeY + 3)} l 3,3" fill="none" stroke="${p.line}" stroke-width="1.5" stroke-linecap="round"/>`
      );
    }
    const ry = clamp(apert * moodMul(side), 0.32, 1.2) * 17;
    const rx = 15;
    const pupilRx = mood === "wide" ? 7.5 : 4.4;
    const pupilRy = ry * (mood === "wide" ? 0.64 : 0.86);
    return (
      `<ellipse cx="${f(ex)}" cy="${f(eyeY)}" rx="${f(rx)}" ry="${f(ry)}" fill="${iris}" stroke="${p.line}" stroke-width="2"/>` +
      `<ellipse cx="${f(ex)}" cy="${f(eyeY)}" rx="${f(pupilRx)}" ry="${f(pupilRy)}" fill="#1a1422"/>` +
      `<circle cx="${f(ex - 5)}" cy="${f(eyeY - ry * 0.4)}" r="3.6" fill="#ffffff" opacity="0.95"/>` +
      `<circle cx="${f(ex + 4.5)}" cy="${f(eyeY + ry * 0.34)}" r="1.8" fill="#ffffff" opacity="0.7"/>`
    );
  };

  const brows =
    mood === "smug"
      ? `<g stroke="${p.line}" stroke-width="2.4" stroke-linecap="round">` +
        `<path d="M ${f(exL - 13)},${f(eyeY - 21)} L ${f(exL + 9)},${f(eyeY - 15)}"/>` +
        `<path d="M ${f(exR + 13)},${f(eyeY - 21)} L ${f(exR - 9)},${f(eyeY - 15)}"/>` +
        `</g>`
      : "";

  const noseY = headCY + 32;
  const nose =
    `<path d="M ${f(CX - 8)},${f(noseY)} Q ${f(CX)},${f(noseY - 3)} ${f(CX + 8)},${f(noseY)} ` +
    `Q ${f(CX + 5)},${f(noseY + 7)} ${f(CX)},${f(noseY + 8)} Q ${f(CX - 5)},${f(noseY + 7)} ${f(CX - 8)},${f(noseY)} Z" ` +
    `fill="${p.nose}" stroke="${p.line}" stroke-width="1"/>`;

  const my = noseY + 8;
  let mouth: string;
  if (mood === "sleepy") {
    mouth = `<path d="M ${f(CX - 8)},${f(my + 4)} Q ${f(CX)},${f(my + 8)} ${f(CX + 8)},${f(my + 4)}" fill="none" stroke="${p.line}" stroke-width="1.8" stroke-linecap="round"/>`;
  } else if (mood === "smug") {
    mouth = `<path d="M ${f(CX)},${f(my)} v3 M ${f(CX)},${f(my + 3)} Q ${f(CX - 11)},${f(my + 5)} ${f(CX - 19)},${f(my)} M ${f(CX)},${f(my + 3)} Q ${f(CX + 9)},${f(my + 12)} ${f(CX + 19)},${f(my + 7)}" fill="none" stroke="${p.line}" stroke-width="1.8" stroke-linecap="round"/>`;
  } else if (mood === "derp") {
    mouth = `<path d="M ${f(CX)},${f(my)} v2 M ${f(CX - 13)},${f(my + 2)} Q ${f(CX)},${f(my + 16)} ${f(CX + 13)},${f(my + 2)} Z" fill="#b65a6e" stroke="${p.line}" stroke-width="1.6" stroke-linejoin="round"/>`;
  } else {
    mouth = `<path d="M ${f(CX)},${f(my)} v3 M ${f(CX)},${f(my + 3)} Q ${f(CX - 9)},${f(my + 11)} ${f(CX - 18)},${f(my + 4)} M ${f(CX)},${f(my + 3)} Q ${f(CX + 9)},${f(my + 11)} ${f(CX + 18)},${f(my + 4)}" fill="none" stroke="${p.line}" stroke-width="1.8" stroke-linecap="round"/>`;
  }
  const tongue =
    mood === "derp"
      ? `<path d="M ${f(CX - 5)},${f(my + 9)} h10 a5,7 0 0 1 -10,0 Z" fill="${p.blush}" stroke="${p.line}" stroke-width="0.7"/>`
      : "";

  const whiskerParts: string[] = [];
  for (const sgn of [-1, 1] as const) {
    const ox = CX + sgn * 14;
    const tx = CX + sgn * 58 * whiskers.spread;
    whiskerParts.push(
      `<path d="M ${f(ox)},${f(noseY + 3)} Q ${f((ox + tx) / 2)},${f(noseY - 3)} ${f(tx)},${f(noseY - 6)}"/>`,
      `<path d="M ${f(ox)},${f(noseY + 7)} Q ${f((ox + tx) / 2)},${f(noseY + 7)} ${f(tx)},${f(noseY + 8)}"/>`,
      `<path d="M ${f(ox)},${f(noseY + 11)} Q ${f((ox + tx) / 2)},${f(noseY + 16)} ${f(tx)},${f(noseY + 21)}"/>`,
    );
  }
  const whiskerLines = `<g fill="none" stroke="${p.line}" stroke-width="1.1" stroke-linecap="round" opacity="0.45">${whiskerParts.join("")}</g>`;

  const earBack = upright ? p.coat : p.coatLight;
  const grad = `cg${uid}`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%" role="img" aria-label="${escapeAttr(config.name)}, a cat avatar">` +
    `<defs>` +
    `<linearGradient id="${grad}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.coatLight}"/><stop offset="1" stop-color="${p.coat}"/></linearGradient>` +
    `<clipPath id="hd${uid}"><path d="${head}"/><path d="${ear(-1)}"/><path d="${ear(1)}"/></clipPath>` +
    `</defs>` +
    `<path d="${body}" fill="url(#${grad})" stroke="${p.line}" stroke-width="3.5" stroke-linejoin="round"/>` +
    `<ellipse cx="${CX}" cy="248" rx="${f(hw * 0.44)}" ry="30" fill="${p.belly}"/>` +
    `<path d="${ear(-1)}" fill="${earBack}" stroke="${p.line}" stroke-width="3.5" stroke-linejoin="round"/>` +
    `<path d="${ear(1)}" fill="${earBack}" stroke="${p.line}" stroke-width="3.5" stroke-linejoin="round"/>` +
    `<path d="${innerEar(-1)}" fill="${p.earInner}"/>` +
    `<path d="${innerEar(1)}" fill="${p.earInner}"/>` +
    tuft(-1) +
    tuft(1) +
    `<path d="${head}" fill="url(#${grad})" stroke="${p.line}" stroke-width="4" stroke-linejoin="round"/>` +
    floof(-1) +
    floof(1) +
    `<g clip-path="url(#hd${uid})">${marks}</g>` +
    `<ellipse cx="${CX}" cy="${f(noseY + 1)}" rx="${f(hw * 0.46)}" ry="22" fill="${p.belly}" opacity="0.92"/>` +
    `<ellipse cx="${f(CX - hw * 0.54)}" cy="${f(noseY - 4)}" rx="13" ry="7.5" fill="${p.blush}" opacity="0.5"/>` +
    `<ellipse cx="${f(CX + hw * 0.54)}" cy="${f(noseY - 4)}" rx="13" ry="7.5" fill="${p.blush}" opacity="0.5"/>` +
    `<g>${brows}${eye(exL, -1, p.irisL)}${eye(exR, 1, p.irisR)}${nose}${mouth}${tongue}${whiskerLines}</g>` +
    `</svg>`
  );
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
