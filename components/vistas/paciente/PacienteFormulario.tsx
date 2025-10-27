import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useAuth } from "@/context/auth";
import { Boton } from "@/components/base/Boton";
import { Titulo } from "@/components/base/Titulo";
import { FormularioCampo, FormularioCampoFecha } from "@/components/base/Entrada";

export function PacienteFormulario(){

  const { authToken, refreshToken, createApi, setAuthToken } = useAuth();
    const router = useRouter();
  
    // ESTADOS
    const [nombre, setNombre] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
    const [sexo, setSexo] = useState("");
    const [isLoadingBoton, setIsLoadingBoton] = useState(false);
  
    // HANDLE: GUARDAR
    const handleGuardar = async () => {
      if (!nombre || !fechaNacimiento || !sexo) {
        Alert.alert("Error", "Por favor, completa todos los campos marcados con *.");
        return;
      }
      setIsLoadingBoton(true);
      console.log("Guardando paciente:", { nombre, fechaNacimiento, sexo });
      try {
        const api = createApi(authToken, refreshToken, setAuthToken);
        const res = await api.post("/cuidador-plan-trabajo/", { nombre, fechaNacimiento, sexo });
        console.log("[Agregar paciente] Respuesta:", res.data);
        router.push("/cuidador?success=1");
      } catch(err) {
        console.log("[Agregar paciente] Error:", err);
        Alert.alert(
          "Error",
          "Hubo un problema al guardar el paciente. Intenta nuevamente.",
          [{text: "OK"}]
        )
      } finally {
        setIsLoadingBoton(false);
      }
    };
  
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
            <FormularioCampo
              label={"Nombre"}
              value={nombre}
              onChangeText={setNombre}
              placeholder={"Ingresa un nombre"}
              maxLength={255}
              asterisco={true}
              tipo={2}
            />
            <FormularioCampoFecha
              fecha={fechaNacimiento}
              setFecha={setFechaNacimiento}
              label={"Fecha de nacimiento"}
              placeholder={"Selecciona una fecha de nacimiento..."}
              asterisco={true}
              tipo={2}
            />
            <FormularioCampo
              label={"Sexo"}
              value={sexo}
              onChangeText={setSexo}
              radioButton
              options={["Masculino", "Femenino", "Otro"]}
              asterisco={true}
              tipo={2}
            />
            <Boton
              texto={"Guardar"}
              onPress={handleGuardar}
              isLoading={isLoadingBoton}
              tipo={3}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );

}