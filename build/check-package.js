import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const temporary = mkdtempSync(path.join(tmpdir(), "seedstone-package-"));
const consumer = path.join(temporary, "consumer");

function run(command, args, cwd = root) {
  return execFileSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

try {
  const packed = JSON.parse(
    run("npm", ["pack", "--json", "--pack-destination", temporary, "--ignore-scripts"]),
  )[0];
  if (packed.size > 3_000_000 || packed.unpackedSize > 12_000_000) {
    throw new Error(
      `Package exceeds the size budget: ${packed.size} compressed, ${packed.unpackedSize} unpacked.`,
    );
  }

  const tarball = path.join(temporary, packed.filename);
  run("npm", [
    "install",
    "--prefix",
    consumer,
    tarball,
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
  ]);

  run(
    "node",
    [
      "--input-type=module",
      "--eval",
      "const root = await import('seedstone'); const core = await import('seedstone/core'); const gem = await import('seedstone/gem'); const cat = await import('seedstone/cat'); const fox = await import('seedstone/fox'); if (root.gem.id !== gem.gem.id || root.cat.id !== cat.cat.id || root.fox.id !== fox.fox.id || typeof core.definePlugin !== 'function') process.exit(1);",
    ],
    consumer,
  );
  run(
    "node",
    [
      "--eval",
      "const root = require('seedstone'); const core = require('seedstone/core'); const gem = require('seedstone/gem'); const cat = require('seedstone/cat'); const fox = require('seedstone/fox'); if (root.gem.id !== gem.gem.id || root.cat.id !== cat.cat.id || root.fox.id !== fox.fox.id || typeof core.definePlugin !== 'function') process.exit(1);",
    ],
    consumer,
  );

  writeFileSync(
    path.join(consumer, "consumer.mts"),
    `import { create, gem, type GemOptions, type GemView } from "seedstone";
import { definePlugin, type PluginOptions, type PluginView } from "seedstone/core";
import { gem as directGem } from "seedstone/gem";
import { cat } from "seedstone/cat";
import { fox } from "seedstone/fox";
declare const target: HTMLElement;
const options: GemOptions = { autoRotate: false, pixelRatio: 1, preserveDrawingBuffer: true };
const view: GemView = create(gem, target, "alice", options);
view.pause(); view.play();
void definePlugin; void directGem; void cat; void fox;
type Options = PluginOptions<typeof gem>;
type Mounted = PluginView<typeof gem>;
const inferredOptions: Options = options;
const inferredView: Mounted = view;
void inferredOptions; void inferredView;
`,
  );
  writeFileSync(
    path.join(consumer, "consumer.cts"),
    `import { create, gem, type GemView } from "seedstone";
import { definePlugin } from "seedstone/core";
import { cat } from "seedstone/cat";
declare const target: HTMLElement;
const view: GemView = create(gem, target, "alice", { autoRotate: false });
view.pause();
void definePlugin; void cat;
`,
  );

  const base = {
    compilerOptions: {
      target: "ES2020",
      strict: true,
      noEmit: true,
      skipLibCheck: false,
      lib: ["ES2020", "DOM"],
    },
    include: ["consumer.mts", "consumer.cts"],
  };
  writeFileSync(
    path.join(consumer, "tsconfig.node.json"),
    JSON.stringify({
      ...base,
      compilerOptions: {
        ...base.compilerOptions,
        module: "NodeNext",
        moduleResolution: "NodeNext",
      },
    }),
  );
  writeFileSync(
    path.join(consumer, "tsconfig.bundler.json"),
    JSON.stringify({
      ...base,
      compilerOptions: { ...base.compilerOptions, module: "ESNext", moduleResolution: "Bundler" },
    }),
  );

  const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");
  run("node", [tsc, "-p", "tsconfig.node.json"], consumer);
  run("node", [tsc, "-p", "tsconfig.bundler.json"], consumer);

  process.stdout.write(
    `Package verified: ${packed.size} bytes compressed, ${packed.unpackedSize} bytes unpacked.\n`,
  );
} catch (error) {
  if (error?.stderr) process.stderr.write(error.stderr);
  throw error;
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
