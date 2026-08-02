import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { derive, sampleUnit } from "../src/core/index.js";
import { renderCat } from "../src/plugins/cat/index.js";
import { renderFox } from "../src/plugins/fox/render.js";
import { gemTraits } from "../src/plugins/gem/config.js";
import { buildGeometry } from "../src/plugins/gem/geometries/index.js";
import { applyDistortions } from "../src/plugins/gem/geometries/lib/distort.js";

const SEEDS = ["", "alice", "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", "✦"];

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function normalizedJson(value: unknown, digits: number): string {
  return JSON.stringify(value, (_key, next) =>
    typeof next === "number" ? Number(next.toFixed(digits)) : next,
  );
}

describe("v3 identity compatibility", () => {
  it("preserves core, config, SVG, and geometry vectors", () => {
    const vectors = {
      sampleUnit: Object.fromEntries(
        SEEDS.map((seed) => [seed, Number(sampleUnit(seed, "identity").toFixed(15))]),
      ),
      gemConfig: Object.fromEntries(
        SEEDS.map((seed) => [seed, JSON.parse(normalizedJson(derive(gemTraits, seed), 12))]),
      ),
      catSvg: Object.fromEntries(SEEDS.map((seed) => [seed, hash(renderCat(seed))])),
      foxSvg: Object.fromEntries(SEEDS.map((seed) => [seed, hash(renderFox(seed))])),
      geometry: Object.fromEntries(
        SEEDS.map((seed) => {
          const config = derive(gemTraits, seed);
          const geometry = buildGeometry(config.gem.cut);
          applyDistortions(geometry, config.gem.distortion);
          const positions = geometry.getAttribute("position").array;
          return [seed, hash(normalizedJson(Array.from(positions), 8))];
        }),
      ),
    };

    expect(vectors).toMatchSnapshot();
  });
});
