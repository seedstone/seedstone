import {
  constant,
  seeded,
  pick,
  derive,
  merge,
  type Config,
  type Override,
} from "../../core/index.js";
import { listCuts } from "./geometries/index.js";

type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Tint = "accent1" | "accent2" | null;

export const gemTraits = {
  renderer: {
    toneMappingExposure: seeded(0.5, 1),
    transmissionResolutionScale: 0.5,
    defaultSize: 400,
    maxPixelRatio: 2,
    maxFrameDelta: 0.1,
  },

  camera: {
    fov: constant(35),
    near: 0.1,
    far: 100,
    position: [0, 0.2, 2.4] as Vec3,
    lookAt: [0, -0.05, 0] as Vec3,
  },

  gem: {
    cut: pick(listCuts),
    hue: seeded(0, 360),
    saturation: seeded(0.55, 1),
    speed: seeded(0.6, 1.4),
    tilt: seeded(-0.2, 0.2),

    material: {
      ior: seeded(1.8, 2.8),
      iridescence: seeded(0.3, 1),
      transmission: constant(0.8),
      thickness: constant(0.5),
      iridescenceIOR: constant(1.67),
      iridescenceThicknessRange: [100, 800] as Vec2,
      attenuationDistance: constant(2),
      envMapIntensity: constant(3.1),
    },

    distortion: {
      perfection: seeded(0, 1),
      scaleX: seeded(0, 1),
      scaleY: seeded(0, 1),
      scaleZ: seeded(0, 1),
      noiseSeed: seeded(0, 1),
    },

    bodyLightness: constant(0.45),
    bodySaturationScale: constant(0.78),
    attenuationLightness: constant(0.29),
    wireframeOpacity: constant(0.3),
    spinRate: constant(0.25),
    wobbleRate: constant(1),
    wobbleAmount: constant(0.2),
  },

  environment: {
    domeRadius: 6,
    domeSaturation: constant(0.1),
    domeLightness: constant(0.314),
    spotCount: constant(16),
    spotOrbitRadius: 5.5,
    spotSize: constant(0.07),
    whiteSpotIntensity: constant(2.5),
    tintSpotIntensity: constant(1.8),
    tintSpotLightness: constant(0.9),
    fillCount: constant(4),
    fillRadius: 4,
    fillSize: 0.8,
    fillSaturation: constant(0.6),
    fillLightness: constant(0.18),
    fillHueStep: 90,
    fillY: -1,
    blurRadius: constant(0),
  },

  lights: {
    accent1Hue: seeded(0, 360),
    accent2HueOffset: constant(110),
    ambientIntensity: constant(0.2),
    pointLightRange: constant(6),
    orbits: [
      {
        color: 0xfff4e0,
        tint: null,
        intensity: 180,
        radius: 1.6,
        speed: 0.55,
        phaseDeg: 0,
        y: 1.0,
      },
      {
        color: 0xffffff,
        tint: "accent1" as Tint,
        intensity: 140,
        radius: 1.8,
        speed: -0.42,
        phaseDeg: 120,
        y: 0.3,
      },
      {
        color: 0xffffff,
        tint: "accent2" as Tint,
        intensity: 120,
        radius: 1.5,
        speed: 0.8,
        phaseDeg: 240,
        y: -0.2,
      },
      {
        color: 0xc8d8ff,
        tint: null,
        intensity: 80,
        radius: 2.0,
        speed: -0.3,
        phaseDeg: 180,
        y: 1.4,
      },
    ],
    tintSaturation: constant(1),
    tintLightness: seeded(0.1, 0.35),
    bobRate: constant(0.38),
    bobAmount: constant(0.35),
    rim: {
      intensity: constant(1.8),
      hueOffset: constant(160),
      saturation: constant(0.8),
      lightness: constant(0.55),
      position: [0.5, -1.5, -1.5] as Vec3,
    },
  },

  sparkles: {
    scatterSeed: seeded(0, 1),
    count: constant(120),
    size: constant(0.025),
    radiusMin: constant(0.9),
    radiusRange: constant(1.4),
    driftRate: constant(-0.03),
    baseOpacity: constant(0.45),
    pulseAmount: constant(0.15),
    pulseRate: constant(0.5),
  },
};

export type GemTraits = typeof gemTraits;
export type GemConfig = Config<GemTraits>;
export type GemOverrides = Override<GemTraits>;

export function resolveGem(seed: string, overrides?: GemOverrides): GemConfig {
  return derive(merge<GemTraits>(gemTraits, overrides), seed);
}

export default resolveGem;
