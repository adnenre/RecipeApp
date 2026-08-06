// app/recipe/[id].tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppStore } from "../../src/store/useAppStore";
import { RECIPES } from "../../src/data/recipes";
import { COOKING_METHODS } from "../../src/types";
import { formatQtyLabel } from "../../src/utils/helpers";
import { colors, typography, spacing } from "../../src/theme";

export default function RecipeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { favorites, toggleFavorite } = useAppStore();

  const recipe = RECIPES.find((r) => r.id === Number(id));
  const isFav = recipe ? favorites.has(recipe.id) : false;

  const [tab, setTab] = useState<"ingredients" | "steps">("ingredients");
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [servings, setServings] = useState(recipe?.servings || 1);
  const [unitMode, setUnitMode] = useState<"g" | "bol">("g");
  const [method, setMethod] = useState(recipe?.methods[0] ?? "");

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recette non trouvée</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Retour</Text>
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

  const currentMethod = COOKING_METHODS.find((m) => m.id === method);

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
            <Feather name="heart" size={24} color={isFav ? colors.primary : colors.foreground} fill={isFav ? colors.primary : "none"} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Tags */}
          <View style={styles.tagsContainer}>
            {recipe.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.description}>{recipe.description}</Text>

          {/* Settings Container */}
          <View style={styles.settingsContainer}>
            {/* Servings */}
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Personnes</Text>
                <Text style={styles.settingValue}>{servings} pers.</Text>
              </View>
              <View style={styles.quantityControls}>
                <TouchableOpacity style={styles.quantityButton} onPress={() => setServings((v) => Math.max(1, v - 1))}>
                  <Feather name="minus" size={16} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{servings}</Text>
                <TouchableOpacity style={styles.quantityButton} onPress={() => setServings((v) => Math.min(20, v + 1))}>
                  <Feather name="plus" size={16} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Unit */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Unité de mesure</Text>
              <View style={styles.unitContainer}>
                {(["g", "bol"] as ("g" | "bol")[]).map((u) => (
                  <TouchableOpacity key={u} style={[styles.unitButton, unitMode === u && styles.unitButtonActive]} onPress={() => setUnitMode(u)}>
                    <Text style={[styles.unitButtonText, unitMode === u && styles.unitButtonTextActive]}>
                      {u === "g" ? "Grammes / ml" : "Bols (250 ml)"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cooking Methods */}
            {recipe.methods.length > 0 && (
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Mode de cuisson</Text>
                <View style={styles.methodsContainer}>
                  {recipe.methods.map((mid) => {
                    const m = COOKING_METHODS.find((cm) => cm.id === mid);
                    if (!m) return null;
                    return (
                      <TouchableOpacity
                        key={mid}
                        style={[styles.methodButton, method === mid && styles.methodButtonActive]}
                        onPress={() => setMethod(mid)}
                      >
                        <Feather name={m.icon as any} size={16} color={method === mid ? colors.white : colors.foreground} />
                        <Text style={[styles.methodButtonText, method === mid && styles.methodButtonTextActive]}>{m.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {currentMethod?.hasTemp && (
                  <Text style={styles.tempText}>
                    Température conseillée : <Text style={styles.tempValue}>180 °C</Text>
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {(["ingredients", "steps"] as ("ingredients" | "steps")[]).map((t) => (
              <TouchableOpacity key={t} style={[styles.tabButton, tab === t && styles.tabButtonActive]} onPress={() => setTab(t)}>
                <Text style={[styles.tabButtonText, tab === t && styles.tabButtonTextActive]}>{t === "ingredients" ? "Ingrédients" : "Étapes"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ingredients Tab */}
          {tab === "ingredients" && (
            <View style={styles.ingredientsContainer}>
              {servings !== recipe.servings && (
                <View style={styles.adjustmentNotice}>
                  <Text style={styles.adjustmentText}>
                    Quantités ajustées pour {servings} pers. (base {recipe.servings})
                  </Text>
                </View>
              )}
              {recipe.ingredients.map((ing, i) => (
                <View key={i} style={styles.ingredientItem}>
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <Text style={styles.ingredientQty}>{formatQtyLabel(ing, recipe.servings, servings, unitMode)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Steps Tab */}
          {tab === "steps" && (
            <View style={styles.stepsContainer}>
              {recipe.steps.map((step, i) => (
                <TouchableOpacity key={i} style={[styles.stepItem, checkedSteps.has(i) && styles.stepItemChecked]} onPress={() => toggleStep(i)}>
                  <View style={styles.stepIcon}>
                    {checkedSteps.has(i) ? (
                      <Feather name="check-circle" size={20} color={colors.primary} />
                    ) : (
                      <Feather name="circle" size={20} color={colors.mutedForeground} />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepNumber}>Étape {i + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                </TouchableOpacity>
              ))}
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
  settingsContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  settingRow: {
    marginBottom: spacing.lg,
  },
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
    gap: spacing.sm,
  },
  unitButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    alignItems: "center",
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
    gap: spacing.sm,
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
    gap: spacing.xs,
  },
  methodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.foreground,
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
    gap: spacing.sm,
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
    gap: spacing.md,
  },
  stepItem: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  stepItemChecked: {
    opacity: 0.5,
  },
  stepIcon: {
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepNumber: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "600",
    ...typography.monoSmall,
    marginBottom: 2,
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
});
