import { BotonEsquinaSuperior } from "@/components/base/Boton";
import { colors } from "@/constants/colors";
import { images } from "@/constants/images";
import { Slot, usePathname, useRouter } from "expo-router";
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

export default function LayoutAuth() {

  const pathname = usePathname();
  const router = useRouter();

  return (
    <View className="flex-1 bg-primary">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-10 justify-center">
            {pathname === "/registro" && (
              <BotonEsquinaSuperior
                onPress={() => router.push("/login")}
                fondoBoton={colors.primary}
                tipo={"izquierda"}
                iconName={"arrow-back"}
              />
            )}
            <View className="mb-4 flex-row items-end justify-center">
              <Image
                source={images.logo}
                className="mr-1"
                style={{
                  width: Platform.OS === "web" ? 40 : 80,
                  height: Platform.OS === "web" ? 40 : 80
                }}
                resizeMode="contain"
              />
              <Text className="text-white text-4xl font-bold pb-2">CEApp</Text>
            </View>
            <View className="bg-light rounded-2xl px-4 py-8">
              <Slot/>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );

}
