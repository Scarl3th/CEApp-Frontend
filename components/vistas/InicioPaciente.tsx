import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { colors } from "@/constants/colors";
import { Titulo } from "@/components/base/Titulo";
import { IconType, Icons } from "@/constants/icons";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { formatearTiempo } from "@/components/base/FormatearFecha";

function TarjetaInicio({
  onPress,
  titulo,
  subtitulo,
  icono,
  tarjetaColor = colors.lightgrey,
  fullWidth = false,
}: {
  onPress: () => void;
  titulo: string;
  subtitulo: string[];
  icono?: IconType;
  tarjetaColor?: string;
  fullWidth?: boolean;
}) {
  const subtituloes = Array.isArray(subtitulo) ? subtitulo : [subtitulo];
  const subtituloesTexto = subtituloes.join(" / ");
  return (
    <Pressable onPress={onPress} className="rounded-lg" style={{ width: fullWidth ? "100%" : "48%" }}>
      {({ pressed }) => (
        <View
          className="rounded-lg p-4 my-2 gap-1 items-center justify-start"
          style = {{ backgroundColor: pressed ? colors.mediumlightgrey : tarjetaColor }}
        >
          {icono && (
            <Ionicons
              name={icono}
              size={30}
              color={colors.black}
              style={{ alignSelf: "center", marginBottom: 4 }}
            />
          )}
          <Text className="text-base font-semibold text-center" style={{ color: colors.black }}
          >
            {titulo}
          </Text>
          <Text className="text-sm text-center" style={{ color: colors.mediumdarkgrey }}>
            {subtituloesTexto}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

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

  useEffect(() => {
      fetchMetricas();
    }, [authToken, refreshToken]);

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
        <Titulo>
          {`¡Bienvenid@, ${usuarioNombre}! 👋`}
          </Titulo>
        <Text className="text-base text-secondary font-bold pb-4">
          {`Estás viendo el plan de trabajo de ${pacienteNombre}`}
        </Text>
      </View>
      {isLoading ? (
        <IndicadorCarga/>
      ) : (
        <ScrollView>
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
          {!error ? (
            <View className="flex-row flex-wrap justify-between">
              <TarjetaInicio
                onPress={() => router.replace(`/${rol}/${paciente}/plan/progreso`)}
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
                onPress={() => router.replace(`/${rol}/${paciente}/plan/progreso`)}
                titulo={"Tiempo dedicado"}
                subtitulo={[`${formatearTiempo(tiempoTotalDedicado)}`]}
                icono={Icons["tiempo"].iconName}
                tarjetaColor={colors.lightblue}
              />
            </View>
          ) : null}
          <Text className="text-lg text-center mt-2">Conoce las herramientas que tenemos para ti:</Text>
          <View className="flex-row flex-wrap justify-between">
            <TarjetaInicio
              onPress={() => router.replace(`/${rol}/${paciente}/plan`)}
              titulo={Icons["plan"].label + " de trabajo"}
              subtitulo={[Icons["plan"].description]}
              icono={Icons["plan"].iconName}
            />
            {isProfesional ? (
              <TarjetaInicio
                onPress={() => router.replace(`/${rol}/${paciente}/plan`)}
                titulo={Icons["bitacora"].label}
                subtitulo={[Icons["bitacora"].description]}
                icono={Icons["bitacora"].iconName}
              />
            ) : null}
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
          </View>
        </ScrollView>
      )}
    </View>
  );

}