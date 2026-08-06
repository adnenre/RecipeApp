import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Recipe } from "../../types";
import { getDifficultyLevel } from "../../utils/helpers";
import { colors, typography, spacing } from "../../theme";

const { width } = Dimensions.get("window");
const cardWidth = (width - 56) / 2;

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: () => void;
  onToggleFav: () => void;
  isFav: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect, onToggleFav, isFav }) => {
  const difficultyLevel = getDifficultyLevel(recipe.difficulty);

  return (
    <TouchableOpacity onPress={onSelect} style={styles.container} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: recipe.image }} style={styles.image} />
        <TouchableOpacity onPress={onToggleFav} style={styles.favButton} activeOpacity={0.8}>
          <Feather name="heart" size={16} color={isFav ? colors.primary : colors.mutedForeground} fill={isFav ? colors.primary : "none"} />
        </TouchableOpacity>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{recipe.category}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>{recipe.time}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{recipe.servings}</Text>
          <Text style={styles.metaDot}>•</Text>
          <View style={styles.difficultyDots}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.difficultyDot, i <= difficultyLevel ? styles.dotActive : styles.dotInactive]} />
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: "relative",
    height: 140,
    backgroundColor: colors.secondary,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 6,
  },
  categoryBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 9,
    color: colors.foreground,
    ...typography.monoSmall,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.foreground,
    ...typography.body,
    marginBottom: 6,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  metaText: {
    fontSize: 10,
    color: colors.mutedForeground,
    ...typography.monoSmall,
  },
  metaDot: {
    fontSize: 10,
    color: colors.mutedForeground,
    marginHorizontal: 4,
  },
  difficultyDots: {
    flexDirection: "row",
    gap: 2,
  },
  difficultyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotInactive: {
    backgroundColor: colors.border,
  },
});
