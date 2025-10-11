import React from "react";
import { Text, View } from "react-native";
import { IconType } from "@/constants/icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/constants/colors";

interface EtiquetaProps {
  fondoColor?: string;
  texto: string;
  textoColor?: string;
  iconoNombre?: IconType;
  iconoColor?: string;
}
export function Etiqueta({
  fondoColor = colors.primary,
  texto,
  textoColor = colors.white,
  iconoNombre,
  iconoColor = colors.white,
}: EtiquetaProps) {
  return (
    <View
      style={{ backgroundColor: fondoColor }}
      className="w-full rounded-full p-2 flex-row items-center justify-center gap-1"
    >
      {iconoNombre && (
        <Ionicons
          name={iconoNombre}
          size={20}
          color={iconoColor}
        />
      )}
      <Text style={{ color: textoColor }} className="font-semibold">
        {texto}
      </Text>
    </View>
  );
}
