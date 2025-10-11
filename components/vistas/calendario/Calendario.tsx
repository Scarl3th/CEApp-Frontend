import { BotonAccionIcon, BotonAgregar, BotonDescripcion } from "@/components/base/Boton";
import { TituloSeccion } from "@/components/base/Titulo";
import { useAuth } from "@/context/auth";
import { Ionicons } from "@expo/vector-icons";
import { getDay, parseISO } from "date-fns";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

// Lista de eventos con color de ejemplo
/*
const eventos = [
  { id: "1", title: "Reunión semanal", diaSemana: 2, color: "blue", hora: "10:00", descripcion: "Revisión de proyecto" },
  { id: "2", title: "Llamada con cliente", diaSemana: 3, color: "green", hora: "14:00", descripcion: "Feedback de avances" },
  { id: "3", title: "Entrega de proyecto", fecha: "2025-09-24", color: "orange", hora: "16:00", descripcion: "Enviar a cliente final" },
  { id: "4", title: "Evento especial", fecha: "2025-09-23", color: "purple", descripcion: "Recordatorio especial" },
  { id: "5", title: "Otra reunión", diaSemana: 2, color: "red", hora: "11:30" },
  { id: "6", title: "Evento mensual", diaMensual: 31, color: "teal", hora: "09:00", descripcion: "Cierre de mes" }, // nuevo evento mensual
];
*/

//Establecer calendario en español
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

LocaleConfig.defaultLocale = 'es';

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

export function Calendario() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const parametros = useLocalSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const recargar = parametros.recargar;
  const paciente = parametros.paciente;
  const isProfesional = user?.role === "profesional";

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBoton, setIsLoadingBoton] = useState(false);
  const [error, setError] = useState(false);
  
  const [eventos, setEventos] = useState([])
  const [selectedDate, setSelectedDate] = useState("");
  const [markedDates, setMarkedDates] = useState({});

  //Fetch a los eventos al principio
  useEffect(() => {
    fetchEventos();
  }, [authToken, refreshToken]);

  // Cargar datos al principio
  useEffect(() => {
    const today = new Date();
    const localFechaString = today.toLocaleDateString("en-CA");
    setSelectedDate(localFechaString);
  }, []);

  // Recalcular marcados cuando se cargan los eventos
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

  // Obtener eventos del día seleccionado
  const eventosDelDia = (fecha) => {
    const dateObj = parseISO(fecha);
    dateObj.setHours(0, 0, 0, 0); // normalizamos a medianoche
    const dayOfWeek = getDay(dateObj);
    const dayOfMonth = dateObj.getDate();

    return eventos.filter((evento) => {
      const eventDay = parseISO(evento.fecha);
      eventDay.setHours(0, 0, 0, 0); // normalizamos también

      if (evento.dia_semana) {
        return evento.dia_semana === dayOfWeek && dateObj >= eventDay;
      }
      if (evento.dia_mensual) {
        return evento.dia_mensual === dayOfMonth && dateObj >= eventDay;
      }
      return evento.fecha === fecha;
    });
  };


  // Marcar días con puntitos y día seleccionado
  const handleMonthChange = (month) => {
    const year = month.year;
    const monthIndex = month.month - 1;
    const daysInMonth = new Date(year, month.month, 0).getDate();

    const newMarked = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, monthIndex, day);
      // normalizamos a medianoche
      dateObj.setHours(0, 0, 0, 0);
      const dateStr = dateObj.toISOString().split("T")[0];
      const dayOfWeek = getDay(dateObj);
      const dayOfMonth = dateObj.getDate();

      const eventosDelDia = eventos.filter((evento) => {
        const eventDay = new Date(evento.fecha);
        eventDay.setHours(0, 0, 0, 0); // normalizamos también
        // si es recurrente semanal
        if (evento.dia_semana) {
          return evento.dia_semana === dayOfWeek && dateObj >= eventDay;
        }
        // si es recurrente mensual
        if (evento.dia_mensual) {
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
    if(isProfesional){
      router.push(`/cuidador/${paciente}/calendario/evento-agregar?date=${selectedDate}`);
    }
    else{
      router.push(`/profesional/${paciente}/calendario/evento-agregar?date=${selectedDate}`);
    }
  }

  //HANDLE: EDITAR EVENTO
  const handleEditarEvento = (id: number) => {
    console.log(`[Calendario] Editando evento ${id}...`);
    if(isProfesional){
      router.push(`/cuidador/${paciente}/calendario/evento-agregar?id=${id}`);
    }
    else{
      router.push(`/profesional/${paciente}/calendario/evento-agregar?id=${id}`);
    }
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
              console.log("Eliminar", id);
              const api = createApi(authToken, refreshToken, setAuthToken);
              await api.delete(`/eventos/${id}/`); 
              console.log("[calendario] Evento eliminado correctamente");
              fetchEventos();
            } catch (err) {
              console.error("[calendario] Error eliminando evento:", err);
              Alert.alert("Error", "No se pudo eliminar el evento.");
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

  //ELEMENTO LISTA EVENTOS

  const renderEvento = ({ item }) => (
    <View className="flex-row p-3 mb-4 mx-2 mt-2 bg-white rounded-2xl items-center" 
          style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3.5,
          elevation: 2,
        }}
    >

      {/* Barra de color */}

      <View
        style={{
          width: 6,
          height: "100%",
          backgroundColor: item.color,
          borderRadius: 3,
          marginRight: 8,
        }}
      />

      {/* Info del evento */}

      <View className="flex-1">
        <Text className="font-bold text-base">{item.title}</Text>

        {item.hora_inicio && (
          <Text className="text-gray-500 text-sm">
            {utcToLocalTime(item.hora_inicio)}
            {item.hora_termino && " - " + utcToLocalTime(item.hora_termino)}
          </Text>
        )}

        {item.profesional && (
          <Text className="text-gray-400 text-sm">
            <Ionicons name="clipboard" size={14} color="#9ca3af" /> {item.profesional}
          </Text>
        )}

        {item.plan && (
          <Text className="text-gray-400 text-sm">
            <Ionicons name="person" size={14} color="#9ca3af" /> {item.plan}
          </Text>
        )}
      </View>

      {/* Botones de acción */}

      <View className="flex-row items-center gap-3 pr-2">

        <BotonAccionIcon
          iconoNombre="create-outline"
          iconoColor="#3b82f6"
          onPress={() => handleEditarEvento(item.id)}
          isLoading={false} 
        />
        
        <BotonAccionIcon
          iconoNombre="trash-outline"
          iconoColor="#ef4444"
          onPress={() => handleEliminarEvento(item.id)}
          isLoading={false}
        />

        <BotonDescripcion tipoModal={"expandible"}>
          <View className="gap-1">
            <TituloSeccion
              children={""}
              respuesta={`${item.descripcion}`}
            />
          </View>
        </BotonDescripcion>
      </View>
    </View>
  );

  //VISTA
  return (
    <View className="flex-1 bg-white">

      <Calendar
        current={new Date().toISOString().split("T")[0]}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
        markingType={"multi-dot"}
        theme={{
          todayTextColor: "#F26052",
          arrowColor: "#114F80",
          monthTextColor: "#111",
          textMonthFontSize: 20, 
          textMonthFontWeight: "bold", 
          textDayHeaderFontSize: 14, 
          textDayHeaderFontWeight: "600", 
        }}
      />

      <View className="my-5 px-2 flex-1">
        <Text className="font-bold text-lg mb-2 mx-2">Eventos del día {selectedDate}:</Text>
        {eventosDelDiaSeleccionada.length > 0 ? (
          <FlatList
            data={eventosDelDiaSeleccionada}
            keyExtractor={(item) => item.id}
            renderItem={renderEvento}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text className="text-base text-gray-500 p-3">No hay eventos para este día</Text>
        )}
      </View>
      {selectedDateLocal >= todayLocal && (
        <BotonAgregar onPress={handleAgregarEvento}/>
      )}
    </View>
  );
}
