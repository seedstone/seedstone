import * as THREE from "three";
import { extractFlatNormals } from "./geometry";

// PolyhedronGeometry normalizes these cube vertices to the circumradius.
const CUBE_VERTS = [
  -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
];
const CUBE_TRIS = [
  0,
  2,
  1,
  0,
  3,
  2, // -z
  4,
  5,
  6,
  4,
  6,
  7, // +z
  0,
  1,
  5,
  0,
  5,
  4, // -y
  2,
  3,
  7,
  2,
  7,
  6, // +y
  1,
  2,
  6,
  1,
  6,
  5, // +x
  3,
  0,
  4,
  3,
  4,
  7, // -x
];

const GENERATORS: Record<number, (r: number) => THREE.BufferGeometry> = {
  4: (r) => new THREE.TetrahedronGeometry(r, 0),
  6: (r) => new THREE.PolyhedronGeometry(CUBE_VERTS, CUBE_TRIS, r, 0),
  8: (r) => new THREE.OctahedronGeometry(r, 0),
  12: (r) => new THREE.DodecahedronGeometry(r, 0),
  20: (r) => new THREE.IcosahedronGeometry(r, 0),
};

/** Builds a regular polyhedron with 4, 6, 8, 12, or 20 faces. */
export function buildRegularPolyhedron(faces: number, scale = 0.65): THREE.BufferGeometry {
  const factory = GENERATORS[faces];
  if (!factory) {
    throw new Error(
      `buildRegularPolyhedron: no regular polyhedron with ${faces} faces (valid: ${Object.keys(GENERATORS).join(", ")})`,
    );
  }
  return extractFlatNormals(factory(scale), 1);
}
