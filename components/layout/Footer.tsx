import React from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { IconType, Icons } from "@/constants/icons";
import { useDescartarCambios } from "@/context/DescartarCambios";

function usarDescartarCambios(pathname: string): boolean {
  return pathname.includes("/objetivo") || pathname.includes("/entrada");
}

//ITEM: FOOTER
const FooterItem = ({
  iconName,
  label,
  isActive,
  onPress,
}: {
  iconName: IconType;
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} className="flex-1 items-center justify-center">
    {({ pressed }) => (
      <View className="items-center">
        <Ionicons
          name={iconName}
          size={24}
          color={pressed ? colors.mediumdarkgrey : isActive ? colors.white : colors.mediumgrey}
        />
        <Text
          className="text-xs mt-1"
          style={{ color: pressed ? colors.mediumdarkgrey : isActive ? colors.white : colors.mediumgrey }}
        >
          {label}
        </Text>
      </View>
    )}
  </Pressable>
);

//FOOTER
export function Footer() {

  const { handleDescartarCambios } = useDescartarCambios();
  const router = useRouter();
  const pathname = usePathname();
  const { paciente } = useLocalSearchParams();
  const { user } = useAuth();
  const isProfesional = user?.role === "profesional";
  const isCuidador = user?.role === "cuidador";
  
  if (!paciente || (!isProfesional && !isCuidador)) return null;

  const items = isProfesional
    ? [
        { route: `/profesional/${paciente}`, iconName: Icons["inicio"].iconName, label: Icons["inicio"].label },
        { route: `/profesional/${paciente}/plan`, iconName: Icons["plan"].iconName, label: Icons["plan"].label },
        { route: `/profesional/${paciente}/bitacora`, iconName: Icons["bitacora"].iconName, label: Icons["bitacora"].label },
        { route: `/profesional/${paciente}/chat`, iconName: Icons["chat"].iconName, label: Icons["chat"].label },
      ]
    : [
        { route: `/cuidador/${paciente}`, iconName: Icons["inicio"].iconName, label: Icons["inicio"].label },
        { route: `/cuidador/${paciente}/plan`, iconName: Icons["plan"].iconName, label: Icons["plan"].label },
        { route: `/cuidador/${paciente}/bitacora`, iconName: Icons["bitacora"].iconName, label: Icons["bitacora"].label },
        { route: `/cuidador/${paciente}/calendario`, iconName: Icons["calendario"].iconName, label: Icons["calendario"].label },
      ];

  return (

    <View className="bg-primary rounded-lg mx-4 mb-4 h-[70px] absolute bottom-0 left-0 right-0 flex-row">

      {items.map((item) => {
        const isActive =
          item.label === "Inicio"
            ? pathname === item.route
            : pathname === item.route || pathname.startsWith(item.route + "/");
        return (
          <FooterItem
            key={item.route}
            iconName={item.iconName}  
            label={item.label}
            isActive={isActive}
            onPress={() => {
              if (handleDescartarCambios && usarDescartarCambios(pathname)) {
                handleDescartarCambios(item.route);
              } else {
                router.push(item.route);
              }
            }}
          />
        );
      })}

    </View>

  );

}