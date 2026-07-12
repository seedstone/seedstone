<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from "vue";
import { create } from "seedstone";

const { active } = useActivePlugin();

const USE_CASES = [
{
seed: "collection://genesis",
title: "NFT Collections",
tag: "Generative Art",
desc: "Create unique NFT artwork and collectible gemstone identities from deterministic seeds. Perfect for on-chain collections and digital collectibles.",
},

{
seed: "agent://atlas",
title: "AI Agent Avatars",
tag: "AI Identity",
desc: "Give every AI agent a unique visual identity that remains consistent across dashboards, chats, workflows, and autonomous systems.",
},

{
seed: "0x71C7856E9D4a4C6A",
title: "Wallet Avatars",
tag: "Web3 Identity",
desc: "Turn crypto wallet addresses into instantly recognizable visual identities for Web3 apps, explorers, and blockchain products.",
},

{
seed: "@satoshi",
title: "Profiles & Usernames",
tag: "Digital Identity",
desc: "Generate unique avatars for usernames, accounts, and online profiles without uploading photos or creating custom artwork.",
},

{
seed: "Seedstone API",
title: "Apps & Developer Platforms",
tag: "API Integration",
desc: "Generate deterministic avatars and visual fingerprints for users, API keys, services, organizations, and digital resources.",
},

{
seed: "Argoman Studio",
title: "Communities & Brands",
tag: "Groups & Organizations",
desc: "Create recognizable visual identities for communities, DAOs, teams, companies, products, and online spaces.",
}
];


const thumbnails: Array<ReturnType<typeof create>> = [];
let io: IntersectionObserver | null = null;

function destroyThumbnails(): void {
  while (thumbnails.length) thumbnails.pop()?.destroy();
}

function setupObserver(): void {
  io?.disconnect();
  destroyThumbnails();
  // Build each thumbnail's gem only as it nears the viewport. These sit below
  // the fold, so this keeps their (synchronous) construction off the critical
  // first second, where it would otherwise starve the hero animation.
  io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLDivElement;
        io!.unobserve(el); // build once
        if (!el.isConnected) return;
        const s = el.clientWidth || 104;
        thumbnails.push(
          create(active.value.plugin, el, el.dataset.ucSeed!, {
            width: s,
            height: s,
            background: null,
            targetFPS: 24,
          }),
        );
      }),
    { rootMargin: "200px" }, // start building just before they scroll in
  );
  document.querySelectorAll<HTMLDivElement>("[data-uc-seed]").forEach((el) => io!.observe(el));
}

onMounted(() => {
  setupObserver();
});

watch(
  () => active.value.plugin.id,
  async () => {
    await nextTick();
    setupObserver();
  },
);

onBeforeUnmount(() => {
  io?.disconnect();
  destroyThumbnails();
});
</script>

<template>
  <section id="cases" class="section-cases reveal">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Popular use cases</span>

        <h2 class="sec-h2">
          One digital identity engine.
          <br />
          Endless use cases.
        </h2>

        <p class="sec-lede">
          Generate unique gemstone-inspired avatars, NFT artwork, wallet identities,
          AI agent profiles, and visual signatures from any string.
        </p>
      </div>

      <div class="uc-grid">
        <article v-for="useCase in USE_CASES" :key="useCase.seed" class="uc">
          <div class="ucg" :data-uc-seed="useCase.seed"></div>
          <span class="uc-tag">{{ useCase.tag }}</span>
          <h3>{{ useCase.title }}</h3>
          <p>{{ useCase.desc }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-cases {
  width: 100%;
  padding: 80px 0;
  position: relative;
  z-index: 1;
}

.sec-head {
  max-width: 42em;
  margin-bottom: 42px;
}
.sec-h2 {
  font-size: clamp(28px, 3.4vw, 40px);
  letter-spacing: -0.025em;
  font-weight: 600;
  line-height: 1.08;
  margin-top: 14px;
  color: var(--text);
}
.sec-lede {
  color: var(--text-2);
  font-size: 17px;
  margin-top: 14px;
  line-height: 1.6;
  max-width: 34em;
}

.uc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 860px) {
  .uc-grid {
    grid-template-columns: 1fr;
  }
}

.uc {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 24px;
  transition:
    border-color 0.25s,
    transform 0.25s;
  position: relative;
  overflow: hidden;
}
.uc:hover {
  border-color: var(--line-2);
  transform: translateY(-3px);
}

.ucg {
  width: 104px;
  height: 104px;
  margin-bottom: 6px;
  background: radial-gradient(circle at 50% 45%, oklch(0.42 0.13 290 / 0.4), transparent 68%);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}
.ucg :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
.ucg :deep(svg) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.uc h3 {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.015em;
  margin-top: 10px;
  color: var(--text);
}
.uc p {
  color: #9491a3;
  font-size: 14px;
  margin-top: 8px;
  line-height: 1.58;
}
.uc-tag {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 10.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--violet);
  margin-top: 14px;
  display: block;
}
</style>
