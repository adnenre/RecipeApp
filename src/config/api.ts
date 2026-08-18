export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || "https://dashboard-recepie.vercel.app/api",
  endpoints: {
    recipes: "/recipes",
  },
};
