import { describe, it, expect } from "vitest";
import {
  constant,
  seeded,
  pick,
  derive,
  merge,
  isConstant,
  isSeeded,
  isPick,
} from "../src/core/index";

const traits = {
  hue: seeded(0, 360),
  saturation: seeded(0.55, 1),
  fov: constant(35),
  cut: pick(() => ["garnet", "spinel", "zircon"]),
  material: { ior: seeded(1.8, 2.8), transmission: constant(0.8) },
  ratio: 0.5, // raw passthrough number
  position: [0, 0.2, 2.4] as number[], // raw passthrough array
};

function seededLeaves(
  node: unknown,
  path: string[] = [],
): Array<{ path: string; min: number; max: number }> {
  if (isSeeded(node)) return [{ path: path.join("."), min: node.min, max: node.max }];
  if (!node || typeof node !== "object" || Array.isArray(node) || isConstant(node) || isPick(node))
    return [];
  return Object.entries(node).flatMap(([k, v]) => seededLeaves(v, [...path, k]));
}

function getPath(obj: any, path: string): any {
  return path.split(".").reduce((o, key) => o?.[key], obj);
}

describe("core engine", () => {
  it("same seed always derives the same config", () => {
    for (const seed of ["alice", "hello world", "0x1a2b3c", "✦"]) {
      expect(derive(traits, seed)).toEqual(derive(traits, seed));
    }
  });

  it("different seeds derive different configs", () => {
    expect(derive(traits, "alice")).not.toEqual(derive(traits, "bob"));
  });

  it("empty seed falls back to seedstone", () => {
    expect(derive(traits, "")).toEqual(derive(traits, "seedstone"));
  });

  it("passthrough values and arrays are preserved verbatim", () => {
    const c = derive(traits, "alice");
    expect(c.ratio).toBe(0.5);
    expect(c.position).toEqual([0, 0.2, 2.4]);
    expect(c.fov).toBe(35);
  });

  it("no-seed defaults: seeded → midpoint, pick → first option", () => {
    const c = derive(traits);
    expect(c.hue).toBe(180); // (0 + 360) / 2
    expect(c.cut).toBe("garnet");
  });

  it("every seeded scalar stays within its declared range", () => {
    const leaves = seededLeaves(traits);
    expect(leaves.length).toBeGreaterThan(0);
    for (let i = 0; i < 20; i++) {
      const resolved = derive(traits, `seed-${i}`);
      for (const { path, min, max } of leaves) {
        const value = getPath(resolved, path);
        expect(value, `${path} out of range`).toBeGreaterThanOrEqual(min);
        expect(value, `${path} out of range`).toBeLessThan(max);
      }
    }
  });

  it("seeded values are independent — not shifting in lock-step", () => {
    const leaves = seededLeaves(traits);
    const a = derive(traits, "alice");
    const b = derive(traits, "bob");
    const diffs = leaves.map(
      ({ path, min, max }) => (getPath(a, path) - getPath(b, path)) / (max - min),
    );
    expect(diffs.filter((d) => d !== 0).length).toBeGreaterThan(0);
    expect(new Set(diffs.map((d) => d.toFixed(4))).size).toBeGreaterThan(1);
  });

  it("merge pins a value fixed across all seeds", () => {
    const t = merge(traits, { hue: 200, material: { ior: 2.0 } });
    for (const seed of ["alice", "bob", ""]) {
      const r = derive(t, seed);
      expect(r.hue).toBe(200);
      expect(r.material.ior).toBe(2.0);
    }
  });

  it("merge with seeded() flips a constant back to seed-driven", () => {
    expect(derive(traits, "alice").fov).toBe(35);
    const t = merge(traits, { fov: seeded(10, 80) });
    const a = derive(t, "alice").fov;
    const b = derive(t, "bob").fov;
    expect(a).not.toBe(b);
    expect(a).toBeGreaterThanOrEqual(10);
    expect(a).toBeLessThan(80);
  });

  it("merge can pin a seed-driven choice and re-open it", () => {
    expect(derive(merge(traits, { cut: "spinel" }), "alice").cut).toBe("spinel");
    const reopened = merge(traits, { cut: pick(() => ["garnet", "spinel", "zircon"]) });
    const cuts = new Set(["a", "b", "c", "d", "e"].map((s) => derive(reopened, s).cut));
    expect(cuts.size).toBeGreaterThan(1);
  });

  it("guards discriminate the three trait kinds", () => {
    expect(isConstant(constant(1))).toBe(true);
    expect(isSeeded(seeded(0, 1))).toBe(true);
    expect(isPick(pick(() => []))).toBe(true);
    expect(isConstant(seeded(0, 1))).toBe(false);
    expect(isSeeded(5)).toBe(false);
    expect(isPick({})).toBe(false);
  });
});
