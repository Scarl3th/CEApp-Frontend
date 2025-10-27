import React from "react";
import { View, Text, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/constants/colors";
import { BotonEditar, BotonEditarMini } from "@/components/base/Boton";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useAuth } from "@/context/auth";

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

const paciente = {
  nombre: "Emilio Bazaes",
  edad: 7,
  fecha_nacimiento: new Date("2018-05-15T00:00:00Z"),
  sexo: "Masculino",
  grado: 2, // opcional
  condiciones_adicionales: ["Hipotonía", "Asma"], // opcional
  presenta_discapacidad: true, // opcional
  tipo_de_discapacidad: 2, // opcional
};

export function Paciente() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const router = useRouter();
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const { paciente_name, success } = useLocalSearchParams();
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];
  const isProfesional = user?.role === "profesional";

  const discapacidad = tiposDiscapacidad.find(
    (d) => d.id === paciente.tipo_de_discapacidad
  );

  const fechaNacimientoFormateada = paciente.fecha_nacimiento
    ? paciente.fecha_nacimiento.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "No registrado";

  // Función auxiliar para determinar el ícono correcto
  const getSexoIcon = (sexo) => {
    // Aseguramos que el valor no sea nulo o indefinido
    const normalizedSexo = (sexo || "").toLowerCase(); 

    if (normalizedSexo === "masculino") {
      return "male-outline";
    } else if (normalizedSexo === "femenino") {
      return "female-outline";
    } else {
      // Para "Otro", "No registrado", o cualquier otro valor
      return "person-outline"; 
    }
  };

  const datosPrincipales = [
    {
      label: "Fecha de nacimiento",
      value: fechaNacimientoFormateada,
      icon: "calendar-outline",
    },
    { label: "Edad", value: paciente.edad ?? "No registrado", icon: "time-outline" },
    { label: "Sexo", value: paciente.sexo ?? "No registrado", icon: getSexoIcon(paciente.sexo) },
    {
      label: "Grado de autismo",
      value: paciente.grado ?? "No ingresado",
      icon: "extension-puzzle-outline",
    },
  ];

  //HANDLE: EDITAR DATOS
  const handleEditar = () => {
    console.log("[Paciente] Agregando Evento...")
    router.push(`/cuidador/${paciente_name}/paciente/paciente-editar`);
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
              {paciente.nombre}
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
                  paciente.presenta_discapacidad && discapacidad
                    ? discapacidad.bgColor
                    : colors.lightgrey,
                borderWidth: 1,
                borderColor:
                  paciente.presenta_discapacidad && discapacidad
                    ? discapacidad.iconColor
                    : colors.mediumlightgrey,
                alignItems: "flex-start",
              }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={
                    paciente.presenta_discapacidad !== null
                      ? paciente.presenta_discapacidad === true
                        ? discapacidad
                          ? discapacidad.icon :
                            "checkmark-outline"
                        : "close-outline"
                      : "help-outline"
                  }
                  size={20}
                  color={
                    paciente.presenta_discapacidad !== null
                      ? paciente.presenta_discapacidad === true
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
                      paciente.presenta_discapacidad !== null
                        ? colors.black
                        : colors.mediumgrey,
                  }}
                >
                  {paciente.presenta_discapacidad !== null
                    ? paciente.presenta_discapacidad === true
                      ? discapacidad
                      ? discapacidad.tipo :
                        "Si presenta"
                      : "No presenta"
                    : "No ingresado"}
                </Text>
              </View>

              {paciente.presenta_discapacidad === true && discapacidad && (
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
            {paciente.condiciones_adicionales?.length > 0 ? (
              paciente.condiciones_adicionales.map((item, index) => (
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
