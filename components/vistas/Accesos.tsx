import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { useAuth } from "@/context/auth";
import { colors } from "@/constants/colors";
import { Titulo } from "@/components/base/Titulo";
import { CustomToast } from "@/components/base/Toast";
import { TarjetaOpcion } from "@/components/base/Tarjeta";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { formatearFechaString } from "@/components/base/FormatearFecha";
import { useLocalSearchParams} from "expo-router";

// INTERFACE PARA LOG
interface Log {
  id: string;
  elemento: string;
  nombre_elemento?: string;
  accion: string;
  profesional: string;
  fecha_evento: Date;
}

// ICONO DE LOG
interface LogIconProps {
  elemento: string;
  accion: string;
}
const LogIcon = ({ elemento, accion }: LogIconProps) => {
  let iconName: keyof typeof Ionicons.glyphMap = "information-circle";
  let iconColor = colors.mediumgrey;

  // Iconos según el tipo de log
  switch (accion) {
    case "crear":
    case "iniciar":
      iconColor = colors.mediumgreen;
      break;
    case "editar":
      iconColor = colors.mediumyellow;
      break;
    case "eliminar":
    case "cerrar":
      iconColor = colors.mediumred;
      break;
    default:
      iconColor = colors.mediumgrey;
  }

  return (
    <View className="rounded-full justify-center items-center bg-gray-200 p-2">
      <Ionicons name={iconName} size={24} color={iconColor} />
    </View>
  );
};

// ITEM DE LOG
interface LogItemProps {
  log: Log;
}
const LogItem = ({ log }: LogItemProps) => {
  // Texto descriptivo
  const descripcion = `${log.profesional} ${log.accion} ${log.elemento}${log.nombre_elemento ? ` "${log.nombre_elemento}"` : ""}.`;

  return (
    <TarjetaOpcion
      antetitulo={log.elemento}
      titulo={descripcion}
      subtitulo={formatearFechaString(log.fecha_evento, {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
      icono={<LogIcon elemento={log.elemento} accion={log.accion} />}
      tituloTamano="text-base"
      iconoFondoColor={colors.primary}
    />
  );
};

// LISTA DE LOGS
interface LogsListaProps {
  logs: Log[];
}
const LogsLista = ({ logs }: LogsListaProps) => {
  return (
    <FlatList
      data={logs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <LogItem log={item} />}
      contentContainerStyle={{ paddingBottom: 55 }}
    />
  );
};

// VISTA PRINCIPAL
export function Accesos() {
  const { authToken, refreshToken, createApi, setAuthToken } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState<{
    text1: string;
    text2?: string;
    type: "success" | "error";
  } | null>(null);

  //Buscamos parámetros locales para conseguir el id del plan (pacienteID)
  const { paciente, recargar, success } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];


  useEffect(() => {
    fetchLogs();
  }, [authToken, refreshToken]);

  // FETCH LOGS
  const fetchLogs = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.get(`/logs/${pacienteID}/`); //Realizamos la llamada
      const logsData: Log[] = res.data.map((l: any) => ({
        ...l,
        fecha_evento: new Date(l.fecha_evento),
      }));
      setLogs(logsData);
      setError(false);
    } catch (err) {
      console.error("[logs] Error al obtener logs:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1">
      {/* TÍTULO */}
      <Titulo onPressRecargar={fetchLogs}>Logs</Titulo>

      {/* CUERPO */}
      {isLoading ? (
        <IndicadorCarga />
      ) : error ? (
        <MensajeVacio
          mensaje="Hubo un error al cargar los logs. Intenta nuevamente."
          onPressRecargar={fetchLogs}
        />
      ) : logs.length === 0 ? (
        <MensajeVacio mensaje="No se encontraron logs." />
      ) : (
        <LogsLista logs={logs} />
      )}

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