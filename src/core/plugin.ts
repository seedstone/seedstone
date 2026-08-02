import type { Override, Traits } from "./traits";
import type { Plugin, View, CreateOptions } from "./contract";

/** Identity helper — declare a plugin with full type inference. */
export function definePlugin<T extends Traits, C>(plugin: Plugin<T, C>): Plugin<T, C> {
  return plugin;
}

/**
 * Mount a plugin and return a live view — the entry point for rendering any
 * plugin. The runtime resolves `target` (a CSS selector or an element),
 * validates the inputs, then invokes the plugin's `mount` hook. End users call
 * `create`; they never call `plugin.mount` directly.
 *
 *   const view = create(gem, "#avatar", "alice");
 *   const view = create(cat, el, "alice", { overrides: { coat: { hue: 120 } } });
 */
export function create<T extends Traits, C>(
  plugin: Plugin<T, C>,
  target: string | HTMLElement,
  seed: string,
  options?: CreateOptions<Override<T>>,
): View<C, Override<T>> {
  const container = typeof target === "string" ? document.querySelector(target) : target;
  if (!(container instanceof HTMLElement)) {
    const where = typeof target === "string" ? ` for selector "${target}"` : "";
    throw new Error(`[seedstone] create(${plugin.id}): no container element found${where}.`);
  }
  if (typeof seed !== "string") {
    throw new TypeError(`[seedstone] create(${plugin.id}): seed must be a string.`);
  }
  return plugin.mount(container, seed, options);
}

/** Reusable string→div renderer for SVG/HTML plugins. Owns the container:
 *  holds seed + overrides + resolved config, recomputes and swaps `innerHTML`
 *  on `update`/`setOverrides`, and clears on `destroy`. */
export function mountString<C, O extends object = object>(
  container: HTMLElement,
  seed: string,
  resolve: (seed: string, overrides: O) => C,
  render: (config: C) => string,
  options: CreateOptions<O> = {},
): View<C, O> {
  let currentSeed = seed;
  let overrides = options.overrides ?? ({} as O);
  let config = resolve(currentSeed, overrides);

  const paint = () => {
    container.innerHTML = render(config);
  };
  paint();
  options.onReady?.();

  return {
    get config() {
      return config;
    },
    update(next: string) {
      currentSeed = next;
      config = resolve(currentSeed, overrides);
      paint();
    },
    setOverrides(next: O = {} as O) {
      overrides = next;
      config = resolve(currentSeed, overrides);
      paint();
    },
    destroy() {
      container.innerHTML = "";
    },
  };
}
