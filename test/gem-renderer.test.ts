import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface RendererState {
  options: unknown;
  domElement: { remove: ReturnType<typeof vi.fn> };
  setPixelRatio: ReturnType<typeof vi.fn>;
  setSize: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
  forceContextLoss: ReturnType<typeof vi.fn>;
}

interface LifecycleState {
  update?: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
}

const state = vi.hoisted(() => {
  const renderers: RendererState[] = [];
  const environments: LifecycleState[] = [];
  const meshes: LifecycleState[] = [];
  const lights: LifecycleState[] = [];
  const sparkles: LifecycleState[] = [];
  return { renderers, environments, meshes, lights, sparkles };
});

vi.mock("three", () => ({
  ACESFilmicToneMapping: "aces",
  Color: class Color {
    constructor(public value: unknown) {}
  },
  Scene: class Scene {
    environment: unknown;
    background: unknown;
  },
  PerspectiveCamera: class PerspectiveCamera {
    aspect = 1;
    fov: number;
    near: number;
    far: number;
    position = { set: vi.fn() };
    lookAt = vi.fn();
    updateProjectionMatrix = vi.fn();

    constructor(fov: number, aspect: number, near: number, far: number) {
      this.fov = fov;
      this.aspect = aspect;
      this.near = near;
      this.far = far;
    }
  },
  WebGLRenderer: class WebGLRenderer {
    domElement = { style: {}, remove: vi.fn() };
    shadowMap = { enabled: true };
    debug = { checkShaderErrors: true };
    setPixelRatio = vi.fn();
    setSize = vi.fn();
    compileAsync = vi.fn(() => Promise.resolve());
    render = vi.fn();
    dispose = vi.fn();
    forceContextLoss = vi.fn();
    toneMapping: unknown;
    toneMappingExposure = 0;
    transmissionResolutionScale = 0;

    constructor(public options: unknown) {
      state.renderers.push(this);
    }
  },
}));

vi.mock("../src/plugins/gem/environment.js", () => ({
  Environment: class Environment {
    render = vi.fn(() => ({ texture: "environment" }));
    update = vi.fn(() => ({ texture: "updated" }));
    dispose = vi.fn();
    constructor() {
      state.environments.push(this);
    }
  },
}));

vi.mock("../src/plugins/gem/mesh.js", () => ({
  GemMesh: class GemMesh {
    update = vi.fn();
    animate = vi.fn();
    dispose = vi.fn();
    constructor() {
      state.meshes.push(this);
    }
  },
}));

vi.mock("../src/plugins/gem/lights.js", () => ({
  Lights: class Lights {
    update = vi.fn();
    dispose = vi.fn();
    constructor() {
      state.lights.push(this);
    }
  },
}));

vi.mock("../src/plugins/gem/sparkles.js", () => ({
  Sparkles: class Sparkles {
    update = vi.fn();
    animate = vi.fn();
    dispose = vi.fn();
    constructor() {
      state.sparkles.push(this);
    }
  },
}));

import { gem } from "../src/plugins/gem/index.js";

describe("gem view lifecycle", () => {
  const rafCallbacks = new Map<number, FrameRequestCallback>();
  let rafId = 0;

  beforeEach(() => {
    for (const values of Object.values(state)) values.length = 0;
    rafCallbacks.clear();
    rafId = 0;
    vi.useFakeTimers();
    vi.stubGlobal("window", { devicePixelRatio: 2 });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      const id = ++rafId;
      rafCallbacks.set(id, callback);
      return id;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => rafCallbacks.delete(id));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("forwards gem options and exposes playback controls", async () => {
    const ready = vi.fn();
    const container = {
      clientWidth: 320,
      clientHeight: 240,
      appendChild: vi.fn(),
    } as unknown as HTMLElement;

    const view = gem.mount(container, "alice", {
      autoRotate: false,
      pixelRatio: 1.5,
      preserveDrawingBuffer: true,
      background: "#123456",
      onReady: ready,
    });
    await Promise.resolve();

    const renderer = state.renderers[0]!;
    expect(renderer.options).toMatchObject({ preserveDrawingBuffer: true, alpha: false });
    expect(renderer.setPixelRatio).toHaveBeenCalledWith(1.5);
    expect(renderer.setSize).toHaveBeenCalledWith(320, 240);
    expect(ready).toHaveBeenCalledOnce();
    expect(view.seed).toBe("alice");

    view.play();
    expect(rafCallbacks.size).toBe(1);
    view.pause();
    expect(rafCallbacks.size).toBe(0);
  });

  it("coalesces updates, resizes, and disposes owned resources", async () => {
    const container = {
      clientWidth: 400,
      clientHeight: 400,
      appendChild: vi.fn(),
    } as unknown as HTMLElement;
    const view = gem.mount(container, "alice", { autoRotate: false });
    await Promise.resolve();

    view.update("bob");
    view.update("charlie");
    view.setOverrides({ gem: { hue: 120 } });
    vi.runAllTimers();

    expect(view.seed).toBe("charlie");
    expect(view.config.gem.hue).toBe(120);
    expect(state.meshes[0]!.update).toHaveBeenCalledOnce();
    expect(state.environments[0]!.update).toHaveBeenCalledOnce();

    view.resize(640, 360);
    expect(state.renderers[0]!.setSize).toHaveBeenLastCalledWith(640, 360);

    view.destroy();
    expect(state.renderers[0]!.domElement.remove).toHaveBeenCalledOnce();
    expect(state.renderers[0]!.dispose).toHaveBeenCalledOnce();
    expect(state.environments[0]!.dispose).toHaveBeenCalledOnce();
    expect(state.meshes[0]!.dispose).toHaveBeenCalledOnce();
    expect(state.lights[0]!.dispose).toHaveBeenCalledOnce();
    expect(state.sparkles[0]!.dispose).toHaveBeenCalledOnce();

    const forceLoss = [...rafCallbacks.values()].at(-1)!;
    forceLoss(0);
    expect(state.renderers[0]!.forceContextLoss).toHaveBeenCalledOnce();
  });
});
