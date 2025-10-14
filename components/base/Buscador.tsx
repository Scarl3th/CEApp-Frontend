import { colors } from "@/constants/colors";
import { Icons } from "@/constants/icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TextInput, View } from "react-native";

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
        className="flex-1 py-2"
        style={{ color: colors.black }}
        value={busqueda}
        onChangeText={setBusqueda}
        placeholder={placeholder}
        placeholderTextColor={colors.mediumdarkgrey}
      />
    </View>
  );
}