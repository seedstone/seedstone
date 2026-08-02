import { describe, it, expect } from "vitest";
import { gemTraits, type GemConfig } from "../src/plugins/gem/config";
import { derive } from "../src/core/index";

describe("gem config", () => {
  it("traits resolve to renderer + camera blocks", () => {
    const c = derive(gemTraits, "alice") as GemConfig;
    expect(typeof c.renderer.maxFrameDelta).toBe("number");
    expect(typeof c.renderer.transmissionResolutionScale).toBe("number");
    expect(typeof c.camera.fov).toBe("number");
    expect(c.camera.position).toHaveLength(3);
  });

  it("the gem section carries the values the scene modules consume", () => {
    const c = derive(gemTraits, "alice") as GemConfig;
    expect(typeof c.gem.hue).toBe("number");
    expect(typeof c.gem.speed).toBe("number");
    expect(typeof c.lights.accent1Hue).toBe("number");
    expect(Array.isArray(c.lights.orbits)).toBe(true);
    expect(typeof c.sparkles.scatterSeed).toBe("number");
  });
});
