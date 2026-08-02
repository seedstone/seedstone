import { defineConfig } from "rolldown";
import { geometryGlob, banner } from "./build/geometry-glob.js";

const subpathEntries = {
  core: "src/core/index.ts",
  gem: "src/plugins/gem/index.ts",
  cat: "src/plugins/cat/index.ts",
  fox: "src/plugins/fox/index.ts",
};

// Primary bundler. Rolldown transforms TypeScript and resolves node_modules
// natively (no extra plugins needed) and ships a built-in minifier, so each
// build is just: expand the geometry glob, then emit the bundle.
//
// Type declarations are produced separately by `tsc` (see the `build:types`
// npm script) so this config — and the speed comparison against Rollup — stays
// focused on JavaScript bundling only.
//
// Three.js is bundled into every output — no peer dependency required.
export default defineConfig([
  // ESM build — tree-shakeable, for bundlers
  {
    input: "src/index.ts",
    plugins: [geometryGlob()],
    output: { file: "dist/seedstone.esm.js", format: "esm", banner, sourcemap: true },
  },
  ...Object.entries(subpathEntries).flatMap(([name, input]) => [
    {
      input,
      plugins: [geometryGlob()],
      output: { file: `dist/${name}.js`, format: "esm", banner, sourcemap: true },
    },
    {
      input,
      plugins: [geometryGlob()],
      output: { file: `dist/${name}.cjs`, format: "cjs", banner, sourcemap: true },
    },
  ]),
  // UMD build — for CommonJS / legacy bundlers
  {
    input: "src/index.ts",
    plugins: [geometryGlob()],
    output: {
      file: "dist/seedstone.umd.cjs",
      format: "umd",
      name: "Seedstone",
      banner,
      sourcemap: true,
      minify: true,
    },
  },
  // IIFE build — single <script> tag, no setup required
  {
    input: "src/index.ts",
    plugins: [geometryGlob()],
    output: {
      file: "dist/seedstone.standalone.js",
      format: "iife",
      name: "Seedstone",
      banner,
      minify: true,
    },
  },
]);
