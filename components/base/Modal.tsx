import { Dimensions, Modal, Pressable, ScrollView, View } from "react-native";
import { colors } from "@/constants/colors";
import { BotonEsquinaSuperior } from "@/components/base/Boton";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const modalHeight = screenHeight * 0.9;

interface CustomModalProps {
  tipo: "x" | "-x" | "y" | "-y" | "0" | "1" | "2" | "expandible";
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  fondoColor?: string;
  iconoColor?: string;
  bordeColor?: string;
}

export function CustomModal({
  tipo,
  visible,
  onClose,
  children,
  fondoColor = colors.light,
  iconoColor = colors.black,
  bordeColor,
}: CustomModalProps) {

  if (!visible) return null;

  // Configuración de posiciones y tamaños según tipo
  let left, right, top, width;
  switch (tipo) {
    case "expandible":
      left = screenWidth * 0.1; right = undefined; width = screenWidth * 0.8; top = screenHeight * 0.2; break;
  }

  if (tipo === "x" || tipo === "-x" || tipo === "y" || tipo === "-y" || tipo === "0" || tipo === "1" || tipo === "2") {
  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.40)" }}
        onPress={onClose}
      />
      <View
        style={{
          position: "absolute",
          left: 
            tipo === "0" || tipo === "1" ? screenWidth * 0.1 :
            tipo === "-x" ? 0 :
            undefined,
          right:
            tipo === "x" ? 0 :
            undefined,
          top: 
            tipo === "1" ? (screenHeight - screenHeight * 0.3) / 2 :
            tipo === "0" ? screenHeight * 0.2 : 
            tipo === "-y" ? screenHeight - modalHeight :
            0,
          bottom: 0,
          width:
            tipo === "-x" ? "80%" :
            tipo === "x" ? "88%" :
            tipo === "-y" ? "100%":
            tipo === "0" ? screenWidth * 0.8 :
            tipo === "1" ? screenWidth * 0.8 :
            "100%",
          height:
            tipo === "-x" ? "100%" :
            tipo === "-y" ? modalHeight:
            tipo === "0" ? screenHeight * 0.6 :
            tipo === "1" ? screenHeight * 0.3 :
            "100%",
          backgroundColor: fondoColor,
          borderTopRightRadius: 
            tipo === "-x" ? 20 :
            tipo === "-y" ? 20 :
            tipo === "0" ? 20 :
            tipo === "1" ? 20 :
            0,
          borderBottomRightRadius:
            tipo === "-x" ? 20 :
            tipo === "-y" ? 0 :
            tipo === "0" ? 20 :
            tipo === "1" ? 20 :
            0,
          borderTopLeftRadius:
            tipo === "-x" ? 0 :
            tipo === "x" ? 20 :
            tipo === "-y" ? 20 :
            tipo === "0" ? 20 :
            tipo === "1" ? 20 :
            0,
          borderBottomLeftRadius:
            tipo === "-x" ? 0 :
            tipo === "x" ? 20 :
            tipo === "-y" ? 0 :
            tipo === "0" ? 20 :
            tipo === "1" ? 20 :
            0,
          paddingVertical: 8,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        }}
      >
        <BotonEsquinaSuperior
          onPress={onClose}
          fondoBoton={fondoColor}
          iconName={"close"}
          color={iconoColor}
          tipo={
            tipo === "-x" ? "izquierda" :
            tipo === "x" ? "derecha" :
            tipo === "-y" ? "derecha" :
            tipo === "0" ? "derecha" :
            tipo === "1" ? "derecha" :
            tipo === "2" ? "derecha" :
            "izquierda"
          }
        />
        <View className="flex-1 p-4 mt-8">
          {children}
        </View>
      </View>
    </Modal>
  );} else {
    return (
      <Modal visible={visible} transparent animationType="none">
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={onClose}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 16,
          }}
        >
        <View
          className="rounded-lg py-4"
          style={{
            width: screenWidth * 0.8,      // ancho fijo relativo a pantalla
            maxHeight: screenHeight * 0.8, // máximo 80% altura
            backgroundColor: fondoColor,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8,
            overflow: "hidden",
            borderWidth: bordeColor ? 4 : 0,
            borderColor: bordeColor || "transparent",
          }}
        >
          <BotonEsquinaSuperior
            tipo="derecha"
            onPress={onClose}
            iconName="close"
            color={iconoColor}
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-1 p-4 mt-8">
              {children}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );}
}