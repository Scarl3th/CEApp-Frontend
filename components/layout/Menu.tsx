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
  const { user, createApi, authToken, refreshToken, setAuthToken } = useAuth();
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


  //Handle para cerrar sesión
  const handleCloseSession = async () =>{
    
    //Si es profesional debemos crear un log 
    if (user.role === "profesional"){
    
      try{
        const api = createApi(authToken, refreshToken, setAuthToken);
        const res = await api.post("/logs/end-session/");
        console.log("[log cerrar sesión] Log de sesión cerrada creado existoasamente");
      }
      catch(err: unknown){
        console.error("[log cerrar sesión] Error creando el log para cerrar sesión:", err);
      }
    }
    
    //Ponemos las funcionalidades que estaban en el botón por defecto
    console.log("[menú] Cerrando sesión...");
    setRutaPendiente(`/login`);
    onClose();
  }

  const items = [
    { route: `plan/progreso`, iconName: Icons["progreso"].iconName, label: Icons["progreso"].label, roles: ["profesional","cuidador"] },
    { route: `observaciones`, iconName: Icons["observaciones"].iconName, label: Icons["observaciones"].label, roles: ["profesional","cuidador"] },
    { route: `medicamentos`, iconName: Icons["medicamentos"].iconName, label: Icons["medicamentos"].label, roles: ["profesional","cuidador"] },
    { route: `informes`, iconName: Icons["informes"].iconName, label: Icons["informes"].label, roles: ["profesional","cuidador"] },
    { route: `equipo`, iconName: Icons["equipo"].iconName, label: Icons["equipo"].label, roles: ["profesional","cuidador"] },
    { route: `accesos`, iconName: Icons["accesos"].iconName, label: Icons["accesos"].label, roles: ["cuidador"] },
    { route: `tutoriales`, iconName: Icons["tutoriales"].iconName, label: Icons["tutoriales"].label, roles: ["profesional","cuidador"] },
    { route: `terminos-y-condiciones`, iconName: Icons["terminos_y_condiciones"].iconName, label: Icons["terminos_y_condiciones"].label, roles: ["profesional","cuidador"] },
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

        <View className="gap-3">

          {isProfesional ? (
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
          ) : null}

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
                    onPress: () => handleCloseSession(),
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