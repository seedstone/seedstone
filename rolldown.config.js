import { defineConfig } from "rolldown";
import { geometryGlob, banner } from "./build/geometry-glob.js";

const subpathEntries = {
  core: "src/core/index.ts",
  gem: "src/plugins/gem/index.ts",
  cat: "src/plugins/cat/index.ts",
  fox: "src/plugins/fox/index.ts",
};

export default defineConfig([
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
