import * as THREE from "three";
import { flatNormalGeo, pushTri } from "./geometry.js";

/** Builds an n-antiprism with 4n-4 triangular faces. */
export function buildAntiprism(n: number, scale = 0.65): THREE.BufferGeometry {
  if (n < 3) throw new Error(`buildAntiprism: n must be ≥ 3 (got ${n})`);

  const r = scale * 0.84;
  const h = scale * 0.48;

  const top: [number, number, number][] = [];
  const bot: [number, number, number][] = [];
  for (let k = 0; k < n; k++) {
    const at = (k / n) * Math.PI * 2;
    const ab = at + Math.PI / n;
    top.push([r * Math.cos(at), h, r * Math.sin(at)]);
    bot.push([r * Math.cos(ab), -h, r * Math.sin(ab)]);
  }

  const positions: number[] = [],
    normals: number[] = [],
    uvs: number[] = [];

  // Reverse the top winding for outward normals.
  for (let k = 1; k < n - 1; k++) {
    pushTri(
      positions,
      normals,
      uvs,
      top[0][0],
      top[0][1],
      top[0][2],
      top[k + 1][0],
      top[k + 1][1],
      top[k + 1][2],
      top[k][0],
      top[k][1],
      top[k][2],
    );
  }

  // Reverse the bottom winding for outward normals.
  for (let k = 1; k < n - 1; k++) {
    pushTri(
      positions,
      normals,
      uvs,
      bot[0][0],
      bot[0][1],
      bot[0][2],
      bot[k][0],
      bot[k][1],
      bot[k][2],
      bot[k + 1][0],
      bot[k + 1][1],
      bot[k + 1][2],
    );
  }

  for (let k = 0; k < n; k++) {
    const kn = (k + 1) % n;
    pushTri(
      positions,
      normals,
      uvs,
      top[k][0],
      top[k][1],
      top[k][2],
      top[kn][0],
      top[kn][1],
      top[kn][2],
      bot[k][0],
      bot[k][1],
      bot[k][2],
    );
    pushTri(
      positions,
      normals,
      uvs,
      top[kn][0],
      top[kn][1],
      top[kn][2],
      bot[kn][0],
      bot[kn][1],
      bot[kn][2],
      bot[k][0],
      bot[k][1],
      bot[k][2],
    );
  }

  return flatNormalGeo(positions, normals, uvs);
}
