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

//OBSERVACIÓN
interface Observacion {
  id: string;
  titulo: string;
  fecha_observacion: Date;
  hora_observacion: Date;
  descripcion: string;
  fecha_creacion: Date;
  fecha_modificacion?: Date;
}

//ICONO: OBSERVACION
export function ObservacionIcono() {
  return (
    <View className="rounded-full justify-center items-center">
      <Ionicons name={Icons["observacion"].iconName} size={30} color={colors.white}/>
    </View>
  );
}

//ITEM: OBSERVACION
interface ObservacionItemProps {
  observacion: Observacion;
  onChange: () => void;
  setToast: React.Dispatch<
    React.SetStateAction<{
      text1: string;
      text2?: string;
      type: "success" | "error";
    } | null>
  >;
}
const ObservacionItem = ({
  observacion,
  onChange,
  setToast
}: ObservacionItemProps) => {
  
  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const isProfesional = user?.role === "profesional";
  const router = useRouter();
  const { paciente } = useLocalSearchParams();
  const [pacienteID] = paciente[0].split("-");
  
  //HANDLE: EDITAR
  const handleEditar = () => {
    console.log("[observaciones] Editando observación:", observacion.id);
    router.push(`/cuidador/${paciente}/observaciones/observacion-agregar?id=${observacion.id}`);
  };

  //HANDLE: ELIMINAR
  const handleEliminar = () => {
    Alert.alert(
      "Eliminar observación",
      `¿Estás segur@ de que quieres eliminar "${observacion.titulo}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => {console.log("[observaciones] Eliminando observacion:", observacion.id);
          {
            if (!authToken || !refreshToken) return;
            const api = createApi(authToken, refreshToken, setAuthToken);
            api
              .delete(`/observaciones/${pacienteID}/${observacion.id}/`, { timeout: 5000 })
              .then((res: any) => {
                console.log("[observaciones] Respuesta:", res.status);
                setToast({ text1: "Observación eliminada exitosamente.", type: "success" });
                onChange();
              })
              .catch((err: any) => {
                console.log("[observaciones] Error:", err.message);
                setToast({ text1: "Hubo un problema al eliminar la observación.", text2: "Intenta nuevamente.", type: "error" });
                onChange();
              });
          } 
        }, style: "destructive" },
      ]
    );
  };

  //VISTA
  return (
    <TarjetaExpandible
      titulo={observacion.titulo}
      subtitulo={
        observacion.hora_observacion
          ? `Fecha: ${formatearFechaString(observacion.fecha_observacion, { day: "numeric", month: "long", year: "numeric"  })}, ${formatearFechaString(observacion.hora_observacion, { hour: "2-digit", minute: "2-digit", hour12: false })}`
          : `Fecha: ${formatearFechaString(observacion.fecha_observacion, { day: "numeric", month: "long", year: "numeric"  })}`
      }
      icono={<ObservacionIcono/>}
      expandidoContenido={
        <View className="gap-4">
          {/* DESCRIPCIÓN */}
          {observacion.descripcion?.length > 0 && (<TextoBloque texto={observacion.descripcion}/>)}
          <View className="gap-2">
            {/* OPCIONES */}
            <TituloSeccion children={"Opciones:"}/>
            <View className="flex-row flex-wrap justify-between gap-2" style={{ flexShrink: 1}}>
              {!isProfesional && <BotonEditar onPress={handleEditar}/>}
              {!isProfesional && <BotonEliminar onPress={handleEliminar}/>}
              <BotonDetalles tipoModal={"expandible"}>
                <View className="gap-1">
                  <TituloSeccion
                    children={"Creado:"}
                    respuesta={`${formatearFechaString(observacion.fecha_creacion, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}`}
                  />
                  {observacion.fecha_modificacion && (
                    <TituloSeccion
                      children={"Última modificación:"}
                      respuesta={`${formatearFechaString(observacion.fecha_modificacion, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}`}
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

//LISTA: OBSERVACIONES
interface ObservacionesListaProps {
  observaciones: Observacion[];
  onChange: () => void;
  setToast: React.Dispatch<
    React.SetStateAction<{
      text1: string;
      text2?: string;
      type: "success" | "error";
    } | null>
  >;
}
export function ObservacionesLista({
  observaciones,
  onChange,
  setToast
}: ObservacionesListaProps) {
  return (
    <FlatList
      data={observaciones}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ObservacionItem observacion={item} onChange={onChange} setToast={setToast}/>}
      contentContainerStyle={{ paddingBottom: 55 }}
    />
  );
};

//VISTA: OBSERVACIONES
export function Observaciones() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const isProfesional = user?.role === "profesional";
  const router = useRouter();
  const { paciente, success } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];

  //ESTADOS
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState<{ text1: string; text2?: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchObservaciones();
  }, [authToken, refreshToken]);

  useEffect(() => {
    if (success) {
      setToast({ text1: "Observación guardada exitosamente.", type: "success" });
    }
  }, [success]);

  //FETCH: OBSERVACIONES
  const fetchObservaciones = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[observaciones] Obteniendo observaciones de la base de datos...");
      const res = await api.get(`/observaciones/${pacienteID}`);
      const observacionesFechas: Observacion[] = res.data.map((observacion: any) => ({
        ...observacion,
        fecha_observacion: new Date(observacion.fecha_observacion),
        hora_observacion: observacion.hora_observacion ? new Date(observacion.hora_observacion) : null,
        fecha_creacion: new Date(observacion.fecha_creacion),
        fecha_modificacion: observacion.fecha_modificacion ? new Date(observacion.fecha_modificacion) : null,
      }));
      setObservaciones(observacionesFechas);
      setError(false);
    } catch(err) {
      console.log("[observaciones] Error:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  //HANDLE: AGREGAR-OBSERVACION
  const handleAgregarObservacion = () => {
    console.log("[observaciones] Agregando observación...");
    router.push(`/cuidador/${paciente}/observaciones/observacion-agregar`);
  }

  //FILTRO
  const observacionesBusqueda = observaciones.filter((observacion) => {
    const textoBusqueda = busqueda.toLowerCase();
    const titulo = observacion.titulo?.toLowerCase() ?? "";
    const descripcion = observacion.descripcion?.toLowerCase() ?? "";
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
        onPressRecargar={fetchObservaciones}
        onBusquedaChange={setBusqueda}
      >
        Observaciones
      </Titulo>
      {/* CUERPO */}
      {isLoading ? (
        <IndicadorCarga/>
      ) : error ? (
        <MensajeVacio
          mensaje={`Hubo un error al cargar las observaciones.\nIntenta nuevamente.`}
          onPressRecargar={fetchObservaciones}
        />
      ) : observacionesBusqueda.length === 0 ? (
        <MensajeVacio
          mensaje={`No se encontraron observaciones.\n${
            !isProfesional ? "¡Comienza a registrar observaciones del paciente usando el botón ＋!" :
            "¡Revisa aquí cuando el cuidador los registre!"
          }`}
        />
      ) : (
        <ObservacionesLista
          observaciones={observacionesBusqueda}
          onChange={fetchObservaciones}
          setToast={setToast}
        />
      )}
      {/* BOTÓN FLOTANTE */}
      {!isProfesional && <BotonAgregar onPress={handleAgregarObservacion}/>}
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
  );

}