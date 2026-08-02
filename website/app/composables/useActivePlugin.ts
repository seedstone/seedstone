import { computed, onMounted, watch } from "vue";
import { sitePlugins } from "~/plugins";

const STORAGE_KEY = "seedstone:active-plugin";

export function useActivePlugin() {
  const fallbackId = sitePlugins[0]?.plugin.id ?? "gem";
  const activeId = useState<string>("active-plugin", () => fallbackId);

  const active = computed(
    () => sitePlugins.find((entry) => entry.plugin.id === activeId.value) ?? sitePlugins[0]!,
  );

  function setActive(id: string): void {
    if (sitePlugins.some((entry) => entry.plugin.id === id)) activeId.value = id;
  }

  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setActive(saved);
  });

  watch(activeId, (id) => {
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, id);
  });

  return { sitePlugins, active, activeId, setActive };
}
