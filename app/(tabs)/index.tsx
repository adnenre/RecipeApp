// app/(tabs)/index.tsx
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Composants
import { RecipeCard } from "../../src/components/common/RecipeCard";
import { LangPicker } from "../../src/components/LangPicker";

// Store
import { useAppStore } from "../../src/store/useAppStore";

// Thème
import { colors, spacing, typography } from "../../src/theme";

// Utilitaires
import { filterRecipesByCategory, formatRecipeMeta, getCategories, getFeaturedRecipe, getTranslatedCategory } from "../../src/utils/helpers";

// Translation
import { useTranslation } from "../../src/hooks/useTranslation";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  // Router
  const router = useRouter();

  // Translation
  const { t, lang } = useTranslation();

  // État local
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [refreshing, setRefreshing] = useState(false);

  // Store
  const { recipes, recipesLoading, recipesError, favorites, toggleFavorite, setSelectedRecipe, fetchRecipes, initializeApp } = useAppStore();

  // Initialisation
  useEffect(() => {
    initializeApp();
  }, []);

  // Rafraîchissement
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecipes();
    setRefreshing(false);
  }, [fetchRecipes]);

  // Sélection d'une recette
  const handleRecipeSelect = (recipe: any) => {
    setSelectedRecipe(recipe);
    router.push(`/recipe/${recipe.id}`);
  };

  // Données calculées
  const featured = getFeaturedRecipe(recipes);
  const categories = getCategories(recipes);
  const filteredRecipes = filterRecipesByCategory(recipes, selectedCategory, featured?.id);

  // États de chargement et d'erreur
  if (recipesLoading && recipes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t("searchHint", 0)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (recipesError && recipes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>😅</Text>
          <Text style={styles.errorTitle}>{t("noResults")}</Text>
          <Text style={styles.errorText}>{recipesError}</Text>
          <TouchableOpacity onPress={fetchRecipes} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>{t("reset")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title={t("reset")}
            titleColor={colors.mutedForeground}
          />
        }
      >
        {/* En-tête avec LangPicker */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{t("greeting")}</Text>
              <Text style={styles.title}>
                {t("tagline1")} <Text style={styles.titleItalic}>{t("tagline2")}</Text>
              </Text>
            </View>
            <View style={styles.headerRight}>
              <LangPicker />
            </View>
          </View>
        </View>

        {/* Barre de recherche */}
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push("/search")} activeOpacity={0.7}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <Text style={styles.searchText}>{t("searchPlaceholder")}</Text>
        </TouchableOpacity>

        {/* Section À la une */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionLabel}>{t("featured")}</Text>
          {featured ? (
            <FeaturedRecipeCard
              recipe={featured}
              isFavorite={favorites.has(featured.id)}
              onSelect={() => handleRecipeSelect(featured)}
              onToggleFavorite={() => toggleFavorite(featured.id)}
            />
          ) : (
            <Text style={styles.emptyText}>{t("noResults")}</Text>
          )}
        </View>

        {/* Catégories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat) => {
            // Translate the category name
            const translatedCat = getTranslatedCategory(cat, lang);
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{translatedCat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Grille de recettes */}
        <View style={styles.recipesGrid}>
          {filteredRecipes.length === 0 ? (
            <Text style={styles.emptyText}>{t("noResults")}</Text>
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

// Composant: Carte de la recette en vedette
function FeaturedRecipeCard({
  recipe,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: {
  recipe: any;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  const { t } = useTranslation();
  const meta = formatRecipeMeta(recipe);

  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onSelect} activeOpacity={0.9}>
      <Image source={{ uri: recipe.image }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredTags}>
          {meta.tags.map((tag) => (
            <View key={tag} style={styles.featuredTag}>
              <Text style={styles.featuredTagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.featuredTitle}>{recipe.title}</Text>
        <View style={styles.featuredMeta}>
          <View style={styles.metaItem}>
            <Feather name="clock" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featuredMetaText}>{meta.time}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="users" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featuredMetaText}>
              {meta.servings} {t("servingsSuffix")}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.featuredFavButton} onPress={onToggleFavorite} activeOpacity={0.7}>
        <Feather name="heart" size={16} color={isFavorite ? colors.white : colors.white} fill={isFavorite ? colors.white : colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// Styles
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
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
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
  headerContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    paddingTop: 4,
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
