import { Alert, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";
import { CustomModal } from "@/components/base/Modal";
import { TarjetaMenu } from "@/components/base/Tarjeta";

function primeraLetraMayuscula(text: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function Menu({ visible, onClose, paciente }) {
  const router = useRouter();
  const { user } = useAuth();
  if (!user) return null;
  const isProfesional = user?.role === "profesional";

  const pathname = usePathname();
  const ruta = decodeURIComponent(pathname || "");
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];

  //ESTADOS
  const [rutaPendiente, setRutaPendiente] = useState<string | null>(null);

  //RUTA PENDIENTE: REVISAR!
  useEffect(() => {
    if (!visible && rutaPendiente) {
      //Postergar la navegación para evitar conflictos de render
      setTimeout(() => {
        router.replace(rutaPendiente);
        setRutaPendiente(null);
      }, 0);
    }
  }, [visible, rutaPendiente, router]);

  const items = [
    { route: `plan/progreso`, iconName: Icons["progreso"].iconName, label: Icons["progreso"].label, roles: ["profesional","cuidador"] },
    { route: `observaciones`, iconName: Icons["observaciones"].iconName, label: Icons["observaciones"].label, roles: ["profesional","cuidador"] },
    { route: `medicamentos`, iconName: Icons["medicamentos"].iconName, label: Icons["medicamentos"].label, roles: ["profesional","cuidador"] },
    { route: `informes`, iconName: Icons["informes"].iconName, label: Icons["informes"].label, roles: ["profesional","cuidador"] },
    { route: `equipo`, iconName: Icons["equipo"].iconName, label: Icons["equipo"].label, roles: ["profesional","cuidador"] },
  ];

  //VISTA
  return (
    <CustomModal
      tipo={"-x"}
      visible={visible}
      onClose={onClose}
      fondoColor={colors.primary}
      iconoColor={colors.white}
    >
      <View>

        {/* USUARIO */}
        <View className="px-4 py-4 items-center">
          <Ionicons
            name={Icons["usuario"].iconName}
            size={50}
            color={colors.white}
          />
          <Text className="text-white text-2xl font-bold">{user.nombre}</Text>
          <Text className="text-lightgrey text-base">{primeraLetraMayuscula(user.role)}</Text>
        </View>

        <View className="gap-4">

          <TarjetaMenu
            titulo={Icons["calendario"].label}
            fondoColor={colors.lightblue}
            textoColor={colors.black}
            iconoColor={colors.mediumblue}
            iconoNombre={Icons["calendario"].iconName}
            onPress={() => {
              setRutaPendiente(`/${rol}/${paciente}/calendario`);
              onClose();
            }}
          />

          {isProfesional && (
            <TarjetaMenu
              titulo={Icons["actividades"].label}
              fondoColor={colors.lightblue}
              textoColor={colors.black}
              iconoColor={colors.mediumblue}
              iconoNombre={Icons["actividades"].iconName}
              onPress={() => {
                setRutaPendiente(`/${rol}/${paciente}/actividades`);
                onClose();
              }}
            />
          )}

          {items
            .filter(item => item.roles.includes(user.role))
            .map(item => (
              <TarjetaMenu
                key={item.route}
                titulo={item.label}
                iconoNombre={item.iconName}
                onPress={() => {
                  setRutaPendiente(`/${rol}/${paciente}/${item.route}`);
                  onClose();
                }}
              />
          ))}

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
                      console.log("[menú] Cambiando paciente...");
                      setRutaPendiente(`/${rol}`);
                      onClose();
                    },
                  },
                ]
              );
            }}
          />

          <TarjetaMenu
            titulo={Icons["cerrar_sesion"].label}
            fondoColor={colors.lightred}
            textoColor={colors.black}
            iconoColor={colors.mediumred}
            iconoNombre={Icons["cerrar_sesion"].iconName}
            onPress={() => {
              Alert.alert(
                "¿Cerrar sesión?",
                "¿Estás segur@ de que deseas cerrar sesión?",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Cerrar sesión",
                    style: "destructive",
                    onPress: () => {
                      console.log("[menú] Cerrando sesión...");
                      setRutaPendiente(`/login`);
                      onClose();
                    },
                  },
                ]
              );
            }}
          />
          
        </View>

      </View>
    </CustomModal>
  );
}