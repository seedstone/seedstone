const seedstoneEsm = new URL("../dist/seedstone.esm.js", import.meta.url).pathname;
const SEEDSTONE_DTS_SHIM = "\0seedstone-dts-shim";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: ["@vercel/speed-insights/nuxt", "@vercel/analytics", "@zadigetvoltaire/nuxt-gtm"],

  css: ["~/assets/css/main.css"],

  // Static site generation — all Three.js content is <ClientOnly> so there
  // is nothing to render server-side. The output lands in .output/public/.
  nitro: {
    preset: "static",
  },

  gtm: {
    id: "GTM-XXXXXXX",
    enabled: true,
    debug: false,
  },

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#07080f" },
        { property: "og:image", content: "/icon.png" },
        { property: "og:image:type", content: "image/png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "/icon.png" },
      ],
      link: [{ rel: "icon", type: "image/png", href: "/favicon.ico" }],
    },
  },

  // seedstone is a workspace package whose runtime entry is a single pre-bundled
  // ESM file (Three.js is inlined). Point the bare specifier straight at it so
  // Vite never pre-bundles it (which would break the dynamic import() pattern
  // for SSR).
  alias: {
    seedstone: seedstoneEsm,
  },

  vite: {
    plugins: [
      // Nuxt's dev SSR/client module runner probes for an `index.d.ts` sidecar
      // next to the resolved ESM entry and then tries to execute that
      // type-declaration file as a real module. It crashes because the
      // declarations re-export via extension-less paths (e.g. `./core/index`)
      // that have no matching `.js`. Redirect any such probe to a tiny virtual
      // module that re-exports the real JS bundle — providing both named
      // exports and a default, so the probe links regardless of import style.
      {
        name: "seedstone-dts-guard",
        enforce: "pre",
        async resolveId(source, importer, options) {
          if (source === SEEDSTONE_DTS_SHIM) return SEEDSTONE_DTS_SHIM;
          if (!source.endsWith("index.d.ts") && source !== "seedstone") return null;
          const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
          if (resolved?.id.endsWith("/dist/index.d.ts")) {
            return SEEDSTONE_DTS_SHIM;
          }
          return null;
        },
        load(id) {
          if (id === SEEDSTONE_DTS_SHIM) {
            const spec = JSON.stringify(seedstoneEsm);
            return `export * from ${spec};\nimport * as __all from ${spec};\nexport default __all;`;
          }
          return null;
        },
      },
    ],
    optimizeDeps: {
      exclude: ["seedstone"],
    },
  },
});
