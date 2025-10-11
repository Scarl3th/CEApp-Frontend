import { Alert, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from "@/context/auth";
import { Boton } from "@/components/base/Boton";
import { Titulo } from "@/components/base/Titulo";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { DescartarCambiosContext } from "@/context/DescartarCambios";
import { FormularioCampo, FormularioCampoFecha, FormularioCampoHora } from "@/components/base/Entrada";

export function ObservacionFormulario() {

  const { authToken, refreshToken, createApi, setAuthToken } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  //id: ID de la observación
  //Si es agregar, id es undefined
  //Si es editar, id es observacion.id
  const { paciente, id } = useLocalSearchParams();
  //Si es agregar, modoEdicion es false
  //Si es editar, modoEdicion es true
  const modoEdicion = !!id;
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];

  //ESTADOS
  const [observacion, setObservacion] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [fecha_observacion, setFecha_observacion] = useState<Date | null>(null);
  const [hora_observacion, setHora_observacion] = useState<Date | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBoton, setIsLoadingBoton] = useState(false);
  const datosIniciales = useRef({
    titulo: "",
    fecha_observacion: null,
    hora_observacion: null,
    descripcion: ""
  });

  useEffect(() => {
    if (modoEdicion) {
      if (!authToken || !refreshToken) return;
      console.log("[actividades: actividad-agregar] Obteniendo información de la observación:", id);
      const api = createApi(authToken, refreshToken, setAuthToken);
      api
        .get("/observaciones/" + pacienteID + "/" + id + "/")
        .then((res: any) => {
          const data = res.data;
          const selectedDate = new Date(data.fecha_observacion);
          setObservacion(data);
          setTitulo(data.titulo ?? "");
          setFecha_observacion(selectedDate ?? "");
          setHora_observacion(data.hora_observacion ? new Date(data.hora_observacion) : null);
          setDescripcion(data.descripcion ?? "");
          datosIniciales.current = { titulo: data.titulo ?? "", fecha_observacion: data.fecha ?? null, hora_observacion: data.hora ?? null, descripcion: data.descripcion ?? ""};
          setIsLoading(false);
        })
        .catch((err: any) => {
          console.log(err);
          setIsLoading(false);
        });
    } else {
      datosIniciales.current = { titulo: "", fecha_observacion: null, hora_observacion: null, descripcion: "" };
      setIsLoading(false);
    }
  }, [modoEdicion, id, authToken, refreshToken]);

  const hayCambios = () => {
    return (
      titulo != datosIniciales.current.titulo ||
      fecha_observacion != datosIniciales.current.fecha_observacion ||
      hora_observacion != datosIniciales.current.hora_observacion ||
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
  }, [navigation, titulo, fecha_observacion, hora_observacion, descripcion]);

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
    if (!titulo || !fecha_observacion || !descripcion) {
      console.log("[observaciones: observacion-agregar] Error. Por favor, completa todos los campos obligatorios marcados con *...");
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios marcados con *.");
      return;
    }
    setIsLoadingBoton(true);
    try {
      if (!authToken || !refreshToken) return;
      const api = createApi(authToken, refreshToken, setAuthToken);
      if (modoEdicion) {
        console.log("[observaciones: observacion-agregar] Editando observación:", { pacienteID, titulo, fecha_observacion, hora_observacion, descripcion });
        {
          const res = await api.put("/observaciones/" + pacienteID + "/" + id + "/", {titulo: titulo,
                                                                   fecha_observacion: fecha_observacion,
                                                                   hora_observacion: hora_observacion,
                                                                   descripcion: descripcion},
                                                                  {timeout: 5000})
          console.log("[observaciones: observacion-agregar] Respuesta:", res.data);
          router.push(`/cuidador/${paciente}/observaciones?success=1`);
        }
      } else {
        console.log("[observaciones: observacion-agregar] Creando observación:", {titulo: titulo,
                                                                      fecha_observacion: fecha_observacion.toISOString(),
                                                                      hora_observacion: hora_observacion ? hora_observacion.toISOString() : null,
                                                                      descripcion: descripcion});
        {
          const res = await api.post(`/observaciones/${pacienteID}`, {titulo: titulo,
                                                                      fecha_observacion: fecha_observacion?.toISOString(),
                                                                      hora_observacion: hora_observacion ? hora_observacion.toISOString() : null,
                                                                      descripcion: descripcion},
                                                                      {timeout: 5000})
          console.log("[observaciones: observacion-agregar] Respuesta:", res.data);
          router.push(`/cuidador/${paciente}/observaciones?success=1`);
        }
      }
    } catch(err) {
      console.log("[observaciones: observacion-agregar] Error:", err); 
      Alert.alert(
        "Error",
        modoEdicion
        ? "La observación no pudo ser editada. Intenta nuevamente."
        : "La observación no pudo ser creada. Intenta nuevamente.",
        [{text: "OK"}]
      )
    } finally {
      setIsLoadingBoton(false);
    }
  };
    
  //VISTA
  return (
    <DescartarCambiosContext.Provider value={{ handleDescartarCambios }}>
      <KeyboardAwareScrollView
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1, padding: 8 }} 
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={24}
      >
        <Titulo> 
          {modoEdicion ? 'Editar observación' : 'Agregar observación'}
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
            <FormularioCampoFecha
              fecha={fecha_observacion}
              setFecha={setFecha_observacion}
              label={"Fecha"}
              placeholder={"Selecciona una fecha..."}
              asterisco={true}
              tipo={2}
            />
            <FormularioCampoHora
              hora={hora_observacion}
              setHora={setHora_observacion}
              label={"Hora"}
              placeholder={"Selecciona una hora..."}
              asterisco={false}
              tipo={2}
            />
            <FormularioCampo
              label={"Descripción"}
              value={descripcion}
              onChangeText={setDescripcion}    
              placeholder={"Ingresa una descripción"}
              multiline
              maxLength={4000}
              asterisco={true}
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
      </KeyboardAwareScrollView>
    </DescartarCambiosContext.Provider>
  );

}
