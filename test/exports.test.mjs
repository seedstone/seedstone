import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { create, gem as rootGem, cat as rootCat, fox as rootFox } from "seedstone";
import { definePlugin } from "seedstone/core";
import { gem } from "seedstone/gem";
import { cat, renderCat } from "seedstone/cat";
import { fox } from "seedstone/fox";

describe("package entry points", () => {
  it("exports the consumer API and direct plugin entry points", () => {
    expect(typeof create).toBe("function");
    expect(typeof definePlugin).toBe("function");
    expect(rootGem).toBeTruthy();
    expect(rootCat).toBeTruthy();
    expect(rootFox).toBeTruthy();
    expect(gem.id).toBe("gem");
    expect(cat.id).toBe("cat");
    expect(fox.id).toBe("fox");
    expect(renderCat("alice")).toContain("<svg");
  });

  it("provides CommonJS entry points", () => {
    const require = createRequire(import.meta.url);
    expect(typeof require("seedstone/core").definePlugin).toBe("function");
    expect(require("seedstone/gem").gem.id).toBe("gem");
    expect(require("seedstone/cat").cat.id).toBe("cat");
    expect(require("seedstone/fox").fox.id).toBe("fox");
  });
});
