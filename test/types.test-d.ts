import { create, gem, type GemConfig, type GemOverrides } from "../src/index";

declare const target: HTMLElement;

const view = create(gem, target, "alice", {
  overrides: { gem: { hue: 200, cut: "spinel" } },
});

const config: GemConfig = view.config;
const overrides: GemOverrides = { gem: { hue: 120 } };
view.setOverrides(overrides);
view.setOverrides();

// @ts-expect-error gem plugins do not accept cat trait overrides
create(gem, target, "alice", { overrides: { coat: { hue: 200 } } });

// @ts-expect-error gem hue overrides must be traits, numbers, or strings
view.setOverrides({ gem: { hue: true } });

void config;
