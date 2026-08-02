import { buildRegularPolyhedron } from "./lib/platonic.js";
import type { GemCutModule } from "./index.js";

const mod: GemCutModule = {
  name: "tanzanite",
  build: () => buildRegularPolyhedron(20),
};
export default mod;
