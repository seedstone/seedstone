import * as THREE from "three";
import { merge, derive, type CreateOptions, type View } from "../../core/index.js";
import { gemTraits, type GemTraits, type GemConfig, type GemOverrides } from "./config.js";
import { Environment } from "./environment.js";
import { GemMesh } from "./mesh.js";
import { Lights } from "./lights.js";
import { Sparkles } from "./sparkles.js";

export type { GemOverrides };

export interface GemOptions extends CreateOptions<GemOverrides> {
  autoRotate?: boolean;
  pixelRatio?: number;
  preserveDrawingBuffer?: boolean;
}

export interface GemView extends View<GemConfig, GemOverrides> {
  readonly seed: string;
  pause(): void;
  play(): void;
}

interface GemRendererOptions extends GemOptions {
  container: HTMLElement;
}

export class GemRenderer implements GemView {
  private traits: GemTraits;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private environment!: Environment;
  private gem!: GemMesh;
  private lights!: Lights;
  private sparkles!: Sparkles;

  private minFrameMs: number;
  private onReady?: () => void;
  private lastTick = 0;
  private elapsed = 0;
  private rebuildSeq = 0;
  private animFrameId: number | null = null;
  private destroyed = false;

  seed: string;
  config: GemConfig;

  constructor(seed: string, options: GemRendererOptions) {
    this.traits = merge<GemTraits>(gemTraits, options.overrides);
    this.seed = seed;
    this.config = derive(this.traits, seed);

    const container = options.container;
    if (!container) throw new Error("[seedstone] options.container is required.");

    const { renderer: rendererCfg } = this.config;
    const width = options.width ?? (container.clientWidth || rendererCfg.defaultSize);
    const height = options.height ?? (container.clientHeight || rendererCfg.defaultSize);
    const bg = options.background ?? null;
    this.minFrameMs = options.targetFPS ? 1000 / options.targetFPS : 0;
    this.onReady = options.onReady;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: bg === null,
      powerPreference: "high-performance",
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
    });
    this.renderer.setPixelRatio(
      options.pixelRatio ?? Math.min(window.devicePixelRatio, rendererCfg.maxPixelRatio),
    );
    this.renderer.setSize(width, height);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = false;
    // Avoid synchronous shader-error readback during compilation.
    this.renderer.debug.checkShaderErrors = false;
    this.renderer.domElement.style.display = "block";
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    if (bg !== null) this.scene.background = new THREE.Color(bg);

    const cameraCfg = this.config.camera;
    this.camera = new THREE.PerspectiveCamera(
      cameraCfg.fov,
      width / height,
      cameraCfg.near,
      cameraCfg.far,
    );

    this._applyRendererConfig();
    this._buildScene();
    this._start(options.autoRotate !== false);
  }

  // Compile before first paint to avoid a visible shader stall. Render even if
  // precompilation fails.
  private _start(autoRotate: boolean): void {
    const start = () => {
      if (this.destroyed) return;
      this._renderFrame();
      this.onReady?.();
      if (autoRotate) this._startLoop();
    };
    this.renderer.compileAsync(this.scene, this.camera).then(start, start);
  }

  private _applyRendererConfig(): void {
    const { renderer: rendererCfg, camera: cameraCfg } = this.config;
    this.renderer.toneMappingExposure = rendererCfg.toneMappingExposure;
    this.renderer.transmissionResolutionScale = rendererCfg.transmissionResolutionScale;
    this.camera.fov = cameraCfg.fov;
    this.camera.near = cameraCfg.near;
    this.camera.far = cameraCfg.far;
    this.camera.position.set(...cameraCfg.position);
    this.camera.lookAt(...cameraCfg.lookAt);
    this.camera.updateProjectionMatrix();
  }

  private _buildScene(): void {
    this.environment = new Environment(this.renderer, this.config);
    this.scene.environment = this.environment.render();
    this.gem = new GemMesh(this.scene, this.config.gem);
    this.lights = new Lights(this.scene, this.config);
    this.sparkles = new Sparkles(this.scene, this.config.sparkles);
  }

  private _disposeScene(): void {
    this.gem.dispose();
    this.lights.dispose();
    this.sparkles.dispose();
    this.environment.dispose();
  }

  private _scheduleApply(): void {
    const seq = ++this.rebuildSeq;
    const apply = () => {
      if (this.destroyed || seq !== this.rebuildSeq) return;
      this._applyRendererConfig();
      this.scene.environment = this.environment.update(this.config);
      this.gem.update(this.config.gem);
      this.lights.update(this.config);
      this.sparkles.update(this.config.sparkles);
      if (this.animFrameId === null) this._renderFrame();
    };
    setTimeout(apply, 0);
  }

  private _renderFrame(): void {
    this.gem.animate(this.elapsed);
    this.sparkles.animate(this.elapsed);
    this.renderer.render(this.scene, this.camera);
  }

  private _startLoop(): void {
    const tick = (now: number) => {
      if (this.destroyed) return;
      this.animFrameId = requestAnimationFrame(tick);

      if (this.minFrameMs > 0 && now - this.lastTick < this.minFrameMs) return;

      const dt =
        this.lastTick === 0
          ? 0
          : Math.min((now - this.lastTick) / 1000, this.config.renderer.maxFrameDelta);
      this.lastTick = now;
      this.elapsed += dt;
      this._renderFrame();
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  update(seed: string): void {
    if (this.destroyed) return;
    this.seed = seed;
    this.config = derive(this.traits, seed);
    this._scheduleApply();
  }

  setOverrides(overrides: GemOverrides = {}): void {
    if (this.destroyed) return;
    this.traits = merge<GemTraits>(gemTraits, overrides);
    this.config = derive(this.traits, this.seed);
    this._scheduleApply();
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.animFrameId === null && !this.destroyed) this._renderFrame();
  }

  pause(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
      this.lastTick = 0;
    }
  }

  play(): void {
    if (this.animFrameId === null && !this.destroyed) this._startLoop();
  }

  destroy(): void {
    this.destroyed = true;
    this.pause();
    this.renderer.domElement.remove();
    this._disposeScene();
    this.renderer.dispose();
    // Avoid a white frame while Chrome removes the canvas compositor layer.
    const renderer = this.renderer;
    requestAnimationFrame(() => renderer.forceContextLoss());
  }
}
