import {
  cat,
  gem,
  fox,
  type CatConfig,
  type GemConfig,
  type FoxConfig,
  type Plugin,
} from "seedstone";
import { buildLabControls, gemLabControls, type LabControls } from "~/lab-controls";

export interface SummaryStat {
  label: string;
  value: string;
  pct?: number;
}

export interface Summary {
  title: string;
  subtitle?: string;
  swatch?: string;
  stats?: SummaryStat[];
}

export interface SitePlugin {
  plugin: Plugin;
  controls: LabControls;
  importName?: string;
  noun?: string;
  lede?: string;
  sampleSeeds?: string[];
  summarize?: (config: unknown, seed: string) => Summary;
}

export const DEFAULT_SAMPLE_SEEDS = [
  "@satoshi",
  "0x71C7...976F",
  "Orion-7",
  "Stripe Inc",
  "DOC-99812",
];

function statPct(v: number, lo: number, hi: number): number {
  return Math.max(4, Math.min(100, Math.round(((v - lo) / (hi - lo)) * 100)));
}

function gemSummary(config: unknown): Summary {
  const c = config as GemConfig | null;
  const hue = c?.gem.hue ?? 270;
  const sat = c?.gem.saturation ?? 0.8;
  const ior = c?.gem.material.ior ?? 2;
  const fire = c?.gem.material.iridescence ?? 0.5;
  const speed = c?.gem.speed ?? 1;
  const perfection = c?.gem.distortion.perfection ?? 0.5;
  const grade =
    perfection >= 0.88
      ? "Imperial"
      : perfection >= 0.75
        ? "Flawless"
        : perfection >= 0.58
          ? "Radiant"
          : perfection >= 0.38
            ? "Brilliant"
            : "Refined";

  return {
    title: c?.gem.cut ?? "crystal",
    swatch: `oklch(0.62 ${(0.16 + sat * 0.1).toFixed(3)} ${hue.toFixed(1)})`,
    stats: [
      { label: "Grade", value: grade },
      { label: "Saturation", pct: Math.round(sat * 100), value: `${Math.round(sat * 100)}%` },
      { label: "IOR", pct: statPct(ior, 1.5, 2.8), value: ior.toFixed(2) },
      { label: "Fire", pct: Math.round(fire * 100), value: `${Math.round(fire * 100)}%` },
      { label: "Speed", pct: statPct(speed, 0.3, 2), value: `x${speed.toFixed(2)}` },
      {
        label: "Perfection",
        pct: Math.round(perfection * 100),
        value: `${Math.round(perfection * 100)}%`,
      },
    ],
  };
}

function catSummary(config: unknown): Summary {
  const c = config as CatConfig | null;
  return {
    title: c?.name ?? "Cat avatar",
    swatch: c?.palette.coat,
    stats: c
      ? [
          {
            label: "Coat",
            value: `${Math.round(c.coat.hue)}deg`,
            pct: statPct(c.coat.hue, 0, 360),
          },
          {
            label: "Eyes",
            value: `${Math.round(c.eyes.hue)}deg`,
            pct: statPct(c.eyes.hue, 40, 210),
          },
          { label: "Pattern", value: c.coat.pattern },
          { label: "Mood", value: c.mood },
          { label: "Ears", value: c.ears.shape },
          {
            label: "Floof",
            value: `${Math.round(c.face.floof * 100)}%`,
            pct: Math.round(c.face.floof * 100),
          },
        ]
      : [],
  };
}

function foxSummary(config: unknown): Summary {
  const c = config as FoxConfig | null;
  return {
    title: c?.name ?? "Fox",
    swatch: c?.palette.coat,
    stats: c
      ? [
          {
            label: "Coat",
            value: `${Math.round(c.coat.hue)}deg`,
            pct: statPct(c.coat.hue, 0, 360),
          },
          {
            label: "Eyes",
            value: `${Math.round(c.eyes.hue)}deg`,
            pct: statPct(c.eyes.hue, 18, 55),
          },
          { label: "Pattern", value: c.coat.pattern },
          { label: "Expression", value: c.expression },
          {
            label: "Ruff",
            value: `${Math.round(c.face.ruff * 100)}%`,
            pct: Math.round(c.face.ruff * 100),
          },
        ]
      : [],
  };
}

export function fallbackSummary(config: unknown, seed: string, plugin: Plugin): Summary {
  const stats: SummaryStat[] = [];
  const walk = (value: unknown, path: string[] = []) => {
    if (stats.length >= 5) return;
    if (typeof value === "number") {
      stats.push({
        label: path.at(-1) ?? "value",
        value: Number.isInteger(value) ? String(value) : value.toFixed(2),
      });
    } else if (typeof value === "string") {
      stats.push({ label: path.at(-1) ?? "value", value });
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [key, next] of Object.entries(value)) walk(next, [...path, key]);
    }
  };
  walk(config);
  return { title: plugin.name, subtitle: seed, stats };
}

export const sitePlugins: SitePlugin[] = [
  {
    plugin: gem,
    controls: gemLabControls,
    importName: "gem",
    noun: "gemstone",
    lede: "Type a username, wallet, company, or AI agent — Seedstone forges a unique 3D gem as its permanent visual identity.",
    sampleSeeds: DEFAULT_SAMPLE_SEEDS,
    summarize: gemSummary,
  },
  {
    plugin: cat,
    controls: buildLabControls(cat.traits),
    importName: "cat",
    noun: "cat",
    lede: "Type a username, wallet, company, or AI agent — Seedstone draws a deterministic SVG cat as its permanent visual identity.",
    sampleSeeds: ["@satoshi", "Mochi-77", "0x71C7...976F", "Patchwork Labs", "DOC-99812"],
    summarize: catSummary,
  },
  {
    plugin: fox,
    controls: buildLabControls(fox.traits),
    importName: "fox",
    noun: "fox",
    lede: "Type a username, wallet, company, or AI agent — Seedstone draws a deterministic SVG fox as its permanent visual identity.",
    sampleSeeds: ["@satoshi", "Reynard", "0x71C7...976F", "Foxglove Labs", "DOC-99812"],
    summarize: foxSummary,
  },
];
