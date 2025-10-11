import { Slot, usePathname, useRouter } from "expo-router";
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { images } from "@/constants/images";
import { BotonEsquinaSuperior } from "@/components/base/Boton";
import { colors } from "@/constants/colors";

export default function LayoutAuth() {

  const router = useRouter();

  const pathname = usePathname();

  return (

    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-primary">

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

        <View className="flex-1 bg-primary px-6 py-10 justify-center">

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
            <Slot />
          </View>
          
        </View>

      </ScrollView>

    </KeyboardAvoidingView>

  );

}
