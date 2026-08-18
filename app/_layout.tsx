// app/_layout.tsx
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { I18nManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "../src/hooks/useFonts";
import { TranslationProvider } from "../src/hooks/useTranslation";
import { colors } from "../src/theme";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsLoaded = useFonts();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Reset RTL on app start
  useEffect(() => {
    // Force LTR for all languages
    if (I18nManager.isRTL) {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TranslationProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="search"
            options={{
              headerShown: false,
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </TranslationProvider>
  );
}
