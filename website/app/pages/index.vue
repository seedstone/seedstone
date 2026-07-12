<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue";

const { active } = useActivePlugin();
const activeNoun = computed(() => active.value.noun ?? active.value.plugin.name.toLowerCase());

useHead({
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap",
    },
  ],
});

useSeoMeta({
  title:
    "Seedstone | Generate Unique Digital Identities, Avatars & NFT Art from Any String",

  description:
    "Turn any text, wallet address, username, or AI agent into a unique gemstone-inspired visual identity. Create avatars, NFT collections, digital signatures, and generative art.",

  ogTitle:
    "Seedstone | Unique Digital Identities from Any String",

  ogDescription:
    "Generate gemstone-inspired avatars, NFT art, wallet identities, and AI agent visuals from any string.",

  twitterCard: "summary_large_image",

  twitterTitle:
    "Generate Unique Digital Identities from Any String",

  twitterDescription:
    "Create avatars, NFT art, digital signatures, and AI agent identities from any text."
});

let revealObs: IntersectionObserver | null = null;

onMounted(() => {
  revealObs = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          revealObs!.unobserve(e.target);
        }
      }),
    { threshold: 0.08, rootMargin: "0px 0px -48px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObs!.observe(el));
});

onBeforeUnmount(() => revealObs?.disconnect());
</script>

<template>
  <SiteNav />

  <main class="page">
    <HeroSection ref="hero" />

    <section id="usage" class="section reveal">
      <div class="section-hd">
        <div class="section-ey">Get started</div>
        <h2 class="section-h2">Two lines to a {{ activeNoun }}</h2>
      </div>
      <CodeSection />
    </section>

    <HowItWorks />

    <UseCases />
  </main>
</template>

<style scoped>
.page {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
