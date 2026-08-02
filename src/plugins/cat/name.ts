import { sampleUnit } from "../../core/index.js";

const NAMES = [
  "Marmalade",
  "Pickle",
  "Sushi",
  "Espresso",
  "Domino",
  "Cricket",
  "Bumble",
  "Tater",
  "Macaron",
  "Soba",
  "Cinder",
  "Pesto",
  "Brioche",
  "Wasabi",
  "Cleo",
  "Atlas",
  "Miso",
  "Pancake",
  "Strudel",
  "Cocoa",
  "Tangerine",
  "Custard",
  "Pretzel",
  "Marlowe",
  "Banjo",
  "Sprout",
  "Cinnamon",
  "Toast",
  "Gnocchi",
  "Wonton",
];

export function nameFor(seed: string): string {
  return NAMES[Math.floor(sampleUnit(seed, "cat.name") * NAMES.length)];
}
