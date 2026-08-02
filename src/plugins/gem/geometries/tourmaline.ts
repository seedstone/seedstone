import { buildBipyramid } from "./lib/bipyramid.js";
import type { GemCutModule } from "./index.js";

const mod: GemCutModule = {
  name: "tourmaline",
  build: () => buildBipyramid(20),
};
export default mod;
