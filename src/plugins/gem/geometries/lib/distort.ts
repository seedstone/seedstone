import * as THREE from "three";
import { hash2D } from "../../../../core/random.js";

export const MAX_SCALE_JITTER = 0.85;

export const MAX_VERTEX_NOISE = 0.15;

function applyScale(geo: THREE.BufferGeometry, sx: number, sy: number, sz: number): void {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(i, pos.getX(i) * sx, pos.getY(i) * sy, pos.getZ(i) * sz);
  }
  pos.needsUpdate = true;
}

/** Applies the same displacement to vertices that share a position. */
function applyVertexNoise(geo: THREE.BufferGeometry, amplitude: number, seed: number): void {
  if (amplitude <= 0) return;
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const SNAP = 1e4;

  const groups = new Map<string, [number, number, number]>();

  for (let i = 0; i < pos.count; i++) {
    const key = `${Math.round(pos.getX(i) * SNAP)},${Math.round(pos.getY(i) * SNAP)},${Math.round(pos.getZ(i) * SNAP)}`;
    if (!groups.has(key)) {
      const gi = groups.size;
      let dx = hash2D(seed, gi * 3 + 0) - 0.5;
      let dy = hash2D(seed, gi * 3 + 1) - 0.5;
      let dz = hash2D(seed, gi * 3 + 2) - 0.5;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      groups.set(key, [(dx / len) * amplitude, (dy / len) * amplitude, (dz / len) * amplitude]);
    }
    const [dx, dy, dz] = groups.get(key)!;
    pos.setXYZ(i, pos.getX(i) + dx, pos.getY(i) + dy, pos.getZ(i) + dz);
  }
  pos.needsUpdate = true;
}

export interface Distortion {
  perfection: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  noiseSeed: number;
}

export function applyDistortions(geo: THREE.BufferGeometry, distortion: Distortion): void {
  const p = distortion.perfection;

  geo.computeBoundingBox();
  const origSize = new THREE.Vector3();
  geo.boundingBox!.getSize(origSize);

  // Preserve volume while scaling each axis independently.
  const sx0 = 1 + (distortion.scaleX - 0.5) * 2 * MAX_SCALE_JITTER * (1 - p);
  const sy0 = 1 + (distortion.scaleY - 0.5) * 2 * MAX_SCALE_JITTER * (1 - p);
  const sz0 = 1 + (distortion.scaleZ - 0.5) * 2 * MAX_SCALE_JITTER * (1 - p);
  const gm = Math.cbrt(sx0 * sy0 * sz0);
  applyScale(geo, sx0 / gm, sy0 / gm, sz0 / gm);

  applyVertexNoise(geo, MAX_VERTEX_NOISE * (1 - p), Math.floor(distortion.noiseSeed * 65536));

  // Keep the distorted geometry within its original bounds.
  geo.computeBoundingBox();
  const newSize = new THREE.Vector3();
  geo.boundingBox!.getSize(newSize);
  const fit = Math.min(
    newSize.x > 0 ? origSize.x / newSize.x : 1,
    newSize.y > 0 ? origSize.y / newSize.y : 1,
    newSize.z > 0 ? origSize.z / newSize.z : 1,
  );
  if (fit < 1) applyScale(geo, fit, fit, fit);

  geo.computeVertexNormals();
}
