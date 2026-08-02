# seedstone

Create deterministic visual identities from any string. The same seed always
produces the same output, whether the implementation renders a WebGL gemstone,
an SVG avatar, or a third-party visual.

## Quick start

```sh
npm install seedstone
```

```ts
import { create, gem } from "seedstone";

const view = create(gem, "#avatar", "alice");
```

Seedstone bundles three plugins:

```ts
import { create, gem, cat, fox } from "seedstone";

create(gem, "#gem", "alice");
create(cat, "#cat", "alice");
create(fox, "#fox", "alice");
```

Direct entry points are also available as `seedstone/gem`, `seedstone/cat`, and
`seedstone/fox`. For a script tag, load `dist/seedstone.standalone.js` and use
`window.Seedstone.create(window.Seedstone.gem, target, seed)`.

## Overrides and live updates

Every plugin declares a typed tree of traits. Pass `overrides` to pin a value or
replace a trait with a new seed-driven range:

```ts
import { create, gem, seeded, type GemConfig } from "seedstone";

const view = create(gem, "#avatar", "alice", {
  overrides: {
    gem: {
      cut: "spinel",
      hue: seeded(140, 240),
    },
  },
});

view.update("bob");
view.setOverrides({ gem: { hue: 200 } });
view.setOverrides(); // reset all overrides

const resolved: GemConfig = view.config;
view.destroy();
```

`view.config` is always the resolved, plain-value configuration. Override inputs
are typed from the selected plugin, so unrelated trait paths are rejected by
TypeScript.

The cat also has a headless renderer for SSR, static files, and tests:

```ts
import { renderCat } from "seedstone/cat";

const svg = renderCat("alice");
```

## Writing a plugin

“Plugin” is the extension-system term; consumers normally work with short
implementation names such as `gem` or `cat`. Plugin authors use the lightweight
`seedstone/core` entry point:

```ts
import {
  definePlugin,
  derive,
  merge,
  mountString,
  seeded,
  type Config,
  type Override,
} from "seedstone/core";

const traits = { body: { hue: seeded(0, 360) } };
type BadgeConfig = Config<typeof traits>;
type BadgeOverrides = Override<typeof traits>;

export const badge = definePlugin<typeof traits, BadgeConfig>({
  id: "badge",
  name: "Badge",
  traits,
  mount: (container, seed, options = {}) =>
    mountString<BadgeConfig, BadgeOverrides>(
      container,
      seed,
      (nextSeed, overrides) => derive(merge(traits, overrides), nextSeed),
      ({ body }) => `<span style="color:hsl(${body.hue} 70% 50%)">◆</span>`,
      options,
    ),
});
```

Published plugins should declare `seedstone` as a peer dependency and import
their authoring API from `seedstone/core`:

```json
{
  "peerDependencies": {
    "seedstone": "^2.0.0"
  }
}
```

See [`src/README.md`](src/README.md) for the engine and plugin architecture.

## API stability

The consumer runtime, trait engine, plugin contract, and documented entry
points follow semver. Plugin-specific rendering internals are not public unless
their entry point exports them.

## Development

```sh
pnpm install
pnpm dev
pnpm build
pnpm test
```

The procedural cat was inspired by [@jaameypr](https://github.com/jaameypr)'s
[catsum](https://github.com/jaameypr/catsum) fork.

## License

[MIT](LICENSE)
