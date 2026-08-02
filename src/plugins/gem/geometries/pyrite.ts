import { buildRegularPolyhedron } from "./lib/platonic.js";
import type { GemCutModule } from "./index.js";

const mod: GemCutModule = {
  name: "pyrite",
  build: () => buildRegularPolyhedron(6),
};
export default mod;
