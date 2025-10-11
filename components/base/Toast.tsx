import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";

interface CustomToastProps {
  text1: string;
  text2?: string;
  type?: "success" | "error";
  duration?: number;
  onHide?: () => void;
}
export const CustomToast = ({
  text1,
  text2,
  type = "success",
  duration = 4000,
  onHide,
}: CustomToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onHide?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [text1, text2, duration, onHide]);

  const borderColor = type === "success" ? colors.mediumgreen : colors.mediumred;
  const backgroundColor = type === "success" ? colors.lightgreen : colors.lightred;

  return (
    <View 
      className="absolute bottom-4 left-4 right-4"
      style={{
        elevation: 9999,
        zIndex: 9999,
      }}
    >
      <View
        className="px-4 py-4 rounded-lg flex-row items-center justify-between"
        style={{
          backgroundColor: backgroundColor,
          borderLeftWidth: 8,
          borderLeftColor: borderColor,
        }}
      >
        <View className="flex-1 gap-1">
          <Text className="text-black text-base font-bold">{text1}</Text>
          {text2 && <Text className="text-black text-sm">{text2}</Text>}
        </View>
        <Pressable onPress={onHide}>
          {({ pressed }) => (
            <View
              className="rounded-full p-1"
              style={{ backgroundColor: pressed ? colors.mediumlightgrey : backgroundColor }}
            >
              <Ionicons name={Icons["cerrar"].iconName} size={24} color="black"/>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};