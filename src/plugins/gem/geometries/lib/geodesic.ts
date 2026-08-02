import * as THREE from "three";
import { extractFlatNormals } from "./geometry.js";

/** Builds an icosahedron subdivided `detail` times. */
export function buildGeodesicSphere(detail: number, scale = 0.65): THREE.BufferGeometry {
  if (!Number.isInteger(detail) || detail < 0)
    throw new Error(`buildGeodesicSphere: detail must be a non-negative integer (got ${detail})`);
  return extractFlatNormals(new THREE.IcosahedronGeometry(scale, detail), 1);
}
