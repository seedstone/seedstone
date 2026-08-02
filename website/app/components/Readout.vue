<script setup lang="ts">
import { computed } from "vue";
import { fallbackSummary, type SitePlugin } from "~/plugins";

const props = defineProps<{
  entry: SitePlugin;
  config: unknown;
  seed: string;
}>();

const summary = computed(() =>
  props.entry.summarize
    ? props.entry.summarize(props.config, props.seed)
    : fallbackSummary(props.config, props.seed, props.entry.plugin),
);
</script>

<template>
  <aside class="readout">
    <div class="ro-h">
      <span class="ro-diamond"></span>
      Readout
    </div>

    <div class="ro-name">
      <span class="ro-nm">{{ summary.title }}</span>
      <span
        v-if="summary.swatch"
        class="ro-sw"
        :style="{ background: summary.swatch, boxShadow: `0 0 16px -2px ${summary.swatch}` }"
      ></span>
    </div>

    <div v-if="summary.subtitle" class="ro-subtitle">
      <span class="ro-k">Signature</span>
      <span class="ro-sv">{{ summary.subtitle }}</span>
    </div>

    <div v-for="s in summary.stats ?? []" :key="s.label" class="ro-stat">
      <span class="ro-k">{{ s.label }}</span>
      <template v-if="typeof s.pct === 'number'">
        <span class="ro-track"><i :style="{ width: s.pct + '%' }"></i></span>
        <span class="ro-val">{{ s.value }}</span>
      </template>
      <span v-else class="ro-tag">{{ s.value }}</span>
    </div>
  </aside>
</template>

<style scoped>
.readout {
  flex: 0 0 240px;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: oklch(0.085 0.012 285 / 0.74);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--line-2);
  border-radius: 18px;
  padding: 22px 18px;
  box-shadow:
    0 28px 70px -34px #000,
    0 0 70px -30px oklch(0.6 0.16 298 / 0.45);
  position: relative;
  z-index: 1;
}
@media (max-width: 640px) {
  .readout {
    flex: 0 0 auto;
    width: 100%;
    max-width: 320px;
    align-self: center;
  }
}

.ro-h {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--violet);
  margin-bottom: 16px;
}
.ro-diamond {
  width: 10px;
  height: 10px;
  transform: rotate(45deg);
  border-radius: 2px;
  background: var(--grad);
  box-shadow: 0 0 8px 0 oklch(0.7 0.16 300 / 0.65);
  flex-shrink: 0;
}

.ro-name {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.ro-nm {
  flex: 1;
  text-align: center;
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 12.5px;
  color: var(--text);
  background: oklch(0.12 0.02 285 / 0.6);
  border: 1px solid var(--line-2);
  border-radius: 9px;
  padding: 8px 6px;
  text-transform: lowercase;
  letter-spacing: 0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.ro-sw {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  flex-shrink: 0;
  transition:
    background 0.5s,
    box-shadow 0.5s;
}

.ro-subtitle {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
  padding: 2px 0 10px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 6px;
}
.ro-k {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9491a3;
}
.ro-sv {
  font-size: 12px;
  font-weight: 600;
  text-align: right;
  background: var(--grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.ro-stat {
  display: grid;
  grid-template-columns: 54px 1fr 44px;
  column-gap: 16px;
  align-items: center;
  padding: 5px 0;
}
.ro-track {
  height: 4px;
  border-radius: 3px;
  background: var(--panel-3);
  overflow: hidden;
}
.ro-track i {
  display: block;
  height: 100%;
  border-radius: 3px;
  width: 0;
  background: var(--grad);
  transition: width 0.8s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.ro-val {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 10px;
  color: var(--text);
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ro-tag {
  grid-column: 2 / -1;
  justify-self: end;
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 2px 7px;
  border-radius: 5px;
  border: 1px solid oklch(0.6 0.15 290 / 0.35);
  background: oklch(0.6 0.15 290 / 0.08);
  color: oklch(0.8 0.1 290);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
