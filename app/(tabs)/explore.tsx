// app/(tabs)/explore.tsx
import { getTranslatedCategories, getTranslatedCookingMethods, getTranslatedIngredients } from "@/utils/TranslationHelper";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RecipeCard } from "../../src/components/common/RecipeCard";
import { useTranslation } from "../../src/hooks/useTranslation";
import { useAppStore } from "../../src/store/useAppStore";
import { colors, spacing, typography } from "../../src/theme";
import { type Recipe } from "../../src/types";

export default function ExploreScreen() {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const { recipes: RECIPES, favorites, toggleFavorite, setSelectedRecipe } = useAppStore();

  // Get translated data
  const ALL_INGREDIENTS = getTranslatedIngredients(t);
  const CATEGORIES = getTranslatedCategories(t);
  const COOKING_METHODS_TRANSLATED = getTranslatedCookingMethods(t);

  const [selMethods, setSelMethods] = useState<Set<string>>(new Set());
  const [selIngredients, setSelIngredients] = useState<Set<string>>(new Set());
  const [maxTime, setMaxTime] = useState(240);
  const [showIngSearch, setShowIngSearch] = useState(false);
  const [ingQuery, setIngQuery] = useState("");

  const filteredIng = ingQuery.length > 0 ? ALL_INGREDIENTS.filter((i) => i.toLowerCase().includes(ingQuery.toLowerCase())) : ALL_INGREDIENTS;

  const toggleMethod = (id: string) =>
    setSelMethods((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleIng = (name: string) =>
    setSelIngredients((prev) => {
      const n = new Set(prev);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });

  const results = useMemo(
    () =>
      RECIPES.filter((r) => {
        if (selMethods.size > 0 && !r.methods.some((m) => selMethods.has(m))) return false;
        if (selIngredients.size > 0) {
          const ingNames = r.ingredients.map((i) => i.name.toLowerCase());
          if (![...selIngredients].some((si) => ingNames.some((n) => n.includes(si)))) return false;
        }
        if (r.timeMin > maxTime) return false;
        return true;
      }),
    [selMethods, selIngredients, maxTime, RECIPES],
  );

  const formatTime = (min: number) => {
    if (min < 60) return `${min} ${t("min")}`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h}${t("hour")}` : `${h}${t("hour")}${m}${t("min")}`;
  };

  const hasFilters = selMethods.size > 0 || selIngredients.size > 0 || maxTime < 240;

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    router.push(`/recipe/${recipe.id}`);
  };

  const resetFilters = () => {
    setSelMethods(new Set());
    setSelIngredients(new Set());
    setMaxTime(240);
  };

  const timeLabels = [t("timeLabel1"), t("timeLabel2"), t("timeLabel3"), t("timeLabel4")];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <View style={[styles.headerRow, isRTL && styles.headerRowRTL]}>
            <View style={[styles.headerLeft, isRTL && styles.headerLeftRTL]}>
              <Text style={styles.greeting}>{t("exploreTagline")}</Text>
              <Text style={[styles.title, isRTL && styles.titleRTL]}>
                {t("exploreTitle1")} <Text style={styles.titleItalic}>{t("exploreTitle2")}</Text>
              </Text>
            </View>
            {hasFilters && (
              <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
                <Feather name="x" size={14} color={colors.primary} />
                <Text style={styles.resetText}>{t("reset")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.filtersContainer}>
          {/* Cooking Methods */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, isRTL && styles.filterLabelRTL]}>{t("cookingMethodLabel")}</Text>
            <View style={[styles.methodsGrid, isRTL && styles.methodsGridRTL]}>
              {COOKING_METHODS_TRANSLATED.map((m) => {
                const active = selMethods.has(m.id);
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.methodButton, active && styles.methodButtonActive, isRTL && styles.methodButtonRTL]}
                    onPress={() => toggleMethod(m.id)}
                    activeOpacity={0.7}
                  >
                    <Feather name={m.icon as any} size={16} color={active ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.methodButtonText, active && styles.methodButtonTextActive]}>{m.label}</Text>
                    {active && <Feather name="check" size={12} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.filterSection}>
            <View style={[styles.ingredientHeader, isRTL && styles.ingredientHeaderRTL]}>
              <Text style={[styles.filterLabel, isRTL && styles.filterLabelRTL]}>{t("availableIng")}</Text>
              <TouchableOpacity onPress={() => setShowIngSearch(!showIngSearch)}>
                <Text style={styles.toggleSearchText}>{showIngSearch ? t("hideBtn") : t("searchBtn")}</Text>
              </TouchableOpacity>
            </View>

            {showIngSearch && (
              <View style={[styles.searchInputContainer, isRTL && styles.searchInputContainerRTL]}>
                <Feather name="search" size={14} color={colors.mutedForeground} />
                <TextInput
                  value={ingQuery}
                  onChangeText={setIngQuery}
                  placeholder={t("ingSearchPlaceholder")}
                  style={[styles.searchInput, isRTL && styles.searchInputRTL]}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            )}

            {selIngredients.size > 0 && (
              <View style={[styles.selectedIngredients, isRTL && styles.selectedIngredientsRTL]}>
                {[...selIngredients].map((ing) => (
                  <TouchableOpacity key={ing} style={styles.selectedIngredient} onPress={() => toggleIng(ing)}>
                    <Text style={styles.selectedIngredientText}>{ing}</Text>
                    <Feather name="x" size={12} color={colors.white} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={[styles.ingredientsList, isRTL && styles.ingredientsListRTL]}>
              {filteredIng
                .filter((i) => !selIngredients.has(i))
                .slice(0, 18)
                .map((ing) => (
                  <TouchableOpacity key={ing} style={styles.ingredientChip} onPress={() => toggleIng(ing)}>
                    <Text style={styles.ingredientChipText}>{ing}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* Time */}
          <View style={styles.filterSection}>
            <View style={[styles.timeHeader, isRTL && styles.timeHeaderRTL]}>
              <Text style={[styles.filterLabel, isRTL && styles.filterLabelRTL]}>{t("maxTimeLabel")}</Text>
              <Text style={styles.timeValue}>{maxTime >= 240 ? t("unlimited") : formatTime(maxTime)}</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={240}
                step={5}
                value={maxTime}
                onValueChange={(value) => setMaxTime(value)}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
            </View>
            <View style={[styles.timeLabels, isRTL && styles.timeLabelsRTL]}>
              {timeLabels.map((label, index) => (
                <Text key={index} style={styles.timeLabel}>
                  {label}
                </Text>
              ))}
            </View>
          </View>

          {/* Results */}
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsCount, isRTL && styles.resultsCountRTL]}>{t("recipesFound", results.length)}</Text>
            {results.length === 0 ? (
              <View style={styles.noResults}>
                <Feather name="sliders" size={40} color={colors.mutedForeground} />
                <Text style={[styles.noResultsText, isRTL && styles.noResultsTextRTL]}>{t("noResults")}</Text>
              </View>
            ) : (
              <View style={[styles.recipesGrid, isRTL && styles.recipesGridRTL]}>
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
          </View>
        </View>
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
    // RTL specific header styles
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerRowRTL: {
    flexDirection: "row-reverse",
  },
  headerLeft: {
    flex: 1,
  },
  headerLeftRTL: {
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
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  resetText: {
    fontSize: 10,
    color: colors.primary,
    ...typography.monoSmall,
  },
  filtersContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  filterSection: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  filterLabel: {
    fontSize: 10,
    color: colors.mutedForeground,
    ...typography.monoSmall,
    marginBottom: spacing.md,
  },
  filterLabelRTL: {
    textAlign: "right",
  },
  methodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  methodsGridRTL: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    flex: 1,
    minWidth: "30%",
    justifyContent: "center",
  },
  methodButtonRTL: {
    flexDirection: "row-reverse",
  },
  methodButtonActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  methodButtonText: {
    fontSize: 11,
    color: colors.mutedForeground,
    ...typography.monoSmall,
  },
  methodButtonTextActive: {
    color: colors.primary,
  },
  ingredientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  ingredientHeaderRTL: {
    flexDirection: "row-reverse",
  },
  toggleSearchText: {
    fontSize: 10,
    color: colors.primary,
    ...typography.monoSmall,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInputContainerRTL: {
    flexDirection: "row-reverse",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.foreground,
    padding: 0,
  },
  searchInputRTL: {
    textAlign: "right",
  },
  selectedIngredients: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  selectedIngredientsRTL: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  selectedIngredient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  selectedIngredientText: {
    fontSize: 10,
    color: colors.white,
    ...typography.monoSmall,
  },
  ingredientsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  ingredientsListRTL: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  ingredientChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
  },
  ingredientChipText: {
    fontSize: 10,
    color: colors.foreground,
    ...typography.monoSmall,
  },
  timeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  timeHeaderRTL: {
    flexDirection: "row-reverse",
  },
  timeValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    ...typography.mono,
  },
  sliderContainer: {
    marginVertical: spacing.sm,
    paddingHorizontal: 4,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  timeLabelsRTL: {
    flexDirection: "row-reverse",
  },
  timeLabel: {
    fontSize: 9,
    color: colors.mutedForeground,
    ...typography.monoSmall,
  },
  resultsContainer: {
    marginTop: spacing.sm,
  },
  resultsCount: {
    fontSize: 10,
    color: colors.mutedForeground,
    ...typography.monoSmall,
    marginBottom: spacing.md,
  },
  resultsCountRTL: {
    textAlign: "right",
  },
  noResults: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
  },
  noResultsText: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 20,
  },
  noResultsTextRTL: {
    textAlign: "center",
  },
  recipesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  recipesGridRTL: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
});
