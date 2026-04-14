import type { createFetch } from "@vueuse/core";
import type { InjectionKey } from "vue";

export const useWaniKaniFetchKey = Symbol() as InjectionKey<ReturnType<typeof createFetch>>;