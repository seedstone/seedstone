import {
  constant,
  create,
  definePlugin,
  derive,
  gem,
  pick,
  seeded,
  type Config,
  type CreateOptions,
  type GemConfig,
  type GemOptions,
  type GemOverrides,
  type GemView,
  type Override,
  type PluginOptions,
  type PluginView,
  type View,
} from "../src/index.js";

declare const target: HTMLElement;

const view = create(gem, target, "alice", {
  overrides: { gem: { hue: 200, cut: "spinel" } },
});

const config: GemConfig = view.config;
const gemOptions: GemOptions = {
  autoRotate: false,
  pixelRatio: 1,
  preserveDrawingBuffer: true,
};
const gemView: GemView = create(gem, target, "alice", gemOptions);
gemView.pause();
gemView.play();

const inferredOptions: PluginOptions<typeof gem> = gemOptions;
const inferredView: PluginView<typeof gem> = gemView;
const overrides: GemOverrides = { gem: { hue: 120 } };
view.setOverrides(overrides);
view.setOverrides();

// @ts-expect-error gem plugins do not accept cat trait overrides
create(gem, target, "alice", { overrides: { coat: { hue: 200 } } });

// @ts-expect-error gem hue overrides must be numeric traits or numbers
view.setOverrides({ gem: { hue: true } });

// @ts-expect-error numeric traits cannot be replaced by strings
view.setOverrides({ gem: { hue: "red" } });

// @ts-expect-error choice traits cannot be replaced by numbers
view.setOverrides({ gem: { cut: 123 } });

// @ts-expect-error gem cuts preserve their supported literal union
view.setOverrides({ gem: { cut: "not-a-cut" } });

const choiceTraits = {
  shape: pick(() => ["disc", "ring", "star"] as const),
  opacity: constant(0.9),
};
const choiceConfig = derive(choiceTraits, "alice");
const shape: "disc" | "ring" | "star" = choiceConfig.shape;
const opacity: number = choiceConfig.opacity;
// @ts-expect-error resolved numeric constants widen to number
const literalOpacity: 0.9 = choiceConfig.opacity;

const badgeTraits = { body: { hue: seeded(0, 360) } };
type BadgeConfig = Config<typeof badgeTraits>;
type BadgeOverrides = Override<typeof badgeTraits>;
interface BadgeOptions extends CreateOptions<BadgeOverrides> {
  variant?: "round" | "square";
}
interface BadgeView extends View<BadgeConfig, BadgeOverrides> {
  flash(): void;
}
const badge = definePlugin<typeof badgeTraits, BadgeConfig, BadgeOptions, BadgeView>({
  id: "badge",
  name: "Badge",
  traits: badgeTraits,
  mount: () => ({}) as BadgeView,
});
const badgeView = create(badge, target, "alice", { variant: "round" });
badgeView.flash();
// @ts-expect-error custom plugin options retain their literal union
create(badge, target, "alice", { variant: "pill" });

void config;
void inferredOptions;
void inferredView;
void shape;
void opacity;
void literalOpacity;
