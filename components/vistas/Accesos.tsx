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
import { useLocalSearchParams } from "expo-router";

// INTERFACE PARA LOG
interface Log {
  id: string;
  elemento: string;
  nombre_elemento?: string;
  accion: string;
  profesional: string;
  fecha_evento: Date;
  plan_trabajo_nombre?: string;
}

// ICONO DE LOG
interface LogIconProps {
  elemento: string;
  accion: string;
}
const LogIcon = ({ elemento, accion }: LogIconProps) => {
  let iconName: keyof typeof Ionicons.glyphMap = "information-circle";
  let iconColor = colors.mediumgrey;

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
  // Conjugaciones por acción
  const acciones: Record<string, string> = {
    subir: "subió",
    visualizar: "visualizó",
    descargar: "descargó",
    acceder: "accedió a",
    crear: "creó",
    iniciar: "inició",
    editar: "editó",
    eliminar: "eliminó",
    cerrar: "cerró",
  };

  const accionTexto = acciones[log.accion] || log.accion;

  // Frases según elemento
  let descripcion = "";

  switch (log.elemento) {
    case "datos del paciente":
      descripcion = `Profesional ${log.profesional} ${accionTexto} los datos del paciente.`;
      break;

    case "informe":
      descripcion = `Profesional ${log.profesional} ${accionTexto} el informe${log.nombre_elemento ? ` "${log.nombre_elemento}"` : ""}.`;
      break;

    case "bitacora":
      descripcion = `Profesional ${log.profesional} ${accionTexto} la bitácora.`;
      break;

    case "entrada de bitacora":
      descripcion = `Profesional ${log.profesional} creó una entrada en la bitácora${log.nombre_elemento ? ` "${log.nombre_elemento}"` : ""}.`;
      break;

    case "sesion":
      descripcion = `Profesional ${log.profesional} ${accionTexto} sesión.`;
      break;

    case "medicamento":
      descripcion = `Profesional ${log.profesional} ${accionTexto} los medicamentos.`;
      break;

    case "plan de trabajo":
      descripcion = `Profesional ${log.profesional} ${accionTexto} el plan de trabajo.`;
      break;

    case "objetivo general":
      descripcion = `Profesional ${log.profesional} ${accionTexto} el objetivo general${log.nombre_elemento ? ` "${log.nombre_elemento}"` : ""}.`;
      break;

    case "objetivo especifico":
      descripcion = `Profesional ${log.profesional} ${accionTexto} el objetivo específico${log.nombre_elemento ? ` "${log.nombre_elemento}"` : ""}.`;
      break;

    case "progreso":
      descripcion = `Profesional ${log.profesional} ${accionTexto} la sección de progreso.`;
      break;

    default:
      descripcion = `Profesional ${log.profesional} ha realizado la acción "${log.accion}" sobre "${log.elemento}".`;
  }

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
const LogsLista = ({ logs }: LogsListaProps) => (
  <FlatList
    data={logs}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => <LogItem log={item} />}
    contentContainerStyle={{ paddingBottom: 55 }}
  />
);

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

  const { paciente } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID] = pacienteString?.split("-") ?? [null, null];

  useEffect(() => {
    fetchLogs();
  }, [authToken, refreshToken]);

  const fetchLogs = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.get(`/logs/${pacienteID}/`);
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
      <Titulo onPressRecargar={fetchLogs}>Logs</Titulo>

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