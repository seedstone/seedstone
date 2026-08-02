import { describe, it, expect } from "vitest";
import { gem } from "../src/plugins/gem/index";
import { cat } from "../src/plugins/cat/index";
import { fox } from "../src/plugins/fox/index";

describe.each([
  ["gem", "Gemstone", gem],
  ["cat", "Cat", cat],
  ["fox", "Fox", fox],
])("%s plugin", (id, name, plugin) => {
  it("has the canonical functional shape", () => {
    expect(plugin.id).toBe(id);
    expect(plugin.name).toBe(name);
    expect(typeof plugin.mount).toBe("function");
    expect(plugin.traits).toBeTruthy();
  });

  it("does not carry website presentation metadata", () => {
    for (const key of ["lab", "controls", "copy", "summarize", "sampleSeeds", "noun"]) {
      expect(key in plugin, `${plugin.id} should not expose ${key}`).toBe(false);
    }
  });
});
