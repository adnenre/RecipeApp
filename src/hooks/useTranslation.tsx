// hooks/useTranslation.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ActivityIndicator, I18nManager, Text, View } from "react-native";
import { Lang, UI } from "../utils/translations";

interface TranslationContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, ...args: any[]) => string;
  isRTL: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const LANG_STORAGE_KEY = "app-language";
const RTL_LANGUAGES: Lang[] = ["ar"];

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("fr");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(LANG_STORAGE_KEY);
        if (savedLang && ["fr", "en", "ar"].includes(savedLang)) {
          setLang(savedLang as Lang);
        }
      } catch (error) {
        console.error("Failed to load language:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguage();
  }, []);

  useEffect(() => {
    if (I18nManager.isRTL) {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }
  }, []);

  const handleSetLang = async (newLang: Lang) => {
    setLang(newLang);
    try {
      await AsyncStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  };

  const t = (key: string, ...args: any[]): string => {
    const translation = UI[lang][key as keyof typeof UI.fr];

    if (typeof translation === "function") {
      return (translation as (...args: any[]) => string).apply(null, args);
    }

    return (translation as string) || key;
  };

  const isRTL = RTL_LANGUAGES.includes(lang);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 12, color: "#666" }}>Loading language...</Text>
      </View>
    );
  }

  return (
    <TranslationContext.Provider
      value={{
        lang,
        setLang: handleSetLang,
        t,
        isRTL,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }
  return context;
};
