<script setup lang="ts">
import { onMounted, onBeforeUnmount, useTemplateRef } from "vue";

const STAR_COUNT = 220;
const STAR_RADIUS_MIN = 0.4;
const STAR_RADIUS_RANGE = 1.3;
const STAR_OPACITY_MIN = 0.1;
const STAR_OPACITY_RANGE = 0.7;
const STAR_SPEED_MIN = 0.0002;
const STAR_SPEED_RANGE = 0.0006;
const STAR_TIME_STEP = 0.012;
const STAR_BLINK_SCALE = 300;

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  speed: number;
  phase: number;
}

const canvasRef = useTemplateRef<HTMLCanvasElement>("canvas");
let rafId = 0;

onMounted(() => {
  const canvas = canvasRef.value!;
  const ctx = canvas.getContext("2d")!;
  let W = 0,
    H = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: STAR_RADIUS_MIN + Math.random() * STAR_RADIUS_RANGE,
    o: STAR_OPACITY_MIN + Math.random() * STAR_OPACITY_RANGE,
    speed: STAR_SPEED_MIN + Math.random() * STAR_SPEED_RANGE,
    phase: Math.random() * Math.PI * 2,
  }));

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += STAR_TIME_STEP;
    for (const s of stars) {
      const blink = s.o * (0.5 + 0.5 * Math.sin(t * s.speed * STAR_BLINK_SCALE + s.phase));
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${blink.toFixed(3)})`;
      ctx.fill();
    }
    rafId = requestAnimationFrame(draw);
  }
  draw();

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
  });
});
</script>

<template>
  <canvas ref="canvas" class="stars-bg" />
</template>

<style scoped>
.stars-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
