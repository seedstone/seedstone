import fs from "node:fs";
import path from "node:path";

export const banner = `/**
 * seedstone v2.0.0 — https://github.com/titangmz/seedstone
 * MIT License
 */`;

/**
 * Expand the `import.meta.glob` call in the gem geometry registry at build time.
 *
 * `import.meta.glob` is a Vite-only feature; Rolldown does not
 * understand it natively, so we rewrite it into static imports + a plain
 * registry object. It uses the standard `transform` hook implemented by
 * Rolldown.
 */
export function geometryGlob() {
  return {
    name: "geometry-glob",
    transform(code, id) {
      if (!id.endsWith(path.join("src", "plugins", "gem", "geometries", "index.ts"))) return null;

      const globCall =
        /import\.meta\.glob(?:<[^>]*>)?\(['"]\.\/\*\.ts['"],\s*\{\s*eager:\s*true,\s*import:\s*['"]default['"],\s*\}\)/m;
      if (!globCall.test(code)) return null;

      const dir = path.dirname(id);
      const geometryFiles = fs
        .readdirSync(dir)
        .filter((file) => file.endsWith(".ts") && file !== "index.ts" && !file.endsWith(".d.ts"))
        .sort();

      const imports = geometryFiles
        .map((file, index) => `import geometry${index} from './${file}';`)
        .join("\n");
      const registry = `{\n${geometryFiles
        .map((file, index) => `  './${file}': geometry${index},`)
        .join("\n")}\n}`;

      return {
        code: `${imports}\n${code.replace(globCall, registry)}`,
        map: null,
      };
    },
  };
}
