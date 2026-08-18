import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { API_CONFIG } from "../config/api";
import { Recipe } from "../types";

interface AppState {
  // Favoris
  favorites: Set<string>;

  // Navigation
  selectedRecipe: Recipe | null;
  currentScreen: string;
  prevScreen: string;

  // Recettes
  recipes: Recipe[];
  recipesLoading: boolean;
  recipesError: string | null;

  // Actions existantes
  toggleFavorite: (id: string) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  setCurrentScreen: (screen: string) => void;
  setPrevScreen: (screen: string) => void;
  clearSelectedRecipe: () => void;

  // Actions
  initializeApp: () => Promise<void>;
  fetchRecipes: () => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // État initial
      favorites: new Set<string>(),
      selectedRecipe: null,
      currentScreen: "home",
      prevScreen: "home",
      recipes: [],
      recipesLoading: false,
      recipesError: null,

      // Basculer un favori
      toggleFavorite: (id: string) =>
        set((state) => {
          const newFavorites = new Set(state.favorites);
          if (newFavorites.has(id)) {
            newFavorites.delete(id);
          } else {
            newFavorites.add(id);
          }
          return { favorites: newFavorites };
        }),

      // Actions de navigation
      setSelectedRecipe: (recipe: Recipe | null) => set({ selectedRecipe: recipe }),
      setCurrentScreen: (screen: string) => set({ currentScreen: screen }),
      setPrevScreen: (screen: string) => set({ prevScreen: screen }),
      clearSelectedRecipe: () => set({ selectedRecipe: null }),

      // Initialisation de l'application - charge les recettes
      initializeApp: async () => {
        console.log("🚀 Initialisation de l'application...");

        if (get().recipes.length === 0 && !get().recipesLoading) {
          console.log("📦 Chargement des recettes...");
          await get().fetchRecipes();
        } else {
          console.log(`✅ ${get().recipes.length} recettes déjà chargées`);
        }
      },

      // Récupère toutes les recettes (GET public)
      fetchRecipes: async () => {
        if (get().recipesLoading) {
          console.log("⏳ Déjà en cours de chargement...");
          return;
        }

        set({ recipesLoading: true, recipesError: null });

        try {
          console.log("📦 Récupération des recettes...");

          const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.recipes}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const data = await response.json();
          const recipes: Recipe[] = Array.isArray(data) ? data : data.recipes || [];

          // Normalise les IDs en strings
          const normalizedRecipes = recipes.map((recipe) => ({
            ...recipe,
            id: String(recipe.id),
          }));

          // Si aucune recette n'est en vedette, définir la première comme vedette
          let finalRecipes = normalizedRecipes;
          if (normalizedRecipes.length > 0 && !normalizedRecipes.some((r) => r.featured === true)) {
            finalRecipes = normalizedRecipes.map((r, index) => ({
              ...r,
              featured: index === 0,
            }));
            console.log("⭐ Aucune recette en vedette, la première est définie comme À la une");
          }

          console.log(`✅ ${finalRecipes.length} recettes chargées`);

          set({
            recipes: finalRecipes,
            recipesLoading: false,
            recipesError: null,
          });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Erreur de chargement";
          console.error("❌ Erreur fetchRecipes:", errorMsg);
          set({
            recipesError: errorMsg,
            recipesLoading: false,
          });
        }
      },

      // Récupère une recette par son ID
      getRecipeById: (id: string) => {
        return get().recipes.find((r) => String(r.id) === id);
      },
    }),
    {
      name: "recipe-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: Array.from(state.favorites),
        // Optionnel: persister les recettes pour éviter de les recharger
        // recipes: state.recipes,
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        favorites: new Set(persistedState?.favorites || []),
      }),
    },
  ),
);
