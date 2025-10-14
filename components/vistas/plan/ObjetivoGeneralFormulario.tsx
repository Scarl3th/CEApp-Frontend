import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useAuth } from "@/context/auth";
import { Boton } from "@/components/base/Boton";
import { Titulo } from "@/components/base/Titulo";
import { colors, colorsUser } from "@/constants/colors";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { DescartarCambiosContext } from "@/context/DescartarCambios";
import { FormularioCampo, FormularioCampoSelect } from "@/components/base/Entrada";

const categorias = [
  { id: "Acompañamiento en transiciones (educativas y vitales)", titulo: "Acompañamiento en transiciones (educativas y vitales)", color: colors.primary },
  { id: "Acompañamiento familiar y psicoeducación", titulo: "Acompañamiento familiar y psicoeducación", color: colors.primary },
  { id: "Asesoría institucional y formación a equipos", titulo: "Asesoría institucional y formación a equipos", color: colors.primary },
  { id: "Conductual y adaptación al entorno", titulo: "Conductual y adaptación al entorno", color: colors.primary },
  { id: "Desarrollo cognitivo y neuropsicológico", titulo: "Desarrollo cognitivo y neuropsicológico", color: colors.primary },
  { id: "Inclusión educativa y adaptaciones curriculares", titulo: "Inclusión educativa y adaptaciones curriculares", color: colors.primary },
  { id: "Lenguaje, comunicación y habla", titulo: "Lenguaje, comunicación y habla", color: colors.primary },
  { id: "Motricidad y coordinación", titulo: "Motricidad y coordinación", color: colors.primary },
  { id: "Salud física y bienestar médico (complementario)", titulo: "Salud física y bienestar médico (complementario)", color: colors.primary },
  { id: "Sensopercepción e integración sensorial", titulo: "Sensopercepción e integración sensorial", color: colors.primary },
  { id: "Socialización, habilidades sociales y tiempo libre", titulo: "Socialización, habilidades sociales y tiempo libre", color: colors.primary },
];

export function ObjetivoGeneralFormulario() {

  const { authToken, refreshToken, createApi, setAuthToken } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  //id: ID del objetivo
  //Si es agregar, id es undefined
  //Si es editar, id es objetivoGeneral.id
  const { paciente, id } = useLocalSearchParams();
  //Si es agregar, modoEdicion es false
  //Si es editar, modoEdicion es true
  const modoEdicion = !!id; 
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];
    
  //ESTADOS
  const [objetivoGeneral, setObjetivoGeneral] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState(null);
  const [color, setColor] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBoton, setIsLoadingBoton] = useState(false);
  const datosIniciales = useRef({
    titulo: "",
    descripcion: "",
    categoria: null
  });

  useEffect(() => {
    if (modoEdicion) {
      if (!authToken || !refreshToken) return;
      console.log("[plan: objetivo-general-agregar] Obteniendo información del objetivo general:", id);
      const api = createApi(authToken, refreshToken, setAuthToken);
      api
        .get("/objetivos/detalle/" + id + "/")
        .then((res: any) => {
          const data = res.data;
          setObjetivoGeneral(data);
          setTitulo(data.titulo);
          setDescripcion(data.descripcion);
          setCategoria(data.categoria);
          setColor(data.color || colors.primary);
          datosIniciales.current = {
            titulo: data.titulo,
            descripcion: data.descripcion,
            categoria: data.categoria,
          };
          setIsLoading(false);
        })
        .catch((err: any) => {
          console.log("[plan: objetivo-general-agregar] Error:", err); 
          setIsLoading(false);
        });
    } else {
      const colorAleatorio = colorsUser[Math.floor(Math.random() * colorsUser.length)].color;
      setColor(colorAleatorio);
      datosIniciales.current = {
        titulo: "",
        descripcion: "",
        categoria: null,
      };
      setIsLoading(false);
    }
  }, [modoEdicion, id, authToken, refreshToken]);

  const hayCambios = () => {
    return (
      titulo != datosIniciales.current.titulo ||
      descripcion != datosIniciales.current.descripcion ||
      categoria != datosIniciales.current.categoria
    )
  }

  //DESCARTAR CAMBIOS
  useEffect(() => {
    const beforeRemoveListener = navigation.addListener("beforeRemove", (e) => {
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
  }, [navigation, titulo, descripcion, categoria]);

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
    if (!titulo || !categoria || !descripcion || !color) {
      console.log("[plan: objetivo-general-agregar] Error. Por favor, completa todos los campos obligatorios marcados con *...");
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios marcados con *.");
      return;
    }
    setIsLoadingBoton(true);
    try {
      if (!authToken || !refreshToken) return;
      const api = createApi(authToken, refreshToken, setAuthToken);
      if (modoEdicion) {
        console.log("[plan: objetivo-general-agregar] Editando objetivo general:", {
          pacienteID,
          titulo,
          descripcion,
          categoria,
          color
        });
        {
          const res = await api.put("/objetivos/detalle/" + id + "/", {
            titulo: titulo,
            descripcion: descripcion,
            categoria:  categoria,
            color: color
          }, {timeout: 5000})
          console.log("[plan: objetivo-general-agregar] Respuesta:", res.data);
          router.push(`/profesional/${paciente}/plan?recargar=1&success=1`);
        }
      } else {
        console.log("[plan: objetivo-general-agregar] Creando objetivo general:", {
          pacienteID,
          titulo,
          descripcion,
          categoria,
          color
        });
        {
          const res = await api.post("/objetivos/" + pacienteID + "/", {
            titulo: titulo,
            descripcion: descripcion,
            categoria:  categoria,
            color: color
          }, {timeout: 5000})
          console.log("[plan: objetivo-general-agregar] Respuesta:", res.data);
          router.push(`/profesional/${paciente}/plan?recargar=1&success=1`);
        }
      }
    } catch(err) {
      console.log("[plan: objetivo-general-agregar] Error:", err); 
      Alert.alert(
        "Error",
        "Hubo un problema al guardar el objetivo general. Intenta nuevamente.",
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
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 2, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Titulo> 
            {modoEdicion ? "Editar objetivo general" : "Agregar objetivo general"}
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
                asterisco={true}
                tipo={2}
              />
              <FormularioCampoSelect
                label={"Categoría"}
                placeholder={"Selecciona una categoría"}
                items={categorias}
                selectedId={categoria}
                onChange={setCategoria}
                asterisco={true}
                tipo={2}
              />
              <FormularioCampoSelect
                label={"Color"}
                placeholder={"Selecciona un color"}
                items={colorsUser.map(c => ({ id: c.color, titulo: c.titulo, color: c.color }))}
                selectedId={color}
                onChange={setColor}
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
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </DescartarCambiosContext.Provider>
  );
};