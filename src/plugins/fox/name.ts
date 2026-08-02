import { sampleUnit } from "../../core/index";

const NAMES = [
  "Ember",
  "Sorrel",
  "Pippin",
  "Vixen",
  "Rusty",
  "Maple",
  "Cinder",
  "Birch",
  "Hazel",
  "Fennec",
  "Saffron",
  "Clover",
  "Juniper",
  "Bramble",
  "Foxglove",
  "Amber",
  "Marigold",
  "Tamarind",
  "Sienna",
  "Copper",
  "Ginger",
  "Aspen",
  "Willow",
  "Nutmeg",
  "Thistle",
  "Reynard",
  "Basil",
  "Dusk",
  "Sol",
  "Rowan",
];

export function nameFor(seed: string): string {
  return NAMES[Math.floor(sampleUnit(seed, "fox.name") * NAMES.length)];
}
