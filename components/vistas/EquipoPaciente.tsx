import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { useLocalSearchParams, useRouter, usePathname } from "expo-router";
import { useAuth } from "@/context/auth";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";
import { CustomToast } from "@/components/base/Toast";
import { TarjetaTresPuntos } from "@/components/base/Tarjeta";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { Titulo, TituloSeccion } from "@/components/base/Titulo";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { BotonAgregar, BotonDeshabilitar, BotonDetalles } from "@/components/base/Boton";

//PROFESIONAL
interface Profesional {
  id: string;
  nombre: string;
  cargo: string;
  institucion: string;
  correo: string;
}

//ICONO: PROFESIONAL
export function ProfesionalIcono() {
  return (
    <View className="rounded-full justify-center items-center">
      <Ionicons name={Icons["usuario"].iconName} size={30} color={colors.white}/>
    </View>
  );
}

//ITEM: PROFESIONAL
interface ProfesionalItemProps {
  profesional: Profesional;
  isProfesional: boolean;
  onChange: () => void;
  setToast: React.Dispatch<
    React.SetStateAction<{
      text1: string;
      text2?: string;
      type: "success" | "error";
    } | null>
  >;
}
const ProfesionalItem = ({
  profesional,
  isProfesional,
  onChange,
  setToast,
}: ProfesionalItemProps) => {

  const { authToken, refreshToken, createApi, setAuthToken } = useAuth();
  const { paciente } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];

  //HANDLE: DESHABILITAR PROFESIONAL
  const handleDeshabilitarProfesional = () => {
    Alert.alert(
      "Deshabilitar profesional",
      `¿Estás segur@ de que quieres deshabilitar a "${profesional.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deshabilitar",
          style: "destructive",
          onPress: async () => {
            try {
              const api = createApi(authToken, refreshToken, setAuthToken);
              console.log("[equipo] Deshabilitando profesional:", profesional.id);
              await api.delete(`plan-trabajo/${pacienteID}/profesionales`, {
                data: { id_profesional: profesional.id },
              });
              console.log("[equipo] Profesional deshabilitado correctamente");
              setToast({ text1: "Profesional deshabilitado exitosamente.", type: "success" });
              onChange();
            } catch (err) {
              console.log("[equipo] Error:", err);
              setToast({ text1: "Hubo un problema al deshabilitar el profesional.", text2: "Intenta nuevamente.", type: "error" });
              onChange();
            }
          },
        },
      ]
    );
  };

  //VISTA
  return (
    <TarjetaTresPuntos
      titulo={profesional.nombre}
      subtitulo={`${profesional.cargo}\n${profesional.institucion}`}
      icono={ProfesionalIcono()}
      tresPuntosContenido={
        <>
          {!isProfesional && (
            <BotonDeshabilitar onPress={handleDeshabilitarProfesional} tipo={"horizontal"}/>
          )}
          <BotonDetalles tipo={"horizontal"} tipoModal={"expandible"}>
            <View className="gap-1">
              <TituloSeccion
                children={"Correo electrónico:"}
                respuesta={profesional.correo}
              />
            </View>
          </BotonDetalles>
        </>
      }
    />
  );
};

//LISTA: PROFESIONALES
interface ListaProfesionalesProp {
  profesionales: Profesional[];
  isProfesional: boolean;
  onChange: () => void;
  setToast: React.Dispatch<
      React.SetStateAction<{
        text1: string;
        text2?: string;
        type: "success" | "error";
      } | null>
    >;
}
const ListaProfesionales = ({
  profesionales,
  isProfesional,
  onChange,
  setToast,
}: ListaProfesionalesProp) => {
  return (
    <View className="flex-1 gap-2">
      <FlatList
        data={profesionales}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProfesionalItem
            profesional={item}
            isProfesional={isProfesional}
            onChange={onChange}
            setToast={setToast}
          />
        )}
        contentContainerStyle={{ paddingBottom: 55 }}
      />
    </View>
  );
};

//PROFESIONALES
export function EquipoPaciente() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const isProfesional = user?.role === "profesional";
  const router = useRouter();
  const pathname = usePathname(); 
  const { paciente } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];

  //ESTADOS
  const [equipo, setEquipo] = useState<Profesional[]>([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState<{ text1: string; text2?: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchEquipo();
  }, [authToken, refreshToken]);

  //FETCH: EQUIPO
  const fetchEquipo = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    console.log("[equipo] Obteniendo equipo de la base de datos...");
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.get(`plan-trabajo/${pacienteID}/profesionales`);
      console.log("[equipo] Respuesta:", res.data);
      setEquipo(res.data);
      setIsLoading(false);
      setError(false);
    } catch (err) {
      console.log("[equipo] Error:", err);
      setIsLoading(false);
      setError(true);
    }
  }

  //HANDLE: AGREGAR-PROFESIONAL
  const handleAgregarProfesional = () => {
    console.log("[equipo] Agregando personas al equipo...");
    router.push(`/cuidador/${paciente}/equipo/equipo-agregar`);
  };

  //FILTRO
  const profesionalesBusqueda = equipo.filter((profesional) => {
    const textoBusqueda = busqueda.toLowerCase();
    const nombre = profesional.nombre?.toLowerCase() ?? "";
    const cargo = profesional.cargo?.toLowerCase() ?? "";
    const institucion = profesional.institucion?.toLowerCase() ?? "";
    const correo = profesional.correo?.toLowerCase() ?? "";
    return (
      nombre.includes(textoBusqueda) ||
      cargo.includes(textoBusqueda) ||
      institucion.includes(textoBusqueda) ||
      correo.includes(textoBusqueda)
    );
  });

  //VISTA
  return (
    <View className="flex-1">
      {/* TÍTULO */}
      <Titulo onPressRecargar={fetchEquipo} onBusquedaChange={setBusqueda}>
        Equipo
      </Titulo>
      {/* CUERPO */}
      {isLoading ? (
        <IndicadorCarga/>
      ): error ? (
        <MensajeVacio
          mensaje={`Hubo un error al cargar el equipo.\nIntenta nuevamente.`}
          onPressRecargar={fetchEquipo}
        />
      ) : profesionalesBusqueda.length === 0 ? (
        <MensajeVacio
          mensaje={`No se encontraron profesionales en el equipo.\n${
            !isProfesional ? "¡Comienza a unir profesionales al equipo usando el botón ＋!" :
            "¡Revisa aquí cuando se unan!"
          }`}
        />
      ) : (
        <ListaProfesionales
          profesionales={profesionalesBusqueda}
          isProfesional={isProfesional}
          onChange={fetchEquipo}
          setToast={setToast}
        />
      )}
      {/* BOTÓN FLOTANTE */}
      {!isProfesional ? <BotonAgregar onPress={handleAgregarProfesional} iconoNombre={Icons["vincular"].iconName} iconoTamano={30}/> : null}
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