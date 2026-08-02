import { buildRegularPolyhedron } from "./lib/platonic.js";
import type { GemCutModule } from "./index.js";

const mod: GemCutModule = {
  name: "fluorite",
  build: () => buildRegularPolyhedron(8),
};
export default mod;
