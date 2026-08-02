import { buildAntiprism } from "./lib/antiprism.js";
import type { GemCutModule } from "./index.js";

const mod: GemCutModule = {
  name: "citrine",
  build: () => buildAntiprism(5),
};
export default mod;
