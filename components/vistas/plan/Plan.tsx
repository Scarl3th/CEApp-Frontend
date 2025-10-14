import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, FlatList, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/auth";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";
import { Badge } from "@/components/base/Badge";
import { CustomToast } from "@/components/base/Toast";
import { TextoBloque } from "@/components/base/TextoBloque";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { Titulo, TituloSeccion } from "@/components/base/Titulo";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { formatearFechaString } from "@/components/base/FormatearFecha";
import { TarjetaExpandible, TarjetaSelector } from "@/components/base/Tarjeta";
import { ObjetivosEspecificosModal } from "@/components/vistas/plan/ObjetivosEspecificos";
import { BotonAgregar, BotonDetalles, BotonEditar, BotonEliminar, BotonProgreso, BotonTab } from "@/components/base/Boton";

//OBJETIVO GENERAL
interface ObjetivoGeneral {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  color: string;
  autor_creacion: string;
  fecha_creacion: Date;
  autor_modificacion?: string;
  fecha_modificacion?: Date;
  clasificacion: 0 | 1 | 2;
}
const clasificacionMap: Record<number, string> = {
  0: "En construcción",
  1: "En progreso",
  2: "Completado",
};

//ICONO: OBJETIVO GENERAL
export function ObjetivoGeneralIcono() {
  return (
    <View className="rounded-full justify-center items-center">
      <Ionicons name={Icons["plan"].iconName} size={30} color={colors.white}/>
    </View>
  );
}

//ITEM: OBJETIVO GENERAL
interface ObjetivoGeneralItemProps {
  objetivoGeneral: ObjetivoGeneral;
  onChange: () => void;
  setToast: React.Dispatch<
    React.SetStateAction<{
      text1: string;
      text2?: string;
      type: "success" | "error";
    } | null>
  >;
}
const ObjetivoGeneralItem = ({
  objetivoGeneral,
  onChange,
  setToast
}: ObjetivoGeneralItemProps) => {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const isProfesional = user?.role === "profesional";
  const router = useRouter();
  const { paciente } = useLocalSearchParams();

  //ESTADOS
  const [showObjetivosEspecificos, setShowObjetivosEspecificos] = useState(false);

  //HANDLE: OBJETIVOS ESPECÍFICOS
  const handleObjetivosEspecificos = (visible: boolean) => {
    setShowObjetivosEspecificos(visible);
  };

  //HANDLE: EDITAR
  const handleEditar = () => {
    console.log("[plan] Editando objetivo general:", objetivoGeneral.id);
    router.push(`/profesional/${paciente}/plan/objetivo-general-agregar?id=${objetivoGeneral.id}`);
  };

  //HANDLE: ELIMINAR
  const handleEliminar = () => {
    Alert.alert(
      "Eliminar objetivo general",
      `¿Estás segur@ de que quieres eliminar "${objetivoGeneral.titulo}"? ¡Se perderá información sobre el progreso del paciente!`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => {console.log("[plan] Eliminando objetivo general:", objetivoGeneral.id);
          {
            if (!authToken || !refreshToken) return;
            const api = createApi(authToken, refreshToken, setAuthToken);
            api
              .delete("/objetivos/detalle/" + objetivoGeneral.id + "/", {timeout:5000})
              .then((res: any) => {console.log("[plan] Respuesta:", res.status);
                                   setToast({ text1: "Objetivo general eliminado exitosamente.", type: "success" });
                                   onChange()})
              .catch((err: any) => {console.log("[plan] Error:", err.message);
                                    setToast({ text1: "Hubo un problema al eliminar el objetivo general.", text2: "Intenta nuevamente.", type: "error" });
                                    onChange();
              });
          } 
        }, style: "destructive" },
      ]
    );
  };

  //VISTA
  return (
    <View className="relative">
      {/* BADGE */}
      {objetivoGeneral.clasificacion === 0 && (
        <Badge
          fondoColor={colors.primary}
          texto={"En construcción"}
          textoColor={colors.white}
        />
      )}
      {/* TARJETA EXPANDIBLE */}
      <TarjetaExpandible
        titulo={objetivoGeneral.titulo}
        subtitulo={`Categoría: ${objetivoGeneral.categoria}`}
        icono={<ObjetivoGeneralIcono/>}
        iconoFondoColor={objetivoGeneral.clasificacion === 2 ? colors.mediumgrey : objetivoGeneral.color}
        expandidoContenido={
          <View className="gap-4">
            {objetivoGeneral.descripcion && objetivoGeneral.descripcion.length > 0 && (<TextoBloque texto={objetivoGeneral.descripcion}/>)}
            <View className="gap-2">
              {/* OPCIONES */}
              <TituloSeccion children={"Opciones:"}/>
              <View className="gap-2">
                {/* OBJETIVOS ESPECÍFICOS */}
                <TarjetaSelector
                  titulo={"Ver objetivos específicos"}
                  onPress={() => handleObjetivosEspecificos(true)}
                  icono={<Ionicons name={Icons["objetivos_especificos"].iconName} size={24} color={colors.white}/>}
                  iconoColor={colors.white}
                  tarjetaColor={colors.primary}
                  tarjetaEstilo={"bg-primary p-2"}
                  tituloEstilo={"text-white text-base font-semibold"}
                />
                {/* ACCIONES */}
                <View className="flex-row flex-wrap justify-between gap-1" style={{ flexShrink: 1 }}>
                  {isProfesional ? (
                    <>
                      <BotonEditar texto={"Editar"} onPress={handleEditar} />
                      {objetivoGeneral.clasificacion === 0 || objetivoGeneral.clasificacion == 2 ? (
                        <BotonEliminar texto={"Eliminar"} onPress={handleEliminar} />
                      ) : null}
                    </>
                  ) : null}
                  <BotonDetalles tipoModal={"expandible"}>
                    <View className="gap-1">
                      <TituloSeccion
                        children={"Autor:"}
                        respuesta={`${objetivoGeneral.autor_creacion} (${formatearFechaString(objetivoGeneral.fecha_creacion, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })})`}
                      />
                      {objetivoGeneral.autor_modificacion && objetivoGeneral.fecha_modificacion && (
                        <TituloSeccion
                          children={"Última modificación:"}
                          respuesta={`${objetivoGeneral.autor_modificacion} (${formatearFechaString(objetivoGeneral.fecha_modificacion, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })})`}
                        />
                      )}
                      <TituloSeccion
                        children={"Clasificación:"}
                        respuesta={clasificacionMap[objetivoGeneral.clasificacion]}
                      />
                    </View>
                  </BotonDetalles>
                </View>
              </View>
            </View>
          </View>
        }
      />
      {/* MODAL */}
      <ObjetivosEspecificosModal
        visible={showObjetivosEspecificos}
        onClose={() => {handleObjetivosEspecificos(false); onChange();}}
        objetivoGeneralID={objetivoGeneral.id}
      />
    </View>
  );
};

//LISTA: OBJETIVOS GENERAL
interface ObjetivosGeneralesListaProps {
  objetivosGenerales: ObjetivoGeneral[];
  onChange: () => void;
  setToast: React.Dispatch<
    React.SetStateAction<{
      text1: string;
      text2?: string;
      type: "success" | "error";
    } | null>
  >;
}
export function ObjetivosGeneralesLista({
  objetivosGenerales,
  onChange,
  setToast
}: ObjetivosGeneralesListaProps) {
  return (
    <FlatList
      data={objetivosGenerales}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ObjetivoGeneralItem objetivoGeneral={item} onChange={onChange} setToast={setToast} />}
      contentContainerStyle={{ paddingBottom: 55 }}
    />
  );
};

//VISTA: PLAN
export function Plan() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const isProfesional = user?.role === "profesional";
  const router = useRouter();
  const { paciente, recargar, success } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];

  //ALMACENAMIENTO LOCAL
  const datosObjetivosGeneralesAlmacenamiento = `plan_objetivos_general_${pacienteID}`;
  const fechaObjetivosGeneralesAlmacenamiento = `plan_objetivos_general_${pacienteID}_fecha`;

  //ESTADOS
  const [objetivosGenerales, setObjetivosGenerales] = useState<ObjetivoGeneral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState<{ text1: string; text2?: string; type: "success" | "error" } | null>(null);
  const recargarObjetivosGenerales = useRef(recargar === "1");

  const [selectedTab, setSelectedTab] = useState<"enprogreso" | "completados">("enprogreso");

  useEffect(() => {
    if (success) {
      setToast({ text1: "Objetivo general guardado exitosamente.", type: "success" });
    }
  }, [success]);

  useEffect(() => {
    fetchObjetivosGenerales();
  },[authToken, refreshToken]);
  
  //FETCH: OBJETIVOS GENERALES
  const fetchObjetivosGenerales = async (recargarForzar = false) => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const ahora = Date.now();
      const cachefechaObjetivosGeneralesAlmacenamiento = await AsyncStorage.getItem(fechaObjetivosGeneralesAlmacenamiento);
      const cachedatosObjetivosGeneralesAlmacenamiento = await AsyncStorage.getItem(datosObjetivosGeneralesAlmacenamiento);
      const tiempo = 5 * 60 * 1000;
      if (cachefechaObjetivosGeneralesAlmacenamiento && cachedatosObjetivosGeneralesAlmacenamiento && !recargarObjetivosGenerales.current && !recargarForzar) {
        const cacheFecha = parseInt(cachefechaObjetivosGeneralesAlmacenamiento, 10);
        if (ahora - cacheFecha < tiempo ) {
          console.log("[plan] Obteniendo objetivos generales del almacenamiento local...");
          const objetivosGeneralesFechas: ObjetivoGeneral[] = JSON.parse(cachedatosObjetivosGeneralesAlmacenamiento).map((og: any) => ({
            ...og,
            fecha_creacion: new Date(og.fecha_creacion),
            fecha_modificacion: og.fecha_modificacion ? new Date(og.fecha_modificacion) : null,
          }));
          setObjetivosGenerales(objetivosGeneralesFechas);
          setIsLoading(false);
          setError(false);
          return;
        }
      }
      //SIN CACHÉ VÁLIDO
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[plan] Obteniendo objetivos generales de la base de datos...");
      const res = await api.get("/objetivos/" + pacienteID + "/");
      const objetivosGeneralesFechas: ObjetivoGeneral[] = res.data.map((og: any) => ({
        ...og,
        fecha_creacion: new Date(og.fecha_creacion),
        fecha_modificacion: og.fecha_modificacion ? new Date(og.fecha_modificacion) : null,
      }));
      setObjetivosGenerales(objetivosGeneralesFechas);
      setIsLoading(false);
      setError(false);
      await AsyncStorage.setItem(datosObjetivosGeneralesAlmacenamiento, JSON.stringify(res.data));
      await AsyncStorage.setItem(fechaObjetivosGeneralesAlmacenamiento, ahora.toString());
      if (recargarObjetivosGenerales.current) {
        recargarObjetivosGenerales.current = false;
      }
    } catch (err) {
      console.log("[plan] Error:", err);
      setIsLoading(false);
      setError(true);
    };
  };

  //HANDLE: AGREGAR-OBJETIVO-GENERAL
  const handleAgregarObjetivoGeneral = () => {
    console.log("[plan] Agregando objetivo general...")
    router.push(`/profesional/${paciente}/plan/objetivo-general-agregar`);
  }

  //HANDLE: PROGRESO
  const handleProgreso = () => {
    console.log("[plan] Visualizando progreso...")
    router.push(`/profesional/${paciente}/plan/progreso`);
  }

  //FILTRO: BÚSQUEDA
  const objetivosGeneralesBusqueda = objetivosGenerales.filter((objetivoGeneral: ObjetivoGeneral) => {
    const textoBusqueda = busqueda.toLowerCase();
    const titulo = objetivoGeneral.titulo?.toLowerCase() ?? "";
    const categoria = objetivoGeneral.categoria?.toLowerCase() ?? "";
    const descripcion = objetivoGeneral.descripcion?.toLowerCase() ?? "";
    const autor_creacion = objetivoGeneral.autor_creacion?.toLowerCase() ?? "";
    const autor_modificacion = objetivoGeneral.autor_modificacion?.toLowerCase() ?? "";
    const clasificacion = clasificacionMap[objetivoGeneral.clasificacion]?.toLowerCase() ?? "";
    return (
      titulo.includes(textoBusqueda) ||
      categoria.includes(textoBusqueda) ||
      descripcion.includes(textoBusqueda) ||
      autor_creacion.includes(textoBusqueda) ||
      autor_modificacion.includes(textoBusqueda) ||
      clasificacion.includes(textoBusqueda)
    );
  });

  //FILTRO: CLASIFICACIÓN
  const objetivosEnProgreso = objetivosGeneralesBusqueda.filter(
    obj => obj.clasificacion === 0 || obj.clasificacion === 1
  );
  const objetivosCompletados = objetivosGeneralesBusqueda.filter(
    obj => obj.clasificacion === 2
  );

  //VISTA
  return (
    <View className="flex-1">
      {/* TÍTULO */}
      <Titulo
        subtitulo={"Objetivos generales"}
        onPressRecargar={() => fetchObjetivosGenerales(true)}
        onBusquedaChange={setBusqueda}
      >
        Plan de trabajo
      </Titulo>
      {/* PESTAÑAS */}
      <View className="flex-row justify-around bg-lightgrey rounded-xl my-2 ">
        <BotonTab
          label={"En progreso"}
          active={selectedTab === "enprogreso"}
          onPress={() => setSelectedTab("enprogreso")}
        />
        <BotonTab
          label={"Completados"}
          active={selectedTab === "completados"}
          onPress={() => setSelectedTab("completados")}
        />
      </View>
      {/* CUERPO */}
      {isLoading ? (
        <IndicadorCarga/>
      ) : error ? (
        <MensajeVacio
          mensaje={`Hubo un error al cargar los objetivos generales.\nIntenta nuevamente.`}
          onPressRecargar={() => fetchObjetivosGenerales(true)}
        />
      ) : (
        <>
          {selectedTab === "enprogreso" ? (
            objetivosEnProgreso.length === 0 ? (
              <MensajeVacio
                mensaje={
                  `No se encontraron objetivos generales en progreso.\n${
                    isProfesional ? "¡Comienza a planificar el trabajo del paciente usando el botón ＋!" :
                    "¡Revisa aquí cuando los profesionales los planifiquen!"
                  }`
                }
              />
            ) : (
              <ObjetivosGeneralesLista
                objetivosGenerales={objetivosEnProgreso}
                onChange={() => fetchObjetivosGenerales(true)}
                setToast={setToast}
              />
            )
          ) : selectedTab === "completados" ? (
            objetivosCompletados.length === 0 ? (
              <MensajeVacio
                mensaje={
                  `No se encontraron objetivos generales completados.\n${
                    isProfesional ? "¡Comienza a planificar el trabajo del paciente usando el botón ＋!" :
                    "¡Revisa aquí cuando los profesionales los planifiquen!"
                  }`
                }
              />
            ) : (
              <ObjetivosGeneralesLista
                objetivosGenerales={objetivosCompletados}
                onChange={() => fetchObjetivosGenerales(true)}
                setToast={setToast}
              />
            )
          ) : null}
        </>
      )}
      {/* BOTONES FLOTANTES */}
      {isProfesional ? <BotonAgregar onPress={handleAgregarObjetivoGeneral} /> : null}
      <BotonProgreso onPress={handleProgreso}/>
      {/* TOAST */}
      {toast && (
        <CustomToast
          text1={toast.text1}
          text2={toast.text2}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}
    </View>
  )
}