<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { DEFAULT_SAMPLE_SEEDS } from "~/plugins";

const route = useRoute();
const router = useRouter();
const { active } = useActivePlugin();

const inputValue = ref(typeof route.query.seed === "string" ? route.query.seed : "");
const config = ref<unknown>(null);
const inputFocused = ref(false);
const caseInsensitive = ref(true);
const copied = ref(false);

function share() {
  navigator.clipboard.writeText(window.location.href);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

const noun = computed(
  () => active.value?.noun ?? active.value?.plugin.name.toLowerCase() ?? "identity",
);
const lede = computed(
  () =>
    active.value?.lede ??
    `Type a username, wallet, company, or AI agent — Seedstone renders a unique ${noun.value} as its permanent visual identity.`,
);
const quickPicks = computed(() => active.value?.sampleSeeds ?? DEFAULT_SAMPLE_SEEDS);

const activeSeed = computed(() => {
  const raw = inputValue.value.trim() || "doadkjwfo";
  return caseInsensitive.value ? raw.toLowerCase() : raw;
});

watch(inputValue, (val) => {
  router.replace({ query: val.trim() ? { seed: val.trim() } : {} });
});

watch(
  () => active.value?.plugin.id,
  () => {
    config.value = null;
  },
);

function onInput() {}
function onQuickPick(val: string) {
  inputValue.value = val;
}

defineExpose({
  focusInput() {
    document.getElementById("forge-input")?.focus();
    document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
  },
});
</script>

<template>
  <header id="hero" class="hero">
    <div class="wrap">
      <div class="hero-grid">
        <!-- Left: copy + forge field -->
        <div class="hero-copy">
          <span class="eyebrow">
            Unique avatars, NFT art & digital identities
          </span>
          <h1 class="h1">
            Turn any string into its own
            <em>{{ noun }}</em>.
          </h1>

          <p class="lede">
            Transform any name, wallet address, AI agent, company, or piece of text into
            a unique gemstone-inspired visual identity.
            <strong>
              The same input always creates the exact same result.
            </strong>
          </p>

          <div class="forge">
            <div class="field" :class="{ focused: inputFocused }">
              <svg
                class="field-icon"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="11" y2="17" />
              </svg>
              <input
                id="forge-input"
                v-model="inputValue"
                type="text"
                placeholder="Enter a name, wallet, company, or agent…"
                autocomplete="off"
                spellcheck="false"
                @input="onInput"
                @keydown.enter="onInput"
                @focus="inputFocused = true"
                @blur="inputFocused = false"
              />
              <button
                class="case-toggle"
                :class="{ active: caseInsensitive }"
                :title="
                  caseInsensitive
                    ? 'Case-insensitive (click to make case-sensitive)'
                    : 'Case-sensitive (click to make case-insensitive)'
                "
                @click="caseInsensitive = !caseInsensitive"
                @mousedown.prevent
              >
                Aa
              </button>
              <button
                class="share-btn"
                :class="{ copied }"
                title="Copy link to this gem"
                @click="share"
                @mousedown.prevent
              >
                <svg
                  v-if="!copied"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                <svg
                  v-else
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            </div>

            <div class="examples">
              <span class="ex-lbl">Try</span>
              <button v-for="val in quickPicks" :key="val" class="chip" @click="onQuickPick(val)">
                {{ val }}
              </button>
            </div>
          </div>
        </div>

        <!-- Right: gem stage + genome panel -->
        <div class="hero-right">
          <div class="stage">
            <ClientOnly>
              <PluginStage
                v-if="active"
                :key="active.plugin.id"
                :seed="activeSeed"
                :plugin="active.plugin"
                @config="(c) => (config = c)"
              />
            </ClientOnly>
          </div>
          <Readout v-if="active" :entry="active" :config="config" :seed="activeSeed" />
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 108px 0 72px;
  position: relative;
  z-index: 1;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 56px;
  align-items: center;
}
@media (min-width: 960px) {
  .hero-grid {
    grid-template-columns: 1.05fr 1.1fr;
    gap: 60px;
  }
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.h1 {
  font-size: clamp(36px, 4.2vw, 54px);
  line-height: 1.13;
  letter-spacing: -0.03em;
  font-weight: 600;
  margin: 26px 0 0;
  color: var(--text);
}
.h1 em {
  font-family: "Instrument Serif", Georgia, serif;
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.01em;
  background: var(--grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.lede {
  font-size: 17px;
  line-height: 1.65;
  color: var(--text-2);
  margin: 26px 0 0;
  max-width: 28em;
}
.lede strong {
  color: var(--text);
  font-weight: 500;
}

.forge {
  margin-top: 38px;
}

.field {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--panel);
  border: 1px solid var(--line-2);
  border-radius: 13px;
  padding: 6px 14px;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
}
.field.focused {
  border-color: oklch(0.7 0.15 290 / 0.55);
  box-shadow: 0 0 0 4px oklch(0.7 0.15 290 / 0.09);
}
.field-icon {
  flex-shrink: 0;
  color: #67647a;
}

.field input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 14.5px;
  letter-spacing: -0.01em;
  min-width: 0;
  padding: 4px 0;
}
.field input::placeholder {
  color: #67647a;
}

.case-toggle {
  flex-shrink: 0;
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 3px 7px;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: transparent;
  color: #67647a;
  cursor: pointer;
  transition:
    color 0.18s,
    border-color 0.18s,
    background 0.18s;
  user-select: none;
}
.case-toggle.active {
  color: oklch(0.75 0.14 290);
  border-color: oklch(0.7 0.15 290 / 0.45);
  background: oklch(0.7 0.15 290 / 0.08);
}
.case-toggle:hover {
  border-color: var(--line-2);
  color: var(--text-2);
}
.case-toggle.active:hover {
  color: oklch(0.82 0.14 290);
  border-color: oklch(0.7 0.15 290 / 0.65);
}

.share-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: transparent;
  color: #67647a;
  cursor: pointer;
  transition:
    color 0.18s,
    border-color 0.18s,
    background 0.18s;
}
.share-btn:hover {
  border-color: var(--line-2);
  color: var(--text-2);
}
.share-btn.copied {
  color: oklch(0.75 0.14 150);
  border-color: oklch(0.7 0.15 150 / 0.45);
  background: oklch(0.7 0.15 150 / 0.08);
}

.examples {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin-top: 18px;
}
.ex-lbl {
  font-size: 12px;
  color: #67647a;
  margin-right: 2px;
}
.chip {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 12px;
  color: var(--text-2);
  cursor: pointer;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: oklch(0.1 0.01 280 / 0.5);
  transition: all 0.18s;
}
.chip:hover {
  border-color: var(--line-2);
  color: #fff;
  background: var(--panel-2);
  transform: translateY(-1px);
}

.hero-right {
  display: flex;
  align-items: center;
  gap: 28px;
}
@media (max-width: 640px) {
  .hero-right {
    flex-direction: column;
  }
}

.stage {
  flex: 1;
  min-width: 220px;
  position: relative;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stage::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 46%,
    oklch(0.6 0.16 290 / 0.38),
    oklch(0.5 0.14 265 / 0.12) 46%,
    transparent 70%
  );
  filter: blur(8px);
  z-index: 0;
  pointer-events: none;
}
.stage :deep(.stage-wrap) {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}
.stage :deep(.stage-wrap::before) {
  display: none;
}
.stage :deep(.stage-container) {
  border-radius: 0;
  overflow: visible;
}
</style>
