import { buildRegularPolyhedron } from "./lib/platonic.js";
import type { GemCutModule } from "./index.js";

const mod: GemCutModule = {
  name: "spinel",
  build: () => buildRegularPolyhedron(4),
};
export default mod;
