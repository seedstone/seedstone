import { buildRegularPolyhedron } from "./lib/platonic";
import type { GemCutModule } from "./index";

const mod: GemCutModule = {
  name: "spinel",
  build: () => buildRegularPolyhedron(4),
};
export default mod;
