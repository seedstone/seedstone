import * as THREE from "three";
import { mulberry32 } from "../../core/index.js";

export interface SparklesConfig {
  count: number;
  scatterSeed: number;
  size: number;
  radiusMin: number;
  radiusRange: number;
  baseOpacity: number;
  driftRate: number;
  pulseRate: number;
  pulseAmount: number;
}

function positionSignature(s: SparklesConfig): string {
  return [s.count, s.scatterSeed, s.radiusMin, s.radiusRange].join(",");
}

export class Sparkles {
  private cfg: SparklesConfig;
  private points: THREE.Points;
  private material: THREE.PointsMaterial;
  private positionSig: string;

  constructor(scene: THREE.Scene, cfg: SparklesConfig) {
    this.cfg = cfg;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", this._buildPositions(cfg));
    this.positionSig = positionSignature(cfg);

    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: cfg.size,
      transparent: true,
      opacity: cfg.baseOpacity,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(geometry, this.material);
    scene.add(this.points);
  }

  private _buildPositions(s: SparklesConfig): THREE.BufferAttribute {
    const positions = new THREE.BufferAttribute(new Float32Array(s.count * 3), 3);
    const rand = mulberry32(Math.floor(s.scatterSeed * 0xffffffff));
    for (let i = 0; i < s.count; i++) {
      const r = s.radiusMin + rand() * s.radiusRange;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      positions.setXYZ(
        i,
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
    }
    return positions;
  }

  update(cfg: SparklesConfig): void {
    const sig = positionSignature(cfg);
    if (sig !== this.positionSig) {
      this.points.geometry.setAttribute("position", this._buildPositions(cfg));
      this.positionSig = sig;
    }
    this.material.size = cfg.size;
    this.cfg = cfg;
  }

  animate(t: number): void {
    this.points.rotation.y = t * this.cfg.driftRate;
    this.material.opacity =
      this.cfg.baseOpacity + Math.sin(t * this.cfg.pulseRate) * this.cfg.pulseAmount;
  }

  dispose(): void {
    this.points.removeFromParent();
    this.points.geometry.dispose();
    this.material.dispose();
  }
}
