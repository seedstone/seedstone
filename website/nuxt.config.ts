const seedstoneEsm = new URL("../dist/seedstone.esm.js", import.meta.url).pathname;
const SEEDSTONE_DTS_SHIM = "\0seedstone-dts-shim";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: ["@vercel/speed-insights/nuxt", "@vercel/analytics", "@zadigetvoltaire/nuxt-gtm"],

  css: ["~/assets/css/main.css"],

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

  // Resolve the workspace package against its prebuilt bundle.
  alias: {
    seedstone: seedstoneEsm,
  },

  vite: {
    plugins: [
      // Prevent Nuxt's module runner from executing the declaration sidecar.
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
