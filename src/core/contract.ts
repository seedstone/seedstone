import type { Override, Traits } from "./traits";

/** A live, mounted render. Update the seed or override traits; the plugin
 *  reconciles its container in place. */
export interface View<C = unknown, O extends object = object> {
  /** The resolved config currently rendered. */
  readonly config: C;
  /** Re-render for a new seed. */
  update(seed: string): void;
  /** Replace all overrides and re-render. Omitting a key restores that trait to
   *  its declaration. `setOverrides({})` resets everything. */
  setOverrides(overrides?: O): void;
  /** Resize the canvas — only present on WebGL plugins. */
  resize?(width: number, height: number): void;
  /** Tear down and release the container. */
  destroy(): void;
}

/** Options accepted by `create`. All optional — `overrides` replaces traits;
 *  the rest are hints a plugin may use (WebGL) or ignore (SVG/string). */
export interface CreateOptions<O extends object = object> {
  overrides?: O;
  width?: number;
  height?: number;
  background?: string | number | null;
  targetFPS?: number;
  onReady?: () => void;
}

/**
 * A plugin — a passive descriptor the runtime drives. Authors build one with
 * `definePlugin`; users hand it to `create`.
 */
export interface Plugin<T extends Traits = Traits, C = unknown> {
  /** Stable identifier, e.g. `"gem"`. */
  id: string;
  /** Human-readable label, e.g. `"Gemstone"`. */
  name: string;
  /** The trait declaration tree. */
  traits: T;
  /** Runtime hook implemented by plugin authors and invoked by `create`. It
   *  receives a resolved, validated container. End users call
   *  `create(plugin, target, seed)` rather than this directly. */
  mount(
    container: HTMLElement,
    seed: string,
    options?: CreateOptions<Override<T>>,
  ): View<C, Override<T>>;
}
