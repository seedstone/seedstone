# Migrating from Seedstone v2 to v3

V3 replaces the gem-specific constructor with a plugin runtime. There are no legacy aliases.

## Creating a gem

```ts
// v2
import { SeedstoneRenderer } from "seedstone";

const view = new SeedstoneRenderer("alice", { container });
```

```ts
// v3
import { create, gem } from "seedstone";

const view = create(gem, container, "alice");
```

The target may be an `HTMLElement` or a selector string.

## Overrides

The constructor's `config` option is now `overrides`, and `setConfig()` is now
`setOverrides()`:

```ts
const view = create(gem, container, "alice", {
  overrides: { gem: { cut: "spinel", hue: 200 } },
});

view.setOverrides({ gem: { hue: 120 } });
view.setOverrides();
```

`view.config` remains the fully resolved configuration. Override values are now
checked against the selected plugin's trait tree and choice unions.

## Gem controls

Gem-only options remain available through `GemOptions`:

```ts
const view = create(gem, container, "alice", {
  autoRotate: false,
  pixelRatio: 1,
  preserveDrawingBuffer: true,
  targetFPS: 30,
});

view.play();
view.pause();
view.resize(640, 640);
view.destroy();
```

The inferred return type is `GemView`, which also exposes the current readonly
`seed`.

## Plugins and entry points

The root package includes all bundled implementations:

```ts
import { create, gem, cat, fox } from "seedstone";
```

Use `seedstone/gem`, `seedstone/cat`, and `seedstone/fox` when importing one
implementation directly. Plugin authors should import `Plugin`, `definePlugin`,
traits, and authoring utilities from `seedstone/core` and peer-depend on
`seedstone` `^3.0.0`.
