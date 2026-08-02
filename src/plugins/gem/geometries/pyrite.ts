import { buildRegularPolyhedron } from "./lib/platonic";
import type { GemCutModule } from "./index";

const mod: GemCutModule = {
  name: "pyrite",
  build: () => buildRegularPolyhedron(6),
};
export default mod;
