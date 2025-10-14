import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useAuth } from "@/context/auth";
import { Titulo } from "@/components/base/Titulo";
import { Boton } from "@/components/base/Boton";
import { FormularioCampo } from "@/components/base/Entrada";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { DescartarCambiosContext } from "@/context/DescartarCambios";

export default function ActividadAgregar() {

  const { authToken, refreshToken, createApi, setAuthToken } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  //id: ID de la actividad
  //Si es agregar, id es undefined
  //Si es editar, id es actividad.id
  const { paciente, id } = useLocalSearchParams();
  //Si es agregar, modoEdicion es false
  //Si es editar, modoEdicion es true
  const modoEdicion = !!id;
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];
    
  //ESTADOS
  const [actividad, setActividad] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBoton, setIsLoadingBoton] = useState(false);
  const datosIniciales = useRef({
    titulo: "",
    descripcion: ""
  });

  useEffect(() => {
    if (modoEdicion) {
      if (!authToken || !refreshToken) return;
      console.log("[actividades: actividad-agregar] Obteniendo información de la actividad:", id);
      const api = createApi(authToken, refreshToken, setAuthToken);
      api
        .get("/actividades/" + id + "/")
        .then((res: any) => {
          const data = res.data;
          setActividad(data);
          setTitulo(data.titulo ?? "");
          setDescripcion(data.descripcion ?? "");
          datosIniciales.current = { titulo: data.titulo ?? "", descripcion: data.descripcion ?? ""};
          setIsLoading(false);
        })
        .catch((err: any) => {
          console.log("[actividades: actividad-agregar] Error:", err);
          setIsLoading(false);
        });
    } else {
      datosIniciales.current = { titulo: "", descripcion: "" };
      setIsLoading(false);
    }
  }, [modoEdicion, id, authToken, refreshToken]);

  const hayCambios = () => {
    return (
      titulo != datosIniciales.current.titulo ||
      descripcion != datosIniciales.current.descripcion
    )
  }

  //DESCARTAR CAMBIOS
  useEffect(() => {
    const beforeRemoveListener = navigation.addListener('beforeRemove', (e) => {
      if (!hayCambios()) {return}
      e.preventDefault();
      Alert.alert(
        "¿Descartar cambios?",
        "Tienes cambios sin guardar. ¿Estás segur@ de que quieres salir?",
        [
          {
            text: "No",
            style: "cancel",
            onPress: () => {}
          },
          {
            text: "Salir",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          }
        ]
      );
    });
    return () => beforeRemoveListener();
  }, [navigation, titulo, descripcion]);

  //DESCARTAR CAMBIOS
  const handleDescartarCambios = (path: any) => {
    if (hayCambios()) {
      Alert.alert(
        "¿Descartar cambios?",
        "Tienes cambios sin guardar. ¿Estás segur@ de que quieres salir?",
        [
          {
            text: "No",
            style: "cancel",
            onPress: () => {}
          },
          {
            text: "Salir",
            style: "destructive",
            onPress: () => router.push(path),
          }
        ]
      );
    } else {
      router.push(path);
    }
  };
  
  //HANDLE: GUARDAR
  const handleGuardar = async () => {
    if (!titulo) {
      console.log("[actividades: actividad-agregar] Error. Por favor, completa todos los campos obligatorios marcados con *...");
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios marcados con *.");
      return;
    }
    setIsLoadingBoton(true);
    try {
      if (!authToken || !refreshToken) return;
      const api = createApi(authToken, refreshToken, setAuthToken);
      if (modoEdicion) {
        console.log("[actividades: actividad-agregar] Editando actividad:", {
          pacienteID,
          titulo,
          descripcion
        });
        {
          const res = await api.put("/actividades/" + id + "/", {
            titulo: titulo,
            descripcion: descripcion
          }, {timeout: 5000})
          console.log("[actividades: actividad-agregar] Respuesta:", res.data);
          router.push(`/profesional/${paciente}/actividades?success=1`);
        }
      } else {
        console.log("[actividades: actividad-agregar] Creando actividad:", {
          pacienteID,
          titulo,
          descripcion
        });
        {
          const res = await api.post("/actividades/", {
            titulo: titulo,
            descripcion: descripcion
          }, {timeout: 5000})
          console.log("[actividades: actividad-agregar] Respuesta:", res.data);
          router.push(`/profesional/${paciente}/actividades?success=1`);
        }
      }
    } catch(err) {
      console.log("[actividades: actividad-agregar] Error:", err); 
      Alert.alert(
        "Error",
        "Hubo un problema al guardar la actividad. Intenta nuevamente.",
        [{text: "OK"}]
      )
    } finally {
      setIsLoadingBoton(false);
    }
  };
    
  //VISTA
  return (
    <DescartarCambiosContext.Provider value={{ handleDescartarCambios }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={130}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 2, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Titulo> 
            {modoEdicion ? 'Editar actividad' : 'Agregar actividad'}
          </Titulo>
          {isLoading ? (
            <IndicadorCarga/>
          ) : (
            <View className="gap-2">
              <FormularioCampo
                label={"Título"}
                value={titulo}
                onChangeText={setTitulo}
                placeholder={"Ingresa un título"}
                maxLength={255}
                asterisco={true}
                tipo={2}
              />
              <FormularioCampo
                label={"Descripción"}
                value={descripcion}
                onChangeText={setDescripcion}    
                placeholder={"Ingresa una descripción"}
                multiline
                maxLength={4000}
                asterisco={false}
              tipo={2}
              />
              <Boton
                texto="Guardar"
                onPress={handleGuardar}
                isLoading={isLoadingBoton}
                tipo={3}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </DescartarCambiosContext.Provider>
  );
};