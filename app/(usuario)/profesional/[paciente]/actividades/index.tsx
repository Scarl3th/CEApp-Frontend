import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";
import { CustomToast } from "@/components/base/Toast";
import { TextoBloque } from "@/components/base/TextoBloque";
import { TarjetaExpandible } from "@/components/base/Tarjeta";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { Titulo, TituloSeccion } from "@/components/base/Titulo";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { formatearFechaString } from "@/components/base/FormatearFecha";
import { BotonAgregar, BotonDetalles, BotonEditar, BotonEliminar } from "@/components/base/Boton";

//ACTIVIDAD
interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_creacion: Date;
  fecha_modificacion?: Date;
}

//ICONO: ACTIVIDAD
export function ActividadIcono() {
  return (
    <View className="rounded-full justify-center items-center">
      <Ionicons name={Icons["actividad"].iconName} size={30} color={colors.white}/>
    </View>
  );
}

//ITEM: ACTIVIDAD
interface ActividadItemProps {
  actividad: Actividad;
  onChange: () => void;
  setToast: React.Dispatch<
    React.SetStateAction<{
      text1: string;
      text2?: string;
      type: "success" | "error";
    } | null>
  >;
}
const ActividadItem = ({
  actividad,
  onChange,
  setToast
}: ActividadItemProps) => {
  
  const { authToken, refreshToken, createApi, setAuthToken } = useAuth();
  const router = useRouter();
  const { paciente } = useLocalSearchParams();
  
  //HANDLE: EDITAR
  const handleEditar = () => {
    console.log("[actividades] Editando actividad:", actividad.id);
    router.push(`/profesional/${paciente}/actividades/actividad-agregar?id=${actividad.id}`);
  };

  //HANDLE: ELIMINAR
  const handleEliminar = () => {
    Alert.alert(
      "Eliminar actividad",
      `¿Estás segur@ de que quieres eliminar "${actividad.titulo}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => {console.log("[actividades] Eliminando actividad:", actividad.id);
          {
            if (!authToken || !refreshToken) return;
            const api = createApi(authToken, refreshToken, setAuthToken);
            api
              .delete("/actividades/" + actividad.id + "/", { timeout: 5000 })
              .then((res: any) => {console.log("[actividades] Respuesta:", res.status);
                                   setToast({ text1: "Actividad eliminada exitosamente.", type: "success" });
                                   onChange()})
              .catch((err: any) => {console.log("[actividades] Error:", err.message);
                                    setToast({ text1: "Hubo un problema al eliminar la actividad.", text2: "Intenta nuevamente.", type: "error" });
                                    onChange()});
          } 
        }, style: "destructive" },
      ]
    );
  };

  //VISTA
  return (
    <TarjetaExpandible
      titulo={actividad.titulo}
      icono={<ActividadIcono/>}
      expandidoContenido={
        <View className="gap-4">
          {/* DESCRIPCIÓN */}
          {actividad.descripcion?.length > 0 && (<TextoBloque texto={actividad.descripcion}/>)}
          <View className="gap-2">
            {/* OPCIONES */}
            <TituloSeccion children={"Opciones:"}/>
            <View className="flex-row flex-wrap justify-between gap-2" style={{ flexShrink: 1}}>
              <BotonEditar onPress={handleEditar}/>
              <BotonEliminar onPress={handleEliminar}/>
              <BotonDetalles tipo={"vertical"} tipoModal={"expandible"}>
                <View className="gap-1">
                  <TituloSeccion
                    children={"Creado:"}
                    respuesta={`${formatearFechaString(actividad.fecha_creacion, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}`}
                  />
                  {actividad.fecha_modificacion && (
                    <TituloSeccion
                      children={"Última modificación:"}
                      respuesta={`${formatearFechaString(actividad.fecha_creacion, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}`}
                    />
                  )}
                </View>
              </BotonDetalles>
            </View>
          </View>
        </View>
      }
    />
  );
};

//LISTA: ACTIVIDADES
interface ActividadesListaProps {
  actividades: Actividad[];
  onChange: () => void;
  setToast: React.Dispatch<
    React.SetStateAction<{
      text1: string;
      text2?: string;
      type: "success" | "error";
    } | null>
  >;
}
export function ActividadesLista({
  actividades,
  onChange,
  setToast
}: ActividadesListaProps) {
  return (
    <FlatList
      data={actividades}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ActividadItem actividad={item} onChange={onChange} setToast={setToast}/>}
      contentContainerStyle={{ paddingBottom: 55 }}
    />
  );
};
  
//VISTA: ACTIVIDADES
export default function Actividades() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const router = useRouter();
  const { paciente, success } = useLocalSearchParams();
  
  //ESTADOS
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState<{ text1: string; text2?: string; type: "success" | "error" } | null>(null);

  useEffect(() => {  
    fetchActividades();
  },[authToken, refreshToken]);

  useEffect(() => {
    if (success) {
      setToast({ text1: "Actividad guardada exitosamente.", type: "success" });
    }
  }, [success]);
    
  //FETCH: ACTIVIDADES
  const fetchActividades = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[actividades] Obteniendo actividades de la base de datos...");
      const res = await api.get("/actividades/");
      const actividadesFechas: Actividad[] = res.data.map((actividad: any) => ({
        ...actividad,
        fecha_creacion: new Date(actividad.fecha_creacion),
        fecha_modificacion: actividad.fecha_modificacion ? new Date(actividad.fecha_modificacion) : null,
      }));
      setActividades(actividadesFechas);
      setIsLoading(false);
      setError(false);
    } catch (err) {
      console.log("[actividades] Error:", err);
      setIsLoading(false);
      setError(true);
    };
  };
  
  //HANDLE: AGREGAR-ACTIVIDAD
  const handleAgregarActividad = () => {
    console.log("[actividades] Agregando actividad...")
    router.push(`/profesional/${paciente}/actividades/actividad-agregar`);
  }

  //FILTRO
  const actividadesBusqueda = actividades.filter((actividad) => {
    const textoBusqueda = busqueda.toLowerCase();
    const titulo = actividad.titulo?.toLowerCase() ?? "";
    const descripcion = actividad.descripcion?.toLowerCase() ?? "";
    return (
      titulo.includes(textoBusqueda) ||
      descripcion.includes(textoBusqueda)
    );
  });

  //VISTA
  return (
    <View className="flex-1">
      {/* TÍTULO */}
      <Titulo
        onPressRecargar={fetchActividades}
        onBusquedaChange={setBusqueda}
      >
        Actividades
      </Titulo>
      {/* CUERPO */}
      {isLoading ? (
        <IndicadorCarga/>
      ) : error ? (
        <MensajeVacio
          mensaje={`Hubo un error al cargar las actividades.\nIntenta nuevamente.`}
          onPressRecargar={fetchActividades}
        />
      ) : actividadesBusqueda.length === 0 ? (
        <MensajeVacio mensaje={`No se encontraron actividades.\n¡Comienza a planificar el trabajo del paciente usando el botón ＋!`}/>
      ) : (
        <ActividadesLista
          actividades={actividadesBusqueda}
          onChange={fetchActividades}
          setToast={setToast}
        />
      )}
      {/* BOTÓN FLOTANTE */}
      <BotonAgregar onPress={handleAgregarActividad}/>
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