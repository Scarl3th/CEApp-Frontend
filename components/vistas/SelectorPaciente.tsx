import { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlatList, Text, View } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";
import { Titulo } from "@/components/base/Titulo";
import { CustomToast } from "@/components/base/Toast";
import { Buscador } from "@/components/base/Buscador";
import { BotonAgregar } from "@/components/base/Boton";
import { TarjetaSelector } from "@/components/base/Tarjeta";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";

//PACIENTE
interface Paciente {
  id: string;
  nombre: string;
  cuidador?: string;
  color?: string;
}

//ICONO: PACIENTE
export function PacienteIcono() {
  return (
    <View className="rounded-full justify-center items-center">
      <Ionicons name={Icons["paciente"].iconName} size={50} color={colors.black}/>
    </View>
  );
}

//ITEM: PACIENTE
interface PacienteItemProps {
  paciente: Paciente;
  isProfesional: boolean;
}
export const PacienteItem = ({
  paciente,
  isProfesional,
}: PacienteItemProps) => {
  return (
    <Link
      key={paciente.id}
      href={`/${isProfesional ? "profesional" : "cuidador"}/${paciente.id}-${encodeURIComponent(paciente.nombre)}`}
      asChild
    >
      <TarjetaSelector
        titulo={paciente.nombre}
        subtitulo={isProfesional ? [`Cuidador: ${paciente.cuidador}`] : undefined}
        icono = {<PacienteIcono/>}
        onPress={() => {}}
      />
    </Link>
  );
};

//LISTA: PACIENTES
interface PacientesListaProps {
  pacientes: Paciente[];
  isProfesional: boolean;
}
const PacientesLista = ({
  pacientes,
  isProfesional,
}: PacientesListaProps) => {
  return (
    <FlatList
      data={pacientes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PacienteItem paciente={item} isProfesional={isProfesional}/>}
      contentContainerStyle={{ paddingBottom: 55 }}
    />
  );
};

//PACIENTES
export function SelectorPaciente() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const primer_nombre = user?.nombre.split(" ")[0];
  const isProfesional = user?.role === "profesional";
  const router = useRouter();
  const { paciente, success, loginSuccess } = useLocalSearchParams();

  //ESTADOS
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState<{ text1: string; text2?: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchPacientes();
  }, [authToken, refreshToken]);

  useEffect(() => {
    if (success) {
      setToast({ text1: "Paciente guardado exitosamente.", type: "success" });
    }
  }, [success]);

  useEffect(() => {
    if (loginSuccess) {
      setToast({ text1: "Inicio de sesión exitoso.", type: "success" });
    }
  }, [loginSuccess]);

  //FETCH: PACIENTES
  const fetchPacientes = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[selector-paciente] Obteniendo pacientes de la base de datos...");
      const res =
        isProfesional ? (await api.get("/profesional-plan-trabajo/")) :
        (await api.get("/cuidador-plan-trabajo/"));
      setPacientes(res.data);
      setIsLoading(false);
      setError(false);
    } catch (err) {
      console.log("[selector-paciente] Error:", err);
      setIsLoading(false);
      setError(true);
    }
  }

  //HANDLE: AGREGAR-PACIENTE
  const handleAgregarPaciente = () => {
    console.log("[selector-paciente] Agregando paciente...");
    if (isProfesional) {
      router.push(`/profesional/paciente-agregar`);
    }
    else {
      router.push(`/cuidador/paciente-agregar`);
    }
  }

  //FILTRO
  const pacientesFiltrados = pacientes.filter((paciente) => {
    const textoBusqueda = busqueda.toLowerCase();
    const nombre = paciente.nombre?.toLowerCase() ?? "";
    const cuidador = paciente.cuidador?.toLowerCase() ?? "";
    return (
      nombre.includes(textoBusqueda) ||
      cuidador.includes(textoBusqueda)
    )
  });

  //VISTA
  return (
    <View className="flex-1 p-4">
      <View className="justify-center items-center">
        {/* TÍTULO */}
        <Titulo>
          {`¡Bienvenid@, ${primer_nombre}! 👋`}
          </Titulo>
        <Text className="text-base text-secondary font-bold pb-4">
          Selecciona un paciente para comenzar:
        </Text>
      </View>
      {/* CUERPO */}
      <View className="flex-1">
        {isLoading ? (
          <IndicadorCarga/>
        ) : error ? (
          <MensajeVacio
            mensaje={`Hubo un error al cargar los pacientes.\nIntenta nuevamente.`}
            onPressRecargar={() => fetchPacientes()}
          />
        ) : pacientes.length === 0 ? (
          <MensajeVacio
            mensaje={
              `No se encontraron pacientes asignados.\n¡${
                isProfesional ? "Unete a un plan de trabajo usando el botón +" :
                `Comienza a planificar el trabajo del paciente usando el botón ＋`
              }!`
            }
          />
        ) : (
          <>
            <Buscador
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              placeholder={"Buscar paciente..."}
              icono={true}
            />
            <PacientesLista
              pacientes={pacientesFiltrados}
              isProfesional={isProfesional}
            />
          </>
        )}
      </View>
      {/* BOTÓN FLOTANTE */}
      <BotonAgregar onPress={handleAgregarPaciente}/>
      {/* FLOTANTE */}
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