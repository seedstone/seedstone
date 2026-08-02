import { buildGeodesicSphere } from "./lib/geodesic.js";
import type { GemCutModule } from "./index.js";

const mod: GemCutModule = {
  name: "zircon",
  build: () => buildGeodesicSphere(1),
};
export default mod;
