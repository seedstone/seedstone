<script setup lang="ts">
import { navigateTo } from "#app";
import { ref, onMounted, onBeforeUnmount } from "vue";

const scrolled = ref(false);
const { sitePlugins, activeId, setActive } = useActivePlugin();
const route = useRoute();

function onScroll() {
  scrolled.value = window.scrollY > 20;
}
onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }));
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));

function scrollTo(id: string, e: MouseEvent) {
  e.preventDefault();
  if (route.path === "/") {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  } else {
    navigateTo(`/#${id}`);
  }
}
</script>

<template>
  <nav :class="['site-nav', { scrolled }]">
    <div class="nav-in">
      <a class="brand" href="/#hero" @click="scrollTo('hero', $event)">
        <svg class="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="gm" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#d8c9ff" />
              <stop offset="1" stop-color="#8e9bff" />
            </linearGradient>
          </defs>
          <path
            d="M16 3 27.3 9.5 27.3 22.5 16 29 4.7 22.5 4.7 9.5Z"
            fill="oklch(0.16 0.04 285 / .5)"
            stroke="url(#gm)"
            stroke-width="1.4"
            stroke-linejoin="round"
          />
          <path
            d="M16 16 16 3M16 16 27.3 9.5M16 16 27.3 22.5M16 16 16 29M16 16 4.7 22.5M16 16 4.7 9.5"
            stroke="url(#gm)"
            stroke-width="0.85"
            opacity="0.55"
          />
          <path d="M16 16 27.3 9.5 16 3Z" fill="url(#gm)" opacity="0.16" />
          <path d="M16 16 4.7 22.5 16 29Z" fill="url(#gm)" opacity="0.10" />
          <circle cx="16" cy="16" r="2.7" fill="url(#gm)" />
          <circle cx="16" cy="16" r="2.7" fill="#fff" opacity="0.35" />
        </svg>
        <span>Seedstone</span>
      </a>

      <div class="nav-links">
        <a href="#usage" @click="scrollTo('usage', $event)">Usage</a>
        <a href="#how" @click="scrollTo('how', $event)">How it works</a>
        <a href="#cases" @click="scrollTo('cases', $event)">Use cases</a>
      </div>

      <div class="nav-cta">
        <label class="plugin-picker">
          <select :value="activeId" @change="setActive(($event.target as HTMLSelectElement).value)">
            <option v-for="entry in sitePlugins" :key="entry.plugin.id" :value="entry.plugin.id">
              {{ entry.plugin.name }}
            </option>
          </select>
        </label>
        <a
          href="https://github.com/titangmz/seedstone"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-icon-btn"
          aria-label="GitHub"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z"
            />
          </svg>
        </a>
        <button class="nav-primary" @click="navigateTo('/lab')">Trait Lab</button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.site-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(18px) saturate(1.3);
  background: oklch(0.06 0.01 280 / 0.55);
  border-bottom: 1px solid transparent;
  transition:
    border-color 0.3s,
    background 0.3s;
}
.site-nav.scrolled {
  background: oklch(0.055 0.01 280 / 0.82);
  border-bottom-color: var(--line);
}

.nav-in {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 13px 28px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15.5px;
  letter-spacing: -0.015em;
  color: var(--text);
  justify-self: start;
}
.brand-mark {
  width: 26px;
  height: 26px;
  display: block;
}

.nav-links {
  display: flex;
  gap: 26px;
  justify-content: center;
}
.nav-links a {
  font-size: 14px;
  color: #9491a3;
  text-decoration: none;
  transition: color 0.2s;
  white-space: nowrap;
}
.nav-links a:hover {
  color: var(--text);
}

.nav-cta {
  display: flex;
  align-items: center;
  gap: 9px;
  justify-self: end;
}

.plugin-picker {
  position: relative;
  display: flex;
  align-items: center;
}
.plugin-picker::after {
  content: "";
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #9491a3;
  pointer-events: none;
}
.plugin-picker select {
  height: 34px;
  padding: 0 30px 0 11px;
  border-radius: 9px;
  border: 1px solid var(--line-2);
  background: oklch(0.1 0.01 280 / 0.5);
  color: var(--text);
  font: inherit;
  font-size: 13px;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}
.plugin-picker select:focus {
  border-color: oklch(0.7 0.15 290 / 0.55);
}
.plugin-picker select:focus + .plugin-picker::after,
.plugin-picker:focus-within::after {
  border-top-color: oklch(0.75 0.15 290);
}

.nav-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  color: #9491a3;
  border: 1px solid var(--line-2);
  background: oklch(0.1 0.01 280 / 0.5);
  text-decoration: none;
  transition:
    color 0.18s,
    background 0.18s,
    border-color 0.18s;
}
.nav-icon-btn:hover {
  color: #fff;
  background: var(--panel-2);
  border-color: oklch(0.7 0.15 290 / 0.45);
}

.nav-primary {
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 9px 17px;
  border-radius: 9px;
  border: none;
  background: var(--grad);
  color: #0a0712;
  white-space: nowrap;
  box-shadow:
    0 1px 0 oklch(0.85 0.1 290 / 0.5) inset,
    0 8px 28px -10px oklch(0.7 0.15 285 / 0.65);
  transition:
    transform 0.15s,
    box-shadow 0.25s;
}
.nav-primary:hover {
  transform: translateY(-1px);
  box-shadow:
    0 1px 0 oklch(0.9 0.1 290 / 0.6) inset,
    0 14px 38px -12px oklch(0.7 0.15 285 / 0.85);
}

@media (max-width: 860px) {
  .nav-links {
    display: none;
  }
  .nav-in {
    grid-template-columns: auto 1fr;
  }
  .nav-cta {
    justify-content: flex-end;
  }
  .plugin-picker select {
    max-width: 118px;
  }
}
</style>
