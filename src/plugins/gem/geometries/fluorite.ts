import { buildRegularPolyhedron } from "./lib/platonic";
import type { GemCutModule } from "./index";

const mod: GemCutModule = {
  name: "fluorite",
  build: () => buildRegularPolyhedron(8),
};
export default mod;
