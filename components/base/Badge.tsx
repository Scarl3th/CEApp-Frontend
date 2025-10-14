import React from "react";
import { Text, View } from "react-native";

//BADGE
interface BadgeProps {
  fondoColor: string;
  texto: string;
  textoColor: string;
}
export function Badge({
  fondoColor,
  texto,
  textoColor,
}: BadgeProps) {
  return (
    <View
      className="rounded-bl-lg mt-2 px-2 py-1 absolute top-0 right-0.5 z-10"
      style={{ backgroundColor: fondoColor }}
    >
      <Text className="text-xs font-bold"
        style={{ color: textoColor }}
      >
          {texto}
      </Text>
    </View>
  );
}