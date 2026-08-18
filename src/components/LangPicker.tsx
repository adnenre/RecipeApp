// components/LangPicker.tsx
import { Lang } from "@/utils/translations";
import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "../hooks/useTranslation";
interface LangOption {
  id: Lang;
  code: string;
  native: string;
}

const options: LangOption[] = [
  { id: "fr", code: "FR", native: "Français" },
  { id: "en", code: "EN", native: "English" },
  { id: "ar", code: "AR", native: "العربية" },
];

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
const BRAND_COLOR = "#c24b2a";

export const LangPicker: React.FC = () => {
  const { lang, setLang } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<View>(null);

  const selectedOption: LangOption | undefined = options.find((o: LangOption) => o.id === lang);

  const measureAndOpen = (): void => {
    if (triggerRef.current) {
      triggerRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        // Calculate dropdown height
        const dropdownHeight = Math.min(200, options.length * 44 + 8);

        // Check space below and above
        const spaceBelow = screenHeight - (pageY + height + 10);
        const spaceAbove = pageY - 10;

        let topPosition: number;

        if (spaceBelow >= dropdownHeight) {
          topPosition = pageY + height + 5;
        } else if (spaceAbove >= dropdownHeight) {
          topPosition = pageY - dropdownHeight - 5;
        } else {
          topPosition = pageY + height + 5;
        }

        // Horizontal positioning
        const dropdownWidth = Math.max(180, Math.min(width, 220));
        let leftPosition = pageX;

        if (leftPosition + dropdownWidth > screenWidth - 10) {
          leftPosition = screenWidth - dropdownWidth - 10;
        }
        if (leftPosition < 10) {
          leftPosition = 10;
        }

        setDropdownPosition({
          top: topPosition,
          left: leftPosition,
          width: dropdownWidth,
        });

        setIsOpen(true);
      });
    }
  };

  const handleToggle = (): void => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      measureAndOpen();
    }
  };

  const handleSelectLang = (langId: Lang): void => {
    setLang(langId);
    setIsOpen(false);
  };

  const handleClose = (): void => {
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity style={styles.trigger} onPress={handleToggle} activeOpacity={0.7}>
          <Feather name="globe" size={16} color="#666" />
          <Text style={styles.code}>{selectedOption?.code || "FR"}</Text>
          <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={14} color="#666" />
        </TouchableOpacity>
      </View>

      {isOpen && (
        <Modal transparent={true} visible={isOpen} animationType="fade" onRequestClose={handleClose} statusBarTranslucent={true}>
          <Pressable style={styles.overlay} onPress={handleClose}>
            <View
              style={[
                styles.dropdown,
                {
                  position: "absolute",
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                },
              ]}
            >
              <ScrollView
                style={styles.dropdownScroll}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                {options.map((item: LangOption) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.option, item.id === lang && styles.selectedOption]}
                    onPress={() => handleSelectLang(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionCode, item.id === lang && styles.selectedText]}>{item.code}</Text>
                    <Text style={[styles.optionNative, item.id === lang && styles.selectedText]}>{item.native}</Text>
                    {item.id === lang && <Feather name="check" size={16} color={BRAND_COLOR} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
    position: "relative",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  code: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 200,
    overflow: "hidden",
  },
  dropdownScroll: {
    borderRadius: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    minHeight: 44,
  },
  selectedOption: {
    backgroundColor: `${BRAND_COLOR}15`, // 15% opacity of brand color
  },
  optionCode: {
    fontSize: 12,
    fontWeight: "600",
    width: 30,
    color: "#666",
  },
  optionNative: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  selectedText: {
    color: BRAND_COLOR,
    fontWeight: "600",
  },
});
