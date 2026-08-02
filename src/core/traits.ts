import { sampleUnit } from "./random";

export interface ConstantTrait<V extends number | string = number | string> {
  readonly kind: "constant";
  readonly value: V;
}

export interface SeededTrait {
  readonly kind: "seeded";
  readonly min: number;
  readonly max: number;
}

export interface PickTrait {
  readonly kind: "pick";
  readonly options: () => string[];
}

export type Trait = ConstantTrait | SeededTrait | PickTrait;

export function constant<V extends number | string>(value: V): ConstantTrait<V> {
  return { kind: "constant", value };
}

export function seeded(min: number, max: number): SeededTrait {
  return { kind: "seeded", min, max };
}

export function pick(options: () => string[]): PickTrait {
  return { kind: "pick", options };
}

export function isConstant(v: unknown): v is ConstantTrait {
  return typeof v === "object" && v !== null && (v as { kind?: unknown }).kind === "constant";
}

export function isSeeded(v: unknown): v is SeededTrait {
  return typeof v === "object" && v !== null && (v as { kind?: unknown }).kind === "seeded";
}

export function isPick(v: unknown): v is PickTrait {
  return typeof v === "object" && v !== null && (v as { kind?: unknown }).kind === "pick";
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export type Traits = Record<string, unknown>;

export type Config<T> =
  T extends ConstantTrait<infer V>
    ? V
    : T extends SeededTrait
      ? number
      : T extends PickTrait
        ? string
        : T extends readonly unknown[]
          ? T
          : T extends object
            ? { [K in keyof T]: Config<T[K]> }
            : T;

/** A deep-partial trait tree. Raw numbers and strings become constants. */
export type Override<T> = T extends Trait
  ? Trait | number | string
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [K in keyof T]?: Override<T[K]> }
      : T;

/** Resolves traits to plain values. Without a seed, uses midpoint/first-option defaults. */
export function derive<T extends Traits>(traits: T, seed?: string): Config<T> {
  function resolve(node: unknown, path: string): unknown {
    if (isConstant(node)) return node.value;
    if (isSeeded(node)) {
      return seed !== undefined
        ? node.min + sampleUnit(seed, path) * (node.max - node.min)
        : (node.min + node.max) / 2;
    }
    if (isPick(node)) {
      const options = node.options();
      return seed !== undefined
        ? options[Math.floor(sampleUnit(seed, path) * options.length)]
        : options[0];
    }
    if (Array.isArray(node)) return node;
    if (isPlainObject(node)) {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node)) out[k] = resolve(v, path ? `${path}.${k}` : k);
      return out;
    }
    return node;
  }
  return resolve(traits, "") as Config<T>;
}

/** Returns a new trait tree with the supplied overrides applied. */
export function merge<T extends Traits>(base: T, overrides: Override<T> = {} as Override<T>): T {
  function mergeNode(baseNode: unknown, patch: unknown): unknown {
    if (patch === undefined) return baseNode;
    if (typeof patch === "number" || typeof patch === "string") return constant(patch);
    if (isConstant(patch) || isSeeded(patch) || isPick(patch)) return patch;
    if (isPlainObject(baseNode) && isPlainObject(patch)) {
      const merged: Record<string, unknown> = { ...baseNode };
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined) continue;
        merged[key] = mergeNode(baseNode[key], value);
      }
      return merged;
    }
    return patch;
  }
  return mergeNode(base, overrides) as T;
}
