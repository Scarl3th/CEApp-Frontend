import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";
import { Titulo } from "@/components/base/Titulo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TarjetaInicio } from "@/components/base/Tarjeta";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { formatearTiempo } from "@/components/base/FormatearFecha";
import { ModalTutorial, Tutoriales } from "@/components/vistas/Tutoriales";

export function InicioPaciente() {

  const { user, authToken, refreshToken, createApi, setAuthToken } = useAuth();
  const router = useRouter();
  const usuarioNombre = user?.nombre.split(" ")[0];
  const isProfesional = user?.role === "profesional";
  const parametros = useLocalSearchParams();
  const paciente = parametros.paciente;
  const [pacienteID, pacienteEncodedNombre] = paciente?.split("-") ?? [null, null];
  const pacienteNombre = pacienteEncodedNombre ? decodeURIComponent(pacienteEncodedNombre) : null;
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];

  //ESTADOS
  const [tiempoTotalDedicado, setTiempoTotalDedicadoDedicado] = useState(0);
  const [porcentajePromedio, setPorcentajePromedio] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    fetchTutoriales();
    fetchMetricas();
  }, [authToken, refreshToken]);

  //FETCH: TUTORIAL
  const fetchTutoriales = async () => {
    const tutorialesAlmacenamiento = `tutoriales_${user?.id}`;
    if (!authToken || !refreshToken) return;
    try {
      //FETCH: TUTORIAL
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[inicio] Obteniendo tutoriales en almacenamiento local...");
      const tutorialesAlmacenamientoLocal = await AsyncStorage.getItem(tutorialesAlmacenamiento);
      let tutorialesAlmacenamientoDatos: Tutoriales;
      if (tutorialesAlmacenamientoLocal) {
        tutorialesAlmacenamientoDatos = JSON.parse(tutorialesAlmacenamientoLocal) as Tutoriales;
      } else {
        console.log("[inicio] No se encontraron tutoriales en el almacenamiento local...");
        console.log("[inicio] Obteniendo tutoriales de la base de datos...");
        const res = await api.get("/tutoriales/");
        tutorialesAlmacenamientoDatos = res.data;
        await AsyncStorage.setItem(tutorialesAlmacenamiento, JSON.stringify(tutorialesAlmacenamientoDatos));
      }
      //HANDLE: TUTORIAL
      if (!tutorialesAlmacenamientoDatos.tutorial_inicio) {
        console.log("[inicio] Tutorial no visto...");
        console.log("[inicio] Activando tutorial...");
        setShowTutorial(true);
        console.log("[inicio] Actualizando tutorial en la base de datos...");
        await api.patch("/tutoriales/", { tutorial_inicio: true });
        tutorialesAlmacenamientoDatos = { ...tutorialesAlmacenamientoDatos, tutorial_inicio: true };
        console.log("[inicio] Actualizando tutorial en almacenamiento local...");
        await AsyncStorage.setItem(tutorialesAlmacenamiento, JSON.stringify(tutorialesAlmacenamientoDatos));
      }
      else {
        console.log("[inicio] Tutorial visto...");
      }
      setError(false);
    } catch (err) {
      console.log("[inicio] Error:", err);
      setError(true);
    }
  };

  //FETCH: MÉTRICAS
  const fetchMetricas = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      console.log("[inicio] Obteniendo métricas...");
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res1 = await api.get("/progreso/tiempo-total-dedicado/" + pacienteID + "/");
      setTiempoTotalDedicadoDedicado(res1.data.tiempo_total);
      const res2 = await api.get("/progreso/porcentaje-promedio/" + pacienteID + "/");
      setPorcentajePromedio(res2.data.promedio_porcentaje);
      setError(false);
    } catch (err) {
      console.log("[inicio] Error:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  //VISTA
  return (
    <View className="flex-1">
      <View className="justify-center items-center">
        {/* TÍTULO */}
        <Titulo>
          {`¡Bienvenid@, ${usuarioNombre}! 👋`}
          </Titulo>
        <Text className="text-base text-secondary font-bold pb-4">
          {`Estás viendo el plan de trabajo de ${pacienteNombre}`}
        </Text>
      </View>
      {/* CUERPO */}
      {isLoading ? (
        <IndicadorCarga/>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
          {/* BOTÓN: AGREGAR PROFESIONAL */}
          {!isProfesional && (
            <Pressable onPress={() => router.push(`/cuidador/${paciente}/equipo/equipo-agregar`)}>
              {({ pressed }) => (
                <View
                  className="bg-secondary rounded-lg p-4 mb-2 flex-row items-center justify-center"
                  style={{
                    backgroundColor: pressed ? colors.mediumlightgrey : colors.secondary,
                    width: '100%',
                  }}
                >
                  <Ionicons name={Icons["vincular"].iconName} size={30} color={colors.white}/>
                  <Text className="text-white text-lg text-center font-semibold ml-3">
                    Agregar profesional
                  </Text>
                </View>
              )}
            </Pressable>
          )}
          {/* MÉTRICAS */}
          {!error ? (
            <View className="flex-row flex-wrap justify-between">
              <TarjetaInicio
                onPress={() => router.replace(`/${rol}/${paciente}/plan/progreso?progresion=1`)}
                titulo={"Progreso"}
                subtitulo={[`${porcentajePromedio}%`]}
                icono={Icons["progreso"].iconName}
                tarjetaColor={
                  porcentajePromedio < 25 ? colors.lightred :
                  porcentajePromedio < 50 ? colors.lightyellow :
                  porcentajePromedio <= 100 ? colors.lightgreen :
                  colors.lightgrey
                }
              />
              <TarjetaInicio
                onPress={() => router.replace(`/${rol}/${paciente}/plan/progreso?tiempo=1`)}
                titulo={"Tiempo dedicado"}
                subtitulo={[`${formatearTiempo(tiempoTotalDedicado)}`]}
                icono={Icons["tiempo"].iconName}
                tarjetaColor={colors.lightblue}
              />
            </View>
          ) : null}
          {/* HERRAMIENTAS */}
          <Text className="text-lg text-center mt-2">Conoce las herramientas que tenemos para ti:</Text>
          <View className="flex-row flex-wrap justify-between">
            <TarjetaInicio
              onPress={() => router.replace(`/${rol}/${paciente}/plan`)}
              titulo={Icons["plan"].label + " de trabajo"}
              subtitulo={[Icons["plan"].description]}
              icono={Icons["plan"].iconName}
            />
            <TarjetaInicio
              onPress={() => router.replace(`/${rol}/${paciente}/bitacora`)}
              titulo={Icons["bitacora"].label}
              subtitulo={[Icons["bitacora"].description]}
              icono={Icons["bitacora"].iconName}
            />
            {isProfesional ? (
              <TarjetaInicio
                onPress={() => router.replace(`/${rol}/${paciente}/chat`)}
                titulo={Icons["chat"].label}
                subtitulo={[Icons["chat"].description]}
                icono={Icons["chat"].iconName}
              />
            ) : null}
            <TarjetaInicio
              onPress={() => router.replace(`/${rol}/${paciente}/calendario`)}
              titulo={Icons["calendario"].label}
              subtitulo={[Icons["calendario"].description]}
              icono={Icons["calendario"].iconName}
            />
            <TarjetaInicio
              onPress={() => router.replace(`/${rol}/${paciente}/medicamentos`)}
              titulo={Icons["medicamentos"].label}
              subtitulo={[Icons["medicamentos"].description]}
              icono={Icons["medicamentos"].iconName}
            />
            <TarjetaInicio
              onPress={() => router.replace(`/${rol}/${paciente}/informes`)}
              titulo={Icons["informes"].label}
              subtitulo={[Icons["informes"].description]}
              icono={Icons["informes"].iconName}
            />
            <TarjetaInicio
              onPress={() => router.replace(`/${rol}/${paciente}/equipo`)}
              titulo={Icons["equipo"].label}
              subtitulo={[Icons["equipo"].description]}
              icono={Icons["equipo"].iconName}
            />
            <TarjetaInicio
              onPress={() => router.replace(`/${rol}/${paciente}/observaciones`)}
              titulo={Icons["observaciones"].label}
              subtitulo={[Icons["observaciones"].description]}
              icono={Icons["observaciones"].iconName}
            />
            {isProfesional ? (
              <TarjetaInicio
                onPress={() => router.replace(`/${rol}/${paciente}/actividades`)}
                titulo={Icons["actividades"].label}
                subtitulo={[Icons["actividades"].description]}
                icono={Icons["actividades"].iconName}
              />
            ) : null}
            {!isProfesional ? (
              <TarjetaInicio
                onPress={() => router.replace(`/${rol}/${paciente}/accesos`)}
                titulo={Icons["accesos"].label}
                subtitulo={[Icons["accesos"].description]}
                icono={Icons["accesos"].iconName}
              />
            ) : null}
            <TarjetaInicio
              onPress={() => router.replace(`/${rol}/${paciente}/tutoriales`)}
              titulo={Icons["tutoriales"].label}
              subtitulo={[Icons["tutoriales"].description]}
              icono={Icons["tutoriales"].iconName}
            />
          </View>
        </ScrollView>
      )}
      {/* TUTORIAL */}
      <ModalTutorial
        tipo={"tutorial"}
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
        inicio={true}
        rol={rol}
      />
    </View>
  );

}