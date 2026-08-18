// app/recipe/[id].tsx
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeartIcon } from "../../src/components/common/Heart";
import { useTranslation } from "../../src/hooks/useTranslation";
import { useAppStore } from "../../src/store/useAppStore";
import { colors, spacing, typography } from "../../src/theme";
import {
  COOKING_METHODS,
  type Ingredient,
  getMethodIcon,
  getMethodLabel,
  getMethodTemperature,
  getPrimaryCookingMethod,
  getRecipeCookingMethods,
  methodHasTemp,
} from "../../src/types";

export default function RecipeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, isRTL } = useTranslation();
  const { recipes: RECIPES, favorites, toggleFavorite } = useAppStore();

  // 🔥 Trouver la recette avec l'ID (string)
  const recipe = RECIPES.find((r) => String(r.id) === id);
  const isFav = recipe ? favorites.has(recipe.id) : false;

  const [tab, setTab] = useState<"ingredients" | "steps">("ingredients");
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [servings, setServings] = useState(recipe?.servings || 1);
  const [unitMode, setUnitMode] = useState<"g" | "bol">("g");
  const [method, setMethod] = useState(recipe?.methods?.[0] ?? "");

  // Reset checked steps when recipe changes
  useEffect(() => {
    if (recipe) {
      setCheckedSteps(new Set());
      setServings(recipe.servings || 1);
      setMethod(recipe.methods?.[0] ?? "");
    }
  }, [recipe]);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t("recipeNotFound")}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>{t("back")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleStep = (i: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  // 🔥 Get cooking methods using helpers
  const recipeMethods = getRecipeCookingMethods(recipe);
  const primaryMethod = getPrimaryCookingMethod(recipe);
  const currentMethod = primaryMethod || COOKING_METHODS.find((m) => m.id === method);

  // Calculate adjusted quantity based on servings
  const getAdjustedQuantity = (ingredient: Ingredient, baseServings: number, targetServings: number) => {
    if (!ingredient || typeof ingredient.grams !== "number" || isNaN(ingredient.grams)) {
      return 0;
    }
    if (baseServings === targetServings || baseServings === 0) {
      return ingredient.grams;
    }
    return (ingredient.grams / baseServings) * targetServings;
  };

  // ✅ SAFE: Format the ingredient quantity - ALWAYS returns a string
  const formatIngredientQty = (ingredient: any, baseServings: number, targetServings: number, unitMode: "g" | "bol") => {
    if (!ingredient || typeof ingredient !== "object") {
      return `0 ${t("unitG")}`;
    }

    try {
      const adjustedQty = getAdjustedQuantity(ingredient, baseServings, targetServings);

      if (typeof adjustedQty !== "number" || isNaN(adjustedQty) || !isFinite(adjustedQty)) {
        return `0 ${t("unitG")}`;
      }

      const formattedQty = adjustedQty % 1 === 0 ? Math.round(adjustedQty) : adjustedQty.toFixed(1);

      if (unitMode === "bol" && ingredient.unit === "g") {
        const bols = adjustedQty / 250;
        if (isNaN(bols) || !isFinite(bols)) return `0 ${t("unitBol")}`;
        const bolsDisplay = bols % 1 === 0 ? Math.round(bols) : bols.toFixed(1);
        return `${bolsDisplay} ${t("unitBol")}`;
      }

      const unit = ingredient.unit || t("unitG");
      return `${formattedQty} ${unit}`;
    } catch (error) {
      console.warn("Error formatting ingredient qty:", error);
      return `0 ${t("unitG")}`;
    }
  };

  // ✅ SAFE: Get safe ingredients array
  const safeIngredients = useMemo(() => {
    if (!recipe || !recipe.ingredients) return [];
    try {
      let ingredients = recipe.ingredients;

      if (typeof ingredients === "string") {
        try {
          ingredients = JSON.parse(ingredients);
        } catch {
          return [];
        }
      }

      if (Array.isArray(ingredients)) {
        return ingredients
          .filter((ing) => ing && typeof ing === "object")
          .map((ing) => ({
            name: String(ing.name || t("ingredient")),
            grams: typeof ing.grams === "number" ? ing.grams : 0,
            unit: String(ing.unit || t("unitG")),
          }));
      }
      return [];
    } catch (error) {
      console.warn("Error parsing ingredients:", error);
      return [];
    }
  }, [recipe, t]);

  // ✅ SAFE: Get safe steps array with proper string conversion
  const safeSteps = useMemo(() => {
    if (!recipe || !recipe.steps) return [];
    try {
      let steps = recipe.steps;

      if (typeof steps === "string") {
        try {
          steps = JSON.parse(steps);
        } catch {
          return [];
        }
      }

      if (Array.isArray(steps)) {
        return steps
          .filter((step) => step && typeof step === "object")
          .map((step) => ({
            text: String(step.text || ""),
            cooking: typeof step.cooking === "boolean" ? step.cooking : false,
            timerMin: typeof step.timerMin === "number" ? step.timerMin : 0,
          }))
          .filter((step) => step.text.trim().length > 0);
      }
      return [];
    } catch (error) {
      console.warn("Error parsing steps:", error);
      return [];
    }
  }, [recipe]);

  // ✅ Safe render function for step text
  const renderStepText = (text: string) => {
    const safeText = String(text || "");
    return safeText || t("emptyStep");
  };

  // ✅ Safe render function for timer text
  const renderTimerText = (timerMin: number) => {
    const safeTimer = typeof timerMin === "number" && !isNaN(timerMin) ? timerMin : 0;
    return `${safeTimer} ${t("min")}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: recipe.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color={colors.foreground} />
          </TouchableOpacity>

          {/* Favorite Button */}
          <TouchableOpacity style={styles.favButton} onPress={() => toggleFavorite(recipe.id)}>
            <HeartIcon size={24} color={colors.primary} fill={isFav ? colors.primary : "none"} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Tags */}
          <View style={styles.tagsContainer}>
            {(recipe.tags || []).map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{String(tag)}</Text>
              </View>
            ))}
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{String(recipe.title || t("recipe"))}</Text>
          <Text style={styles.description}>{String(recipe.description || "")}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="clock" size={16} color={colors.mutedForeground} />
              <Text style={styles.statText}>{String(recipe.duration || recipe.time || "N/A")}</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="users" size={16} color={colors.mutedForeground} />
              <Text style={styles.statText}>
                {String(recipe.servings || 1)} {t("servingsSuffix")}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="activity" size={16} color={colors.mutedForeground} />
              <Text style={styles.statText}>{String(recipe.difficulty || t("easy"))}</Text>
            </View>
          </View>

          <View style={styles.personNumber}>
            <View>
              <Text style={styles.settingLabel}>{t("servingsLabel")}</Text>
              <Text style={styles.settingValue}>
                {String(servings)} {t("servingsSuffix")}
              </Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity style={styles.quantityButton} onPress={() => setServings((v) => Math.max(1, v - 1))}>
                <Feather name="minus" size={16} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{String(servings)}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={() => setServings((v) => Math.min(20, v + 1))}>
                <Feather name="plus" size={16} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mesureUnit}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{t("unitLabel")}</Text>
              <View style={styles.unitContainer}>
                {(["g", "bol"] as ("g" | "bol")[]).map((u) => (
                  <TouchableOpacity key={u} style={[styles.unitButton, unitMode === u && styles.unitButtonActive]} onPress={() => setUnitMode(u)}>
                    <Text style={[styles.unitButtonText, unitMode === u && styles.unitButtonTextActive]}>
                      {u === "g" ? t("unitG") : t("unitBol")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Settings Container */}
          <View style={styles.cookingCard}>
            {/* 🔥 Cooking Methods - Using Helpers */}
            {recipeMethods.length > 0 && (
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>{t("cookingMethodLabel")}</Text>
                <View style={styles.methodsContainer}>
                  {recipeMethods.map((m) => {
                    const active = method === m.id;
                    return (
                      <TouchableOpacity key={m.id} style={[styles.methodButton, active && styles.methodButtonActive]} onPress={() => setMethod(m.id)}>
                        <Feather name={getMethodIcon(m.id) as any} size={16} color={active ? colors.white : colors.foreground} />
                        <Text style={[styles.methodButtonText, active && styles.methodButtonTextActive]}>{getMethodLabel(m.id)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {currentMethod && methodHasTemp(currentMethod.id) && (
                  <Text style={styles.tempText}>
                    {t("tempLabel")} : <Text style={styles.tempValue}>{getMethodTemperature(currentMethod.id)}</Text>
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Tabs - FIXED: renamed 't' to 'tabKey' to avoid conflict with translation function */}
          <View style={styles.tabsContainer}>
            {(["ingredients", "steps"] as ("ingredients" | "steps")[]).map((tabKey) => (
              <TouchableOpacity key={tabKey} style={[styles.tabButton, tab === tabKey && styles.tabButtonActive]} onPress={() => setTab(tabKey)}>
                <Text style={[styles.tabButtonText, tab === tabKey && styles.tabButtonTextActive]}>
                  {tabKey === "ingredients" ? t("ingredientsTab") : t("stepsTab")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ingredients Tab */}
          {tab === "ingredients" && (
            <View style={styles.ingredientsContainer}>
              {servings !== recipe.servings && (
                <View style={styles.adjustmentNotice}>
                  <Text style={styles.adjustmentText}>{t("adjustedQty", servings, recipe.servings)}</Text>
                </View>
              )}
              {safeIngredients.length > 0 ? (
                safeIngredients.map((ing, i) => (
                  <View key={i} style={styles.ingredientItem}>
                    <Text style={styles.ingredientName}>{String(ing.name || t("ingredient"))}</Text>
                    <Text style={styles.ingredientQty}>{formatIngredientQty(ing, recipe.servings, servings, unitMode)}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{t("noIngredients")}</Text>
                </View>
              )}
            </View>
          )}

          {/* Steps Tab - COMPLETELY SAFE */}
          {tab === "steps" && (
            <View style={styles.stepsContainer}>
              {safeSteps.length > 0 ? (
                safeSteps.map((step, i) => (
                  <TouchableOpacity key={i} style={[styles.stepItem, checkedSteps.has(i) && styles.stepItemChecked]} onPress={() => toggleStep(i)}>
                    <View style={styles.stepIcon}>
                      {checkedSteps.has(i) ? (
                        <Feather name="check-circle" size={20} color={colors.primary} />
                      ) : (
                        <Feather name="circle" size={20} color={colors.mutedForeground} />
                      )}
                    </View>
                    <View style={styles.stepContent}>
                      <View style={styles.stepHeader}>
                        <Text style={styles.stepNumber}>
                          {t("stepPrefix")} {String(i + 1)}
                        </Text>
                        {step.cooking === true && (
                          <View style={styles.cookingBadge}>
                            <Feather name="zap" size={12} color={colors.primary} />
                            <Text style={styles.cookingBadgeText}>{t("cooking")}</Text>
                          </View>
                        )}
                        {typeof step.timerMin === "number" && step.timerMin > 0 && (
                          <View style={styles.timerBadge}>
                            <Feather name="clock" size={12} color={colors.mutedForeground} />
                            <Text style={styles.timerBadgeText}>{renderTimerText(step.timerMin)}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.stepText}>{renderStepText(step.text)}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{t("noSteps")}</Text>
                </View>
              )}
            </View>
          )}
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
  heroContainer: {
    height: 260,
    backgroundColor: colors.secondary,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 8,
  },
  favButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 8,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: 10,
    color: colors.mutedForeground,
    ...typography.monoSmall,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.foreground,
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: colors.mutedForeground,
    ...typography.body,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  personNumber: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  mesureUnit: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  cookingCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  statText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.foreground,
    ...typography.mono,
    marginLeft: spacing.xs,
  },
  settingsContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  settingRow: {},
  settingLabel: {
    fontSize: 10,
    color: colors.mutedForeground,
    ...typography.monoSmall,
    marginBottom: spacing.sm,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.foreground,
    ...typography.h2,
    marginHorizontal: spacing.md,
    width: 32,
    textAlign: "center",
  },
  unitContainer: {
    flexDirection: "row",
  },
  unitButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    alignItems: "center",
    marginRight: spacing.sm,
  },
  unitButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.foreground,
  },
  unitButtonTextActive: {
    color: colors.white,
  },
  methodsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  methodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.foreground,
    marginLeft: spacing.xs,
  },
  methodButtonTextActive: {
    color: colors.white,
  },
  tempText: {
    fontSize: 10,
    color: colors.mutedForeground,
    ...typography.monoSmall,
    marginTop: spacing.sm,
  },
  tempValue: {
    color: colors.foreground,
    fontWeight: "500",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 4,
    marginBottom: spacing.xl,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: colors.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.mutedForeground,
  },
  tabButtonTextActive: {
    color: colors.foreground,
  },
  ingredientsContainer: {
    marginTop: spacing.sm,
  },
  adjustmentNotice: {
    backgroundColor: `${colors.primary}20`,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  adjustmentText: {
    fontSize: 10,
    color: colors.primary,
    ...typography.monoSmall,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
  },
  ingredientQty: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    ...typography.mono,
  },
  stepsContainer: {
    marginTop: spacing.sm,
  },
  stepItem: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  stepItemChecked: {
    opacity: 0.5,
  },
  stepIcon: {
    marginTop: 2,
    marginRight: spacing.md,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  stepNumber: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "600",
    ...typography.monoSmall,
    marginRight: spacing.xs,
  },
  cookingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}20`,
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    marginRight: spacing.xs,
  },
  cookingBadgeText: {
    fontSize: 8,
    color: colors.primary,
    fontWeight: "500",
    ...typography.monoSmall,
    marginLeft: 2,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  timerBadgeText: {
    fontSize: 8,
    color: colors.mutedForeground,
    fontWeight: "500",
    ...typography.monoSmall,
    marginLeft: 2,
  },
  stepText: {
    fontSize: 14,
    color: colors.foreground,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 18,
    color: colors.foreground,
    ...typography.h2,
    marginBottom: spacing.lg,
  },
  errorButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  errorButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.mutedForeground,
    ...typography.body,
  },
});
