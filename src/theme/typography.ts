import { TextStyle } from "react-native";

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: "600" as const,
    fontFamily: "PlayfairDisplay_600SemiBold",
    lineHeight: 34,
  } as TextStyle,
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
    fontFamily: "PlayfairDisplay_600SemiBold",
    lineHeight: 30,
  } as TextStyle,
  h3: {
    fontSize: 20,
    fontWeight: "500" as const,
    fontFamily: "PlayfairDisplay_500Medium",
    lineHeight: 26,
  } as TextStyle,
  h4: {
    fontSize: 18,
    fontWeight: "500" as const,
    fontFamily: "PlayfairDisplay_500Medium",
    lineHeight: 24,
  } as TextStyle,
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    fontFamily: "DMSans_400Regular",
    lineHeight: 24,
  } as TextStyle,
  bodySmall: {
    fontSize: 14,
    fontWeight: "400" as const,
    fontFamily: "DMSans_400Regular",
    lineHeight: 20,
  } as TextStyle,
  mono: {
    fontSize: 12,
    fontWeight: "400" as const,
    fontFamily: "DMMono_400Regular",
    lineHeight: 16,
  } as TextStyle,
  monoSmall: {
    fontSize: 10,
    fontWeight: "400" as const,
    fontFamily: "DMMono_400Regular",
    lineHeight: 14,
  } as TextStyle,
  button: {
    fontSize: 16,
    fontWeight: "500" as const,
    fontFamily: "DMSans_500Medium",
    lineHeight: 20,
  } as TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    fontFamily: "DMSans_400Regular",
    lineHeight: 16,
    color: "#7a6552",
  } as TextStyle,
};

export type TypographyKey = keyof typeof typography;
