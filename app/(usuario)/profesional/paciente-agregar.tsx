import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useAuth } from "@/context/auth";
import { Boton } from "@/components/base/Boton";
import { Titulo } from "@/components/base/Titulo";
import { MensajeCard } from "@/components/base/Tarjeta";
import { FormularioCampo } from "@/components/base/Entrada";

export default function PacienteAgregarProfesional() {
  
  const { authToken, refreshToken, createApi, setAuthToken } = useAuth();
  const router = useRouter();

  //ESTADOS
  const [codigo, setCodigo] = useState("");
  const [isLoadingBoton, setIsLoadingBoton] = useState(false);

  //HANDLE: GUARDAR
  const handleGuardar = async () => {
    if (!codigo) {
      Alert.alert("Error", "Por favor, ingresa un código.");
      return;
    }
    setIsLoadingBoton(true);
    console.log("[paciente-agregar] Ingresando código: ", { codigo });
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.post("/usar-codigo-plan-trabajo/", { codigo: codigo });
      console.log("[paciente-agregar] Respuesta:", res.data);
      router.push("/profesional?success=1");
    } catch(err) {
      console.log("[paciente-agregar] Error:", err);
      Alert.alert(
        "Error",
        `Hubo un problema al agregar el paciente. Intenta nuevamente.`,
        [{text: "OK"}]
      )
    } finally {
      setIsLoadingBoton(false);
    }
  };

  //VISTA
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Titulo>Agregar paciente</Titulo>
        <View className="gap-2">
          <MensajeCard 
            titulo={"Instrucciones"}
            mensajes={[
              "Solicita el código del paciente a su cuidador.",
              "Ingresa el código en el campo provisto abajo.",
              "¡Listo! Ya tendrás acceso al plan de trabajo del paciente."
            ]}
          />
          <FormularioCampo
            label={""}
            value={codigo}
            onChangeText={setCodigo}
            placeholder={"Ingresa un código"}
            maxLength={255}
            asterisco={true}
            tipo={2}
          />
          <Boton
            texto={"Ingresar código"}
            onPress={handleGuardar}
            isLoading={isLoadingBoton}
            tipo={3}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
