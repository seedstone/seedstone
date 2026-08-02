import * as THREE from "three";
import { buildGeometry } from "./geometries/index.js";
import { applyDistortions } from "./geometries/lib/distort.js";
import type { GemConfig } from "./config.js";

type GemPart = GemConfig["gem"];

function geometrySignature(gem: GemPart): string {
  const d = gem.distortion;
  return [gem.cut, d.perfection, d.scaleX, d.scaleY, d.scaleZ, d.noiseSeed].join(",");
}

export class GemMesh {
  private cfg: GemPart;
  private mesh: THREE.Mesh;
  private wireframe: THREE.Mesh;
  private material: THREE.MeshPhysicalMaterial;
  private geometrySig: string;

  constructor(scene: THREE.Scene, gem: GemPart) {
    this.cfg = gem;

    const geometry = this._buildGeometry(gem);
    this.geometrySig = geometrySignature(gem);

    this.material = new THREE.MeshPhysicalMaterial({
      ...gem.material,
      metalness: 0.0,
      roughness: 0.0,
      transparent: true,
      side: THREE.DoubleSide,
    });
    this._applyMaterial(gem);

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.rotation.z = gem.tilt;

    this.wireframe = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: gem.wireframeOpacity,
      }),
    );
    this.mesh.add(this.wireframe);
    scene.add(this.mesh);
  }

  private _buildGeometry(gem: GemPart): THREE.BufferGeometry {
    const geometry = buildGeometry(gem.cut);
    applyDistortions(geometry, gem.distortion);
    return geometry;
  }

  private _applyMaterial(gem: GemPart): void {
    Object.assign(this.material, gem.material);
    this.material.color.setHSL(
      gem.hue / 360,
      gem.saturation * gem.bodySaturationScale,
      gem.bodyLightness,
    );
    this.material.attenuationColor.setHSL(gem.hue / 360, 1.0, gem.attenuationLightness);
  }

  update(gem: GemPart): void {
    const sig = geometrySignature(gem);
    if (sig !== this.geometrySig) {
      const geometry = this._buildGeometry(gem);
      const old = this.mesh.geometry;
      this.mesh.geometry = geometry;
      this.wireframe.geometry = geometry;
      old.dispose();
      this.geometrySig = sig;
    }

    this._applyMaterial(gem);
    (this.wireframe.material as THREE.MeshBasicMaterial).opacity = gem.wireframeOpacity;
    this.mesh.rotation.z = gem.tilt;
    this.cfg = gem;
  }

  animate(t: number): void {
    this.mesh.rotation.y = t * this.cfg.speed * this.cfg.spinRate;
    this.mesh.rotation.x =
      Math.sin(t * this.cfg.wobbleRate) * this.cfg.wobbleAmount + this.cfg.tilt;
  }

  dispose(): void {
    this.mesh.removeFromParent();
    this.mesh.geometry.dispose();
    this.material.dispose();
    (this.wireframe.material as THREE.Material).dispose();
  }
}
