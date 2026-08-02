import { buildRegularPolyhedron } from "./lib/platonic";
import type { GemCutModule } from "./index";

const mod: GemCutModule = {
  name: "garnet",
  build: () => buildRegularPolyhedron(12),
};
export default mod;
