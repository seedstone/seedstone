import type { Override, Traits } from "./traits.js";

export interface View<C = unknown, O extends object = object> {
  readonly config: C;
  update(seed: string): void;
  /** Replaces existing overrides. Omit the argument to reset them. */
  setOverrides(overrides?: O): void;
  resize?(width: number, height: number): void;
  destroy(): void;
}

export interface CreateOptions<O extends object = object> {
  overrides?: O;
  width?: number;
  height?: number;
  background?: string | number | null;
  targetFPS?: number;
  onReady?: () => void;
}

export interface Plugin<
  T extends Traits = Traits,
  C = unknown,
  O extends CreateOptions<Override<T>> = CreateOptions<Override<T>>,
  V extends View<C, Override<T>> = View<C, Override<T>>,
> {
  id: string;
  name: string;
  traits: T;
  mount(container: HTMLElement, seed: string, options?: O): V;
}

export type PluginOptions<P> = P extends Plugin<any, any, infer O, any> ? O : never;
export type PluginView<P> = P extends Plugin<any, any, any, infer V> ? V : never;
