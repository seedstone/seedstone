import { describe, it, expect } from "vitest";
import { renderFox } from "../src/plugins/fox/render";
import { resolveFox, foxTraits } from "../src/plugins/fox/config";
import { constant } from "../src/core/index";

describe("fox", () => {
  it("renders deterministically for a seed", () => {
    expect(renderFox("alice")).toBe(renderFox("alice"));
  });

  it("varies by seed", () => {
    expect(renderFox("alice")).not.toBe(renderFox("bob"));
  });

  it("emits a well-formed svg with shapes", () => {
    const svg = renderFox("alice");
    expect(svg).toMatch(/<svg[\s>]/);
    expect(svg).toContain("</svg>");
    expect(svg).toContain("polygon"); // ears
    expect(svg).toContain('viewBox="0 0 256 256"');
    expect(svg).not.toMatch(/NaN|undefined/);
  });

  it("resolves traits to a typed config", () => {
    const c = resolveFox("alice");
    expect(typeof c.coat.hue).toBe("number");
    expect(typeof c.expression).toBe("string");
    expect(c.name).toBeTruthy();
    expect(c.palette.coat).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("honors trait overrides", () => {
    expect(resolveFox("alice", { expression: constant("sleepy") }).expression).toBe("sleepy");
    expect(resolveFox("alice", { coat: { pattern: constant("masked") } }).coat.pattern).toBe(
      "masked",
    );
  });

  it("declares the expected trait groups", () => {
    expect(Object.keys(foxTraits)).toEqual(
      expect.arrayContaining(["coat", "face", "ears", "eyes", "snout", "expression"]),
    );
  });
});
