import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useAuth } from "@/context/auth";
import { Boton } from "@/components/base/Boton";
import { Titulo } from "@/components/base/Titulo";
import { CustomToast } from "@/components/base/Toast";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { DescartarCambiosContext } from "@/context/DescartarCambios";
import { FormularioCampo, FormularioCampoAnimo, FormularioCampoDuracion, FormularioCampoMultiSelect } from "@/components/base/Entrada";

//ÁNIMO
interface Animo {
  id: string | number;
  nombre: string;
  emoji: string;
}

//ACTIVIDAD
interface Actividad {
  id: string;
  titulo: string;
}

//ENTRADA-AGREGAR
export function EntradaFormulario() {

  const { authToken, refreshToken, createApi, setAuthToken , user} = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const { paciente } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];

  //ESTADOS
  const [titulo, setTitulo] = useState("");
  const [animo, setAnimo] = useState<Animo | undefined>(undefined);
  const [duracion, setDuracion] = useState<number | undefined>(undefined);
  const [objetivosEspecificos, setObjetivosEspecificos] = useState([]);
  const [selected_obj, setSelected_obj] = useState<number[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState<string[]>([]);
  const [comentarios, setComentarios] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBoton, setIsLoadingBoton] = useState(false);
  const [toast, setToast] = useState<{text1: string; text2?: string; type: "success" | "error";} | null>(null);
  const datosIniciales = useRef({
    titulo: "",
    animo: undefined,
    duracion: undefined,
    selected_obj: {},
    actividadesSeleccionadas: {},
    comentarios: "",
  });

  useEffect(() => {
    datosIniciales.current = {
      titulo: "",
      animo: undefined,
      duracion: undefined,
      selected_obj: {},
      actividadesSeleccionadas: {},
      comentarios: "",
    };
  }, []);

  useEffect(() => {
    fetchObjetivosEspecificos();
    fetchActividades();
  },[authToken, refreshToken]);

  useEffect(() => {
    if (!isLoading && objetivosEspecificos.length === 0) {
      Alert.alert(
        "Aviso",
        "No se encontraron objetivos específicos. Para crear una entrada, primero debes estar vinculado a un objetivo específico registrado.",
        [{
          text: "Ir al plan de trabajo",
          onPress: () => {router.push(`/profesional/${paciente}/plan?recargar=1`)}
        }],
        { cancelable: false }
      )
    }
  }, [objetivosEspecificos])

  //FETCH: OBJETIVOS ESPECÍFICOS (VINCULADOS AL PROFESIONAL)
  const fetchObjetivosEspecificos = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[bitácora: entrada-agregar] Obteniendo objetivos específicos...");
      const res = await api.get("/objetivos-especificos-vinculados/" + pacienteID + "/");
      setObjetivosEspecificos(res.data);
      setIsLoading(false);
      setError(false);
    } catch(err) {
      console.log("[bitácora: entrada-agregar] Error:", err);
      setIsLoading(false);
      setError(true);
    }
  };

  //FETCH: ACTIVIDADES
  const fetchActividades = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[bitácora: entrada-agregar] Obteniendo actividades de la base de datos...");
      const res = await api.get("/actividades/");
      setActividades(res.data);
      setIsLoading(false);
      setError(false);
    } catch (err) {
      console.log("[bitácora: entrada-agregar] Error:", err);
      setIsLoading(false);
      setError(true);
    };
  }

  const hayCambios = () => {
    if (titulo !== datosIniciales.current.titulo) return true;
    if (comentarios !== datosIniciales.current.comentarios) return true;
    if (animo !== datosIniciales.current.animo) return true;
    if (duracion !== datosIniciales.current.duracion) return true;
    let keys = new Set([
      ...Object.keys(selected_obj),
      ...Object.keys(datosIniciales.current.selected_obj),
    ]);
    for (const k of keys) {
      if (!!selected_obj[k] !== !!datosIniciales.current.selected_obj[k]) return true;
    }
    keys = new Set([
      ...Object.keys(actividadesSeleccionadas),
      ...Object.keys(datosIniciales.current.actividadesSeleccionadas),
    ]);
    for (const k of keys) {
      if (!!actividadesSeleccionadas[k] !== !!datosIniciales.current.actividadesSeleccionadas[k]) return true;
    }
    return false;

  };

  //DESCARTAR CAMBIOS
  useEffect(() => {
    const beforeRemoveListener = navigation.addListener("beforeRemove", (e) => {
      if (!hayCambios()) return;
      e.preventDefault();
      Alert.alert(
        "¿Descartar cambios?",
        "Tienes cambios sin guardar. ¿Estás segur@ de que quieres salir?",
        [
          { text: "No", style: "cancel" },
          { text: "Salir", style: "destructive", onPress: () => navigation.dispatch(e.data.action) },
        ]
      );
    });
    return beforeRemoveListener;
  }, [navigation, titulo, animo, duracion, selected_obj, actividadesSeleccionadas, comentarios]);

  //HANDLE: DESCARTAR CAMBIOS
  const handleDescartarCambiosEntrada = (path: any) => {
    if (hayCambios()) {
      Alert.alert(
        "¿Descartar cambios?",
        "Tienes cambios sin guardar. ¿Estás segur@ de que quieres salir?",
        [
          { text: "No", style: "cancel" },
          { text: "Salir", style: "destructive", onPress: () => router.push(path) },
        ]
      );
    } else {
      router.push(path);
    }
  };

  //HANDLE: GUARDAR
  const handleGuardar = async () => {
    if (!titulo || !animo || !duracion || selected_obj.length == 0) {
      console.log("[bitácora: entrada-agregar] Error. Por favor, completa todos los campos marcados con *...");
      Alert.alert("Error", "Por favor, completa todos los campos marcados con *.");
      return;
    }
    if (!authToken || !refreshToken) {
      console.log("[bitácora: entrada-agregar] Error. No se pudo autenticar...");
      return;
    }
    console.log("[bitácora: entrada-agregar] Guardar entrada:", {
      titulo: titulo,
      animo: animo.id,
      duracion: duracion,
      objetivos_ids: selected_obj,
      actividades_ids: actividadesSeleccionadas,
      comentarios: comentarios,
    });
    setIsLoadingBoton(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.post("/bitacora/" + pacienteID + "/", {
        titulo: titulo,
        animo: animo.id,
        duracion: duracion,
        objetivos_ids: selected_obj,
        actividades_ids: actividadesSeleccionadas,
        comentarios: comentarios
      }, {timeout: 5000})
      console.log("[bitácora: entrada-agregar] Respuesta:", res.data);
      router.push(`/profesional/${paciente}/bitacora?recargar=1&success=1`);

      //Creamos un log de que se accedió a la información de las bitácoras si el usuario es un profecional
      if (user?.role === "profesional") {
        try {
          const payload = 
          {
            "elemento": "entrada de bitacora",
            "accion": "crear",
            "nombre_elemento": titulo,
          }

          await api.post(`/logs/${pacienteID}/`, payload);
          console.log("[LOGs] Log de crear entrada a la bitácora creado");
        } catch (err) {
          console.error("[LOGs] Error creando log de crear entrada a la bitácora");
        }
      }


    } catch(err) {
      console.log("[bitácora: entrada-agregar] Error:", err);
      Alert.alert(
        "Error",
        "Hubo un problema al guardar la entrada. Intenta nuevamente.",
        [{text: "OK"}]
      )
    } finally {
      setIsLoadingBoton(false);
    }
  };

  //HANDLE: AGREGAR ACTIVIDAD
  const handleAgregarActividad = async (newTitle: string) => {
    if (!newTitle.trim()) return;
    if (!authToken || !refreshToken) return;
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[bitácora: entrada-agregar] Guardando nueva actividad en la base de datos...");
      const resPOST = await api.post("/actividades/", { titulo: newTitle });
      console.log("[bitácora: entrada-agregar] Nueva actividad creada:", resPOST.data);
      console.log("[bitácora: entrada-agregar] Obteniendo actividades de la base de datos...");
      const resGET = await api.get("/actividades/");
      setActividades(resGET.data);
    } catch (err) {
      console.log("[bitácora: entrada-agregar] Error:", err);
      Alert.alert(
        "Error",
        "Hubo un problema al guardar la actividad. Intenta nuevamente.",
        [{ text: "OK" }]
      );
    }
  };

  //VISTA
  return (
    <View className="flex-1 mb-2">
      <DescartarCambiosContext.Provider value={{ handleDescartarCambiosEntrada }}>
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
              Agregar entrada
            </Titulo>
            <View className="flex-1">
              {isLoading ? (
                <IndicadorCarga/>
              ) : error ? (
                <MensajeVacio
                  mensaje={`Hubo un error al cargar la información.\nIntenta nuevamente.`}
                  onPressRecargar={() => {
                    fetchObjetivosEspecificos();
                    fetchActividades();
                  }}
                />
              ) : (
                <View className="gap-2">
                  <FormularioCampo
                    label={"Título"}
                    asterisco={true}
                    value={titulo}
                    onChangeText={setTitulo}
                    placeholder={"Ingresa un título"}
                    maxLength={255}
                    tipo={2}
                  />
                  <FormularioCampoAnimo
                    label={"Estado de ánimo"}
                    asterisco={true}
                    value={animo}
                    onChange={setAnimo}
                    tipo={2}
                  />
                  <FormularioCampoDuracion
                    label={"Duración"}
                    value={duracion}
                    onChange={(minutos) => setDuracion(minutos)}
                    asterisco={true}
                    tipo={2}
                  />
                  <FormularioCampoMultiSelect
                    label={"Objetivos específicos trabajados"}
                    items={objetivosEspecificos}
                    selected={selected_obj}
                    onChange={setSelected_obj}
                    placeholder={"Toca para seleccionar objetivos específicos"}
                    placeholderSelected={"objetivos específicos seleccionados"}
                    asterisco={true}
                    tipo={2}
                  />
                  <FormularioCampoMultiSelect
                    label={"Actividades realizadas"}
                    items={actividades}
                    selected={actividadesSeleccionadas}
                    onChange={setActividadesSeleccionadas}
                    placeholder={"Toca para seleccionar actividades"}
                    placeholderSelected={"actividades seleccionadas"}
                    onAddItem={handleAgregarActividad}
                    asterisco={false}
                    tipo={2}
                    setToast={setToast}
                  />
                  <FormularioCampo
                    label={"Comentarios"}
                    asterisco={false}
                    value={comentarios}
                    onChangeText={setComentarios}
                    placeholder={"Ingresa comentarios"}
                    multiline
                    maxLength={4000}
                    tipo={2}
                  />
                  <Boton
                    texto={"Guardar"}
                    onPress={handleGuardar}
                    isLoading={isLoadingBoton}
                    tipo={3}
                  />
                </View>
              )
            }
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </DescartarCambiosContext.Provider>
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
  
};