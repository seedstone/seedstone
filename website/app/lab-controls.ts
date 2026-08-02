import { gemTraits, isConstant, isPick, isSeeded, type Traits } from "seedstone";

export type LabSlider = { min: number; max: number };
export type LabOptions = string[];
export type LabControl = LabSlider | LabOptions;
export type LabControls = Record<string, LabControl>;

export function buildLabControls(
  traits: Traits,
  ranges: Record<string, LabSlider> = {},
): LabControls {
  const controls: LabControls = {};

  const walk = (node: unknown, path: string[]): void => {
    const dotted = path.join(".");
    if (isSeeded(node)) {
      controls[dotted] = ranges[dotted] ?? { min: node.min, max: node.max };
      return;
    }
    if (isConstant(node)) {
      if (typeof node.value === "number" && dotted in ranges) controls[dotted] = ranges[dotted]!;
      return;
    }
    if (isPick(node)) {
      controls[dotted] = node.options();
      return;
    }
    if (node && typeof node === "object" && !Array.isArray(node)) {
      for (const [key, child] of Object.entries(node)) walk(child, [...path, key]);
    }
  };

  walk(traits, []);
  return controls;
}

const ranges = {
  "camera.fov": { min: 10, max: 80 },

  "gem.material.transmission": { min: 0, max: 1 },
  "gem.material.thickness": { min: 0, max: 3 },
  "gem.material.iridescenceIOR": { min: 1, max: 2.33 },
  "gem.material.attenuationDistance": { min: 0.1, max: 8 },
  "gem.material.envMapIntensity": { min: 0, max: 12 },
  "gem.bodyLightness": { min: 0, max: 1 },
  "gem.bodySaturationScale": { min: 0, max: 1 },
  "gem.attenuationLightness": { min: 0, max: 1 },
  "gem.wireframeOpacity": { min: 0, max: 0.3 },
  "gem.spinRate": { min: 0, max: 2 },
  "gem.wobbleRate": { min: 0, max: 2 },
  "gem.wobbleAmount": { min: 0, max: 0.5 },

  "environment.domeSaturation": { min: 0, max: 1 },
  "environment.domeLightness": { min: 0, max: 0.5 },
  "environment.spotCount": { min: 0, max: 48 },
  "environment.spotSize": { min: 0.01, max: 0.3 },
  "environment.whiteSpotIntensity": { min: 0, max: 15 },
  "environment.tintSpotIntensity": { min: 0, max: 10 },
  "environment.tintSpotLightness": { min: 0, max: 1 },
  "environment.fillCount": { min: 0, max: 8 },
  "environment.fillSaturation": { min: 0, max: 1 },
  "environment.fillLightness": { min: 0, max: 0.6 },
  "environment.blurRadius": { min: 0, max: 1 },

  "lights.accent2HueOffset": { min: 0, max: 360 },
  "lights.ambientIntensity": { min: 0, max: 0.5 },
  "lights.pointLightRange": { min: 0, max: 12 },
  "lights.tintSaturation": { min: 0, max: 1 },
  "lights.bobRate": { min: 0, max: 2 },
  "lights.bobAmount": { min: 0, max: 1 },
  "lights.rim.intensity": { min: 0, max: 6 },
  "lights.rim.hueOffset": { min: 0, max: 360 },
  "lights.rim.saturation": { min: 0, max: 1 },
  "lights.rim.lightness": { min: 0, max: 1 },

  "sparkles.count": { min: 0, max: 500 },
  "sparkles.size": { min: 0, max: 0.1 },
  "sparkles.radiusMin": { min: 0.3, max: 2 },
  "sparkles.radiusRange": { min: 0, max: 3 },
  "sparkles.driftRate": { min: -0.3, max: 0.3 },
  "sparkles.baseOpacity": { min: 0, max: 1 },
  "sparkles.pulseAmount": { min: 0, max: 0.5 },
  "sparkles.pulseRate": { min: 0, max: 3 },
};

export const gemLabControls: LabControls = buildLabControls(gemTraits, ranges);
