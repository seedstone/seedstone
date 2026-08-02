import { ref, reactive, computed } from "vue";
import { isSeeded, isConstant, isPick } from "seedstone";
import type { LabSlider, LabOptions, LabControls } from "~/lab-controls";
import type { SitePlugin } from "~/plugins";

export interface NumberParam extends LabSlider {
  kind: "number";
  path: string;
  mode: "constant" | "seeded";
  step: number;
  value: number;
}

export interface PickParam {
  kind: "pick";
  path: string;
  options: LabOptions;
  value: string;
}

export type Param = NumberParam | PickParam;

export interface ParamSection {
  title: string;
  params: Param[];
}

const SEED_DRIVEN = "";

function sectionFor(path: string): string {
  const parts = path.split(".");
  const raw = parts.slice(0, parts.length >= 3 ? 2 : 1).join(" ");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  const last = keys.pop()!;
  let cursor = obj;
  for (const key of keys) cursor = (cursor[key] ??= {}) as Record<string, unknown>;
  cursor[last] = value;
}

function serializeOverrides(obj: Record<string, unknown>, indent = 2): string {
  const pad = " ".repeat(indent);
  const entries = Object.entries(obj).map(([k, v]) => {
    let val: string;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const rec = v as Record<string, unknown>;
      val =
        rec.kind === "seeded"
          ? `seeded(${rec.min}, ${rec.max})`
          : serializeOverrides(rec, indent + 2);
    } else {
      val = typeof v === "string" ? `constant('${v}')` : `constant(${v})`;
    }
    return `${pad}${k}: ${val}`;
  });
  return `{\n${entries.join(",\n")}\n${" ".repeat(indent - 2)}}`;
}

function collectParams(obj: unknown, lab: LabControls, path: string[] = []): Param[] {
  const dotted = path.join(".");
  if (isSeeded(obj)) {
    const entry = lab[dotted];
    const slider = entry && !Array.isArray(entry) ? entry : null;
    const min = slider?.min ?? obj.min;
    const max = slider?.max ?? obj.max;
    return [
      {
        kind: "number",
        path: dotted,
        mode: "seeded",
        min,
        max,
        step: (max - min) / 100,
        value: (obj.min + obj.max) / 2,
      },
    ];
  }
  if (isConstant(obj)) {
    if (typeof obj.value !== "number") return [];
    const entry = lab[dotted];
    const slider = entry && !Array.isArray(entry) ? entry : null;
    if (!slider) return [];
    return [
      {
        kind: "number",
        path: dotted,
        mode: "constant",
        min: slider.min,
        max: slider.max,
        step: (slider.max - slider.min) / 100,
        value: obj.value,
      },
    ];
  }
  if (isPick(obj)) {
    return [{ kind: "pick", path: dotted, options: obj.options(), value: SEED_DRIVEN }];
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
  return Object.entries(obj).flatMap(([k, v]) => collectParams(v, lab, [...path, k]));
}

export function useLabState() {
  const sections = ref<ParamSection[]>([]);
  const values = reactive<Record<string, number | string>>({});
  const defaults = reactive<Record<string, number | string>>({});
  const modes = reactive<Record<string, "constant" | "seeded">>({});
  const defModes = reactive<Record<string, "constant" | "seeded">>({});
  const ranges: Record<string, LabSlider> = {};

  function clear(): void {
    sections.value = [];
    for (const k of Object.keys(values)) delete values[k];
    for (const k of Object.keys(defaults)) delete defaults[k];
    for (const k of Object.keys(modes)) delete modes[k];
    for (const k of Object.keys(defModes)) delete defModes[k];
    for (const k of Object.keys(ranges)) delete ranges[k];
  }

  function build(entry: SitePlugin): void {
    clear();
    const lab = entry.controls;
    const groups = new Map<string, Param[]>();
    for (const param of collectParams(entry.plugin.traits, lab)) {
      const sec = sectionFor(param.path);
      const list = groups.get(sec) ?? [];
      list.push(param);
      groups.set(sec, list);
      if (param.kind === "number") {
        defModes[param.path] = modes[param.path] = param.mode;
        ranges[param.path] = { min: param.min, max: param.max };
        defaults[param.path] = values[param.path] = param.value;
      } else {
        defaults[param.path] = values[param.path] = SEED_DRIVEN;
      }
    }
    sections.value = [...groups.entries()].map(([title, params]) => ({ title, params }));
  }

  function toggleMode(path: string): void {
    modes[path] = modes[path] === "seeded" ? "constant" : "seeded";
  }

  function isParamDirty(param: Param): boolean {
    if (param.kind === "pick") return values[param.path] !== defaults[param.path];
    if (modes[param.path] !== defModes[param.path]) return true;
    return modes[param.path] === "constant" && values[param.path] !== defaults[param.path];
  }

  function resetAll(): void {
    for (const k of Object.keys(values)) values[k] = defaults[k]!;
    for (const k of Object.keys(modes)) modes[k] = defModes[k]!;
  }

  function labelFor(path: string): string {
    return path
      .split(".")
      .at(-1)!
      .replace(/([A-Z])/g, " $1")
      .toLowerCase();
  }

  const changed = computed<Array<[string, unknown]>>(() => {
    const result: Array<[string, unknown]> = [];
    for (const path of Object.keys(values)) {
      if (path in defModes) {
        const cur = modes[path];
        if (cur === "seeded") {
          if (cur !== defModes[path]) result.push([path, { kind: "seeded", ...ranges[path] }]);
        } else {
          if (cur !== defModes[path] || values[path] !== defaults[path])
            result.push([path, values[path]]);
        }
      } else {
        if (values[path] !== defaults[path]) result.push([path, values[path]]);
      }
    }
    return result;
  });

  const overrides = computed<Record<string, unknown>>(() => {
    const result: Record<string, unknown> = {};
    for (const [path, value] of changed.value) setPath(result, path, value);
    return result;
  });

  const overridesCode = computed(() => {
    if (!changed.value.length) return "";
    const body = serializeOverrides(overrides.value);
    const usesSeeded = changed.value.some(
      ([, v]) => (v as Record<string, unknown>)?.kind === "seeded",
    );
    const usesPinned = changed.value.some(
      ([, v]) => typeof v === "number" || typeof v === "string",
    );
    const fns = [usesSeeded && "seeded", usesPinned && "constant"].filter(Boolean).join(", ");
    const literal = `overrides: ${body}`;
    return fns ? `import { ${fns} } from 'seedstone'\n\n${literal}` : literal;
  });

  return {
    sections,
    values,
    modes,
    changed,
    overrides,
    overridesCode,
    build,
    toggleMode,
    isParamDirty,
    resetAll,
    labelFor,
  };
}
