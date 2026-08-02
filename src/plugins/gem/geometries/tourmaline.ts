import { buildBipyramid } from "./lib/bipyramid";
import type { GemCutModule } from "./index";

const mod: GemCutModule = {
  name: "tourmaline",
  build: () => buildBipyramid(20),
};
export default mod;
