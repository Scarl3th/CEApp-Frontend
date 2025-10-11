import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from "@/context/auth";
import { Icons } from '@/constants/icons';
import { colors } from "@/constants/colors";
import { Boton } from "@/components/base/Boton";
import { Titulo } from "@/components/base/Titulo";
import { CustomToast } from "@/components/base/Toast";
import { CustomModal } from "@/components/base/Modal";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { formatearTiempo } from '@/components/base/FormatearFecha';
import { DescartarCambiosContext } from "@/context/DescartarCambios";
import { FormularioCampo, FormularioCampoLabel, FormularioCampoMultiSelect } from "@/components/base/Entrada";

//FORMULARIO CAMPO: DURACIÓN
interface FormularioCampoDuracionProps {
  label: string;
  value?: number;
  onChange: (minutes: number) => void;
  placeholder?: string;
  asterisco?: boolean;
  tipo?: number;
  presets?: number[];
}
export function FormularioCampoDuracion({
  label,
  value,
  onChange,
  placeholder = "HH:MM",
  asterisco,
  tipo = 1,
  presets = [30, 45, 60, 90, 120],
}: FormularioCampoDuracionProps) {
  const [hours, setHours] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<number | "custom" | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  // Inicializar valores si se recibe value
  useEffect(() => {
    if (value === undefined) {
      setHours("");
      setMinutes("");
      setSelectedPreset(null);
      return;
    }
    const h = Math.floor(value / 60);
    const m = value % 60;
    setHours(h.toString());
    setMinutes(m.toString());
    if (presets.includes(value)) {
      setSelectedPreset(value);
    } else {
      setSelectedPreset("custom");
    }
  }, [value, presets]);
  const handleHoursChange = (text: string) => {
    const h = text.replace(/[^0-9]/g, "");
    setHours(h);
    const totalMinutes = Number(h || 0) * 60 + Number(minutes || 0);
    onChange(totalMinutes);
    setSelectedPreset("custom");
  };
  const handleMinutesChange = (text: string) => {
    let m = text.replace(/[^0-9]/g, "");
    if (Number(m) > 59) m = "59";
    setMinutes(m);
    const totalMinutes = Number(hours || 0) * 60 + Number(m || 0);
    onChange(totalMinutes);
    setSelectedPreset("custom");
  };
  const handlePresetPress = (minutesPreset: number) => {
    if (selectedPreset === minutesPreset) {
      // Ya estaba seleccionado → des-seleccionar
      setHours("");
      setMinutes("");
      setSelectedPreset(null);
      onChange(undefined);
      return;
    }
    const h = Math.floor(minutesPreset / 60);
    const m = minutesPreset % 60;
    setHours(h.toString());
    setMinutes(m.toString());
    setSelectedPreset(minutesPreset);
    onChange(minutesPreset);
  };
  const handleCustomPress = () => {
    setShowCustomModal(true);
  };
  return (
    <View className="w-full mb-2">
      <FormularioCampoLabel label={label} asterisco={asterisco} tipo={tipo}/>
      {value 
        ? (<Text className="text-black font-medium mt-2 mb-4 text-center">{formatearTiempo(value)}</Text>)
        : (<Text className="text-mediumdarkgrey mt-2 mb-4 text-center">Selecciona la duración de la sesión de terapia</Text>)
      }
      {/* Presets + Botón personalizado */}
      <View className="gap-2 flex-row justify-center flex-wrap items-center">
        {presets.map((p) => {
          const h = Math.floor(p / 60);
          const m = p % 60;
          const labelPreset = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
          const isSelected = selectedPreset === p;
          return (
            <Pressable key={p} onPress={() => handlePresetPress(p)}>
              {({ pressed }) => (
                <View
                  className="rounded-lg border px-4 py-3"
                  style={{
                    backgroundColor:
                      pressed ? colors.mediumlightgrey :
                      isSelected ? colors.primary :
                      colors.white,
                    borderColor:
                      pressed ? colors.mediumlightgrey :
                      isSelected ? colors.primary :
                      colors.mediumgrey,
                  }}
                >
                  <Text
                    className="text-base"
                    style={{ color: isSelected ? colors.white : colors.mediumdarkgrey }}
                  >
                    {labelPreset}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
        {/* Botón personalizado */}
        <Pressable onPress={handleCustomPress}>
          {({ pressed }) => {
            const isCustomSelected = selectedPreset === "custom";
            return (
              <View
                className="rounded-lg border px-4 py-3 gap-1 flex-row items-center"
                style={{
                  backgroundColor:
                    pressed ? colors.mediumlightgrey :
                      isCustomSelected ? colors.primary :
                      colors.white,
                    borderColor:
                      pressed ? colors.mediumlightgrey :
                      isCustomSelected ? colors.primary :
                      colors.mediumgrey,
                  }}
              >
                <Text
                  className="text-base"
                  style={{ color: isCustomSelected ? colors.white : colors.mediumdarkgrey }}
                >
                  {isCustomSelected
                    ? `${Number(hours)}h ${Number(minutes)}m`
                    : "Personalizado"}
                </Text>
                <Ionicons
                  name={Icons["abajo"].iconName}
                  size={20}
                  color={isCustomSelected ? colors.white : colors.mediumdarkgrey}
                />
              </View>
            );
          }}
        </Pressable>
      </View>
      {/* MODAL */}
      <CustomModal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        tipo={"expandible"}
      >
        <View className="flex-1 p-2 gap-4 justify-center">
          <Text className="text-black text-xl font-bold">Duración personalizada</Text>
          <View className="flex-row gap-2 justify-center">
            <TextInput
              value={hours}
              onChangeText={handleHoursChange}
              keyboardType="numeric"
              placeholder="HH"
              className="border border-gray-400 rounded-lg p-2 text-center flex-1"
              maxLength={2}
            />
            <Text className="self-center text-black text-lg">horas</Text>
            <TextInput
              value={minutes}
              onChangeText={handleMinutesChange}
              keyboardType="numeric"
              placeholder="MM"
              className="border border-gray-400 rounded-lg p-2 text-center flex-1"
              maxLength={2}
            />
            <Text className="self-center text-black text-lg">minutos</Text>
          </View>
          <Boton
            texto={"Aceptar"}
            onPress={() => setShowCustomModal(false)}
            tipo={3}
          />
        </View>
      </CustomModal>
    </View>
  );
}

interface Animo {
  id: string | number;
  nombre: string;
  emoji: string;
}
const animos = [
  { id: "Feliz", emoji: "😊", nombre: "Feliz" },
  { id: "Triste", emoji: "😢", nombre: "Triste" },
  { id: "Molesto", emoji: "😡", nombre: "Molesto" },
  { id: "Entusiasmado", emoji: "🤩", nombre: "Entusiasmado" },
  { id: "Sorprendido", emoji: "😮", nombre: "Sorprendido" },
  { id: "Confundido", emoji: "😕", nombre: "Confundido" },
  { id: "Cansado", emoji: "🥱", nombre: "Cansado" },
  { id: "Neutral", emoji: "😐", nombre: "Neutral" },
];

//FORMULARIO CAMPO: ÁNIMO
interface FormularioCampoAnimoProps {
  label: string;
  asterisco: boolean;
  tipo: number;
  value?: Animo;
  onChange: (selected: Animo) => void;
}
export function FormularioCampoAnimo({
  label,
  asterisco,
  tipo,
  value,
  onChange
}: FormularioCampoAnimoProps) {
  return (
    <View className="w-full mb-2">
      <FormularioCampoLabel label={label} asterisco={asterisco} tipo={tipo}/>
      {value 
        ? (<Text className="text-black font-medium mt-2 mb-4 text-center">{value.emoji} {value.nombre}</Text>)
        : (<Text className="text-mediumdarkgrey mt-2 mb-4 text-center">Selecciona el estado de ánimo del paciente</Text>)
      }
      <View className="gap-2 flex-row justify-center flex-wrap">
        {animos.map((item) => {
          const seleccionado = value?.id === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                if (value?.id === item.id) {
                  onChange(undefined);
                } else {
                  onChange(item);
                }
              }}
            >
              {({ pressed }) => (
                <View
                  className="rounded-full border p-4 w-16 h-16 justify-center items-center"
                  style={{
                    backgroundColor:
                      pressed ? colors.mediumlightgrey :
                      seleccionado ? colors.primary :
                      colors.white,
                    borderColor:
                      pressed ? colors.mediumlightgrey :
                      seleccionado ? colors.primary :
                      colors.mediumgrey,
                  }}
                >
                <Text className="text-2xl">{item.emoji}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

//ACTIVIDAD
interface Actividad {
  id: string;
  titulo: string;
}

//ENTRADA-AGREGAR
export function EntradaFormulario() {

  const { authToken, refreshToken, createApi, setAuthToken } = useAuth();
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

  useEffect(() => {
    datosIniciales.current = {
      titulo: "",
      animo: undefined,
      duracion: undefined,
      selected_obj: {},
      actividadesSeleccionadas: {},
      comentarios: '',
    };
  }, []);

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
      comentarios: comentarios,
      animo: animo.id,
      duracion: duracion,
      objetivos_ids: selected_obj,
      actividades_ids: actividadesSeleccionadas,
    });
    setIsLoadingBoton(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.post("/bitacora/" + pacienteID + "/", {titulo: titulo,
                                                                   comentarios: comentarios,
                                                                   animo: animo.id,
                                                                   duracion: duracion,
                                                                   objetivos_ids: selected_obj,
                                                                   actividades_ids: actividadesSeleccionadas},
                                                                  {timeout: 2000})
      console.log("[bitácora: entrada-agregar] Respuesta:", res.data);
      router.push(`/profesional/${paciente}/bitacora?recargar=1&success=1`);
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
      //Crear actividad
      console.log("[bitácora: entrada-agregar] Guardando nueva actividad en la base de datos...");
      const resPOST = await api.post("/actividades/", { titulo: newTitle });
      console.log("[bitácora: entrada-agregar] Nueva actividad creada:", resPOST.data);
      //Refrescando actividades
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
    <View className="flex-1">
      <DescartarCambiosContext.Provider value={{ handleDescartarCambiosEntrada }}>
        <KeyboardAwareScrollView
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1, padding: 8 }}
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={24}
        >
          <Titulo>
            Agregar entrada
          </Titulo>
          <View className="flex-1">
            {isLoading ? (
              <IndicadorCarga/>
            ) : error ? (
              <MensajeVacio
                mensaje={`Hubo un error al cargar los objetivos específicos o las actividades.\nIntenta nuevamente.`}
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
        </KeyboardAwareScrollView>
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