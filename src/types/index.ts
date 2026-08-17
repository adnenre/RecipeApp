// types/index.ts

export type Screen = "home" | "recipe" | "favorites" | "search" | "explore";
export type Tab = "ingredients" | "steps";
export type Unit = "g" | "bol";

export type Ingredient = {
  name: string;
  grams: number;
  unit: string;
};

export type Step = {
  text: string;
  cooking?: boolean;
  timerMin?: number;
};

export interface Recipe {
  id: string;
  title: string;
  category: string;
  time: string;
  timeMin: number;
  duration: string;
  servings: number;
  difficulty: string;
  image: string;
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  methods: string[]; // Array of CookingMethod IDs
  featured?: boolean;
}

export interface CookingMethod {
  id: string;
  label: string;
  icon: string;
  hasTemp: boolean;
}

export const COOKING_METHODS: CookingMethod[] = [
  { id: "four", label: "Four", icon: "thermometer", hasTemp: true },
  { id: "gaz", label: "Gaz", icon: "life-buoy", hasTemp: false },
  { id: "induction", label: "Induction", icon: "zap", hasTemp: false },
  { id: "vapeur", label: "Vapeur", icon: "wind", hasTemp: true },
  { id: "mijoteur", label: "Mijoteur", icon: "trash", hasTemp: false },
  { id: "barbecue", label: "Barbecue", icon: "loader", hasTemp: false },
];

export interface AppState {
  favorites: Set<number>;
  selectedRecipe: Recipe | null;
  currentScreen: string;
  prevScreen: string;
}

// ============================================================
// ✅ Helper Functions for Cooking Methods
// ============================================================

/**
 * Get a cooking method by its ID
 */
export const getCookingMethod = (id: string): CookingMethod | undefined => {
  return COOKING_METHODS.find((method) => method.id === id);
};

/**
 * Get all cooking methods for a recipe
 */
export const getRecipeCookingMethods = (recipe: Recipe): CookingMethod[] => {
  if (!recipe || !recipe.methods) return [];
  return recipe.methods.map((id) => getCookingMethod(id)).filter((method): method is CookingMethod => method !== undefined);
};

/**
 * Check if a recipe uses a specific cooking method
 */
export const recipeUsesMethod = (recipe: Recipe, methodId: string): boolean => {
  if (!recipe || !recipe.methods) return false;
  return recipe.methods.includes(methodId);
};

/**
 * Get the primary cooking method (first one) for a recipe
 */
export const getPrimaryCookingMethod = (recipe: Recipe): CookingMethod | undefined => {
  if (!recipe || !recipe.methods || recipe.methods.length === 0) return undefined;
  return getCookingMethod(recipe.methods[0]);
};

/**
 * Get the icon name for a cooking method (for Feather icons)
 */
export const getMethodIcon = (methodId: string): string => {
  const method = getCookingMethod(methodId);
  return method?.icon || "help-circle";
};

/**
 * Get the label for a cooking method
 */
export const getMethodLabel = (methodId: string): string => {
  const method = getCookingMethod(methodId);
  return method?.label || methodId;
};

/**
 * Check if a cooking method has temperature control
 */
export const methodHasTemp = (methodId: string): boolean => {
  const method = getCookingMethod(methodId);
  return method?.hasTemp || false;
};

/**
 * Get the recommended temperature for a cooking method
 */
export const getMethodTemperature = (methodId: string): string | null => {
  const method = getCookingMethod(methodId);
  if (!method || !method.hasTemp) return null;

  const temperatures: Record<string, string> = {
    four: "180 °C",
    vapeur: "100 °C",
  };

  return temperatures[methodId] || "180 °C";
};

/**
 * Get a formatted string of cooking methods for display
 */
export const getMethodsDisplayString = (recipe: Recipe): string => {
  const methods = getRecipeCookingMethods(recipe);
  return methods.map((m) => m.label).join(" • ");
};

/**
 * Check if a recipe has any cooking methods
 */
export const recipeHasMethods = (recipe: Recipe): boolean => {
  return !!(recipe && recipe.methods && recipe.methods.length > 0);
};
