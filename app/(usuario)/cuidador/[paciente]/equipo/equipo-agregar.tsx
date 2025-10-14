import React, { useState } from "react";
import { usePathname } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Alert, Pressable, Text, View } from "react-native";
import { useAuth } from "@/context/auth";
import { colors } from "@/constants/colors";
import { Boton } from "@/components/base/Boton";
import { Titulo } from "@/components/base/Titulo";
import { CustomToast } from "@/components/base/Toast";
import { MensajeCard } from "@/components/base/Tarjeta";

type CodigoCardProps = {
  codigo: string;
  setToast: React.Dispatch<
      React.SetStateAction<{
        text1: string;
        text2?: string;
        type: "success" | "error";
      } | null>
    >;
};
export function CodigoCard({codigo, setToast}: CodigoCardProps) {
  const copiarAlPortapapeles = async () => {
    await Clipboard.setStringAsync(codigo);
    setToast({ text1: "Código copiado al portapapeles.", type: "success" });
  };
  return (
    <View className="bg-lightgrey rounded-lg p-4 border border-mediumgrey">
      <Text className="text-sm text-gray-500 mb-2">Código generado</Text>
      <View className="flex-row items-center justify-between bg-white rounded-lg px-4 py-3 border border-mediumgrey">
        <Text className="text-lg font-mono text-gray-800">{codigo}</Text>
        <Pressable onPress={copiarAlPortapapeles}>
          {({ pressed }) => (
            <View 
              className="px-3 py-1 rounded-lg"
              style = {{ backgroundColor: pressed ? colors.mediumlightgrey : colors.primary}}
            >
              <Text className="text-white font-semibold">Copiar</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};
  
export default function EquipoAgregar() {

  const { authToken, refreshToken, createApi, setAuthToken } = useAuth();
  const pathname = usePathname(); 
  
  //ESTADOS
  const [codigo, setCodigo] = useState("");
  const [isLoadingBoton, setIsLoadingBoton] = useState(false);
  const [toast, setToast] = useState<{ text1: string; text2?: string; type: "success" | "error" } | null>(null);
  
  //HANDLE: GENERAR
  const handleGenerar = async () => {
    console.log("[equipo-agregar] Solicitando generación de código...");
    setIsLoadingBoton(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      const plan_id = pathname.split("/")[2].split("-")[0];
      const res = await api.post("/codigo-plan-trabajo/", {plan_trabajo_id: plan_id});
      console.log("[Generar codigo] Respuesta: ",res);
      setCodigo(res.data.codigo);
    } catch(err) {
      console.log("[Generar codigo] Error:", err);
      Alert.alert(
        "Error",
        "Hubo un problema al generar el código. Intenta nuevamente.",
        [{text: "OK"}]
      )
    } finally {
      setIsLoadingBoton(false);
    }
  };
  
  //VISTA
  return (
    <View className="flex-1">
      {/* TÍTULO */}
      <Titulo>Agregar profesional</Titulo>
      {/* CUERPO */}
      <View className="gap-2">
        <MensajeCard 
          titulo="Instrucciones"
          mensajes={[
            "Presiona el botón para generar un código.",
            "Envía el código al profesional que deseas agregar.",
            "Pide al profesional que ingrese el código en el apartado de Agregar Paciente.",
            "¡Listo! El profesional ya tendrá acceso al plan de trabajo del paciente."
          ]}
        />
        <CodigoCard
          codigo={codigo}
          setToast={setToast}
        />
        <Boton
          texto={"Generar código"}
          onPress={handleGenerar}
          isLoading={isLoadingBoton}
          tipo={3}
        />
      </View>
      {toast && (
        <CustomToast
          text1={toast.text1}
          text2={toast.text2}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}
    </View>
  );

}