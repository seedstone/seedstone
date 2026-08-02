import * as THREE from "three";

export function flatNormalGeo(
  positions: number[],
  normals: number[],
  uvs: number[],
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  return geo;
}

export function pushTri(
  positions: number[],
  normals: number[],
  uvs: number[],
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  cx: number,
  cy: number,
  cz: number,
): void {
  const ux = bx - ax,
    uy = by - ay,
    uz = bz - az;
  const vx = cx - ax,
    vy = cy - ay,
    vz = cz - az;
  const len = Math.sqrt(
    (uy * vz - uz * vy) ** 2 + (uz * vx - ux * vz) ** 2 + (ux * vy - uy * vx) ** 2,
  );
  const nx = (uy * vz - uz * vy) / len;
  const ny = (uz * vx - ux * vz) / len;
  const nz = (ux * vy - uy * vx) / len;
  positions.push(ax, ay, az, bx, by, bz, cx, cy, cz);
  for (let i = 0; i < 3; i++) normals.push(nx, ny, nz);
  uvs.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5);
}

export function extractFlatNormals(geo: THREE.BufferGeometry, scale: number): THREE.BufferGeometry {
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const idx = geo.getIndex();
  const triCount = idx ? idx.count / 3 : pos.count / 3;
  const positions: number[] = [],
    normals: number[] = [],
    uvs: number[] = [];
  for (let i = 0; i < triCount; i++) {
    const ia = idx ? idx.getX(i * 3) : i * 3;
    const ib = idx ? idx.getX(i * 3 + 1) : i * 3 + 1;
    const ic = idx ? idx.getX(i * 3 + 2) : i * 3 + 2;
    pushTri(
      positions,
      normals,
      uvs,
      pos.getX(ia) * scale,
      pos.getY(ia) * scale,
      pos.getZ(ia) * scale,
      pos.getX(ib) * scale,
      pos.getY(ib) * scale,
      pos.getZ(ib) * scale,
      pos.getX(ic) * scale,
      pos.getY(ic) * scale,
      pos.getZ(ic) * scale,
    );
  }
  return flatNormalGeo(positions, normals, uvs);
}
