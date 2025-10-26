import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { Alert, Image, Platform, Pressable, Text, View } from "react-native";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";
import { images } from "@/constants/images";
import { Menu } from "@/components/layout/Menu";
import { CustomModal } from "@/components/base/Modal";
import { TarjetaMenu } from "@/components/base/Tarjeta";
import { BotonEsquinaSuperior } from "@/components/base/Boton";
import { Titulo, TituloSeccion } from "@/components/base/Titulo";
import { useDescartarCambios } from "@/context/DescartarCambios";

//HEADER
export function Header() {

  const router = useRouter();

  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];
  const paciente = ruta_partes[1];
  let ruta_atras: string | null = null;
  const { handleDescartarCambios } = useDescartarCambios();
  let usarDescartarCambios = false;
  //ESTADOS
  const [menu, setMenu] = useState(false);
  //0: cerrar sesión
  //1: menú
  //2: volver atrás
  let icono: 0 | 1 | 2;
  if (ruta_partes.length === 1) {
    icono = 0;
    ruta_atras = "/login";
  } else if (ruta.includes("/paciente-agregar")) {
    icono = 2;
    ruta_atras = `/${rol}`;
    usarDescartarCambios = true;
  } else if (ruta.includes("/equipo/equipo-agregar")) {
    icono = 2;
    ruta_atras = `/${rol}/${paciente}/equipo`;
    usarDescartarCambios = true;
  } else if (ruta.includes("/observaciones/observacion-agregar")) {
    icono = 2;
    ruta_atras = `/${rol}/${paciente}/observaciones`;
    usarDescartarCambios = true;
  } else if (ruta.includes("/informes/informe-agregar")) {
    icono = 2;
    ruta_atras = `/${rol}/${paciente}/informes`;
    usarDescartarCambios = true;
  } else if (ruta.includes("/informes/informe-ver")) {
    icono = 2;
    ruta_atras = `/${rol}/${paciente}/informes`;
  } else if (ruta.includes("/calendario/evento-agregar")) {
    icono = 2;
    ruta_atras = `/${rol}/${paciente}/calendario`;
    usarDescartarCambios = true;
  } else if (ruta_partes.length === 2) {
    icono = 1;
  } else if (ruta.includes("/objetivo-general-agregar") || ruta.includes("/objetivo-especifico-agregar")) {
    icono = 2;
    ruta_atras = `/${rol}/${paciente}/plan`;
    usarDescartarCambios = true;
  } else if (ruta.includes("/actividad-agregar")) {
    icono = 2;
    ruta_atras = `/${rol}/${paciente}/actividades`;
    usarDescartarCambios = true;
  } else if (ruta.includes("/medicamento-agregar")) {
    icono = 2;
    ruta_atras = `/${rol}/${paciente}/medicamentos`;
    usarDescartarCambios = true;
  } else if (ruta.includes("/evento-agregar")) {
    icono = 2;
    ruta_atras = `/${rol}/${paciente}/calendario`;
    usarDescartarCambios = true;
  } else if (ruta.includes("/entrada")) {
    icono = 2;
    ruta_atras = `/${rol}/${paciente}/bitacora`;
    usarDescartarCambios = true;
  } else {
    icono = 1;
  }
  const handlePress = () => {
    if (usarDescartarCambios && handleDescartarCambios) {
      handleDescartarCambios(ruta_atras!);
    } else if (icono === 0) {
      Alert.alert(
        "¿Cerrar sesión?",
        "¿Estás segur@ de que deseas cerrar sesión?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Cerrar sesión",
            style: "destructive",
            onPress: () => router.replace(ruta_atras!),
          },
        ]
      );
    } else {
      router.replace(ruta_atras!);
    }
  };
  const handleActualizaciones = () => {
    ruta_atras = `/${rol}/${paciente}/actualizaciones`;
    handlePress();
  }
  //VISTA
  return (
    <View className="flex-row bg-primary h-16 justify-center items-center relative">
      {icono === 0 && (
        <BotonEsquinaSuperior
          onPress={handlePress}
          fondoBoton={colors.primary}
          iconName={Icons["cerrar_sesion"].iconName}
          tipo={"izquierda"}
        />
      )}
      {icono === 1 && (
        <BotonEsquinaSuperior
          onPress={() => setMenu(true)}
          fondoBoton={colors.primary}
          iconName={Icons["menu"].iconName}
          tipo={"izquierda"}
        />
      )}
      {icono === 2 && (
        <BotonEsquinaSuperior
          onPress={handlePress}
          fondoBoton={colors.primary}
          iconName={Icons["atras"].iconName}
          tipo={"izquierda"}
        />
      )}
      {/* Tengo que mejorar el if para que solo se muestre en las vistas que tienen tutorial */}
      {ruta_partes.length > 1 && !ruta.includes("/paciente-agregar") && (
        <BotonEsquinaSuperior
          onPress={() => {}}
          fondoBoton={colors.primary}
          iconName={Icons["tutoriales"].iconName}
          tipo={"derecha"}
          horizontal={60}
        />
      )}
      {ruta_partes.length > 1 && !ruta.includes("/paciente-agregar") && (
        <BotonEsquinaSuperior
          onPress={handleActualizaciones}
          fondoBoton={colors.primary}
          iconName={Icons["actualizaciones"].iconName}
          tipo={"derecha"}
        />
      )}
      <View className="flex-row items-end">
        <Image
          source={images.logo}
          className="mr-1 align-middle"
          style={{
            width: Platform.OS === "web" ? 40 : 40,
            height: Platform.OS === "web" ? 40 : 40,
          }}
          resizeMode="contain"
        />
        <Text className="text-2xl text-light font-extrabold align-middle">CEApp</Text>
      </View>
      <Menu
        visible={menu}
        onClose={() => setMenu(false)}
        paciente={paciente}
      />
    </View>
  );
}

//HEADER: PACIENTE
type HeaderPacienteProps = {
  nombre: string;
};
export function HeaderPaciente({
  nombre
}: HeaderPacienteProps) {
  const { paciente } = useLocalSearchParams();
  const pathname = usePathname();
  const ruta = decodeURIComponent(pathname || "");
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      {/* HEADER: PACIENTE */}
      <Pressable onPress={() => setShowModal(true)}>
        {({ pressed }) => (
          <View
            className="px-4 py-2 gap-1 flex-row items-center justify-center"
            style = {{ backgroundColor: pressed ? colors.mediumlightgrey : colors.secondary}}
          >
            <Ionicons name={Icons["paciente"].iconName} size={20} color="white" />
            <Text className="text-white text-base font-bold">
              Paciente: {nombre}
            </Text>
            <Ionicons name={Icons["abajo"].iconName} size={20} color="white"/>
          </View>
        )}
      </Pressable>
      {/* MODAL: PACIENTE */}
      <CustomModal
        tipo={"expandible"}
        visible={showModal}
        onClose={() => setShowModal(false)}
      >
        <View className="flex-1 p-2 gap-4 justify-center">
          {/* TÍTULO */}
          <Text className="text-primary text-xl font-bold">
            {nombre}
          </Text>
          {/* CONTENIDO */}
          <View className="gap-2">
            {/* OPCIONES */}
            <TituloSeccion children={"Opciones:"}/>
            <TarjetaMenu
              titulo={"Ver información"}
              fondoColor={colors.lightblue}
              textoColor={colors.black}
              iconoColor={colors.mediumblue}
              iconoNombre={Icons["agregar"].iconName}
              onPress={() => {
                console.log("[header] Viendo información del paciente...");
                router.replace(`/${rol}/${paciente}/paciente`);
                setShowModal(false);
              }}
            />
            <TarjetaMenu
              titulo={"Cambiar paciente"}
              fondoColor={colors.lightred}
              textoColor={colors.black}
              iconoColor={colors.mediumred}
              iconoNombre={Icons["paciente"].iconName}
              onPress={() => {
                Alert.alert(
                  "¿Cambiar paciente?",
                  "¿Estás segur@ de que deseas cambiar paciente?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Cambiar paciente",
                      style: "destructive",
                      onPress: () => {
                        console.log("[header] Cambiando paciente...");
                        router.replace(`/${rol}`);
                        setShowModal(false);
                      },
                    },
                  ]
                );
              }}
            />
          </View>
        </View>
      </CustomModal>
    </>
  );
}