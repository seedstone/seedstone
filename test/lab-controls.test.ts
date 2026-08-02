import { describe, expect, it } from "vitest";
import { cat, fox, isConstant, isPick, isSeeded } from "../src/index";
import { buildLabControls, gemLabControls, type LabControls } from "../website/app/lab-controls";
import { gem } from "../src/plugins/gem/index";

function numericPaths(node: unknown, path: string[] = []): string[] {
  if (isSeeded(node)) return [path.join(".")];
  if (isConstant(node)) return typeof node.value === "number" ? [path.join(".")] : [];
  if (isPick(node)) return [];
  if (node && typeof node === "object" && !Array.isArray(node)) {
    return Object.entries(node).flatMap(([key, value]) => numericPaths(value, [...path, key]));
  }
  return [];
}

function pickPaths(node: unknown, path: string[] = []): string[] {
  if (isPick(node)) return [path.join(".")];
  if (isSeeded(node) || isConstant(node)) return [];
  if (node && typeof node === "object" && !Array.isArray(node)) {
    return Object.entries(node).flatMap(([key, value]) => pickPaths(value, [...path, key]));
  }
  return [];
}

describe.each([
  [gem, gemLabControls],
  [cat, buildLabControls(cat.traits)],
  [fox, buildLabControls(fox.traits)],
])("$0.id website Lab controls", (plugin, controls: LabControls) => {
  it("covers numeric traits with sliders", () => {
    for (const path of numericPaths(plugin.traits)) {
      expect(controls[path], `${plugin.id} missing ${path}`).toBeTruthy();
      expect(Array.isArray(controls[path]), `${path} should be a slider`).toBe(false);
    }
  });

  it("covers choice traits with dropdowns", () => {
    for (const path of pickPaths(plugin.traits)) {
      expect(Array.isArray(controls[path]), `${plugin.id} missing ${path}`).toBe(true);
    }
  });
});
