<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, useTemplateRef } from "vue";
import { create, type View } from "seedstone";
import { useLabState } from "~/composables/useLabState";

useSeoMeta({ title: "Seedstone — Labs", robots: "noindex" });

const containerRef = useTemplateRef<HTMLDivElement>("container");
const { active } = useActivePlugin();
const {
  sections,
  values,
  modes,
  changed,
  overrides,
  overridesCode,
  build,
  toggleMode,
  isParamDirty,
  resetAll,
  labelFor,
} = useLabState();

const seed = ref("");
const copied = ref(false);
const loaded = ref(false);

let mounted: View | null = null;
let ro: ResizeObserver | null = null;
let applyTimer: ReturnType<typeof setTimeout> | undefined;

watch(overrides, (val) => {
  clearTimeout(applyTimer);
  applyTimer = setTimeout(() => mounted?.setOverrides(val), 120);
});

function init(): void {
  if (!containerRef.value) return;
  loaded.value = false;
  clearTimeout(applyTimer);
  mounted?.destroy();
  containerRef.value.innerHTML = "";
  build(active.value);
  loaded.value = true;
  const s = containerRef.value.clientWidth || 420;
  mounted = create(active.value.plugin, containerRef.value, seed.value.trim() || "seedstone", {
    width: s,
    height: s,
    background: null,
  });
}

function onSeedInput(): void {
  mounted?.update(seed.value.trim() || "seedstone");
}

async function copyCode(): Promise<void> {
  await navigator.clipboard.writeText(overridesCode.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
}

onMounted(() => {
  init();
  ro = new ResizeObserver(() => {
    const s = containerRef.value?.clientWidth;
    if (mounted?.resize && s) mounted.resize(s, s);
  });
  ro.observe(containerRef.value!);
});

watch(
  () => active.value.plugin.id,
  () => init(),
);

onBeforeUnmount(() => {
  clearTimeout(applyTimer);
  mounted?.destroy();
  ro?.disconnect();
});
</script>

<template>
  <SiteNav />
  <div class="config-page">
    <div class="layout">
      <aside class="preview">
        <div ref="container" class="plugin-box" />
        <input
          v-model="seed"
          class="seed-input"
          placeholder="seedstone"
          autocomplete="off"
          spellcheck="false"
          @input="onSeedInput"
        />
        <div class="actions">
          <button class="btn ghost" :disabled="!changed.length" @click="resetAll">Reset</button>
          <button class="btn" :disabled="!changed.length" @click="copyCode">
            {{
              copied
                ? "Copied ✓"
                : `Copy ${changed.length} override${changed.length === 1 ? "" : "s"}`
            }}
          </button>
        </div>
        <pre v-if="changed.length" class="diff">{{ overridesCode }}</pre>
        <p v-else class="diff-empty">Move a slider — changed values show up here.</p>
      </aside>

      <main v-if="loaded" class="params">
        <section v-for="section in sections" :key="section.title" class="group">
          <h2>{{ section.title }}</h2>
          <div
            v-for="param in section.params"
            :key="param.path"
            class="param"
            :class="{ dirty: isParamDirty(param) }"
          >
            <template v-if="param.kind === 'pick'">
              <label :for="param.path" :title="param.path">{{ labelFor(param.path) }}</label>
              <select :id="param.path" v-model="values[param.path]" class="pick-select">
                <option value="">seed-driven</option>
                <option v-for="opt in param.options" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </template>

            <template v-else>
              <label :for="param.path" :title="param.path">
                <span class="param-name">{{ labelFor(param.path) }}</span>
                <button
                  class="mode-toggle"
                  :class="modes[param.path]"
                  :title="
                    modes[param.path] === 'seeded'
                      ? 'seed-driven — click to pin'
                      : 'pinned — click to release'
                  "
                  @click.prevent="toggleMode(param.path)"
                >
                  {{ modes[param.path] === "seeded" ? "seeded" : "pin" }}
                </button>
              </label>
              <template v-if="modes[param.path] === 'constant'">
                <input
                  :id="param.path"
                  v-model.number="values[param.path]"
                  type="range"
                  :min="param.min"
                  :max="param.max"
                  :step="param.step"
                />
                <input
                  v-model.number="values[param.path]"
                  type="number"
                  :min="param.min"
                  :max="param.max"
                  :step="param.step"
                />
              </template>
              <span v-else class="seeded-range">{{ param.min }} – {{ param.max }}</span>
            </template>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.config-page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 88px 24px 80px;
}

.layout {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
@media (min-width: 900px) {
  .layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    align-items: start;
  }
  .preview {
    position: sticky;
    top: 24px;
  }
}

.preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plugin-box {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.25);
}
.plugin-box :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}
.plugin-box :deep(svg) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.seed-input {
  flex: 1;
  min-width: 0;
  padding: 9px 13px;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  font-size: 0.9rem;
  outline: none;
}
.seed-input:focus {
  border-color: rgba(167, 139, 250, 0.6);
}

.btn {
  padding: 9px 16px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  color: #fff;
  white-space: nowrap;
}
.btn:hover:not(:disabled) {
  opacity: 0.88;
}
.btn:disabled {
  opacity: 0.35;
  cursor: default;
}
.btn.ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
}

.actions {
  display: flex;
  gap: 8px;
}
.actions .btn {
  flex: 1;
}

.diff {
  margin: 0;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.35);
  font-family: "Consolas", "SF Mono", monospace;
  font-size: 0.72rem;
  line-height: 1.55;
  color: #a5e8c8;
  max-height: 320px;
  overflow: auto;
  white-space: pre;
}
.diff-empty {
  margin: 0;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.25);
}

.params {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.group {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 20px;
}
.group h2 {
  margin: 0 0 14px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--muted);
}

.param {
  display: grid;
  grid-template-columns: 170px 1fr 86px;
  align-items: center;
  gap: 12px;
  padding: 3px 0;
}
.param label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
  overflow: hidden;
}
.param.dirty label {
  color: var(--accent);
}

.param-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mode-toggle {
  flex-shrink: 0;
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  line-height: 1.5;
  transition: opacity 0.1s;
}
.mode-toggle.seeded {
  background: rgba(167, 139, 250, 0.15);
  border-color: rgba(167, 139, 250, 0.35);
  color: #a78bfa;
}
.mode-toggle.constant {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
}
.mode-toggle:hover {
  opacity: 0.75;
}

.param input[type="range"] {
  width: 100%;
  accent-color: #a78bfa;
}
.param input[type="number"] {
  width: 100%;
  box-sizing: border-box;
  padding: 5px 8px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  font-size: 0.76rem;
  font-family: "Consolas", "SF Mono", monospace;
  outline: none;
}
.param input[type="number"]:focus {
  border-color: rgba(167, 139, 250, 0.6);
}

.seeded-range {
  grid-column: 2 / -1;
  font-size: 0.74rem;
  font-family: "Consolas", "SF Mono", monospace;
  color: rgba(255, 255, 255, 0.28);
}

.pick-select {
  grid-column: 2 / -1;
  padding: 5px 8px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  font-size: 0.76rem;
  font-family: "Consolas", "SF Mono", monospace;
  outline: none;
  cursor: pointer;
  appearance: auto;
}
.pick-select:focus {
  border-color: rgba(167, 139, 250, 0.6);
}
.param.dirty .pick-select {
  border-color: rgba(167, 139, 250, 0.4);
}

@media (max-width: 560px) {
  .param {
    grid-template-columns: 1fr 80px;
  }
  .param label {
    grid-column: 1 / -1;
  }
}
</style>
