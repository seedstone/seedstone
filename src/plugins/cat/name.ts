/**
 * A deterministic display name for the cat, drawn from the seed on its own hash
 * label so it never disturbs the visual traits. Used in the SVG's aria-label and
 * exposed on the resolved config.
 */

import { sampleUnit } from "../../core/index";

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

/** Pick a name deterministically from the seed. */
export function nameFor(seed: string): string {
  return NAMES[Math.floor(sampleUnit(seed, "cat.name") * NAMES.length)];
}
