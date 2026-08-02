<script setup lang="ts">
import { computed, ref, watch } from "vue";

const copiedInstall = ref(false);
const copiedUsage = ref(false);
const usageHtml = ref<string | null>(null);
const { active } = useActivePlugin();

const installCmd = "npm install seedstone";

const usageCode = computed(() => {
  const name = active.value.importName ?? "plugin";
  return `import { create, ${name} } from 'seedstone';

const view = create(${name}, '#avatar', 'alice');`;
});

async function highlightUsage(): Promise<void> {
  const { codeToHtml } = await import("shiki");
  usageHtml.value = await codeToHtml(usageCode.value, {
    lang: "javascript",
    theme: "one-dark-pro",
  });
}

watch(usageCode, () => highlightUsage(), { immediate: true });

async function copyInstall() {
  await navigator.clipboard.writeText(installCmd);
  copiedInstall.value = true;
  setTimeout(() => {
    copiedInstall.value = false;
  }, 1500);
}

async function copyUsage() {
  await navigator.clipboard.writeText(usageCode.value);
  copiedUsage.value = true;
  setTimeout(() => {
    copiedUsage.value = false;
  }, 1500);
}
</script>

<template>
  <div class="code-section">
    <div class="card">
      <span class="card-label">install</span>
      <div class="code-wrap">
        <pre class="install-block"><span class="prompt">$</span> {{ installCmd }}</pre>
        <button
          class="copy-btn"
          :class="{ done: copiedInstall }"
          :aria-label="copiedInstall ? 'Copied' : 'Copy'"
          @click="copyInstall"
        >
          <svg
            v-if="!copiedInstall"
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="card">
      <span class="card-label">usage</span>
      <div class="code-wrap">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="usageHtml" class="shiki-wrap" v-html="usageHtml" />
        <pre v-else class="install-block plain">{{ usageCode }}</pre>
        <button
          class="copy-btn"
          :class="{ done: copiedUsage }"
          :aria-label="copiedUsage ? 'Copied' : 'Copy'"
          @click="copyUsage"
        >
          <svg
            v-if="!copiedUsage"
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.code-section {
  width: 100%;
  max-width: 860px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 640px) {
  .code-section {
    grid-template-columns: 1fr;
  }
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.card-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.code-wrap {
  position: relative;
}

.install-block {
  font-family: "Consolas", "SF Mono", monospace;
  font-size: 0.8rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.82);
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 11px 42px 11px 15px;
  white-space: pre;
  overflow-x: auto;
  margin: 0;
}

.install-block.plain {
  color: rgba(255, 255, 255, 0.55);
}

.prompt {
  color: var(--accent);
  user-select: none;
  margin-right: 8px;
}

.shiki-wrap :deep(pre.shiki) {
  font-family: "Consolas", "SF Mono", monospace;
  font-size: 0.8rem;
  line-height: 1.6;
  background: rgba(0, 0, 0, 0.28) !important;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 11px 42px 11px 15px;
  overflow-x: auto;
  margin: 0;
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
}
.copy-btn:hover {
  background: rgba(255, 255, 255, 0.11);
  color: rgba(255, 255, 255, 0.75);
  border-color: rgba(255, 255, 255, 0.18);
}
.copy-btn.done {
  color: #86efac;
  border-color: rgba(134, 239, 172, 0.3);
  background: rgba(134, 239, 172, 0.07);
}
</style>
