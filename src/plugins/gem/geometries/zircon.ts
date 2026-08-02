import { buildGeodesicSphere } from "./lib/geodesic";
import type { GemCutModule } from "./index";

const mod: GemCutModule = {
  name: "zircon",
  build: () => buildGeodesicSphere(1),
};
export default mod;
