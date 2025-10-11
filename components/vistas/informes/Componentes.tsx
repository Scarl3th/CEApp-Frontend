import React from "react";
import { View, Text } from "react-native";
import { colors } from "@/constants/colors";

interface EspacioUsadoBarraProps {
  espacioUsado: number;
  espacioMaximo: number;
}
export const EspacioUsadoBarra: React.FC<EspacioUsadoBarraProps> = ({ espacioUsado, espacioMaximo }) => {
  const porcentajeUsado = Math.min((espacioUsado / espacioMaximo) * 100, 100);
  let colorBarra = colors.mediumgreen;
  if (porcentajeUsado > 75 && porcentajeUsado <= 90) {
    colorBarra = colors.mediumyellow;
  } else if (porcentajeUsado > 90) {
    colorBarra = colors.mediumred;
  }
  return (
    <View className="my-2 gap-1">
      <Text
        className="text-sm text-right"
        style={{ color: colors.mediumgrey }}
      >
        {`Tu espacio usado en el plan: ${(espacioUsado / (1024 * 1024)).toFixed(2)} MB / ${(espacioMaximo / (1024 * 1024)).toFixed(0)} MB`}
      </Text>
      <View
        className="h-3 rounded-full"
        style={{
          backgroundColor: colors.lightgrey,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${porcentajeUsado}%`,
            backgroundColor: colorBarra,
          }}
        />
      </View>
    </View>
  );
};
