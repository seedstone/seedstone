import { describe, it, expect } from "vitest";
import { constant } from "../src/core/index";
import { renderCat } from "../src/plugins/cat/index";
import { resolveCat, catTraits } from "../src/plugins/cat/config";

describe("cat (core-only SVG)", () => {
  it("same seed always renders the same cat", () => {
    for (const seed of ["alice", "bob", "0xC0FFEE", "moe"]) {
      expect(renderCat(seed)).toBe(renderCat(seed));
    }
  });

  it("different seeds render different cats", () => {
    expect(renderCat("alice")).not.toBe(renderCat("bob"));
  });

  it("emits a well-formed, asset-free SVG", () => {
    const svg = renderCat("alice");
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg.endsWith("</svg>")).toBe(true);
    expect(svg).toContain('viewBox="0 0 256 256"');
    expect(svg).toContain("aria-label=");
    // procedural only — no external assets
    expect(svg).not.toContain("<image");
    expect(svg).not.toContain("href");
  });

  it("resolves a palette of #rrggbb colours and a name", () => {
    const c = resolveCat("alice");
    expect(c.name).toMatch(/^[A-Z][a-z]+$/);
    for (const v of Object.values(c.palette)) expect(v).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("pins traits via overrides across all seeds", () => {
    for (const seed of ["alice", "bob", "charlie"]) {
      const c = resolveCat(seed, {
        coat: { pattern: constant("striped") },
        mood: constant("smug"),
      });
      expect(c.coat.pattern).toBe("striped");
      expect(c.mood).toBe("smug");
    }
  });

  it("every declared pattern and mood renders without throwing", () => {
    const patterns = ["plain", "striped", "masked", "patched", "speckled", "blaze"] as const;
    const moods = ["calm", "smug", "wide", "sleepy", "derp"] as const;
    for (const pattern of patterns)
      expect(renderCat("x", { coat: { pattern: constant(pattern) } })).toContain("<svg");
    for (const mood of moods) expect(renderCat("x", { mood: constant(mood) })).toContain("<svg");
  });

  it("exposes the trait declaration for registry/UI use", () => {
    expect(Object.keys(catTraits)).toEqual(
      expect.arrayContaining(["coat", "face", "ears", "eyes", "whiskers", "mood"]),
    );
  });
});
