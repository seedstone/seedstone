import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  create,
  definePlugin,
  derive,
  merge,
  mountString,
  seeded,
  type Config,
  type Override,
} from "../src/core/index";

const traits = { body: { hue: seeded(0, 360) } };
type TestConfig = Config<typeof traits>;
type TestOverrides = Override<typeof traits>;

class TestElement {
  innerHTML = "";
}

const target = new TestElement();
const plugin = definePlugin<typeof traits, TestConfig>({
  id: "test",
  name: "Test",
  traits,
  mount: (container, seed, options = {}) =>
    mountString<TestConfig, TestOverrides>(
      container,
      seed,
      (nextSeed, overrides) => derive(merge(traits, overrides), nextSeed),
      (config) => String(config.body.hue),
      options,
    ),
});

describe("plugin runtime", () => {
  beforeEach(() => {
    target.innerHTML = "";
    vi.stubGlobal("HTMLElement", TestElement);
    vi.stubGlobal("document", {
      querySelector: (selector: string) => (selector === "#target" ? target : null),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("creates a live view from an element or selector", () => {
    const ready = vi.fn();
    const view = create(plugin, "#target", "alice", {
      overrides: { body: { hue: 120 } },
      onReady: ready,
    });

    expect(view.config.body.hue).toBe(120);
    expect(target.innerHTML).toBe("120");
    expect(ready).toHaveBeenCalledOnce();

    view.setOverrides({ body: { hue: 240 } });
    expect(view.config.body.hue).toBe(240);

    view.update("bob");
    expect(view.config.body.hue).toBe(240);

    view.setOverrides();
    expect(view.config.body.hue).not.toBe(240);

    view.destroy();
    expect(target.innerHTML).toBe("");
  });

  it("rejects missing targets and non-string seeds", () => {
    expect(() => create(plugin, "#missing", "alice")).toThrow(
      'no container element found for selector "#missing"',
    );
    expect(() =>
      create(plugin, target as unknown as HTMLElement, 123 as unknown as string),
    ).toThrow("seed must be a string");
  });
});
