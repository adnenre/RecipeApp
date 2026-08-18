// utils/helpers.ts
import { Recipe } from "../types";

// Define Lang type locally instead of importing from useTranslation
export type Lang = "fr" | "en" | "ar";

export const formatQtyLabel = (
  ing: { qty: number | null; unit: string; name: string },
  base: number,
  current: number,
  unitMode: "g" | "bol",
): string => {
  if (ing.qty === null) return "—";
  const scaled = ing.qty * (current / base);
  const isVolumeOrWeight = ["g", "ml"].includes(ing.unit);

  if (unitMode === "bol" && isVolumeOrWeight) {
    const bols = scaled / 250;
    const rounded = Math.round(bols * 4) / 4;
    return `${rounded < 0.1 ? "< ¼" : rounded} bol`;
  }

  const display = scaled % 1 === 0 ? `${scaled}` : `${+scaled.toFixed(1)}`;
  return `${display} ${ing.unit}`;
};

export const getDifficultyLevel = (level: string): number => {
  const map: Record<string, number> = { Facile: 1, Moyen: 2, Difficile: 3 };
  return map[level] ?? 1;
};

export const formatTime = (min: number): string => {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${m}`;
};

// Récupère le temps d'affichage d'une recette (supporte les deux formats)
export const getDisplayTime = (recipe: any): string => {
  if (recipe.time) return recipe.time;
  if (recipe.prepTime && recipe.cookTime) {
    return `${recipe.prepTime} + ${recipe.cookTime}`;
  }
  return "N/A";
};

// Récupère la recette en vedette (ou la première si aucune n'est marquée)
export const getFeaturedRecipe = (recipes: Recipe[]): Recipe | null => {
  if (recipes.length === 0) return null;
  return recipes.find((r) => r.featured) || recipes[0];
};

// Génère la liste des catégories uniques
export const getCategories = (recipes: Recipe[]): string[] => {
  // Get unique categories from recipes
  const uniqueCategories = new Set(recipes.map((r) => r.category));
  // Return with "Tous" as the first option (will be translated in the UI)
  return ["Tous", ...uniqueCategories];
};

// Get translated category name
export const getTranslatedCategory = (category: string, lang: Lang): string => {
  const categoryMap: Record<string, Record<Lang, string>> = {
    Tous: {
      fr: "Tous",
      en: "All",
      ar: "الكل",
    },
    Desserts: {
      fr: "Desserts",
      en: "Desserts",
      ar: "حلويات",
    },
    Viandes: {
      fr: "Viandes",
      en: "Meats",
      ar: "لحوم",
    },
    Légumes: {
      fr: "Légumes",
      en: "Vegetables",
      ar: "خضروات",
    },
    Soupes: {
      fr: "Soupes",
      en: "Soups",
      ar: "شوربات",
    },
    Salades: {
      fr: "Salades",
      en: "Salads",
      ar: "سلطات",
    },
    Plats: {
      fr: "Plats",
      en: "Main Dishes",
      ar: "أطباق رئيسية",
    },
    Entrées: {
      fr: "Entrées",
      en: "Appetizers",
      ar: "مقبلات",
    },
    Accompagnements: {
      fr: "Accompagnements",
      en: "Sides",
      ar: "أطباق جانبية",
    },
    Boissons: {
      fr: "Boissons",
      en: "Drinks",
      ar: "مشروبات",
    },
  };

  return categoryMap[category]?.[lang] || category;
};

// Filtre les recettes par catégorie (exclut la recette en vedette)
export const filterRecipesByCategory = (recipes: Recipe[], category: string, featuredId?: string): Recipe[] => {
  if (category === "Tous") {
    return recipes.filter((r) => featuredId && r.id !== featuredId);
  }
  return recipes.filter((r) => r.category === category && featuredId && r.id !== featuredId);
};

// Extrait les tags pour l'affichage (limité à 2)
export const getDisplayTags = (tags: string[] = [], limit: number = 2): string[] => {
  return tags.slice(0, limit);
};

// Normalise l'ID d'une recette (assure qu'il est en string)
export const normalizeRecipeId = (id: any): string => {
  return String(id);
};

// Vérifie si une recette est dans les favoris
export const isRecipeFavorite = (favorites: Set<string>, recipeId: string): boolean => {
  return favorites.has(normalizeRecipeId(recipeId));
};

// Formate les métadonnées pour l'affichage
export const formatRecipeMeta = (recipe: any) => {
  return {
    time: getDisplayTime(recipe),
    servings: recipe.servings || "N/A",
    difficulty: recipe.difficulty || "Moyen",
    tags: getDisplayTags(recipe.tags),
  };
};
