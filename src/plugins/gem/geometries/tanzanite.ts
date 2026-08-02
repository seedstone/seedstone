import { buildRegularPolyhedron } from "./lib/platonic";
import type { GemCutModule } from "./index";

const mod: GemCutModule = {
  name: "tanzanite",
  build: () => buildRegularPolyhedron(20),
};
export default mod;
