export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: ["@vercel/speed-insights/nuxt", "@vercel/analytics"],

  css: ["~/assets/css/main.css"],

  nitro: {
    preset: "static",
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
});
