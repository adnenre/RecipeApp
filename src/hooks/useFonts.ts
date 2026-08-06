import { useEffect, useState } from "react";
import * as Font from "expo-font";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from "@expo-google-fonts/dm-sans";
import { DMMono_400Regular, DMMono_500Medium } from "@expo-google-fonts/dm-mono";

export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          PlayfairDisplay_400Regular,
          PlayfairDisplay_500Medium,
          PlayfairDisplay_600SemiBold,
          PlayfairDisplay_700Bold,

          DMSans_400Regular,
          DMSans_500Medium,
          DMSans_700Bold,
          DMMono_400Regular,
          DMMono_500Medium,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("Error loading fonts:", error);
        setFontsLoaded(true); // Still set to true to avoid blocking the app
      }
    }
    loadFonts();
  }, []);

  return fontsLoaded;
};
