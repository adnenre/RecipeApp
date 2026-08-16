import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { API_CONFIG } from "../config/api";
import { Recipe } from "../types";

interface User {
  id: string;
  name: string;
  email: string;
  labels: string[];
  isAdmin: boolean;
}

interface AppState {
  // État existant
  favorites: Set<string>;
  selectedRecipe: Recipe | null;
  currentScreen: string;
  prevScreen: string;

  // Auth
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;

  // Recipes
  recipes: Recipe[];
  recipesLoading: boolean;
  recipesError: string | null;

  // Actions existantes
  toggleFavorite: (id: string) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  setCurrentScreen: (screen: string) => void;
  setPrevScreen: (screen: string) => void;
  clearSelectedRecipe: () => void;

  // Nouvelles actions
  initializeApp: () => Promise<void>;
  login: () => Promise<boolean>;
  logout: () => void;
  fetchRecipes: () => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // État existant
      favorites: new Set<string>(), // 🔥 Set<string>
      selectedRecipe: null,
      currentScreen: "home",
      prevScreen: "home",

      // Auth
      user: null,
      isAuthenticated: false,
      authLoading: false,
      authError: null,

      // Recipes
      recipes: [],
      recipesLoading: false,
      recipesError: null,

      // Actions existantes
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

      setSelectedRecipe: (recipe: Recipe | null) => set({ selectedRecipe: recipe }),
      setCurrentScreen: (screen: string) => set({ currentScreen: screen }),
      setPrevScreen: (screen: string) => set({ prevScreen: screen }),
      clearSelectedRecipe: () => set({ selectedRecipe: null }),

      // 🔐 Login automatique
      login: async (): Promise<boolean> => {
        if (get().authLoading) {
          console.log("⏳ Login déjà en cours...");
          return false;
        }

        set({ authLoading: true, authError: null });

        try {
          const { email, password } = API_CONFIG.credentials;

          console.log("🔐 Tentative de connexion automatique...");

          const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || "Échec de connexion");
          }

          const data = await response.json();

          if (data.success && data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
              authLoading: false,
              authError: null,
            });
            console.log("✅ Connecté automatiquement - Utilisateur:", data.user.email);
            return true;
          } else {
            throw new Error("Réponse de connexion invalide");
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Erreur de connexion";
          console.error("❌ Erreur login:", errorMsg);
          set({
            authError: errorMsg,
            authLoading: false,
            isAuthenticated: false,
          });
          return false;
        }
      },

      // 🚀 Initialisation complète
      initializeApp: async () => {
        console.log("🚀 Initialisation de l'application...");

        const currentUser = get().user;
        const currentAuth = get().isAuthenticated;

        if (currentUser && currentAuth) {
          console.log("🔑 Utilisateur déjà connecté:", currentUser.email);

          if (get().recipes.length === 0 && !get().recipesLoading) {
            await get().fetchRecipes();
          }
          return;
        }

        console.log("🔐 Aucun utilisateur, connexion automatique...");
        const success = await get().login();

        if (success) {
          console.log("✅ Login réussi, chargement des recettes...");
          await get().fetchRecipes();
        } else {
          console.error("❌ Échec du login automatique");
        }
      },

      // 🚪 Déconnexion
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          recipes: [],
          favorites: new Set<string>(),
        });
      },

      // 📦 Récupérer les recettes
      fetchRecipes: async () => {
        if (get().recipesLoading) {
          console.log("⏳ Déjà en cours de chargement...");
          return;
        }

        if (!get().isAuthenticated) {
          console.warn("⚠️ Non authentifié, tentative de login...");
          const success = await get().login();
          if (!success) {
            console.error("❌ Échec du login, impossible de charger les recettes");
            return;
          }
          return get().fetchRecipes();
        }

        set({ recipesLoading: true, recipesError: null });

        try {
          console.log("📦 Récupération des recettes...");

          const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.recipes}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.status === 401) {
            console.warn("⚠️ Non autorisé, tentative de re-login...");
            set({ isAuthenticated: false });
            const success = await get().login();
            if (success) {
              return get().fetchRecipes();
            }
            set({ recipesLoading: false });
            return;
          }

          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const data = await response.json();
          const recipes: Recipe[] = Array.isArray(data) ? data : data.recipes || [];

          // 🔥 S'assurer que les IDs sont des strings
          const normalizedRecipes = recipes.map((recipe) => ({
            ...recipe,
            id: String(recipe.id), // 🔥 Convertir l'ID en string
          }));

          // Si aucune recette n'a featured: true, définir la première comme featured
          let finalRecipes = normalizedRecipes;
          if (normalizedRecipes.length > 0 && !normalizedRecipes.some((r) => r.featured === true)) {
            finalRecipes = normalizedRecipes.map((r, index) => ({
              ...r,
              featured: index === 0,
            }));
            console.log("⭐ Aucune recette featured, la première est définie comme À la une");
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

      // 📖 Helper
      getRecipeById: (id: string) => {
        return get().recipes.find((r) => String(r.id) === id);
      },
    }),
    {
      name: "recipe-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: Array.from(state.favorites),
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        favorites: new Set(persistedState?.favorites || []),
        user: persistedState?.user || null,
        isAuthenticated: persistedState?.isAuthenticated || false,
      }),
    },
  ),
);
