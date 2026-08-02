import * as THREE from "three";

export interface GemCutModule {
  name: string;
  build: () => THREE.BufferGeometry;
}

const modules = import.meta.glob<GemCutModule>("./*.ts", {
  eager: true,
  import: "default",
});

const GEM_CUTS = new Map<string, GemCutModule>();

for (const mod of Object.values(modules)) {
  if (mod && typeof mod.name === "string" && typeof mod.build === "function") {
    GEM_CUTS.set(mod.name, mod);
  }
}

export type GemCut =
  | "citrine"
  | "fluorite"
  | "garnet"
  | "pyrite"
  | "spinel"
  | "tanzanite"
  | "tourmaline"
  | "zircon";

/**
 * Build a BufferGeometry for the given cut.
 * Falls back to the first registered cut if the name is unrecognised.
 */
export function buildGeometry(cut: GemCut): THREE.BufferGeometry {
  const mod = GEM_CUTS.get(cut) ?? GEM_CUTS.values().next().value!;
  return mod.build();
}

export function listCuts(): GemCut[] {
  return [...GEM_CUTS.keys()].sort() as GemCut[];
}
