// utils/translationHelpers.ts
import { COOKING_METHODS, CookingMethod } from "../types";

export const ALL_INGREDIENTS = [
  "pommes",
  "sucre",
  "beurre",
  "pâte feuilletée",
  "cannelle",
  "aubergines",
  "courgettes",
  "tomates",
  "poivrons",
  "oignon",
  "ail",
  "huile d'olive",
  "bœuf",
  "vin rouge",
  "lardons",
  "champignons",
  "carottes",
  "crème",
  "œufs",
  "vanille",
  "pain",
  "Comté",
  "thon",
  "anchois",
  "olives",
];

export const CATEGORIES = ["Tous", "Desserts", "Viandes", "Légumes", "Soupes", "Salades"];

// Map French ingredient names to their translation keys
const ingredientKeyMap: Record<string, string> = {
  pommes: "apples",
  sucre: "sugar",
  beurre: "butter",
  "pâte feuilletée": "puffPastry",
  cannelle: "cinnamon",
  aubergines: "eggplants",
  courgettes: "zucchini",
  tomates: "tomatoes",
  poivrons: "peppers",
  oignon: "onion",
  ail: "garlic",
  "huile d'olive": "oliveOil",
  bœuf: "beef",
  "vin rouge": "redWine",
  lardons: "bacon",
  champignons: "mushrooms",
  carottes: "carrots",
  crème: "cream",
  œufs: "eggs",
  vanille: "vanilla",
  pain: "bread",
  Comté: "comte",
  thon: "tuna",
  anchois: "anchovies",
  olives: "olives",
};

export const getTranslatedIngredients = (t: (key: string) => string): string[] => {
  return ALL_INGREDIENTS.map((ingredient) => {
    const key = ingredientKeyMap[ingredient];
    return key ? t(key) : ingredient;
  });
};

export const getTranslatedCategories = (t: (key: string) => string): string[] => {
  const keyMap: Record<string, string> = {
    Tous: "categoryAll",
    Desserts: "categoryDesserts",
    Viandes: "categoryMeats",
    Légumes: "categoryVegetables",
    Soupes: "categorySoups",
    Salades: "categorySalads",
  };
  return CATEGORIES.map((category) => {
    const key = keyMap[category];
    return key ? t(key) : category;
  });
};

export const getTranslatedCookingMethods = (t: (key: string) => string): CookingMethod[] => {
  return COOKING_METHODS.map((method) => ({
    ...method,
    label: t(method.id),
  }));
};
