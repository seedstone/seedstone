import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const dist = new URL("../dist", import.meta.url);

function mirror(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      mirror(source);
      continue;
    }
    if (!entry.name.endsWith(".d.ts")) continue;

    const target = source.replace(/\.d\.ts$/, ".d.cts");
    const content = readFileSync(source, "utf8").replace(
      /(["'])(\.\.?\/[^"']+)\.js\1/g,
      "$1$2.cjs$1",
    );
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}

mirror(dist.pathname);
