<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import { create, type View, type Plugin } from "seedstone";

const props = defineProps<{
  seed: string;
  plugin: Plugin;
  overrides?: object;
  targetFPS?: number;
}>();

const emit = defineEmits<{ config: [config: unknown] }>();

const containerRef = useTemplateRef<HTMLDivElement>("container");
const loading = ref(true);

let instance: View | null = null;
let ro: ResizeObserver | null = null;
let mountId = 0;

function size(): number {
  return containerRef.value?.clientWidth || 420;
}

function emitConfig(): void {
  if (instance) emit("config", instance.config);
}

function destroy(): void {
  instance?.destroy();
  instance = null;
}

function mount(): void {
  const container = containerRef.value;
  if (!container) return;
  const id = ++mountId;
  destroy();
  loading.value = true;
  const s = size();
  instance = create(props.plugin, container, props.seed, {
    width: s,
    height: s,
    background: null,
    targetFPS: props.targetFPS,
    overrides: props.overrides,
    onReady: () => {
      if (id !== mountId) return;
      loading.value = false;
      emitConfig();
    },
  });
  emitConfig();
}

onMounted(async () => {
  await nextTick();
  mount();
  ro = new ResizeObserver(() => {
    if (!instance?.resize) return;
    const s = size();
    instance.resize(s, s);
  });
  if (containerRef.value) ro.observe(containerRef.value);
});

watch(
  () => props.plugin.id,
  () => mount(),
);

watch(
  () => props.seed,
  (seed) => {
    instance?.update(seed);
    emitConfig();
  },
);

watch(
  () => props.overrides,
  (overrides) => {
    instance?.setOverrides(overrides ?? {});
    emitConfig();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  ++mountId;
  destroy();
  ro?.disconnect();
});
</script>

<template>
  <ClientOnly>
    <div class="stage-wrap">
      <div ref="container" class="stage-container">
        <div v-if="loading" class="spinner" />
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
.stage-wrap {
  position: relative;
  width: min(420px, 90vw);
  height: min(420px, 90vw);
}

.stage-wrap::before {
  content: "";
  position: absolute;
  inset: -30px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(167, 139, 250, 0.18) 0%, transparent 70%);
  animation: pulse 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.06);
  }
}

.stage-container {
  width: 100%;
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  display: grid;
  place-items: center;
}
.stage-container :deep(canvas),
.stage-container :deep(svg) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.spinner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 5;
}
.spinner::after {
  content: "";
  width: 36px;
  height: 36px;
  border: 3px solid rgba(167, 139, 250, 0.25);
  border-top-color: #ce93d8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
