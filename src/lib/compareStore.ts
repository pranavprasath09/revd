import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * The compare tray — the only piece of cross-page state in the Pit Wall set.
 * Checking rows on /cars accumulates up to four car ids; /compare reads them.
 */
interface CompareState {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const MAX_COMPARE = 4;

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((state) => {
          if (state.ids.includes(id))
            return { ids: state.ids.filter((x) => x !== id) };
          if (state.ids.length >= MAX_COMPARE) return state;
          return { ids: [...state.ids, id] };
        }),
      remove: (id) => set((state) => ({ ids: state.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: "revd-compare" },
  ),
);
