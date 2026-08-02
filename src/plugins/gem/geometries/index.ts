/**
 * Geometry registry for Seedstone — auto-discovery edition.
 *
 * HOW TO ADD A NEW CUT
 * ────────────────────
 * 1. Create `src/geometries/<name>.ts`
 * 2. Export a default object matching the `GemCutModule` contract (import that
 *    type from this folder's index), e.g.:
 *
 *      const mod: GemCutModule = {
 *        name: 'mycut',
 *        build: () => { … return geometry; },
 *      };
 *      export default mod;
 *
 * That's it — no edits to this file required.
 * The cut becomes available immediately and is picked by the system.
 */

import * as THREE from "three";

// ── Contract ──────────────────────────────────────────────────────────────────

export interface GemCutModule {
  /** Unique lowercase identifier, e.g. 'garnet', 'zircon'. */
  name: string;
  /** Build the base BufferGeometry for this cut. */
  build: () => THREE.BufferGeometry;
}

// ── Auto-discovery ────────────────────────────────────────────────────────────
// Bundlers like Vite expand import.meta.glob at build time.
// We use a synchronous eager glob so no async is needed at runtime.

const modules = import.meta.glob<GemCutModule>("./*.ts", {
  eager: true,
  import: "default",
});

const GEM_CUTS = new Map<string, GemCutModule>();

for (const mod of Object.values(modules)) {
  // Skip the index itself (no default export with a `name` field)
  if (mod && typeof mod.name === "string" && typeof mod.build === "function") {
    GEM_CUTS.set(mod.name, mod);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Name of a registered cut. */
export type GemCut = string;

/**
 * Build a BufferGeometry for the given cut.
 * Falls back to the first registered cut if the name is unrecognised.
 */
export function buildGeometry(cut: GemCut): THREE.BufferGeometry {
  const mod = GEM_CUTS.get(cut) ?? GEM_CUTS.values().next().value!;
  return mod.build();
}

/** Returns all registered cut names, sorted alphabetically. */
export function listCuts(): string[] {
  return [...GEM_CUTS.keys()].sort();
}
