import { BotonAccionIcon, BotonAgregar, BotonTab } from "@/components/base/Boton";
import { formatearFechaString } from "@/components/base/FormatearFecha";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { Titulo } from "@/components/base/Titulo";
import { colors } from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { Ionicons } from "@expo/vector-icons";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { CustomToast } from "@/components/base/Toast";

const medicamentos = [
  {
    id: 1,
    nombre: "Paracetamol",
    dosis: "1 comprimido", 
    dias: [0,3,6], //días de la semana del 0 al 6
    frecuencia: 3, //veces al día
    horarios: ["10:00", "15:00", "20:00"], //en dates
    recordatorio: null, //en minutos
    color: "purple"
  },
  {
    id: 2,
    nombre: "Neuroval",
    dosis: "1 comprimido", 
    dias: [0,1,2,3,4,5,6], //días de la semana del 0 al 6
    frecuencia: 2, //veces al día
    horarios: ["9:00", "21:00"], //en dates
    recordatorio: 30, //en minutos
    color: "green"
  },
];

//MEDICAMENTO
interface Medicamento {
  id: string;
  nombre: string;
  dosis: string;
  dias: number[];
  frecuencia: number;
  horarios: Date[];
  recordatorio: number;
  color: string;
  recordatorioActivo?: boolean;
  paciente?: string;
}

//BADGE: MEDICAMENTOS
interface MedicamentosBadgeProps {
  fondoColor: string;
  texto: string;
  textoColor: string;
}
export function MedicamentoBadge({
  fondoColor,
  texto,
  textoColor,
}: MedicamentosBadgeProps) {
  return (
    <View
      className="rounded-bl-lg mt-2 mx-2 px-2 py-1 absolute top-0 right-0 z-10"
      style={{ backgroundColor: fondoColor }}
    >
      <Ionicons name="alarm-outline" size={14} color="#ffffff" />
    </View>
  );
}

export function Medicamentos() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const router = useRouter();
  const { paciente, success } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];
  const today = new Date().getDay();
  const [selectedTab, setSelectedTab] = useState<number>(today);
  const [medicamentos, setMedicamentos] = useState([]);
  const isProfesional = user?.role === "profesional";

  //ESTADOS
  //const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState<{ text1: string; text2?: string; type: "success" | "error" } | null>(null);
 
  const medicamentosFiltrados = medicamentos.filter((medicamento) => medicamento.dias.includes(selectedTab));

   useEffect(() => {
    if (success) {
      setToast({ text1: "Medicamento guardado exitosamente.", type: "success" });
    }
  }, [success]);

  //FETCH: MEDICAMENTOS
  const fetchMedicamentos = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[medicamentos] Obteniendo medicamentos de la base de datos...");
      const res = await api.get(`/medicamentos/${pacienteID}`);
      setMedicamentos(res.data);
      setError(false);
    } catch(err) {
      console.log("[medicamentos] Error:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  //Solo se ejecuta una vez al montar (o si cambian los tokens)
  useEffect(() => {
    fetchMedicamentos();
  }, [authToken, refreshToken]);


  //HANDLE: AGREGAR MEDICAMENTO
  const handleAgregarMedicamento = () => {
    console.log("[medicamentos] Agregando Medicamento...")
    router.push(`/cuidador/${paciente}/medicamentos/medicamento-agregar`);
  }

  //HANDLE: EDITAR MEDICAMENTO
  const handleEditarMedicamento = (id: number) => {
    console.log(`[Medicamento] Editando medicamento ${id}...`);
    router.push(`/cuidador/${paciente}/medicamentos/medicamento-agregar?id=${id}`);
  }

  //HANDLE: ELIMINAR MEDICAMENTO
  const handleEliminarMedicamento = (id: number) => {
    Alert.alert(
      "Eliminar medicamento",
      "¿Estás segur@ de que quieres eliminar este medicamento?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: async () => {
            try {
              console.log("[medicamentos] Eliminando medicamento ", id);
              const api = createApi(authToken, refreshToken, setAuthToken);
              await api.delete(`/medicamentos/${pacienteID}/${id}/`); 
              console.log("[medicamentos] Medicamento eliminado correctamente");
              setToast({ text1: "Medicamento eliminado exitosamente.", type: "success" });
              fetchMedicamentos();
            } catch (err) {
              console.error("[medicamentos] Error:", err);
              setToast({ text1: "Hubo un problema al eliminar el medicamento.", text2: "Intenta nuevamente.", type: "error" });
            }
          }
        }
      ]
    );
  };


  //ELEMENTO LISTA MEDICAMENTOS
  const renderMedicamento = ({ item }) => (
    <View className="relative">
      {item.recordatorioActivo? (
              <MedicamentoBadge
                fondoColor={colors.mediumred}
                texto="Recordatorio activo"
                textoColor={colors.white}
              />
      ) : (
        <View />
      )}
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

        {/* Info del medicamento */}

        <View className="flex-1">
          <Text className="font-bold text-lg">{item.nombre}</Text>


          {item.dosis && (
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-md ml-1">{item.dosis ? String(item.dosis) : ""}</Text>
            </View>
          )}


          {item.horarios && item.horarios.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-1">
              {item.horarios.map((hora, index) => (
                <View
                  key={index}
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: item.color }}
                >
                  <Text className="text-white text-sm">{formatearFechaString(new Date(hora), { hour: "2-digit", minute: "2-digit", hour12: false })}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Botones de acción */}

        {!isProfesional &&
        <View className="flex-row items-center gap-3 pr-2">

          <BotonAccionIcon
            iconoNombre="create-outline"
            iconoColor="#3b82f6"
            onPress={() => handleEditarMedicamento(item.id)}
            isLoading={false} 
          />
          
          <BotonAccionIcon
            iconoNombre="trash-outline"
            iconoColor="#ef4444"
            onPress={() => handleEliminarMedicamento(item.id)}
            isLoading={false}
          />

        </View>
        }
      </View>
    </View>
  );

  //VISTA
  return (
    <View className="flex-1">
      {/* TÍTULO */}
      <Titulo
        onPressRecargar={fetchMedicamentos}
      >
        Medicamentos
      </Titulo>
      {/* PESTAÑAS */}
      <View className="flex-row justify-around bg-lightgrey rounded-xl mt-1 mx-2">
        <BotonTab
          label="Lu"
          active={selectedTab === 1}
          today={today === 1}
          onPress={() => setSelectedTab(1)}
        />
        <BotonTab
          label="Ma"
          active={selectedTab === 2}
          today={today === 2}
          onPress={() => setSelectedTab(2)}
        />
        <BotonTab
          label="Mi"
          active={selectedTab === 3}
          today={today === 3}
          onPress={() => setSelectedTab(3)}
        />
        <BotonTab
          label="Ju"
          active={selectedTab === 4}
          today={today === 4}
          onPress={() => setSelectedTab(4)}
        />
        <BotonTab
          label="Vi"
          active={selectedTab === 5}
          today={today === 5}
          onPress={() => setSelectedTab(5)}
        />
        <BotonTab
          label="Sá"
          active={selectedTab === 6}
          today={today === 6}
          onPress={() => setSelectedTab(6)}
        />
        <BotonTab
          label="Do"
          active={selectedTab === 0}
          today={today === 0}
          onPress={() => setSelectedTab(0)}
        />
      </View>
      {/* CUERPO */}
      {isLoading ? (
        <IndicadorCarga/>
      ) : error ? (
        <MensajeVacio
          mensaje={`Hubo un error al cargar los medicamentos.\nIntenta nuevamente.`}
          onPressRecargar={fetchMedicamentos}
        />
      ) : (
        <View className="mb-2  flex-1">
          {medicamentosFiltrados.length > 0 ? (
            <FlatList
              data={medicamentosFiltrados}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMedicamento}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <MensajeVacio
              mensaje={
                `No se encontraron medicamentos para este día.${
                  !isProfesional ? "\n¡Comienza a añadir medicamentos usando el botón ＋!" :
                  ""
                }`
                }
            />
          )}
        </View>
      )}
      {/* BOTÓN FLOTANTE */}
      {!isProfesional && <BotonAgregar onPress={handleAgregarMedicamento}/>}
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
