// app/(tabs)/_layout.tsx
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "../../src/hooks/useTranslation";
import { colors } from "../../src/theme";

// Define the type for tab bar icon props
type TabBarIconProps = {
  color: string;
  size: number;
  focused: boolean;
};

export default function TabLayout() {
  const { t, isRTL } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.95)",
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "DMMono_400Regular",
          marginTop: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("navHome"),
          tabBarIcon: ({ color, size }: TabBarIconProps) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t("navFavs"),
          tabBarIcon: ({ color, size }: TabBarIconProps) => <Feather name="heart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t("navExplore"),
          tabBarIcon: ({ color, size }: TabBarIconProps) => <Feather name="sliders" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
