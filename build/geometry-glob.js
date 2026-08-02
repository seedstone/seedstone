import fs from "node:fs";
import path from "node:path";

const packageJson = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

export const banner = `/**
 * seedstone v${packageJson.version} — https://github.com/seedstone/seedstone
 * MIT License
 */`;

/** Converts the gem geometry glob to static imports for Rolldown. */
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
