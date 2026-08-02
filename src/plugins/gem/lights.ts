import * as THREE from "three";
import { hslToHex } from "../../core/index.js";
import type { GemConfig } from "./config.js";

type OrbitConfig = GemConfig["lights"]["orbits"][number];

interface OrbitingLight {
  light: THREE.PointLight;
  cfg: OrbitConfig;
  phase: number;
  speed: number;
}

export class Lights {
  private cfg: GemConfig["lights"];
  private ambient: THREE.AmbientLight;
  private orbits: OrbitingLight[];
  private rim: THREE.DirectionalLight;

  constructor(scene: THREE.Scene, cfg: GemConfig) {
    this.cfg = cfg.lights;
    const lights = cfg.lights;

    this.ambient = new THREE.AmbientLight(0xffffff, lights.ambientIntensity);
    scene.add(this.ambient);

    this.orbits = lights.orbits.map((orbitCfg) => {
      const light = new THREE.PointLight();
      light.position.set(orbitCfg.radius, orbitCfg.y, 0);
      scene.add(light);
      return {
        light,
        cfg: orbitCfg,
        phase: (orbitCfg.phaseDeg / 180) * Math.PI,
        speed: orbitCfg.speed * cfg.gem.speed,
      };
    });

    this.rim = new THREE.DirectionalLight();
    scene.add(this.rim);

    this._apply(cfg);
  }

  private _apply(cfg: GemConfig): void {
    this.cfg = cfg.lights;
    const lights = cfg.lights;

    this.ambient.intensity = lights.ambientIntensity;

    const accent1Hue = lights.accent1Hue;
    const accent2Hue = (accent1Hue + lights.accent2HueOffset) % 360;

    for (const orbit of this.orbits) {
      const hue =
        orbit.cfg.tint === "accent1"
          ? accent1Hue
          : orbit.cfg.tint === "accent2"
            ? accent2Hue
            : null;
      const color =
        hue !== null ? hslToHex(hue, lights.tintSaturation, lights.tintLightness) : orbit.cfg.color;
      orbit.light.color.set(color);
      orbit.light.intensity = orbit.cfg.intensity;
      orbit.light.distance = lights.pointLightRange;
      orbit.speed = orbit.cfg.speed * cfg.gem.speed;
    }

    this.rim.color.set(
      hslToHex(
        (cfg.gem.hue + lights.rim.hueOffset) % 360,
        lights.rim.saturation,
        lights.rim.lightness,
      ),
    );
    this.rim.intensity = lights.rim.intensity;
    this.rim.position.set(...lights.rim.position);
  }

  update(cfg: GemConfig): void {
    this._apply(cfg);
  }

  animate(t: number): void {
    for (const { light, cfg, phase, speed } of this.orbits) {
      light.position.set(
        cfg.radius * Math.cos(t * speed + phase),
        cfg.y + Math.sin(t * this.cfg.bobRate + phase) * this.cfg.bobAmount,
        cfg.radius * Math.sin(t * speed + phase),
      );
    }
  }

  dispose(): void {
    for (const { light } of this.orbits) {
      light.removeFromParent();
      light.dispose();
    }
    this.ambient.removeFromParent();
    this.ambient.dispose();
    this.rim.removeFromParent();
    this.rim.dispose();
    this.orbits.length = 0;
  }
}
