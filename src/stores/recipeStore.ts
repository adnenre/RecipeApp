import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { API_CONFIG } from "../config/api";
import { Recipe } from "../types";

interface StoreState {
  // Auth
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;

  // Recipes
  recipes: Recipe[];
  recipesLoading: boolean;
  recipesError: string | null;

  // Actions
  initializeApp: () => Promise<void>; // 🔥 Auto-login + fetch
  login: () => Promise<boolean>; // Login avec creds hardcodés
  logout: () => void;
  fetchRecipes: () => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
}

export const useRecipeStore = create<StoreState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      authLoading: false,
      authError: null,
      recipes: [],
      recipesLoading: false,
      recipesError: null,

      // 🔐 Login automatique avec identifiants hardcodés
      login: async (): Promise<boolean> => {
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

          set({
            token: data.token || data.accessToken,
            isAuthenticated: true,
            authLoading: false,
            authError: null,
          });

          console.log("✅ Connecté automatiquement");

          // 🔥 Une fois connecté, charger les recettes
          await get().fetchRecipes();

          return true;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Erreur de connexion";
          console.error("❌ Erreur login:", errorMsg);
          set({
            authError: errorMsg,
            authLoading: false,
          });
          return false;
        }
      },

      // 🚀 Initialisation complète de l'app
      initializeApp: async () => {
        console.log("🚀 Initialisation de l'application...");

        // Vérifier si déjà authentifié
        const currentToken = get().token;

        if (currentToken) {
          console.log("🔑 Token existant trouvé");
          set({ isAuthenticated: true });

          // Charger les recettes
          await get().fetchRecipes();
        } else {
          console.log("🔐 Aucun token, connexion automatique...");
          await get().login();
        }
      },

      // 🚪 Déconnexion
      logout: () => {
        set({
          token: null,
          isAuthenticated: false,
          recipes: [],
        });
      },

      // 📦 Récupérer les recettes
      fetchRecipes: async () => {
        const token = get().token;

        if (!token) {
          console.warn("⚠️ Pas de token, tentative de login...");
          await get().login();
          return;
        }

        set({ recipesLoading: true, recipesError: null });

        try {
          console.log("📦 Récupération des recettes...");

          const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.recipes}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (response.status === 401) {
            console.warn("⚠️ Token expiré, tentative de re-login...");
            // Token expiré, on tente de se reconnecter
            const loginSuccess = await get().login();
            if (loginSuccess) {
              // Réessayer la récupération des recettes
              return get().fetchRecipes();
            }
            return;
          }

          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const data = await response.json();
          const recipes: Recipe[] = Array.isArray(data) ? data : data.recipes || [];

          console.log(`✅ ${recipes.length} recettes chargées`);

          set({
            recipes,
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

      getRecipeById: (id: string) => {
        return get().recipes.find((r) => r.id === id);
      },
    }),
    {
      name: "recipe-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
