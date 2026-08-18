// app/(tabs)/favorites.tsx
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeartIcon } from "../../src/components/common/Heart";
import { RecipeCard } from "../../src/components/common/RecipeCard";
import { useTranslation } from "../../src/hooks/useTranslation";
import { useAppStore } from "../../src/store/useAppStore";
import { colors, spacing, typography } from "../../src/theme";

export default function FavoritesScreen() {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const { recipes: RECIPES, favorites, toggleFavorite, setSelectedRecipe } = useAppStore();
  const favRecipes = RECIPES.filter((r) => favorites.has(r.id));

  const handleRecipeSelect = (recipe: any) => {
    setSelectedRecipe(recipe);
    router.push(`/recipe/${recipe.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <Text style={styles.greeting}>{t("favTagline")}</Text>
          <Text style={[styles.title, isRTL && styles.titleRTL]}>
            {t("favTitle1")} <Text style={styles.titleItalic}>{t("favTitle2")}</Text>
          </Text>
        </View>

        {favRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <HeartIcon size={48} color={colors.primary} fill={colors.primary} strokeWidth={1.5} />
            <Text style={[styles.emptyText, isRTL && styles.emptyTextRTL]}>{t("noFavs")}</Text>
          </View>
        ) : (
          <View style={[styles.recipesGrid, isRTL && styles.recipesGridRTL]}>
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
  headerRTL: {
    alignItems: "flex-end",
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
  titleRTL: {
    textAlign: "right",
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
  emptyTextRTL: {
    textAlign: "right",
  },
  recipesGrid: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  recipesGridRTL: {
    // RTL specific grid styles if needed
  },
});
