import { buildAntiprism } from "./lib/antiprism";
import type { GemCutModule } from "./index";

const mod: GemCutModule = {
  name: "citrine",
  build: () => buildAntiprism(5),
};
export default mod;
