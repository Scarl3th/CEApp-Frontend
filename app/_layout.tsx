import "@/app/globals.css";
import { AuthProvider } from "@/context/auth";
import { Slot } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LayoutRoot() {
  return (
    <AuthProvider>
      <StatusBar hidden={false} barStyle="light-content" translucent={false}/>
      <SafeAreaView className="flex-1 bg-primary">
        <Slot/>
      </SafeAreaView>
    </AuthProvider>
  );
}