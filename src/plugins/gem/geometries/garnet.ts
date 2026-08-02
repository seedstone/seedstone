import { buildRegularPolyhedron } from "./lib/platonic.js";
import type { GemCutModule } from "./index.js";

const mod: GemCutModule = {
  name: "garnet",
  build: () => buildRegularPolyhedron(12),
};
export default mod;
