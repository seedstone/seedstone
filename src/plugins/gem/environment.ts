import * as THREE from "three";
import { hslToHex } from "../../core/index";
import type { GemConfig } from "./config";

function envSignature(cfg: GemConfig): string {
  const e = cfg.environment;
  return [
    cfg.lights.accent1Hue,
    cfg.lights.accent2HueOffset,
    cfg.gem.hue,
    e.domeRadius,
    e.domeSaturation,
    e.domeLightness,
    e.spotCount,
    e.spotOrbitRadius,
    e.spotSize,
    e.whiteSpotIntensity,
    e.tintSpotIntensity,
    e.tintSpotLightness,
    e.fillCount,
    e.fillRadius,
    e.fillSize,
    e.fillSaturation,
    e.fillLightness,
    e.fillHueStep,
    e.fillY,
    e.blurRadius,
  ].join(",");
}

export class Environment {
  private cfg: GemConfig["environment"];
  private pmrem: THREE.PMREMGenerator;
  private envScene: THREE.Scene;
  private target: THREE.WebGLRenderTarget | null = null;
  private signature = "";

  constructor(renderer: THREE.WebGLRenderer, cfg: GemConfig) {
    this.cfg = cfg.environment;
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.envScene = new THREE.Scene();
    this._build(cfg);
  }

  private _build(cfg: GemConfig): void {
    this._clearScene();
    this.cfg = cfg.environment;
    const env = cfg.environment;

    const accent1Hue = cfg.lights.accent1Hue;
    const accent2Hue = (accent1Hue + cfg.lights.accent2HueOffset) % 360;

    const domeMat = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      color: hslToHex(accent1Hue, env.domeSaturation, env.domeLightness),
    });
    this.envScene.add(new THREE.Mesh(new THREE.SphereGeometry(env.domeRadius, 32, 16), domeMat));

    // RGB > 1 reads as an HDR highlight after the PMREM bake.
    const w = env.whiteSpotIntensity;
    const whiteMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(w, w, w) });
    const tintMat = (hue: number) =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color()
          .setHSL(hue / 360, 1.0, env.tintSpotLightness)
          .multiplyScalar(env.tintSpotIntensity),
      });
    const spot1Mat = tintMat(accent1Hue);
    const spot2Mat = tintMat(accent2Hue);

    const spotGeo = new THREE.SphereGeometry(env.spotSize, 6, 6);
    for (let i = 0; i < env.spotCount; i++) {
      const theta = (i / env.spotCount) * Math.PI * 2;
      const phi = Math.PI * 0.25 + (i % 4) * (Math.PI * 0.12);
      const mat = i % 3 === 0 ? whiteMat : i % 3 === 1 ? spot1Mat : spot2Mat;
      const spot = new THREE.Mesh(spotGeo, mat);
      spot.position.set(
        env.spotOrbitRadius * Math.sin(phi) * Math.cos(theta),
        env.spotOrbitRadius * Math.cos(phi),
        env.spotOrbitRadius * Math.sin(phi) * Math.sin(theta),
      );
      this.envScene.add(spot);
    }

    const fillGeo = new THREE.SphereGeometry(env.fillSize, 8, 8);
    for (let i = 0; i < env.fillCount; i++) {
      const theta = (i / env.fillCount) * Math.PI * 2;
      const mat = new THREE.MeshBasicMaterial({
        color: hslToHex(
          (cfg.gem.hue + i * env.fillHueStep) % 360,
          env.fillSaturation,
          env.fillLightness,
        ),
      });
      const fill = new THREE.Mesh(fillGeo, mat);
      fill.position.set(
        env.fillRadius * Math.cos(theta),
        env.fillY,
        env.fillRadius * Math.sin(theta),
      );
      this.envScene.add(fill);
    }

    this.signature = envSignature(cfg);
  }

  private _clearScene(): void {
    for (const obj of this.envScene.children) {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose();
      (mesh.material as THREE.Material | undefined)?.dispose();
      this.envScene.remove(obj);
    }
  }

  private _bake(): THREE.Texture {
    const old = this.target;
    this.target = this.pmrem.fromScene(this.envScene, this.cfg.blurRadius);
    // Let in-flight frames release the old texture before disposal.
    if (old) requestAnimationFrame(() => requestAnimationFrame(() => old.dispose()));
    return this.target.texture;
  }

  render(): THREE.Texture {
    return this._bake();
  }

  update(cfg: GemConfig): THREE.Texture {
    if (envSignature(cfg) === this.signature) return this.target!.texture;
    this._build(cfg);
    return this._bake();
  }

  dispose(): void {
    this.target?.dispose();
    this.pmrem.dispose();
    this._clearScene();
  }
}
