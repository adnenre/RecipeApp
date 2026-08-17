export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || "https://dashboard-recepie.vercel.app/api",
  endpoints: {
    login: "/admin/auth/login",
    recipes: "/recipes",
    batchFeature: "/recipes/batch-feature",
  },
  credentials: {
    email: process.env.EXPO_PUBLIC_ADMIN_EMAIL || "",
    password: process.env.EXPO_PUBLIC_ADMIN_PASSWORD || "",
  },
};
