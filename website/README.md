## Setup

The site consumes the built library from `../dist`, so build that first:

```sh
# from the repo root — installs every workspace, including this one
pnpm install
pnpm build
```

## Development

```sh
# from the repo root
pnpm --filter seedstone-website dev   # dev server on http://localhost:3000
```

Or, from the repo root, `pnpm dev` runs the library in watch mode and this dev server together.

## Production

```sh
# from the repo root
pnpm --filter seedstone-website generate   # static site → .output/public
pnpm --filter seedstone-website preview    # preview the production build locally
```

## Adding a plugin

The whole site is data-driven from a single array: [`app/plugins.ts`](app/plugins.ts)
exports `sitePlugins`, and every surface reads from it — the nav dropdown, the
hero, the usage snippet, the use-case thumbnails, and the lab. Register a plugin
there and it appears everywhere; **no other file needs editing.**

### 1. Get the plugin object

A plugin is anything that satisfies the `Plugin` contract from `seedstone`.

- **Bundled in the library** (lives in `../src`): export it from the package's
  `src/index.ts`, then rebuild so the site picks it up:

  ```sh
  pnpm build           # from the repo root — refreshes ../dist
  ```

  ```ts
  import { myPlugin } from "seedstone";
  ```

- **External / your own**: just import the plugin object directly. It doesn't
  need to live in the `seedstone` package.

  ```ts
  import { myPlugin } from "../../my-plugin";
  ```

> Authoring the plugin itself (traits, the `mount` hook, the lab) is covered in
> [`../src/README.md`](../src/README.md). This section is only about surfacing an
> existing plugin on the site.

### 2. Register it in `sitePlugins`

Append a `SitePlugin` entry. Only `plugin` is required; the rest is presentation:

```ts
export const sitePlugins: SitePlugin[] = [
  // …existing entries…
  {
    plugin: myPlugin, // required — the Plugin object
    importName: "myPlugin", // export name shown in the usage snippet
    noun: "badge", // used in copy, e.g. "Two lines to a badge"
    lede: "One-sentence pitch shown in the hero for this plugin.",
    sampleSeeds: ["@satoshi", "Acme Inc", "DOC-12"], // seed chips
    summarize: mySummary, // optional — see below
  },
];
```

| Field         | Required | Purpose                                                       |
| ------------- | -------- | ------------------------------------------------------------- |
| `plugin`      | yes      | The `Plugin` object the site mounts via `create()`.           |
| `importName`  | no       | Export name shown in the usage snippet; defaults to `plugin`. |
| `noun`        | no       | Word for this output, woven into headings/copy.               |
| `lede`        | no       | Hero subtitle when this plugin is active.                     |
| `sampleSeeds` | no       | Seed suggestions; falls back to `DEFAULT_SAMPLE_SEEDS`.       |
| `summarize`   | no       | Builds the Readout panel; falls back to `fallbackSummary`.    |

That's the whole integration. The plugin supplies `id`, `name`, and `traits`.
Website-owned controls, copy, sample seeds, and summaries stay in `sitePlugins`
and `app/lab-controls.ts` rather than expanding the runtime plugin contract.

### 3. (Optional) Add a Readout summary

Without `summarize`, the Readout panel uses `fallbackSummary`, which walks the
config and lists the first few values generically. For a tailored panel, write a
function that maps the resolved config to a `Summary`:

```ts
function mySummary(config: unknown): Summary {
  const c = config as MyConfig | null;
  return {
    title: c?.body.shape ?? "badge",
    swatch: `hsl(${c?.body.hue ?? 0} 70% 55%)`, // color chip
    stats: [
      // numeric → progress bar (pass `pct`); categorical → tag (omit `pct`)
      {
        label: "Hue",
        value: `${Math.round(c?.body.hue ?? 0)}deg`,
        pct: statPct(c?.body.hue ?? 0, 0, 360),
      },
      { label: "Shape", value: c?.body.shape ?? "—" },
    ],
  };
}
```

A stat with a `pct` renders as a labelled progress bar; a stat without one
renders as a categorical tag.
