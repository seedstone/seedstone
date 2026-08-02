import { computed, onMounted, watch } from "vue";
import { sitePlugins } from "~/plugins";

const STORAGE_KEY = "seedstone:active-plugin";

export function useActivePlugin() {
  const route = useRoute();
  const fallbackId = sitePlugins[0]?.plugin.id ?? "gem";
  const pluginFromRoute = computed(() => {
    const id = route.query.plugin;
    return typeof id === "string" && sitePlugins.some((entry) => entry.plugin.id === id)
      ? id
      : null;
  });
  const activeId = useState<string>("active-plugin", () => pluginFromRoute.value ?? fallbackId);

  const active = computed(
    () => sitePlugins.find((entry) => entry.plugin.id === activeId.value) ?? sitePlugins[0]!,
  );

  function setActive(id: string): void {
    if (sitePlugins.some((entry) => entry.plugin.id === id)) activeId.value = id;
  }

  watch(
    pluginFromRoute,
    (id) => {
      if (id) setActive(id);
    },
    { immediate: true },
  );

  onMounted(() => {
    if (pluginFromRoute.value) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setActive(saved);
  });

  watch(activeId, (id) => {
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, id);
  });

  return { sitePlugins, active, activeId, setActive };
}
