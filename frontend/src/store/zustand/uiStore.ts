/** Tiny Zustand store for UI preferences (recently viewed, theme, etc.). */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  recentlyViewed: string[];
  pushRecent: (productId: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      recentlyViewed: [],
      pushRecent: (id) =>
        set((s) => ({
          recentlyViewed: [id, ...s.recentlyViewed.filter((x) => x !== id)].slice(0, 10)
        }))
    }),
    { name: 'shopkart-ui' }
  )
);
