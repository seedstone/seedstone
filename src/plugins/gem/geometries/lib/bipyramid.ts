import * as THREE from "three";
import { flatNormalGeo, pushTri } from "./geometry";

/** Builds a bipyramid with an even number of triangular faces. */
export function buildBipyramid(N: number, scale = 0.65): THREE.BufferGeometry {
  if (N % 2 !== 0 || N < 6)
    throw new Error(`buildBipyramid: N must be an even number ≥ 6 (got ${N})`);

  const k = N / 2;
  const positions: number[] = [],
    normals: number[] = [],
    uvs: number[] = [];

  for (let i = 0; i < k; i++) {
    const a0 = (i / k) * Math.PI * 2;
    const a1 = ((i + 1) / k) * Math.PI * 2;
    const cx = scale * Math.cos(a0),
      cz = scale * Math.sin(a0);
    const dx = scale * Math.cos(a1),
      dz = scale * Math.sin(a1);
    pushTri(positions, normals, uvs, 0, scale, 0, dx, 0, dz, cx, 0, cz);
    pushTri(positions, normals, uvs, 0, -scale, 0, cx, 0, cz, dx, 0, dz);
  }

  return flatNormalGeo(positions, normals, uvs);
}
