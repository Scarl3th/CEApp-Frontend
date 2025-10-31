import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/constants/colors";
import { BotonEditarMini } from "@/components/base/Boton";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { formatearFechaString } from "@/components/base/FormatearFecha";

const tiposDiscapacidad = [
  {
    id: 1,
    nombre: "Discapacidad física o motora",
    tipo: "Física",
    descripcion:
      "Afecta la movilidad, coordinación o fuerza del cuerpo, dificultando el desplazamiento o manipulación de objetos.",
    icon: "walk-outline",
    bgColor: colors.lightblue,
    iconColor: colors.mediumblue,
  },
  {
    id: 2,
    nombre: "Discapacidad sensorial",
    tipo: "Sensorial",
    descripcion:
      "Involucra la pérdida o disminución de alguno de los sentidos, principalmente la vista o la audición.",
    icon: "eye-outline",
    bgColor: colors.lightpurple,
    iconColor: colors.mediumdarkgrey,
  },
  {
    id: 3,
    nombre: "Discapacidad intelectual",
    tipo: "Intelectual",
    descripcion:
      "Implica limitaciones significativas en el razonamiento, aprendizaje y adaptación a las demandas diarias.",
    icon: "school-outline",
    bgColor: colors.lightyellow,
    iconColor: colors.mediumyellow,
  },
  {
    id: 4,
    nombre: "Discapacidad psicosocial o mental",
    tipo: "Mental",
    descripcion:
      "Deriva de condiciones de salud mental que afectan el comportamiento, las emociones o la interacción social.",
    icon: "brain-outline",
    bgColor: colors.lightred,
    iconColor: colors.mediumred,
  },
  {
    id: 5,
    nombre: "Discapacidad múltiple",
    tipo: "Múltiple",
    descripcion:
      "Combina dos o más tipos de discapacidad, generando necesidades de apoyo más complejas.",
    icon: "apps-outline",
    bgColor: colors.lightgreen,
    iconColor: colors.mediumgreen,
  },
];

//PACIENTE
interface InfoPaciente {
  id: number
  nombre: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: string;
  grado?: number;
  condiciones_adicionales?: string[];
  presenta_discapacidad?: boolean;
  tipo_de_discapacidad?: number;
  cuidador: string;
}

/*
const pacienteObj = {
  nombre: "Emilio Bazaes",
  edad: 7,
  fecha_nacimiento: new Date("2018-05-15T00:00:00Z"),
  sexo: "Masculino",
  grado: "Grado 1 - Necesita ayuda", // opcional
  condiciones_adicionales: ["Hipotonía", "Asma"], // opcional
  presenta_discapacidad: true, // opcional
  tipo_de_discapacidad: 2, // opcional
};
*/

export function Paciente() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const router = useRouter();
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const { paciente, success } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];
  const isProfesional = user?.role === "profesional";
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pacienteObj, setPacienteObj] = useState<InfoPaciente>(
    {
      nombre: "",
      edad: 0,
      fecha_nacimiento: "",
      sexo: "",
      grado: null, // opcional
      condiciones_adicionales: [], // opcional
      presenta_discapacidad: null, // opcional
      tipo_de_discapacidad: null, // opcional
    }
  );

  //FETCH: PACIENTE
  const fetchPaciente = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[paciente] Obteniendo paciente de la base de datos...");
      //console.log(`/cuidador-plan-trabajo/${pacienteID}/`)
      const res = await api.get(`/cuidador-plan-trabajo/${pacienteID}/`);

      //Agregamos un log de que se accedió a datos del paciente
      if (user?.role === "profesional") {
        try {
          const payload = 
          {
            "elemento": "datos del paciente",
            "accion": "acceder",
            "nombre_elemento": res.nombre
          }
          await api.post(`/logs/${pacienteID}/`, payload);
          console.log("[LOGs] Log de acceso a datos del paciente");
        } catch (err) {
          console.error("[LOGs] Error creando log de acceso a datos del paciente");
        }
      }

      setPacienteObj(res.data);
      setError(false);
    } catch(err) {
      console.log("[paciente] Error:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  //Solo se ejecuta una vez al montar (o si cambian los tokens)
  useEffect(() => {
    fetchPaciente();
  }, [authToken, refreshToken]);
  

  const discapacidad = tiposDiscapacidad.find(
    (d) => d.id === pacienteObj.tipo_de_discapacidad
  );

  const fechaNacimientoFormateada = pacienteObj.fecha_nacimiento
    ? formatearFechaString(new Date(`${pacienteObj.fecha_nacimiento}T12:00:00Z`), {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "No registrado";

  // Función auxiliar para determinar el ícono correcto
  const getSexoIcon = (sexo) => {
    const normalizedSexo = (sexo || "").toLowerCase(); 

    if (normalizedSexo === "masculino") {
      return "male-outline";
    } else if (normalizedSexo === "femenino") {
      return "female-outline";
    } else {
      return "person-outline"; 
    }
  };

  const datosPrincipales = [
    {
      label: "Fecha de nacimiento",
      value: fechaNacimientoFormateada,
      icon: "calendar-outline",
    },
    { label: "Edad", value: pacienteObj.edad ?? "No registrado", icon: "time-outline" },
    { label: "Sexo", value: pacienteObj.sexo ?? "No registrado", icon: getSexoIcon(pacienteObj.sexo) },
    {
      label: "Grado de autismo",
      value: pacienteObj.grado ?? "No ingresado",
      icon: "extension-puzzle-outline",
    },
  ];

  //HANDLE: EDITAR DATOS
  const handleEditar = () => {
    console.log("[Paciente] Editando paciente...")
    //router.push(`/cuidador/${paciente_name}/paciente/paciente-editar`);
    console.log(paciente);
    console.log(`/cuidador/paciente-agregar?id=${pacienteID}&paciente=${pacienteEncodedNombre}`)
    router.push(`/cuidador/paciente-agregar?id=${pacienteID}&paciente=${pacienteEncodedNombre}`);
  }

  return (

      <ScrollView
        className=" flex-1"
        showsVerticalScrollIndicator={true}
      >
        <View
          className="rounded-2xl p-5 m-4"
          style={{
            backgroundColor: colors.white,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {/* Nombre y botón editar */}
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className="text-3xl font-bold"
              style={{ color: colors.primary, flexShrink: 1 }}
            >
              {pacienteObj.nombre}
            </Text>

            {!isProfesional && <BotonEditarMini onPress={handleEditar} />}
          </View>

          {/* Datos principales */}
          <View>
            {datosPrincipales.map((dato, index) => {
              const isEmpty = dato.value === "No registrado" || dato.value === "No ingresado";
              return (
                <View key={index} className="mb-3">
                  <Text
                    className="text-sm font-semibold mb-1"
                    style={{ color: colors.mediumdarkgrey }}
                  >
                    {dato.label}
                  </Text>

                  <View
                    className="flex-row items-center px-4 py-2 rounded-xl"
                    style={{
                      backgroundColor: colors.lightgrey,
                      borderWidth: 1,
                      borderColor: colors.mediumlightgrey,
                    }}
                  >
                    <Ionicons
                      name={dato.icon}
                      size={20}
                      color={isEmpty ? colors.mediumgrey : colors.mediumdarkgrey}
                    />
                    <Text
                      className="ml-3 text-base font-semibold"
                      style={{ color: isEmpty ? colors.mediumgrey : colors.black }}
                    >
                      {dato.value}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Discapacidad resumida */}
          <View className="mb-2">
            <Text
              className="text-sm font-semibold mb-1"
              style={{ color: colors.mediumdarkgrey }}
            >
              Discapacidad
            </Text>

            <View
              className="flex-col px-4 py-2 rounded-xl"
              style={{
                backgroundColor:
                  pacienteObj.presenta_discapacidad && discapacidad
                    ? discapacidad.bgColor
                    : colors.lightgrey,
                borderWidth: 1,
                borderColor:
                  pacienteObj.presenta_discapacidad && discapacidad
                    ? discapacidad.iconColor
                    : colors.mediumlightgrey,
                alignItems: "flex-start",
              }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={
                    pacienteObj.presenta_discapacidad !== null
                      ? pacienteObj.presenta_discapacidad === true
                        ? discapacidad
                          ? discapacidad.icon :
                            "checkmark-outline"
                        : "close-outline"
                      : "help-outline"
                  }
                  size={20}
                  color={
                    pacienteObj.presenta_discapacidad !== null
                      ? pacienteObj.presenta_discapacidad === true
                        ? discapacidad
                          ? discapacidad.iconColor :
                            colors.mediumgreen
                        : colors.mediumred
                      : colors.mediumgrey
                  }
                />
                <Text
                  className="text-base font-semibold ml-3"
                  style={{
                    color:
                      pacienteObj.presenta_discapacidad !== null
                        ? colors.black
                        : colors.mediumgrey,
                  }}
                >
                  {pacienteObj.presenta_discapacidad !== null
                    ? pacienteObj.presenta_discapacidad === true
                      ? discapacidad
                      ? discapacidad.tipo :
                        "Si presenta"
                      : "No presenta"
                    : "No ingresado"}
                </Text>
              </View>

              {pacienteObj.presenta_discapacidad === true && discapacidad && (
                <View className=" py-1">
                  <Text
                    className="text-sm mt-1"
                    style={{ color: colors.mediumdarkgrey }}
                  >
                    {discapacidad.descripcion}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Condiciones adicionales */}
          <View
            className="pt-4 mt-4"
            style={{ borderTopColor: colors.mediumgrey, borderTopWidth: 1 }}
          >
            <Text
              style={{ color: colors.black, fontWeight: "600", marginBottom: 4 }}
            >
              Condiciones adicionales:
            </Text>
            {pacienteObj.condiciones_adicionales?.length > 0 ? (
              pacienteObj.condiciones_adicionales.map((item, index) => (
                <View key={index} className="flex-row items-center mb-1">
                  <Ionicons name="ellipse" size={6} color={colors.mediumdarkgrey} />
                  <Text style={{ color: colors.mediumdarkgrey, marginLeft: 4 }}>
                    {item}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.mediumgrey }}>No registradas</Text>
            )}
          </View>
        </View>
      </ScrollView>

  );
}
