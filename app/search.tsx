// app/search.tsx
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RecipeCard } from "../src/components/common/RecipeCard";
import { useAppStore } from "../src/store/useAppStore";
import { colors, spacing } from "../src/theme";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { recipes: RECIPES, favorites, toggleFavorite, setSelectedRecipe } = useAppStore();

  // 🔥 Recherche améliorée - insensible à la casse et aux accents
  const results = useMemo(() => {
    // 🔥 Changement : recherche dès la première lettre (query.length > 0)
    if (query.length === 0) return [];

    const searchTerm = query.toLowerCase().trim();

    return RECIPES.filter((r) => {
      // Recherche dans le titre
      const titleMatch = r.title.toLowerCase().includes(searchTerm);

      // Recherche dans les tags (optionnel)
      const tagMatch = r.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)) || false;

      // Recherche dans la catégorie (optionnel)
      const categoryMatch = r.category.toLowerCase().includes(searchTerm) || false;

      // Recherche dans la description (optionnel)
      const descriptionMatch = r.description?.toLowerCase().includes(searchTerm) || false;

      return titleMatch || tagMatch || categoryMatch || descriptionMatch;
    });
  }, [RECIPES, query]);

  // 🔥 Debug - afficher les résultats
  console.log(`🔍 Recherche: "${query}" → ${results.length} résultat(s)`);

  const handleRecipeSelect = (recipe: any) => {
    setSelectedRecipe(recipe);
    router.push(`/recipe/${recipe.id}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une recette…"
              style={styles.searchInput}
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="search"
            />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* 🔥 Changement : afficher l'état vide uniquement si query.length === 0 */}
        {query.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="book-open" size={40} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>Tapez pour rechercher parmi {RECIPES.length} recettes</Text>
          </View>
        )}

        {/* 🔥 Changement : afficher "Aucun résultat" si query.length > 0 et results.length === 0 */}
        {query.length > 0 && results.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="search" size={40} color={colors.mutedForeground} />
            <Text style={styles.noResultsText}>Aucun résultat pour "{query}"</Text>
          </View>
        )}

        {results.length > 0 && (
          <View style={styles.resultsGrid}>
            {results.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={() => handleRecipeSelect(recipe)}
                onToggleFav={() => toggleFavorite(String(recipe.id))}
                isFav={favorites.has(String(recipe.id))}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    padding: 0,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  noResultsText: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  resultsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: spacing.md,
  },
});
