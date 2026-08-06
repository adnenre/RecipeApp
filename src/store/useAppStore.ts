import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Recipe } from "../types";

interface AppState {
  favorites: Set<number>;
  selectedRecipe: Recipe | null;
  currentScreen: string;
  prevScreen: string;
  toggleFavorite: (id: number) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  setCurrentScreen: (screen: string) => void;
  setPrevScreen: (screen: string) => void;
  clearSelectedRecipe: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      favorites: new Set([1, 4]),
      selectedRecipe: null,
      currentScreen: "home",
      prevScreen: "home",

      toggleFavorite: (id: number) =>
        set((state) => {
          const newFavorites = new Set(state.favorites);
          if (newFavorites.has(id)) {
            newFavorites.delete(id);
          } else {
            newFavorites.add(id);
          }
          return { favorites: newFavorites };
        }),

      setSelectedRecipe: (recipe: Recipe | null) => set({ selectedRecipe: recipe }),

      setCurrentScreen: (screen: string) => set({ currentScreen: screen }),

      setPrevScreen: (screen: string) => set({ prevScreen: screen }),

      clearSelectedRecipe: () => set({ selectedRecipe: null }),
    }),
    {
      name: "recipe-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: Array.from(state.favorites),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        favorites: new Set(persistedState?.favorites || []),
      }),
    },
  ),
);
