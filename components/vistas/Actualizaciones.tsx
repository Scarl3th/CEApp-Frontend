import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { colors } from "@/constants/colors";
import { Titulo } from "@/components/base/Titulo";
import { IconType, Icons } from "@/constants/icons";
import { CustomToast } from "@/components/base/Toast";
import { BotonEliminar } from "@/components/base/Boton";
import { TarjetaTresPuntos } from "@/components/base/Tarjeta";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { formatearFechaString } from "@/components/base/FormatearFecha";

//ACTUALIZACIÓN
interface Actualizacion {
  id: string;
  vista: string; //"Plan de trabajo" || "Equipo" (cuidado con mayúsculas)
  nombre_objetivo?: string; //nombre del objetivo (si corresponde a una actualización de objetivos)
  tipo_objetivo?: string; // "general" || "especifico"
  accion: string; //"agregar" || "editar" || "eliminar"
  profesional: string; //Nombre del profesional
  estado_antiguo?: string; //estado antiguo del objetivo específico (solo corresponde si es editar)
  estado_nuevo?: string; //estado nuevo del objetivo específico (solo corresponde si es agregar o editar)
  fecha_creacion: Date; //Fecha de la actualización
}

//ICONO: ACTUALIZACION
interface ActualizacionIconoProps {
  iconoNombre: IconType;
  iconoColor: string;
}
export function ActualizacionIcono({
  iconoNombre,
  iconoColor,
}: ActualizacionIconoProps) {
  return (
    <View className="rounded-full justify-center items-center">
      <Ionicons name={iconoNombre} size={30} color={iconoColor}/>
    </View>
  );
}

//ITEM: ACTUALIZACIÓN
interface ActualizacionItemProps {
  actualizacion: Actualizacion;
  onChange: () => void;
  setToast: React.Dispatch<
    React.SetStateAction<{
      text1: string;
      text2?: string;
      type: "success" | "error";
    } | null>
  >;
}
const ActualizacionItem = ({ actualizacion, onChange, setToast }: ActualizacionItemProps) => {
  
  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const router = useRouter();
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];
  const paciente = ruta_partes[1];

  //HANDLE: ELIMINAR
  const handleEliminar = () => {
    Alert.alert(
      "Eliminar actualización",
      `¿Estás segur@ de que quieres eliminar la actualización?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => {console.log("[actualizaciones] Eliminando actualización:", actualizacion.id);
          {
            if (!authToken || !refreshToken) return;
            const api = createApi(authToken, refreshToken, setAuthToken);
            api
              .delete("/actualizaciones/" + actualizacion.id + "/", {timeout:5000})
              .then((res: any) => {console.log("[actualizaciones] Respuesta:", res.status);
                                   setToast({ text1: "Actualización eliminada exitosamente.", type: "success" });
                                   onChange()})
              .catch((err: any) => {console.log("[actualizaciones] Error:", err.message);
                                    setToast({ text1: "Error al eliminar actualización.", text2: "Intenta nuevamente", type: "error" });
                                    onChange()});
          }
        }, style: "destructive" },
      ]
    );
  };

  //VISTA
  return (
    <TarjetaTresPuntos
      onPress={() => {
        if (actualizacion.vista === "Plan de trabajo") {
          router.replace(`/${rol}/${paciente}/plan`);
        } else if (actualizacion.vista === "Equipo") {
          router.replace(`/${rol}/${paciente}/equipo`);
        }
      }}
      antetitulo={` ${actualizacion.vista}`}
      titulo={
        actualizacion.accion === "agregar" && actualizacion.vista === "Plan de trabajo" && actualizacion.tipo_objetivo === "general" ? `${actualizacion.profesional} agregó el objetivo general "${actualizacion.nombre_objetivo}".` :
        actualizacion.accion === "agregar" && actualizacion.vista === "Plan de trabajo" && actualizacion.tipo_objetivo === "especifico"  ? `${actualizacion.profesional} agregó el objetivo específico "${actualizacion.nombre_objetivo}" con estado "${actualizacion.estado_nuevo}".` :
        actualizacion.accion === "agregar" && actualizacion.vista === "Equipo" ? `${actualizacion.profesional} se unió al plan de trabajo.` :
        actualizacion.accion === "eliminar" && actualizacion.vista === "Plan de trabajo" && actualizacion.tipo_objetivo === "general" ? `${actualizacion.profesional} eliminó el objetivo general "${actualizacion.nombre_objetivo}".` :
        actualizacion.accion === "eliminar" && actualizacion.vista === "Plan de trabajo" && actualizacion.tipo_objetivo === "especifico" ? `${actualizacion.profesional} eliminó el objetivo específico "${actualizacion.nombre_objetivo}".` :
        actualizacion.accion === "eliminar" && actualizacion.vista === "Equipo" ? `${actualizacion.profesional} fue deshabilitado del plan de trabajo.` :
        actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "general" ? `${actualizacion.profesional} editó el objetivo general "${actualizacion.nombre_objetivo}".` :
        actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo == actualizacion.estado_nuevo ? `${actualizacion.profesional} editó el objetivo específico "${actualizacion.nombre_objetivo}".` :
        actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo != actualizacion.estado_nuevo ? `${actualizacion.profesional} editó el objetivo específico "${actualizacion.nombre_objetivo}", actualizando su estado de "${actualizacion.estado_antiguo}" a "${actualizacion.estado_nuevo}".` :
        ""
      }
      subtitulo={`${formatearFechaString(actualizacion.fecha_creacion, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`}
      icono={
        <ActualizacionIcono
          iconoNombre={
            actualizacion.accion === "agregar" && actualizacion.vista === "Plan de trabajo" ? Icons["agregar"].iconName :
            actualizacion.accion === "agregar" && actualizacion.vista === "Equipo" ? Icons["vincular"].iconName :
            actualizacion.accion === "eliminar" && actualizacion.vista === "Plan de trabajo" ? Icons["eliminar"].iconName :
            actualizacion.accion === "eliminar" && actualizacion.vista === "Equipo" ? Icons["desvincular"].iconName :
            (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "general") || (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo == actualizacion.estado_nuevo) ? Icons["editar"].iconName :
            (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo != actualizacion.estado_nuevo) && actualizacion.estado_nuevo === "Logrado" ? Icons["objetivos_especificos_logrado"].iconName :
            (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo != actualizacion.estado_nuevo) && actualizacion.estado_nuevo === "Medianamente logrado" ? Icons["objetivos_especificos_medianamente_logrado"].iconName :
            (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo != actualizacion.estado_nuevo) && actualizacion.estado_nuevo === "No logrado" ? Icons["objetivos_especificos_no_logrado"].iconName :
            Icons["inactivo"].iconName
          }
          iconoColor={
            actualizacion.accion === "agregar" ? colors.white :
            actualizacion.accion === "eliminar" ? colors.mediumred :
            (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "general") || (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo == actualizacion.estado_nuevo) ? colors.mediumgreen :
            (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo != actualizacion.estado_nuevo) && actualizacion.estado_nuevo === "Logrado" ? colors.mediumgreen :
            (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo != actualizacion.estado_nuevo) && actualizacion.estado_nuevo === "Medianamente logrado" ? colors.mediumyellow :
            (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo != actualizacion.estado_nuevo) && actualizacion.estado_nuevo === "No logrado" ? colors.mediumred :
            colors.mediumgrey
          }
        />}
      iconoFondoColor={
        actualizacion.accion === "agregar" ? colors.secondary :
        actualizacion.accion === "eliminar" ? colors.lightred :
        (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "general") || (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo == actualizacion.estado_nuevo) ? colors.lightgreen :
        (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo != actualizacion.estado_nuevo) && actualizacion.estado_nuevo === "Logrado" ? colors.lightgreen :
        (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo != actualizacion.estado_nuevo) && actualizacion.estado_nuevo === "Medianamente logrado" ? colors.lightyellow :
        (actualizacion.accion === "editar" && actualizacion.tipo_objetivo === "especifico" && actualizacion.estado_antiguo != actualizacion.estado_nuevo) && actualizacion.estado_nuevo === "No logrado" ? colors.lightred :
        colors.primary
      }
      tituloTamano={"text-base"}
      tipoModal={"expandible"}
      tresPuntosContenido={
        <BotonEliminar onPress={handleEliminar} tipo={"horizontal"}/>
      }
    />
  );
};

//LISTA: ACTUALIZACIONES
interface ActualizacionesListaProps {
  actualizaciones: Actualizacion[];
  onChange: () => void;
  setToast: React.Dispatch<
    React.SetStateAction<{
      text1: string;
      text2?: string;
      type: "success" | "error";
    } | null>
  >;
}
export function ActualizacionesLista({ actualizaciones, onChange, setToast }: ActualizacionesListaProps) {
  return (
    <FlatList
      data={actualizaciones}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ActualizacionItem actualizacion={item} onChange={onChange} setToast={setToast}/>}
      contentContainerStyle={{ paddingBottom: 55 }}
    />
  );
};

//VISTA: ACTUALIZACIONES
export function Actualizaciones() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const isProfesional = user?.role === "profesional";
  const router = useRouter();
  const { paciente } = useLocalSearchParams();

  //ESTADOS
  const [actualizaciones, setActualizaciones] = useState<Actualizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState<{ text1: string; text2?: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchActualizaciones();
  }, [authToken, refreshToken]);

  //FETCH: ACTUALIZACIONES
  const fetchActualizaciones = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[actualizaciones] Obteniendo actualizaciones de la base de datos...");
      const res = await api.get("/actualizaciones/");
      const actualizacionesFechas: Actualizacion[] = res.data.map((obs: any) => ({
        ...obs,
        fecha_creacion: new Date(obs.fecha_creacion),
      }));
      setActualizaciones(actualizacionesFechas);
      setError(false);
    } catch(err) {
      console.log("[actualizaciones] Error:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  //FILTRO
  const actualizacionesBusqueda = actualizaciones.filter((actualizacion) => {
    const textoBusqueda = busqueda.toLowerCase();
    const vista = actualizacion.vista?.toLowerCase() ?? "";
    const nombre_objetivo = actualizacion.nombre_objetivo?.toLowerCase() ?? "";
    const accion = actualizacion.accion?.toLowerCase() ?? "";
    const profesional = actualizacion.profesional?.toLowerCase() ?? "";
    const estado_antiguo = actualizacion.estado_nuevo?.toLowerCase() ?? "";
    const estado_nuevo = actualizacion.estado_antiguo?.toLowerCase() ?? "";
    return (
      vista.includes(textoBusqueda) ||
      nombre_objetivo.includes(textoBusqueda) ||
      accion.includes(textoBusqueda) ||
      profesional.includes(textoBusqueda) ||
      estado_antiguo.includes(textoBusqueda) ||
      estado_nuevo.includes(textoBusqueda)
    );
  });

  //VISTA
  return (
    <View className="flex-1">
      <Titulo
        onPressRecargar={fetchActualizaciones}
        onBusquedaChange={setBusqueda}
      >
        Actualizaciones
      </Titulo>
      {isLoading ? (
        <IndicadorCarga/>
      ) : error ? (
        <MensajeVacio
          mensaje={`Hubo un error al cargar las actualizaciones.\nIntenta nuevamente.`}
          onPressRecargar={fetchActualizaciones}
        />
      ) : actualizaciones.length === 0 ? (
        <MensajeVacio mensaje={`Aún no tienes actualizaciones.`}/>
      ) : (
        <ActualizacionesLista
          actualizaciones={actualizacionesBusqueda}
          onChange={fetchActualizaciones}
          setToast={setToast}
        />
      )}
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