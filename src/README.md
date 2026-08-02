# Seedstone source architecture

Seedstone has two layers:

- `core/` is the dependency-free DNA engine and plugin runtime.
- `plugins/` contains interchangeable visual implementations.

```text
src/
  core/          traits, determinism, plugin contract, runtime
  plugins/gem/   WebGL gemstone
  plugins/cat/   SSR-safe SVG cat
  plugins/fox/   SVG fox
  index.ts       consumer entry point
```

The dependency direction is one-way: plugins depend on core; core never imports
a plugin or website concern. Lab controls, copy, sample seeds, and summaries
belong to `website/`.

## Mental model

```text
seed → declared traits → derive → resolved config → plugin mount → View
```

A trait is fixed, a seeded scalar, or a seeded choice:

```ts
import { constant, seeded, pick, derive } from "seedstone/core";

const traits = {
  body: {
    hue: seeded(0, 360),
    shape: pick(() => ["disc", "ring", "star"]),
    opacity: constant(0.9),
  },
};

derive(traits, "alice");
```

Each seeded leaf hashes its dot-path independently, so adding or pinning one
trait does not shift other values. `merge(traits, overrides)` applies a typed
deep-partial override tree before derivation. Raw numbers and strings pin a
leaf; `seeded(...)` and `pick(...)` can make it seed-driven again.

## Plugin contract

`Plugin` is deliberately a small functional descriptor:

```ts
interface Plugin<T extends Traits, C> {
  id: string;
  name: string;
  traits: T;
  mount(
    container: HTMLElement,
    seed: string,
    options?: CreateOptions<Override<T>>,
  ): View<C, Override<T>>;
}
```

Consumers pass a plugin to `create(plugin, target, seed, options?)`. `create`
resolves and validates the DOM target, validates the seed, and calls the mount
hook. A returned view owns its container and supports:

```ts
interface View<C, O> {
  readonly config: C;
  update(seed: string): void;
  setOverrides(overrides?: O): void;
  resize?(width: number, height: number): void;
  destroy(): void;
}
```

`config` always means resolved values; `overrides` always means user input.

## Plugin anatomy

Bundled plugins use this convention:

```text
my-plugin/
  config.ts   traits, config/override types, resolver
  render.ts   drawing or renderer lifecycle
  plugin.ts   definePlugin descriptor
  index.ts    intentional public exports
```

Use `mountString` for SVG or HTML implementations. It owns the seed, overrides,
resolved config, repainting, and teardown. Stateful WebGL or canvas plugins can
return a class implementing `View`, as the gem does.

Every public plugin value uses a short domain noun (`gem`, `cat`, `fox`). The
`Plugin` suffix is reserved for discussion of the extension mechanism and does
not belong on ordinary consumer values.

## Package entry points

- `seedstone` — core consumer API plus bundled plugins
- `seedstone/core` — trait engine and plugin-author API
- `seedstone/gem` — gem plugin and geometry utilities
- `seedstone/cat` — cat plugin and headless SVG renderer
- `seedstone/fox` — fox plugin

An independently published plugin should peer-depend on `seedstone` and import
from `seedstone/core`. Trait guards remain structural rather than `instanceof`
checks so compatible descriptors work across package boundaries.
