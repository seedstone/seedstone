import { describe, it, expect } from "vitest";
import {
  gem,
  constant,
  seeded,
  derive,
  merge,
  isSeeded,
  buildGeometry,
  listCuts,
} from "../dist/seedstone.esm.js";

const configSchema = gem.traits;

const seededLeaves = (node, path = []) => {
  if (isSeeded(node)) return [{ path: path.join("."), min: node.min, max: node.max }];
  if (!node || typeof node !== "object" || Array.isArray(node) || "kind" in node) return [];
  return Object.entries(node).flatMap(([k, v]) => seededLeaves(v, [...path, k]));
};
const getPath = (obj, path) => path.split(".").reduce((o, key) => o?.[key], obj);

describe("public engine", () => {
  it("same seed derives the same config; empty seed falls back to seedstone", () => {
    for (const s of ["alice", "hello world", "✦"])
      expect(derive(configSchema, s)).toEqual(derive(configSchema, s));
    expect(derive(configSchema, "")).toEqual(derive(configSchema, "seedstone"));
    expect(derive(configSchema, "alice")).not.toEqual(derive(configSchema, "bob"));
  });

  it("every seeded knob stays within its declared range", () => {
    const knobs = seededLeaves(configSchema);
    expect(knobs.length).toBeGreaterThan(0);
    for (let i = 0; i < 20; i++) {
      const resolved = derive(configSchema, `seed-${i}`);
      for (const { path, min, max } of knobs) {
        const value = getPath(resolved, path);
        expect(value, `${path} out of range`).toBeGreaterThanOrEqual(min);
        expect(value, `${path} out of range`).toBeLessThan(max);
      }
    }
  });

  it("merge pins overrides, and seeded() flips a constant back to seed-driven", () => {
    const pinned = merge(configSchema, {
      gem: { hue: constant(200) },
      sparkles: { count: constant(50) },
    });
    for (const seed of ["alice", "bob", ""]) {
      const r = derive(pinned, seed);
      expect(r.gem.hue).toBe(200);
      expect(r.sparkles.count).toBe(50);
    }

    expect(derive(configSchema, "alice").gem.material.transmission).toBe(
      derive(configSchema, "bob").gem.material.transmission,
    );
    const flipped = merge(configSchema, { gem: { material: { transmission: seeded(0, 1) } } });
    const a = derive(flipped, "alice").gem.material.transmission;
    const b = derive(flipped, "bob").gem.material.transmission;
    expect(a).not.toBe(b);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(1);
  });
});

describe("gem geometry registry", () => {
  const EXPECTED_TRIANGLES = {
    citrine: 16,
    fluorite: 8,
    garnet: 36,
    pyrite: 12,
    spinel: 4,
    tanzanite: 20,
    tourmaline: 20,
    zircon: 80,
  };
  const triangleCount = (geometry) => geometry.getAttribute("position").count / 3;

  it("auto-discovers every cut, alphabetically", () => {
    expect(listCuts()).toEqual(Object.keys(EXPECTED_TRIANGLES).sort());
  });

  it("each cut builds its expected, non-degenerate geometry", () => {
    for (const cut of listCuts()) {
      const geo = buildGeometry(cut);
      expect(triangleCount(geo), cut).toBe(EXPECTED_TRIANGLES[cut]);
      geo.computeBoundingBox();
      const { min, max } = geo.boundingBox;
      expect(max.x - min.x, `${cut} x`).toBeGreaterThan(0);
      expect(max.y - min.y, `${cut} y`).toBeGreaterThan(0);
      expect(max.z - min.z, `${cut} z`).toBeGreaterThan(0);
    }
  });

  it("an unknown cut falls back to a valid geometry", () => {
    expect(triangleCount(buildGeometry("not-a-real-cut"))).toBeGreaterThan(0);
  });
});
