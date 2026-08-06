export type Screen = "home" | "recipe" | "favorites" | "search" | "explore";
export type Tab = "ingredients" | "steps";
export type Unit = "g" | "bol";

export interface Recipe {
  id: number;
  title: string;
  category: string;
  time: string;
  timeMin: number;
  servings: number;
  difficulty: string;
  image: string;
  description: string;
  ingredients: { qty: number | null; unit: string; name: string }[];
  steps: string[];
  tags: string[];
  methods: string[];
}

export interface CookingMethod {
  id: string;
  label: string;
  icon: string;
  hasTemp: boolean;
}

export const COOKING_METHODS: CookingMethod[] = [
  { id: "four", label: "Four", icon: "thermometer", hasTemp: true },
  { id: "gaz", label: "Gaz", icon: "flame", hasTemp: false },
  { id: "induction", label: "Induction", icon: "zap", hasTemp: false },
  { id: "vapeur", label: "Vapeur", icon: "wind", hasTemp: true },
  { id: "mijoteur", label: "Mijoteur", icon: "flame", hasTemp: false },
  { id: "barbecue", label: "Barbecue", icon: "flame", hasTemp: false },
];

export interface AppState {
  favorites: Set<number>;
  selectedRecipe: Recipe | null;
  currentScreen: string;
  prevScreen: string;
}
