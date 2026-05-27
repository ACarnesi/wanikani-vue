import type { createFetch } from "@vueuse/core";
import type { IDBPDatabase } from "idb/build/entry.js";
import type { InjectionKey } from "vue";

export const useWaniKaniFetchKey = Symbol() as InjectionKey<ReturnType<typeof createFetch>>;
export const useWaniKaniDbKey = Symbol() as InjectionKey<IDBPDatabase<WaniKani.WaniKaniDBSchema>>;