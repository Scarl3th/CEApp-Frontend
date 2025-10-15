import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getDay, format, parseISO } from "date-fns";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";
import { CustomToast } from "@/components/base/Toast";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { TarjetaTresPuntos } from "@/components/base/Tarjeta";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { BotonAgregar, BotonEditar, BotonEliminar } from "@/components/base/Boton";

//CALENDARIO EN ESPAÑOL
LocaleConfig.defaultLocale = 'es';
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  monthNamesShort: [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};

//Convierte XX:XX:XX con hora UTC a XX:XX con hora local
function utcToLocalTime(horaUTC: string) {
  const [hours, minutes, seconds] = horaUTC.split(":").map(Number);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const day = today.getDate();

  // Crear Date en UTC
  const fechaHoraUTC = new Date(Date.UTC(year, month, day, hours, minutes, seconds || 0));

  // Convertir a hora local
  return fechaHoraUTC.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

//CALENDARIO
export function Calendario() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const router = useRouter();
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const { paciente, success } = useLocalSearchParams();
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];
  const isProfesional = user?.role === "profesional";

  //ESTADOS
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [eventos, setEventos] = useState([])
  const [selectedDate, setSelectedDate] = useState("");
  const [markedDates, setMarkedDates] = useState({});
  const [toast, setToast] = useState<{ text1: string; text2?: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchEventos();
  }, [authToken, refreshToken]);

  useEffect(() => {
    if (success) {
      setToast({ text1: "Evento guardado exitosamente.", type: "success" });
    }
  }, [success]);

  //Cargar datos al principio
  useEffect(() => {
    const today = new Date();
    const localFechaString = today.toLocaleDateString("en-CA");
    setSelectedDate(localFechaString);
  }, []);

  //Recalcular marcados cuando se cargan los eventos
  useEffect(() => {
    if (eventos.length > 0) {
      const today = new Date();
      handleMonthChange({ year: today.getFullYear(), month: today.getMonth() + 1 });
    }
  }, [eventos]);

  //FETCH: EVENTOS
  const fetchEventos = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    console.log("[calendario] Obteniendo eventos de la base de datos...");
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.get(`eventos/`);
      console.log("[calendario] Respuesta:", res.data);
      setEventos(res.data);
      setIsLoading(false);
      setError(false);
    } catch (err) {
      console.log("[calendario] Error:", err);
      setIsLoading(false);
      setError(true);
    }
  }

  //OBTENER EVENTOS DEL DÍA SELECCIONADO
  const eventosDelDia = (fecha: any) => {
    const dateObj = parseISO(fecha);
    dateObj.setHours(0, 0, 0, 0); // normalizamos a medianoche
    const dayOfWeek = getDay(dateObj);
    const dayOfMonth = dateObj.getDate();
    return eventos.filter((evento) => {
      const eventDay = parseISO(evento.fecha);
      eventDay.setHours(0, 0, 0, 0); // normalizamos también
      if (evento.tipo === "semanal") {
        return evento.dia_semana === dayOfWeek && dateObj >= eventDay;
      }
      if (evento.tipo === "mensual") {
        return evento.dia_mensual === dayOfMonth && dateObj >= eventDay;
      }
      return evento.fecha === fecha;
    });
  };

  // Marcar días con puntitos y día seleccionado
  const handleMonthChange = (month) => {

    const year = month.year;
    const monthIndex = month.month;
    const daysInMonth = new Date(year, month.month, 0).getDate();
    const newMarked = {};

    for (let day = 1; day <= daysInMonth; day++) {
     
      const dateObj = parseISO(year+"-"
                              +(monthIndex>9? monthIndex: "0"+String(monthIndex))+"-"
                              +(day>9? day: "0"+String(day)));
      
      // normalizamos a medianoche
      dateObj.setHours(0, 0, 0, 0);
      const dateStr = dateObj.toISOString().split("T")[0];
      const dayOfWeek = getDay(dateObj);
      const dayOfMonth = dateObj.getDate();
      const eventosDelDia = eventos.filter((evento) => {
        const eventDay = parseISO(evento.fecha);
        eventDay.setHours(0, 0, 0, 0); // normalizamos también
        // si es recurrente semanal
        if (evento.tipo === "semanal") {
          return evento.dia_semana === dayOfWeek && dateObj >= eventDay;
        }
        // si es recurrente mensual
        if (evento.tipo === "mensual") {
          return evento.dia_mensual === dayOfMonth && dateObj >= eventDay;
        }
        // evento puntual
        return evento.fecha === dateStr;
      });
      if (eventosDelDia.length > 0) {
        const dots = eventosDelDia.slice(0, 3).map((e) => ({
          key: e.id,
          color: e.color,
        }));
        newMarked[dateStr] = { dots, marked: true };
      }
    }
    setMarkedDates(newMarked);
  };

  //HANDLE: AGREGAR EVENTO
  const handleAgregarEvento = () => {
    console.log("[Calendario] Agregando Evento...")
    router.push(`/${rol}/${paciente}/calendario/evento-agregar?date=${selectedDate}`);
  }

  //HANDLE: EDITAR EVENTO
  const handleEditarEvento = (id: number) => {
    console.log(`[Calendario] Editando evento ${id}...`);
    router.push(`/${rol}/${paciente}/calendario/evento-agregar?id=${id}`);
  }

  //HANDLE: ELIMINAR EVENTO
  const handleEliminarEvento = (id: number) => {
    Alert.alert(
      "Eliminar evento",
      "¿Estás segur@ de que quieres eliminar este evento?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: async () => {
            try {
              console.log("[calendario] Eliminando evento:", id);
              const api = createApi(authToken, refreshToken, setAuthToken);
              await api.delete(`/eventos/${id}/`); 
              console.log("[calendario] Evento eliminado correctamente...");
              setToast({ text1: "Evento eliminado exitosamente.", type: "success" });
              fetchEventos();
            } catch (err) {
              console.error("[calendario] Hubo un problema al eliminar el evento:", err);
              setToast({ text1: "Hubo un problema al eliminar el evento.", text2: "Intenta nuevamente.", type: "error" });
            }
          }
        }
      ]
    );
  };

  const eventosDelDiaSeleccionada = selectedDate ? eventosDelDia(selectedDate) : [];
  const today = new Date();
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [year, month, day] = selectedDate.split("-").map(Number);
  const selectedDateLocal = new Date(year, month - 1, day);

  //ITEM: EVENTO
  const renderEvento = ({ item }) => (
    <TarjetaTresPuntos
      titulo={item.title}
      iconoFondoColor={item.color}
      subtituloAlternativo={
        <View className="flex-1 gap-1">
          {item.hora_inicio && (
            <Text className="text-mediumdarkgrey text-sm">
              {utcToLocalTime(item.hora_inicio)}
              {item.hora_termino && " - " + utcToLocalTime(item.hora_termino)}
            </Text>
          )}
          {item.profesional && (
            <View className="gap-1 flex-row items-center">
              <Ionicons name={Icons["usuario"].iconName} size={15} color={colors.mediumgrey}/>
              <Text className="text-mediumdarkgrey text-sm">
                {item.profesional}
              </Text>
            </View>
          )}
          {item.plan && (
            <View className="gap-1 flex-row items-center">
              <Ionicons name={Icons["paciente"].iconName} size={15} color={colors.mediumgrey}/>
              <Text className="text-mediumdarkgrey text-sm">
                {item.plan}
              </Text>
            </View>
          )}
        </View>
      }
      descripcion={
        item.descripcion?.length > 0 
          ? item.descripcion
          : undefined
      }
      tresPuntosContenido={
        <>
          <BotonEditar tipo={"horizontal"} onPress={() => handleEditarEvento(item.id)}/>
          <BotonEliminar tipo={"horizontal"} onPress={() => handleEliminarEvento(item.id)}/>
        </>
      }
    />
  );
  
  //VISTA
  return (
    <View className="flex-1">
      {/* CUERPO */}
      {isLoading ? (
        <IndicadorCarga/>
      ) : error ? (
        <MensajeVacio
          mensaje={`Hubo un error al cargar los eventos.\nIntenta nuevamente.`}
          onPressRecargar={fetchEventos}
        />
      ) : (
        <>
          <Calendar
            current={new Date().toISOString().split("T")[0]}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            onMonthChange={handleMonthChange}
            markedDates={markedDates}
            markingType={"multi-dot"}
            theme={{
              backgroundColor: colors.light,
              calendarBackground: colors.light,
              arrowColor: colors.primary,
              monthTextColor: colors.primary,
              textMonthFontSize: 20,
              textMonthFontWeight: "bold", 
              textDayHeaderFontSize: 14, 
              textDayHeaderFontWeight: "600", 
            }}
            dayComponent={({ date, state, marking }) => {
              const isSelected = date.dateString === selectedDate;
              const eventosDia = marking?.dots ?? [];
              const today = new Date();
              const todayString =
                today.getFullYear() +
                "-" +
                String(today.getMonth() + 1).padStart(2, "0") +
                "-" +
                String(today.getDate()).padStart(2, "0");
              const isToday = date.dateString === todayString;
              return (
                <Pressable
                  onPress={() => setSelectedDate(date.dateString)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      isSelected ? colors.lightmediumgrey :
                      "transparent",
                    borderWidth: 2,
                    borderColor:
                      isToday ? colors.secondary :
                      "transparent",
                  }}
                >
                  <Text
                    style={{
                      color: state === "disabled" ? colors.mediumlightgrey : colors.black
                    }}
                  >
                    {date.day}
                  </Text>
                  {/* Dots de eventos */}
                  {eventosDia.length > 0 && (
                    <View style={{ flexDirection: "row", marginTop: 2 }}>
                      {eventosDia.map((dot) => (
                        <View
                          key={dot.key}
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 999,
                            backgroundColor: dot.color,
                            marginHorizontal: 1,
                          }}
                        />
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            }}
          />
          <View className="my-4 mx-2 flex-1">
            <Text className="font-bold text-black text-lg mb-2">Eventos del {selectedDate && format(parseISO(selectedDate), "d 'de' MMMM 'de' yyyy", { locale: es })}:</Text>
            {eventosDelDiaSeleccionada.length > 0 ? (
              <FlatList
                data={eventosDelDiaSeleccionada}
                keyExtractor={(item) => item.id}
                renderItem={renderEvento}
                contentContainerStyle={{ paddingBottom: 55 }}
              />
            ) : (
              <Text className="text-base text-gray-500 p-3 text-center">{`No se encontraron eventos para este día.\n¡Comienza a crear eventos usando el botón ＋!`}</Text>
            )}
          </View>
          {/* BOTÓN FLOTANTE */}
          {selectedDateLocal >= todayLocal && (
            <BotonAgregar onPress={handleAgregarEvento}/>
          )}
        </>
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