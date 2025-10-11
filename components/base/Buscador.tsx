import { View, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";

interface BuscadorProps {
  busqueda: string;
  setBusqueda: (text: string) => void;
  placeholder?: string;
  icono?: boolean;
}
export function Buscador({
  busqueda,
  setBusqueda,
  placeholder = "Buscar...",
  icono,
}: BuscadorProps) {
  return (
    <View className="bg-lightgrey rounded-lg px-4 mb-2 flex-row items-center">
      {icono && (
        <View className="mr-2">
          <Ionicons name={Icons["busqueda"].iconName} size={20} color={colors.mediumgrey}/>
        </View>
      )}
      <TextInput
        value={busqueda}
        onChangeText={setBusqueda}
        placeholder={placeholder}
        className="flex-1 py-2"
      />
    </View>
  );
}