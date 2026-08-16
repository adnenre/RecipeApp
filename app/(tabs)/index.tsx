import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RecipeCard } from "../../src/components/common/RecipeCard";
import { useAppStore } from "../../src/store/useAppStore";
import { colors, spacing, typography } from "../../src/theme";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 Récupération depuis le store
  const {
    recipes,
    recipesLoading,
    recipesError,
    authLoading,
    authError,
    isAuthenticated,
    favorites,
    toggleFavorite,
    setSelectedRecipe,
    fetchRecipes,
    initializeApp,
  } = useAppStore();

  // 🔥 Initialisation automatique
  useEffect(() => {
    initializeApp();
  }, []);

  // 🔥 Fonction de rafraîchissement (pull-to-refresh)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    console.log("🔄 Rafraîchissement manuel...");
    await fetchRecipes();
    setRefreshing(false);
  }, [fetchRecipes]);

  // 🔥 États de chargement
  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Connexion en cours...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (authError && !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔐</Text>
          <Text style={styles.errorTitle}>Erreur de connexion</Text>
          <Text style={styles.errorText}>{authError}</Text>
          <TouchableOpacity onPress={initializeApp} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Connexion en cours...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (recipesLoading && recipes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des recettes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (recipesError && recipes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>😅</Text>
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorText}>{recipesError}</Text>
          <TouchableOpacity onPress={fetchRecipes} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 🔥 Données dynamiques depuis le store
  const featured = recipes.length > 0 ? recipes.find((r) => r.featured) || recipes[0] : null;
  const categories = ["Tous", ...new Set(recipes.map((r) => r.category))];

  const filteredRecipes =
    selectedCategory === "Tous"
      ? recipes.filter((r) => featured && r.id !== featured.id)
      : recipes.filter((r) => r.category === selectedCategory && featured && r.id !== featured.id);

  const handleRecipeSelect = (recipe: any) => {
    setSelectedRecipe(recipe);
    router.push(`/recipe/${recipe.id}`);
  };

  // 🔥 Affichage du temps (supporte les deux formats)
  const getDisplayTime = (recipe: any) => {
    if (recipe.time) return recipe.time;
    if (recipe.prepTime && recipe.cookTime) {
      return `${recipe.prepTime} + ${recipe.cookTime}`;
    }
    return "N/A";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]} // Android
            tintColor={colors.primary} // iOS
            title="Rafraîchissement..."
            titleColor={colors.mutedForeground}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour, chef</Text>
          <Text style={styles.title}>
            Que cuisinez-vous <Text style={styles.titleItalic}>aujourd'hui ?</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.searchBar} onPress={() => router.push("/search")}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <Text style={styles.searchText}>Rechercher une recette…</Text>
        </TouchableOpacity>

        <View style={styles.featuredSection}>
          <Text style={styles.sectionLabel}>À la une</Text>
          {featured ? (
            <TouchableOpacity style={styles.featuredCard} onPress={() => handleRecipeSelect(featured)} activeOpacity={0.9}>
              <Image source={{ uri: featured.image }} style={styles.featuredImage} />
              <View style={styles.featuredOverlay}>
                <View style={styles.featuredTags}>
                  {featured.tags?.slice(0, 2).map((tag) => (
                    <View key={tag} style={styles.featuredTag}>
                      <Text style={styles.featuredTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.featuredTitle}>{featured.title}</Text>
                <View style={styles.featuredMeta}>
                  <View style={styles.metaItem}>
                    <Feather name="clock" size={12} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.featuredMetaText}>{getDisplayTime(featured)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="users" size={12} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.featuredMetaText}>{featured.servings} pers.</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.featuredFavButton} onPress={() => toggleFavorite(featured.id)}>
                <Feather
                  name="heart"
                  size={16}
                  color={favorites.has(featured.id) ? colors.white : colors.white}
                  fill={favorites.has(featured.id) ? colors.white : colors.primary}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ) : (
            <Text style={styles.emptyText}>Aucune recette disponible</Text>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.recipesGrid}>
          {filteredRecipes.length === 0 ? (
            <Text style={styles.emptyText}>Aucune recette dans cette catégorie.</Text>
          ) : (
            filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={() => handleRecipeSelect(recipe)}
                onToggleFav={() => toggleFavorite(recipe.id)}
                isFav={favorites.has(recipe.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ✅ STYLES INCHANGÉS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.mutedForeground,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: 10,
    color: colors.mutedForeground,
    ...typography.monoSmall,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.foreground,
    ...typography.h1,
  },
  titleItalic: {
    fontStyle: "italic",
    color: colors.primary,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchText: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginLeft: spacing.md,
  },
  featuredSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 1,
    ...typography.monoSmall,
    marginBottom: spacing.md,
  },
  featuredCard: {
    height: 208,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  featuredTags: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  featuredTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  featuredTagText: {
    fontSize: 8,
    color: "rgba(255,255,255,0.9)",
    ...typography.monoSmall,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  featuredMeta: {
    flexDirection: "row",
  },
  featuredMetaText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    ...typography.monoSmall,
    marginLeft: spacing.xs,
  },
  featuredFavButton: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 10,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  categoriesContent: {
    paddingRight: spacing.xl,
  },
  categoryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.foreground,
  },
  categoryTextActive: {
    color: colors.white,
  },
  recipesGrid: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emptyText: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
    paddingVertical: spacing.xxxl,
    width: "100%",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.lg,
  },
});
