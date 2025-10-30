import * as d3 from "d3";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Dimensions, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAuth } from "@/context/auth";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";
import { CustomModal } from "@/components/base/Modal";
import { Boton, BotonTab } from "@/components/base/Boton";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { Titulo, TituloSeccion } from "@/components/base/Titulo";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { formatearFechaString } from '@/components/base/FormatearFecha';
import { ModalTutorial, Tutoriales } from "@/components/vistas/Tutoriales";

function formatearTiempo(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  let resultado = "";
  if (horas > 0) {
    resultado += `${horas} ${horas === 1 ? "hora" : "horas"}`;
  }
  if (mins > 0) {
    if (horas > 0) resultado += " ";
    resultado += `${mins} min`;
  }
  if (resultado === "") resultado = "0 min";
  return resultado;
}

//OBJETIVO GENERAL
interface OG {
  id: string; //id de cualquier cosa la verdad xd (supongo que mejor del objetivo general)
  nombre: string; //nombre del objetivo general
  color?: string; //color del objetivo general (queda pendiente agregarlo)
  tiempo: number; //tiempo total ocupado en el objetivo general (en el CA se explica cómo calcularlo).
  //EL TIEMPO DEBE SER UN NÚMERO, MI IDEA ES QUE SEA EN MINUTOS
  progresion: { //son las actualizaciones que han ido ocurriendo en los objetivos específicos del objetivo general
    fecha: Date; //fecha en la cual ocurrió la progresión
    OE_nombre: string; //nombre del objetivo específico
    accion: string; //accion que se realizó (Agregar, Editar, Eliminar)(Tener cuidado con las mayúsculas)
    profesional: string; //nombre del profesional que realizó la acción
    estado_antiguo?: string; //estado antiguo del objetivo específico (solo corresponde si es Editar)
    estado_nuevo?: string; //estado nuevo del objetivo específico (solo corresponde si es Agregar o Editar)
    porcentaje: number; //Porcentaje de "completitud" del objetivo general
    //                    (a la fecha en la que ocurre la progresión)
  }[];
}

//PROGRESO
export function Progreso() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const { paciente, tiempo, progresion } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID] = pacienteString?.split("-") ?? [null, null];
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];

  const screenWidth = Dimensions.get("window").width;

  const scrollRef = useRef<ScrollView>(null);

  const opcionesPredeterminadas = [
    { label: "1 mes", months: 1 },
    { label: "6 meses", months: 6 },
    { label: "1 año", months: 12 },
  ];

  //ESTADOS
  const [inicializado, setInicializado] = useState(false);
  const [pestana, setPestana] = useState<"progresion" | "tiempo">(tiempo ? "tiempo" : "progresion");
  const [OG, setOG] = useState<OG[]>([]);
  const [OGSelected, setOGSelected] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const [showModalPeriodo, setShowModalPeriodo] = useState(false);
  const [showModalOGProgresion, setShowModalOGProgresion] = useState(false);
  const [OGPressed, setOGPressed] = useState<{ id: string, index: number, fecha: Date } | null>(null);

  const [scrollIzquierda, setScrollIzquierda] = useState(false);
  const [scrollDerecha, setScrollDerecha] = useState(false);
  const [showModalOGTiempo, setShowModalOGTiempo] = useState(false);

  const [showModalOGSelected, setShowModalOGSelected] = useState<OG | null>(null);
  const [showModalOGFechaSelected, setShowModalOGFechaSelected] = useState<Date | null>(null);

  const [contentWidth, setContentWidth] = useState(0);
  const [timeUnit, setTimeUnit] = useState<"month" | "year">("month");
  const [timePeriods, setTimePeriods] = useState<number>(1);
  const [isCustom, setIsCustom] = useState(false);

  const [timeText, setTimeText] = useState(timePeriods.toString());

  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    fetchTutoriales();
    fetchOG();
  }, [authToken, refreshToken]);

  useEffect(() => {
    if (!inicializado && OG.length > 0) {
      setOGSelected(OG.map(o => o.id));
      setInicializado(true);
    }
  }, [OG, inicializado]);

  //FETCH: TUTORIAL
  const fetchTutoriales = async () => {
    const tutorialesAlmacenamiento = `tutoriales_${user?.id}`;
    if (!authToken || !refreshToken) return;
    try {
      //FETCH: TUTORIAL
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[progreso] Obteniendo tutoriales en almacenamiento local...");
      const tutorialesAlmacenamientoLocal = await AsyncStorage.getItem(tutorialesAlmacenamiento);
      let tutorialesAlmacenamientoDatos: Tutoriales;
      if (tutorialesAlmacenamientoLocal) {
        tutorialesAlmacenamientoDatos = JSON.parse(tutorialesAlmacenamientoLocal) as Tutoriales;
      } else {
        console.log("[progreso] No se encontraron tutoriales en el almacenamiento local...");
        console.log("[progreso] Obteniendo tutoriales de la base de datos...");
        const res = await api.get("/tutoriales/");
        tutorialesAlmacenamientoDatos = res.data;
        await AsyncStorage.setItem(tutorialesAlmacenamiento, JSON.stringify(tutorialesAlmacenamientoDatos));
      }
      //HANDLE: TUTORIAL
      if (!tutorialesAlmacenamientoDatos.tutorial_progreso) {
        console.log("[progreso] Tutorial no visto...");
        console.log("[progreso] Activando tutorial...");
        setShowTutorial(true);
        console.log("[progreso] Actualizando tutorial en la base de datos...");
        await api.patch("/tutoriales/", { tutorial_progreso: true });
        tutorialesAlmacenamientoDatos = { ...tutorialesAlmacenamientoDatos, tutorial_progreso: true };
        console.log("[progreso] Actualizando tutorial en almacenamiento local...");
        await AsyncStorage.setItem(tutorialesAlmacenamiento, JSON.stringify(tutorialesAlmacenamientoDatos));
      }
      else {
        console.log("[progreso] Tutorial visto...");
      }
      setError(false);
    } catch (err) {
      console.log("[progreso] Error:", err);
      setError(true);
    }
  };

  //FETCH: OG
  const fetchOG = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      console.log("[progreso] Obteniendo progreso de los objetivos generales en la base de datos...");
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.get("/progreso/" + pacienteID + "/");
      const OGFechas = res.data.map((og: any) => ({
        ...og,
        progresion: og.progresion.map((p: any) => ({
          ...p,
          fecha: new Date(p.fecha),
        })),
      }));
      setOG(OGFechas);
      setError(false);
    } catch (err) {
      console.log("[progreso] Error:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  let startDate: Date = new Date();
  let endDate: Date = new Date();
  if (timeUnit === "month") {
    startDate.setMonth(startDate.getMonth() - timePeriods); //Restar N meses
  } else {
    startDate.setFullYear(startDate.getFullYear() - timePeriods); //Restar N años
  }
  endDate.setHours(23, 59, 59, 999);
  startDate.setHours(0, 0, 0, 0);

  //FILTRO
  const OGFiltroSelected =
    OGSelected.length > 0
      ? OG.filter((o) => OGSelected.includes(o.id))
      : [...OG];
  const OGFiltroTiempo = OGFiltroSelected.reduce((acum, o) => acum + o.tiempo, 0);
  const OGFiltroProgresion = OGFiltroSelected.map(obj => {
    const progresion = obj.progresion;
    const primerAntes = progresion.filter(p => p.fecha < startDate).slice(-1)[0]; //Encuentra el primer punto antes del rango
    const primerDespues = progresion.filter(p => p.fecha > endDate)[0]; //Encuentra el primer punto después del rango
    const dentro = progresion.filter(p => p.fecha >= startDate && p.fecha <= endDate); //Filtra puntos dentro del rango
    //Construye nueva serie incluyendo los puntos de borde
    const nuevaSerie = [
      ...(primerAntes ? [primerAntes] : []),
      ...dentro,
      ...(primerDespues ? [primerDespues] : [])
    ];
    return {
      ...obj,
      progresion: nuevaSerie
    };
  }).filter(obj => obj.progresion.length > 0);
  const OGFiltroSelectedPorcentaje =
    OGFiltroSelected.length > 0
      ? OGFiltroSelected.reduce((acc, og) => {
          const ultimoPorcentaje =
            og.progresion.length > 0
              ? og.progresion[og.progresion.length - 1].porcentaje
              : 0;
          return acc + ultimoPorcentaje;
        }, 0) / OGFiltroSelected.length
      : 0;

  //VISTA
  return (
    <View className="flex-1">
      {/* TÍTULO */}
      <Titulo 
        subtitulo={"Visualización del progreso"}
        onPressRecargar={fetchOG}
      >
        Plan de trabajo
      </Titulo>
      {/* CUERPO */}
      {isLoading ? (
        <IndicadorCarga/>
      ) : error ? (
        <MensajeVacio
          mensaje={"Hubo un error al cargar el progreso.\nIntenta nuevamente."}
          onPressRecargar={fetchOG}
        />
      ) : OG.length === 0 ? (
        <MensajeVacio
          mensaje={"No se encontró progreso.\n¡Comienza a planificar el trabajo del paciente en el plan de trabajo!"}
        />
      ) : (

        <>
        
          {/* PESTAÑAS */}
          <View className="bg-lightgrey rounded-lg my-2 flex-row justify-around">
            <BotonTab
              label={"Progresión"}
              active={pestana === "progresion"}
              onPress={() => setPestana("progresion")}
            />
            <BotonTab
              label={"Tiempo dedicado"}
              active={pestana === "tiempo"}
              onPress={() => setPestana("tiempo")}
            />
          </View>

          <ScrollView className="flex-1 my-2 pb-20 gap-4">
            
            {pestana === "progresion" ? (
              <View className="bg-lightgrey gap-2 pt-2">
                {/* SUBTÍTULO */}
                <Text className="text-black text-lg font-bold text-center">
                  Progresión por objetivo general
                </Text>
                {/* FILTRO: PERÍODO */}
                <View className="gap-1 flex-row items-center justify-center">
                  {opcionesPredeterminadas.map((op) => (
                    <Pressable
                      key={op.label}
                      onPress={() => {
                        setTimeUnit("month");
                        setTimePeriods(op.months);
                        setIsCustom(false);
                      }}
                    >
                      {({ pressed }) => (
                        <View
                          className="rounded-lg p-2 gap-1 flex-row items-center"
                          style={{ backgroundColor: pressed ? colors.mediumlightgrey : !isCustom && timePeriods === op.months ? colors.primary : colors.mediumgrey }}
                        >
                          <Text className="text-white text-base font-bold">{op.label}</Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                  <Pressable onPress={() => setShowModalPeriodo(true)}>
                    {({ pressed }) => (
                      <View
                        className="rounded-lg p-2 gap-1 flex-row items-center"
                        style={{ backgroundColor: pressed ? colors.mediumlightgrey : isCustom ? colors.primary : colors.mediumgrey }}
                      >
                        <Text className="text-white text-base font-bold">
                          {isCustom ? `${timePeriods} ${timeUnit === "month" ? "mes(es)" : "año(s)"}` : "Personalizado"}
                        </Text>
                        <Ionicons name={Icons["abajo"].iconName} size={15} color={colors.white}/>
                      </View>
                    )}
                  </Pressable>
                </View>
                {/* GRÁFICO DE LÍNEAS */}
                <View style={{ position: "relative" }}>
                  <Svg width={screenWidth - 16} height={280}>
                    {(() => {
                      const allFechas = OGFiltroProgresion.flatMap(o => o.progresion.map(p => p.fecha));
                      if (allFechas.length === 0) return null;
                      const xScale = d3.scaleTime()
                        .domain([startDate, endDate])
                        .range([40, screenWidth - 16 - 40]);
                      const yScale = d3.scaleLinear()
                        .domain([0, 100])
                        .range([240, 20]);
                      return (
                        <>
                          {/* EJES */}
                          <Line x1={40} y1={yScale(0)} x2={screenWidth - 16 - 30} y2={yScale(0)} stroke={colors.mediumgrey} strokeWidth={2} />
                          <Line x1={40} y1={yScale(0)} x2={40} y2={yScale(100)} stroke={colors.mediumgrey} strokeWidth={2} />
                          {/* FECHAS */}
                          <SvgText
                            x={xScale(startDate)}
                            y={yScale(0) + 20}
                            fontSize={10}
                            fill={colors.mediumdarkgrey}
                            textAnchor={"start"}>
                            {formatearFechaString(startDate, { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </SvgText>
                          <SvgText
                            x={xScale(endDate) + 10}
                            y={yScale(0) + 20}
                            fontSize={10}
                            fill={colors.mediumdarkgrey}
                            textAnchor={"end"}>
                            {formatearFechaString(endDate, { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </SvgText>
                          {/* LÍNEAS Y CÍRCULOS */}
                          {OGFiltroProgresion.map(objetivo => {
                            const fechas = objetivo.progresion.map(p => p.fecha);
                            if (fechas.length === 0) return null;
                            const linePath = d3.line<[Date, number]>()
                              .x(d => xScale(d[0]))
                              .y(d => yScale(d[1]))
                              .curve(d3.curveMonotoneX)(
                                objetivo.progresion.map(p => [p.fecha, p.porcentaje])
                              );
                            return (
                              <G key={objetivo.id}>
                                <Path
                                  d={linePath!}
                                  stroke={objetivo.color || colors.primary}
                                  strokeWidth={2}
                                  fill="none"
                                  pointerEvents="none"
                                />
                                {objetivo.progresion
                                  .filter(p => p.fecha >= startDate && p.fecha <= endDate)
                                  .map((p, i) => (
                                    <Circle
                                      key={i}
                                      cx={xScale(p.fecha)}
                                      cy={yScale(p.porcentaje)}
                                      r={8}
                                      fill={OGPressed?.id === objetivo.id && OGPressed?.index === i
                                        ? colors.lightmediumgrey
                                        : objetivo.color || colors.primary}
                                      pointerEvents="none"
                                    />
                                  ))}
                              </G>
                            );
                          })}
                          {/* EJE Y: LABELS */}
                          {[0, 25, 50, 75, 100].map((v, idx) => (
                            <SvgText key={idx} x={8} y={yScale(v)} fontSize={10} fill="#333" textAnchor="start">
                              {v}%
                            </SvgText>
                          ))}
                        </>
                      );
                    })()}
                  </Svg>
                  {/* PRESSABLES */}
                  {(() => {
                    const allFechas = OGFiltroProgresion.flatMap(o => o.progresion.map(p => p.fecha));
                    if (allFechas.length === 0) return null;
                    const xScale = d3.scaleTime()
                      .domain([startDate, endDate])
                      .range([40, screenWidth - 16 - 40]);
                    const yScale = d3.scaleLinear()
                      .domain([0, 100])
                      .range([240, 20]);
                    return OGFiltroProgresion.map(objetivo =>
                      objetivo.progresion
                        .filter(p => p.fecha >= startDate && p.fecha <= endDate)
                        .map((p, i) => {
                          const cx = xScale(p.fecha);
                          const cy = yScale(p.porcentaje);
                          return (
                            <Pressable
                              key={`pressable-${objetivo.id}-${i}`}
                              onPressIn={() => setOGPressed({ id: objetivo.id, index: i, fecha: p.fecha })}
                              onPressOut={() => setOGPressed(null)}
                              onPress={() => {
                                console.log("[progreso] Abriendo modal con más información sobre la progresión...");
                                setShowModalOGProgresion(true);
                                setShowModalOGSelected(objetivo);
                                setShowModalOGFechaSelected(p.fecha);
                                setModalIndex(i);
                              }}
                              style={{
                                position: "absolute",
                                left: cx - 15,
                                top: cy - 15,
                                width: 30,
                                height: 30,
                                borderRadius: 15,
                                backgroundColor: "transparent",
                              }}
                            />
                          );
                        })
                    );
                  })()}
                </View>
              </View>
                
            ) : pestana === "tiempo" ? (
              <View className="bg-lightgrey gap-2 pt-2">
                {/* SUBTÍTULO */}
                <Text className="text-black text-lg font-bold text-center">
                  Tiempo dedicado por objetivo general
                </Text>
                {/* GRÁFICO DE BARRAS */}
                <View style={{ position: "relative" }}>
                  <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onContentSizeChange={(w) => {
                      setContentWidth(w);
                      setScrollDerecha(w > screenWidth);
                    }}
                    onScroll={(event) => {
                      const { contentOffset } = event.nativeEvent;
                      setScrollIzquierda(contentOffset.x > 0);
                      setScrollDerecha(contentOffset.x + screenWidth < contentWidth - 1);
                    }}
                  >
                    <Svg
                      width={Math.max(OGFiltroSelected.length * 60, screenWidth - 16)}
                      height={280}
                    >
                      {(() => {
                        const data = OGFiltroSelected;
                        if (data.length === 0) return null;
                        const margin = { top: 20, right: 10, bottom: 40, left: 55 };
                        const width =
                          Math.max(OGFiltroSelected.length * 60, screenWidth - 16) -
                          margin.left -
                          margin.right;
                        const height = 280 - margin.top - margin.bottom;
                        const xScale = d3
                          .scaleBand()
                          .domain(data.map((o, i) => i.toString()))
                          .range([0, width])
                          .padding(0.1);
                        const yScale = d3
                          .scaleLinear()
                          .domain([0, d3.max(data, (d) => d.tiempo)!])
                          .nice()
                          .range([height, 0]);
                        const yTicks = yScale.ticks(5);
                        return (
                          <G transform={`translate(${margin.left}, ${margin.top})`}>
                            {/* EJE Y */}
                            <Line x1={0} y1={0} x2={0} y2={height} stroke={colors.mediumgrey} strokeWidth={2} />
                            {/* EJE X */}
                            <Line x1={0} y1={height} x2={width} y2={height} stroke={colors.mediumgrey} strokeWidth={2} />
                            {/* BARRAS VISUALES */}
                            {data.map((o, i) => (
                              <Rect
                                key={o.id}
                                x={xScale(i.toString()) ?? 0}
                                y={yScale(o.tiempo)}
                                width={xScale.bandwidth()}
                                height={height - yScale(o.tiempo)}
                                fill={OGPressed?.id === o.id ? colors.lightmediumgrey : o.color || colors.primary}
                                rx={2}
                                pointerEvents="none"
                              />
                            ))}
                            {/* EJE Y: LABELS */}
                            {yTicks.map((t, i) => (
                              <G key={i}>
                                <SvgText
                                  x={-25}
                                  y={yScale(t)}
                                  fontSize={10}
                                  fill={colors.mediumdarkgrey}
                                  textAnchor="end"
                                  alignmentBaseline="middle"
                                >
                                  {t}
                                </SvgText>
                                <SvgText
                                  x={-24}
                                  y={yScale(t)}
                                  fontSize={10}
                                  fill={colors.mediumdarkgrey}
                                  textAnchor="start"
                                  alignmentBaseline="middle"
                                >
                                  min
                                </SvgText>
                              </G>
                            ))}
                            {/* EJE X: LABELS */}
                            {data.map((o, i) => (
                              <SvgText
                                key={i}
                                x={xScale(i.toString())! + xScale.bandwidth() / 2}
                                y={height + 14}
                                fontSize={10}
                                fill={colors.mediumdarkgrey}
                                textAnchor="middle"
                              >
                                {o.nombre.length > 6 ? o.nombre.slice(0, 6) + "…" : o.nombre}
                              </SvgText>
                            ))}
                          </G>
                        );
                      })()}
                    </Svg>
                    {/* PRESSABLES */}
                    {(() => {
                      const data = OGFiltroSelected;
                      if (data.length === 0) return null;
                      const margin = { top: 20, right: 10, bottom: 40, left: 55 };
                      const width =
                        Math.max(OGFiltroSelected.length * 60, screenWidth - 16) -
                        margin.left -
                        margin.right;
                      const height = 280 - margin.top - margin.bottom;
                      const xScale = d3
                        .scaleBand()
                        .domain(data.map((o, i) => i.toString()))
                        .range([0, width])
                        .padding(0.1);
                      const yScale = d3
                        .scaleLinear()
                        .domain([0, d3.max(data, (d) => d.tiempo)!])
                        .nice()
                        .range([height, 0]);
                      return data.map((o, i) => {
                        const x = xScale(i.toString())! + margin.left;
                        const y = yScale(o.tiempo) + margin.top;
                        const barWidth = xScale.bandwidth();
                        const barHeight = height - yScale(o.tiempo);
                        return (
                          <Pressable
                            key={`pressable-${o.id}`}
                            onPressIn={() => setOGPressed({ id: o.id, index: i, fecha: new Date() })}
                            onPressOut={() => setOGPressed(null)}
                            onPress={() => {
                              console.log("[progreso] Abriendo modal con más información sobre el tiempo dedicado...");
                              setShowModalOGSelected(o);
                              setShowModalOGTiempo(true);
                            }}
                            style={{
                              position: "absolute",
                              left: x,
                              top: y,
                              width: barWidth,
                              height: barHeight,
                              backgroundColor: "transparent",
                            }}
                          />
                        );
                      });
                    })()}
                  </ScrollView>
                </View>

                {/* FELCHAS */}
                {scrollIzquierda && (
                  <View
                    className="rounded-full p-1"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      zIndex: 10,
                      transform: [{ translateY: -12 }],
                      backgroundColor: colors.mediumgrey,
                    }}
                  >
                    <Ionicons
                      name={Icons["izquierda"].iconName}
                      size={15}
                      color={colors.white}
                      onPress={() => scrollRef.current?.scrollTo({ x: 0, animated: true })}
                    />
                  </View>
                )}
                {scrollDerecha && (
                  <View
                    className="rounded-full p-1"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      zIndex: 10,
                      transform: [{ translateY: -12 }],
                      backgroundColor: colors.mediumgrey,
                    }}
                  >
                    <Ionicons
                      name={Icons["derecha"].iconName}
                      size={15}
                      color={colors.white}
                      onPress={() => {
                        scrollRef.current?.scrollToEnd({ animated: true });
                      }}
                    />
                  </View>
                )}
              </View>

            ) : null}

            {/* FILTRO: OBJETIVOS GENERALES */}
            <View className="pt-2 gap-0.5">
              {OG.map((o) => {
                const isSelected = OGSelected.includes(o.id);
                return (
                  <Pressable
                    key={o.id}
                    onPress={() => {
                      if (isSelected) {
                        setOGSelected((prev) => prev.filter((id) => id !== o.id));
                      } else {
                        setOGSelected((prev) => [...prev, o.id]);
                      }
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className="rounded-lg p-2 mb-2 flex-row items-center justify-between"
                        style={{ backgroundColor: pressed ? colors.lightmediumgrey : colors.lightgrey }}
                      >
                        <View
                          className="w-5 h-5 rounded-sm border-2 mr-3 justify-center items-center"
                          style={{
                            borderColor: o.color || colors.primary,
                            backgroundColor: isSelected ? o.color : "transparent",
                          }}
                        >
                          {isSelected && (
                            <Ionicons name={Icons["checkmark"].iconName} size={15} color={colors.light}/>
                          )}
                        </View>
                        <Text className="flex-1 text-black text-base font-bold">
                          {o.nombre}
                        </Text>
                        {pestana === "tiempo" && (
                          <Text className="text-sm font-medium ml-3" style={{ color: colors.mediumgrey }}>
                            {formatearTiempo(o.tiempo)}
                          </Text>
                        )}
                        {pestana === "progresion" && (
                          <Text className="text-sm font-medium ml-3" style={{ color: colors.mediumgrey }}>
                            {`${o.progresion.length > 0 ? o.progresion[o.progresion.length - 1].porcentaje : 0}%`}
                          </Text>
                        )}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
            {pestana === "tiempo" ? (
              <Text className="text-mediumgrey text-sm text-right pr-2">
                Tiempo total dedicado: {formatearTiempo(OGFiltroTiempo)}
              </Text>
            ) : (
              <Text className="text-mediumgrey text-sm text-right pr-2">
                Progresión promedio: {parseFloat(OGFiltroSelectedPorcentaje.toFixed(2))}%
              </Text>
            )}

          </ScrollView>

          {/* MODAL: PERÍODO PERSONALIZADO */}
          <CustomModal
            tipo={"expandible"}
            visible={showModalPeriodo}
            onClose={() => setShowModalPeriodo(false)}
          >
            <View className="flex-1 p-2 gap-4 justify-center">
              <Text className="text-primary text-xl font-bold">
                Período personalizado
              </Text>
              <TextInput
                value={timeText}
                onChangeText={setTimeText}
                keyboardType="numeric"
                className="border border-gray-400 rounded p-2 flex-1 text-center"
              />
              <View className="gap-2 flex-row items-center justify-center">
                <Pressable
                  onPress={() => setTimeUnit("month")}
                  className="flex-1"
                >
                  {({ pressed }) => (
                    <View
                      className="rounded-lg p-2 gap-1 flex-row items-center justify-center"
                      style={{ backgroundColor: pressed ? colors.mediumlightgrey : timeUnit === "month" ? colors.primary : colors.mediumgrey }}
                    >
                      <Text className="text-white text-base font-bold">Mes(es)</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => setTimeUnit("year")}
                  className="flex-1"
                >
                  {({ pressed }) => (
                    <View
                      className="rounded-lg p-2 gap-1 flex-row items-center justify-center"
                      style={{ backgroundColor: pressed ? colors.mediumlightgrey : timeUnit === "year" ? colors.primary : colors.mediumgrey }}
                    >
                      <Text className="text-white text-base font-bold">Año(s)</Text>
                    </View>
                  )}
                </Pressable>
              </View>
              <Boton
                texto={"Filtrar"}
                onPress={() => {
                  const n = parseInt(timeText);
                  if (!isNaN(n) && n > 0) {
                    setTimePeriods(n);
                    setIsCustom(true);
                    setShowModalPeriodo(false);
                  }
                }}
                tipo={3}
              />
            </View>
          </CustomModal>

          {/* MODAL: DETALLE PROGRESIÓN */}
          <CustomModal
            tipo={"expandible"}
            visible={showModalOGProgresion}
            onClose={() => setShowModalOGProgresion(false)}
            bordeColor={showModalOGSelected ? showModalOGSelected.color : colors.primary}
          >
            {showModalOGSelected && (
              <View>
                {(() => {
                  const progresion = showModalOGSelected.progresion[modalIndex ?? 0];
                  if (!progresion) {
                    return <MensajeVacio mensaje={"No hay progreso registrado."}/>;
                  }
                  return (
                    <View className="flex-1 gap-2 justify-center">
                      <Text className="text-primary text-xl font-bold">
                        {showModalOGSelected.nombre}
                      </Text>
                      <Text className="text-darkmediumgrey text-sm">
                        {formatearFechaString(progresion.fecha, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                      <View className="bg-lightgrey rounded-lg p-2 mb-2">
                        <Text className="text-black text-base font-semibold">
                          {
                            progresion.accion === "agregar" ? `${progresion.profesional} agregó el objetivo específico "${progresion.OE_nombre}" con estado "${progresion.estado_nuevo}".` :
                            progresion.accion === "editar" && progresion.estado_antiguo == progresion.estado_nuevo ? `${progresion.profesional} editó el objetivo específico "${progresion.OE_nombre}".` :
                            progresion.accion === "editar" && progresion.estado_antiguo != progresion.estado_nuevo ? `${progresion.profesional} editó el objetivo específico "${progresion.OE_nombre}", actualizando su estado de "${progresion.estado_antiguo}" a "${progresion.estado_nuevo}".` :
                            progresion.accion === "eliminar" ? `${progresion.profesional} eliminó el objetivo específico "${progresion.OE_nombre}".` :
                            null
                          }
                        </Text>
                      </View>
                      <Text className="text-darkmediumgrey text-sm text-right">
                        {`Progresión del objetivo general: ${progresion.porcentaje}%`}
                      </Text>
                    </View>
                  );
                })()}
              </View>
            )}
          </CustomModal>

          {/* MODAL: DETALLE TIEMPO DEDICADO */}
          <CustomModal
            tipo={"expandible"}
            visible={showModalOGTiempo}
            onClose={() => setShowModalOGTiempo(false)}
            bordeColor={showModalOGSelected ? showModalOGSelected.color : colors.primary}
          >
            {showModalOGSelected && (
              <View className="flex-1 p-2 gap-4 justify-center">
                <Text className="text-primary text-xl font-bold">
                  {showModalOGSelected.nombre}
                </Text>
                <TituloSeccion
                  children={"Tiempo dedicado:"}
                  respuesta={formatearTiempo(showModalOGSelected.tiempo)}
                />
              </View>
            )}
          </CustomModal>
          {/* TUTORIAL */}
          <ModalTutorial
            tipo={"tutorial"}
            visible={showTutorial}
            onClose={() => setShowTutorial(false)}
            plan={true}
            rol={rol}
          />

        </>
      )}
    </View>
  );

}

//ALGUNAS IDEAS PARA MEJORAR LA INTERFAZ:
//PONER OPCIONES DE DESELECCIONAR TODO O SELECCIONAR TODO
//QUE LAS FLECHAS MUEVAN LA VISTA (LO INTENTÉ Y NO ME FUNCIONÓ :p)
//TRAS APRETAR UNA BARRA, EN EL MODAL TENGA DISTINTAS OPCIONES:
//(1) DESELECCIONAR
//(2) VER EN EL PLAN DE TRABAJO (IR AL PLAN DE TRABAJO Y LA BÚSQUEDA DEBE CORRESPONDER AL OG)
//MOSTRAR LA CANTIDAD DE ENTRADAS ASOCIADAS EN LA BITÁCORA
//BÚSQUEDA DE OBJETIVOS GENERALES
//A LAS TARJETAS DE LAS ACTUALIZACIONES PONERLAS MAS COMO ESTÁN EN LA VISTA DE ACTUALIZACIONES. Y QUIZÁS PONER MEJORES MENSAJES, MENOS TÉCNICOS