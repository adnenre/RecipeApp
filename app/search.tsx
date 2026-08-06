// app/search.tsx
import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppStore } from "../src/store/useAppStore";
import { RECIPES } from "../src/data/recipes";
import { RecipeCard } from "../src/components/common/RecipeCard";
import { colors, typography, spacing } from "../src/theme";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { favorites, toggleFavorite, setSelectedRecipe } = useAppStore();

  const results =
    query.length > 1
      ? RECIPES.filter(
          (r) =>
            r.title.toLowerCase().includes(query.toLowerCase()) ||
            r.category.toLowerCase().includes(query.toLowerCase()) ||
            r.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())),
        )
      : [];

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
        {query.length <= 1 && (
          <View style={styles.emptyState}>
            <Feather name="book-open" size={40} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>Tapez pour rechercher parmi {RECIPES.length} recettes</Text>
          </View>
        )}

        {query.length > 1 && results.length === 0 && (
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
                onToggleFav={() => toggleFavorite(recipe.id)}
                isFav={favorites.has(recipe.id)}
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
