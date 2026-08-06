export const formatQtyLabel = (
  ing: { qty: number | null; unit: string; name: string },
  base: number,
  current: number,
  unitMode: "g" | "bol",
): string => {
  if (ing.qty === null) return "—";
  const scaled = ing.qty * (current / base);
  const isVolumeOrWeight = ["g", "ml"].includes(ing.unit);

  if (unitMode === "bol" && isVolumeOrWeight) {
    const bols = scaled / 250;
    const rounded = Math.round(bols * 4) / 4;
    return `${rounded < 0.1 ? "< ¼" : rounded} bol`;
  }

  const display = scaled % 1 === 0 ? `${scaled}` : `${+scaled.toFixed(1)}`;
  return `${display} ${ing.unit}`;
};

export const getDifficultyLevel = (level: string): number => {
  const map: Record<string, number> = { Facile: 1, Moyen: 2, Difficile: 3 };
  return map[level] ?? 1;
};

export const formatTime = (min: number): string => {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${m}`;
};
