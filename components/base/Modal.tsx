import { BotonEsquinaSuperior } from "@/components/base/Boton";
import { colors } from "@/constants/colors";
import { Dimensions, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;
const modalHeight = screenHeight * 0.9;

interface CustomModalProps {
  tipo: "x" | "-x" | "y" | "-y" | "0" | "1" | "2" | "expandible" | "tutorial";
  visible: boolean;
  onClose: () => void;
  onCloseOmitir?: boolean;
  children: React.ReactNode;
  fondoColor?: string;
  iconoColor?: string;
  bordeColor?: string;
  tipoTutorialHeight?: number;
}

export function CustomModal({
  tipo,
  visible,
  onClose,
  onCloseOmitir = false,
  children,
  fondoColor = colors.light,
  iconoColor = colors.black,
  bordeColor,
  tipoTutorialHeight = 0.6,
}: CustomModalProps) {

  if (!visible) return null;

  // Configuración de posiciones y tamaños según tipo
  let left, right, top, width;
  switch (tipo) {
    case "expandible":
      left = screenWidth * 0.1; right = undefined; width = screenWidth * 0.8; top = screenHeight * 0.2; break;
  }

  if (tipo === "x" || tipo === "-x" || tipo === "y" || tipo === "-y" || tipo === "0" || tipo === "1" || tipo === "2" || tipo === "tutorial") {
  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.40)" }}
        onPress={onClose}
      />
      <SafeAreaView
        style={{
          position: "absolute",
          left: 
            tipo === "0" || tipo === "tutorial" || tipo === "1" ? screenWidth * 0.05 :
            tipo === "-x" ? 0 :
            undefined,
          right:
            tipo === "x" ? 0 :
            undefined,
          top: 
            tipo === "1" ? (screenHeight - screenHeight * 0.3) / 2 :
            tipo === "0" ? screenHeight * 0.2 : 
            tipo === "tutorial" ? screenHeight * ((1 - tipoTutorialHeight) / 2) :
            tipo === "-y" ? screenHeight - modalHeight :
            0,
          bottom: 0,
          width:
            tipo === "-x" ? "80%" :
            tipo === "x" ? "88%" :
            tipo === "-y" ? "100%":
            tipo === "0" ? screenWidth * 0.8 :
            tipo === "tutorial" ? screenWidth * 0.9 :
            tipo === "1" ? screenWidth * 0.8 :
            "100%",
          height:
            tipo === "-x" ? "100%" :
            tipo === "-y" ? modalHeight:
            tipo === "0" ? screenHeight * 0.6 :
            tipo === "tutorial" ? screenHeight * tipoTutorialHeight :
            tipo === "1" ? screenHeight * 0.3 :
            "100%",
          backgroundColor: fondoColor,
          borderTopRightRadius: 
            tipo === "-x" ? 20 :
            tipo === "-y" ? 20 :
            tipo === "0" || tipo === "tutorial" ? 20 :
            tipo === "1" ? 20 :
            0,
          borderBottomRightRadius:
            tipo === "-x" ? 20 :
            tipo === "-y" ? 0 :
            tipo === "0" || tipo === "tutorial" ? 20 :
            tipo === "1" ? 20 :
            0,
          borderTopLeftRadius:
            tipo === "-x" ? 0 :
            tipo === "x" ? 20 :
            tipo === "-y" ? 20 :
            tipo === "0" || tipo === "tutorial" ? 20 :
            tipo === "1" ? 20 :
            0,
          borderBottomLeftRadius:
            tipo === "-x" ? 0 :
            tipo === "x" ? 20 :
            tipo === "-y" ? 0 :
            tipo === "0" || tipo === "tutorial" ? 20 :
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
        {onCloseOmitir ? (
            <Pressable
              onPress={onClose}
              style={[
                {
                  position: "absolute",
                  top: 10,
                  right: 16,
                  zIndex: 10,
                },
              ]}
            >
              {({ pressed }) => (
                <View
                  className="rounded-full p-2"
                  style={{ backgroundColor: pressed ? colors.mediumlightgrey : colors.light }}
                >
                  <Text className="font-medium text-base" style = {{ color: colors.mediumdarkgrey }}>
                    Omitir
                  </Text>
                </View>
              )}
            </Pressable>
          ) : (
        <BotonEsquinaSuperior
          onPress={onClose}
          fondoBoton={fondoColor}
          iconName={"close"}
          color={iconoColor}
          top={tipo === "-x" ? 30 : 10}
          tipo={
            tipo === "-x" ? "izquierda" :
            tipo === "x" ? "derecha" :
            tipo === "-y" ? "derecha" :
            tipo === "0" || tipo === "tutorial" ? "derecha" :
            tipo === "1" ? "derecha" :
            tipo === "2" ? "derecha" :
            "izquierda"
          }
        />
          )}
        <View className="flex-1 p-4 mt-8">
          {children}
        </View>
      </SafeAreaView>
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
            width: screenWidth * 0.9,      // ancho fijo relativo a pantalla
            maxHeight: screenHeight * 0.9, // máximo 80% altura
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
          {onCloseOmitir ? (
            <Pressable
              onPress={onClose}
              style={[
                {
                  position: "absolute",
                  top: 10,
                  right: 16,
                  zIndex: 10,
                },
              ]}
            >
              {({ pressed }) => (
                <View
                  className="rounded-full p-2"
                  style={{ backgroundColor: pressed ? colors.mediumlightgrey : colors.light }}
                >
                  <Text className="font-medium text-base" style = {{ color: colors.mediumdarkgrey }}>
                    Omitir
                  </Text>
                </View>
              )}
            </Pressable>
          ) : (
            <BotonEsquinaSuperior
              tipo="derecha"
              onPress={onClose}
              iconName="close"
              color={iconoColor}
            />
          )}
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