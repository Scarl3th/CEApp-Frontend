import React, { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Titulo } from "@/components/base/Titulo";
import { CustomToast } from "@/components/base/Toast";
import { TarjetaTresPuntos } from "@/components/base/Tarjeta";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { formatearFechaString } from "@/components/base/FormatearFecha";
import { BotonAgregar, BotonEditar, BotonEliminar, BotonTab } from "@/components/base/Boton";

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
      className="rounded-bl-lg mt-2 px-2 py-1 absolute top-0 right-0.5 z-10"
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
        <View/>
      )}
      <TarjetaTresPuntos
        titulo={item.nombre}
        iconoFondoColor={item.color}
        subtituloAlternativo={
          <View className="flex-1 gap-1">
            {item.dosis && (
              <View className="gap-1 flex-row items-center">
                <Ionicons name={"receipt-outline"} size={15} color={colors.mediumgrey}/>
                <Text className="text-mediumdarkgrey text-sm">
                  {item.dosis ? String(item.dosis) : ""}
                </Text>
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
        }
        tresPuntosContenido={
          !isProfesional ? (
            <>
              {!isProfesional && (<BotonEditar tipo={"horizontal"} onPress={() => handleEditarMedicamento(item.id)}/>)}
              {!isProfesional && (<BotonEliminar tipo={"horizontal"} onPress={() => handleEliminarMedicamento(item.id)}/>)}
            </>
          ) : (
            undefined
          )
        }
      />
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
      <View className="flex-row justify-around bg-lightgrey rounded-xl mt-1 mb-2">
        <BotonTab
          label="Dom"
          active={selectedTab === 0}
          today={today === 0}
          onPress={() => setSelectedTab(0)}
        />
        <BotonTab
          label="Lun"
          active={selectedTab === 1}
          today={today === 1}
          onPress={() => setSelectedTab(1)}
        />
        <BotonTab
          label="Mar"
          active={selectedTab === 2}
          today={today === 2}
          onPress={() => setSelectedTab(2)}
        />
        <BotonTab
          label="Mié"
          active={selectedTab === 3}
          today={today === 3}
          onPress={() => setSelectedTab(3)}
        />
        <BotonTab
          label="Jue"
          active={selectedTab === 4}
          today={today === 4}
          onPress={() => setSelectedTab(4)}
        />
        <BotonTab
          label="Vie"
          active={selectedTab === 5}
          today={today === 5}
          onPress={() => setSelectedTab(5)}
        />
        <BotonTab
          label="Sáb"
          active={selectedTab === 6}
          today={today === 6}
          onPress={() => setSelectedTab(6)}
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
