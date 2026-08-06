import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppStore } from "../../src/store/useAppStore";
import { RECIPES } from "../../src/data/recipes";
import { RecipeCard } from "../../src/components/common/RecipeCard";
import { colors, typography, spacing } from "../../src/theme";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite, setSelectedRecipe } = useAppStore();
  const favRecipes = RECIPES.filter((r) => favorites.has(r.id));

  const handleRecipeSelect = (recipe: any) => {
    setSelectedRecipe(recipe);
    router.push(`/recipe/${recipe.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Vos préférées</Text>
          <Text style={styles.title}>
            Recettes <Text style={styles.titleItalic}>favorites</Text>
          </Text>
        </View>

        {favRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="heart" size={48} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>
              Aucune recette sauvegardée.{"\n"}
              Tapez ♥ sur une recette pour l'ajouter.
            </Text>
          </View>
        ) : (
          <View style={styles.recipesGrid}>
            {favRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={() => handleRecipeSelect(recipe)}
                onToggleFav={() => toggleFavorite(recipe.id)}
                isFav={true}
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
  emptyState: {
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
    marginTop: spacing.lg,
    lineHeight: 20,
  },
  recipesGrid: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
