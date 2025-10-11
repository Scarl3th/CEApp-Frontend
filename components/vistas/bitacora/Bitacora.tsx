import { FlatList, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/auth";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";
import { Etiqueta } from "@/components/base/Etiqueta";
import { CustomToast } from "@/components/base/Toast";
import { BotonAgregar } from "@/components/base/Boton";
import { TextoBloque } from "@/components/base/TextoBloque";
import { TarjetaExpandible } from "@/components/base/Tarjeta";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { Titulo, TituloSeccion } from "@/components/base/Titulo";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { formatearFechaString, formatearTiempo } from "@/components/base/FormatearFecha";

//ENTRADA
const animos = [
  { id: "Feliz", emoji: "😊", nombre: "Feliz" },
  { id: "Triste", emoji: "😢", nombre: "Triste" },
  { id: "Molesto", emoji: "😡", nombre: "Molesto" },
  { id: "Entusiasmado", emoji: "🤩", nombre: "Entusiasmado" },
  { id: "Sorprendido", emoji: "😮", nombre: "Sorprendido" },
  { id: "Confundido", emoji: "😕", nombre: "Confundido" },
  { id: "Cansado", emoji: "🥱", nombre: "Cansado" },
  { id: "Neutral", emoji: "😐", nombre: "Neutral" },
];
interface Actividad {
  id: string | number;
  titulo: string;
}
interface ObjetivoEspecifico {
  id: string | number;
  titulo: string;
  estado?: number;
}
interface Entrada {
  id: string | number;
  titulo: string;
  fecha_creacion: Date;
  autor: string;
  animo: string;
  duracion: number;
  selected_obj: ObjetivoEspecifico[];
  actividades?: Actividad[];
  comentarios?: string;
}

//ICONO: ENTRADA
interface EntradaIconoProps {
  emoji: string;
}
export function EntradaIcono({
  emoji
}: EntradaIconoProps) {
  return (
    <View className="rounded-full justify-center items-center">
      <Text className="text-3xl text-center">{emoji}</Text>
    </View>
  );
}

//ITEM: ENTRADA
interface EntradaItemProps {
  entrada: Entrada;
}
const EntradaItem = ({
  entrada
}: EntradaItemProps) => {
  const getAnimo = (id?: string) => {
    const animo = animos.find(a => a.id === id);
    return {
      emoji: animo?.emoji ?? "🙂",
      nombre: animo?.nombre ?? "Neutral",
    };
  };
  const { emoji: animoEmoji, nombre: animoNombre } = getAnimo(entrada.animo);
  //VISTA
  return (
    <TarjetaExpandible
      titulo={entrada.titulo}
      subtitulo={`Autor: ${entrada.autor}\nFecha: ${formatearFechaString(entrada.fecha_creacion, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}`}
      icono={<EntradaIcono emoji={animoEmoji}/>}
      expandidoContenido={
        <View className="gap-2">
          {/* COMENTARIOS */}
          {entrada.comentarios && entrada.comentarios.length > 0 && (
            <TextoBloque texto={entrada.comentarios}/>
          )}
          {/* DURACIÓN */}
          <View className="gap-2">
            <TituloSeccion children={"Duración:"}/>
            <Etiqueta
              texto={`${formatearTiempo(entrada.duracion)}`}
              iconoNombre={Icons["tiempo"].iconName}
            />
          </View>
          {/* ÁNIMO */}
          {animoEmoji && (
            <View className="gap-2">
              <TituloSeccion children={"Estado de ánimo:"}/>
              <Etiqueta texto={`${animoEmoji} ${animoNombre}`}/>
            </View>
          )}
          {/* OBJETIVOS ESPECÍFICOS */}
          {entrada.selected_obj.length > 0 && (
            <View className="gap-2">
              <TituloSeccion>Objetivos específicos trabajados:</TituloSeccion>
              <View className="flex-row flex-wrap gap-2">
                {entrada.selected_obj.map((item) => (
                  <View
                    key={item.id}
                    className="bg-primary rounded-full py-2 px-4"
                    style={{ backgroundColor:
                      item.estado === 1 ? colors.mediumgreen :
                      item.estado === 2 ? colors.mediumyellow :
                      item.estado === 3 ? colors.mediumred :
                      colors.primary
                    }}>
                    <Text className="text-white text-base font-semibold">{item.titulo}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {/* ACTIVIDADES */}
          {entrada.actividades && entrada.actividades.length > 0 && (
            <View className="gap-2">
              <TituloSeccion>Actividades realizadas:</TituloSeccion>
              <View className="flex-row flex-wrap gap-2">
                {entrada.actividades.map((item) => (
                  <View key={item.id} className="bg-primary rounded-full py-2 px-4">
                    <Text className="text-white text-base font-semibold">{item.titulo}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      }
    />
  );
};

//LISTA: ENTRADAS
interface EntradasListaProps {
  entradas: Entrada[];
}
const EntradasLista = ({
  entradas
}: EntradasListaProps) => {
  //VISTA
  return (
    <FlatList
      data={entradas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <EntradaItem entrada={item} />}
      contentContainerStyle={{ paddingBottom: 55 }}
    />
  );
};

//BITÁCORA
export function Bitacora() {

  const { authToken, refreshToken, createApi, setAuthToken } = useAuth();
  const router = useRouter();
  const { paciente, recargar, success } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];

  //ALMACENAMIENTO LOCAL
  const datosAlmacenamiento = `bitacora_${pacienteID}`;
  const fechaAlmacenamiento = `bitacora_${pacienteID}_fecha`;

  //ESTADOS
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState<{ text1: string; text2?: string; type: "success" | "error" } | null>(null);
  const recargarNuevaEntrada = useRef(recargar === "1");

  useEffect(() => {
    fetchEntradas();
  }, [authToken, refreshToken]);

  useEffect(() => {
    if (success) {
      setToast({ text1: "Entrada guardada exitosamente.", type: "success" });
    }
  }, [success]);

  //FETCH: ENTRADAS
  const fetchEntradas = async (forzarRecargar = false) => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const ahora = Date.now();
      const cacheFechaAlmacenamiento = await AsyncStorage.getItem(fechaAlmacenamiento);
      const cacheDatosAlmacenamiento = await AsyncStorage.getItem(datosAlmacenamiento);
      const tiempo = 5 * 60 * 1000;
      if (cacheFechaAlmacenamiento && cacheDatosAlmacenamiento && !recargarNuevaEntrada.current && !forzarRecargar) {
        const cacheFecha = parseInt(cacheFechaAlmacenamiento, 10);
        if (ahora - cacheFecha < tiempo ) {
          console.log("[bitácora] Obteniendo entradas del almacenamiento local...");
          const entradasFechas: Entrada[] = JSON.parse(cacheDatosAlmacenamiento).map((entrada: any) => ({
            ...entrada,
            fecha_creacion: new Date(entrada.fecha_creacion),
          }));
          setEntradas(entradasFechas);
          setIsLoading(false);
          setError(false);
          return;
        }
      }
      //SIN CACHÉ VÁLIDO
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[bitácora] Obteniendo entradas de la base de datos...");
      const res = await api.get("/bitacora/" + pacienteID + "/");
      const entradasFechas: Entrada[] = res.data.map((obs: any) => ({
        ...obs,
        fecha_creacion: new Date(obs.fecha_creacion),
      }));
      setEntradas(entradasFechas);
      setIsLoading(false);
      setError(false);
      await AsyncStorage.setItem(datosAlmacenamiento, JSON.stringify(entradasFechas));
      await AsyncStorage.setItem(fechaAlmacenamiento, ahora.toString());
      if (recargarNuevaEntrada.current) {
        recargarNuevaEntrada.current = false;
      }
    } catch (err) {
      console.log("[bitácora] Error:", err);
      setIsLoading(false);
      setError(true);
    }
  };

  //HANDLE: AGREGAR
  const handleAgregar = () => {
    console.log("[bitácora] Agregando entrada...")
    router.push(`/profesional/${paciente}/bitacora/entrada-agregar`);
  }

  //FILTRO
  const entradasBusqueda = entradas.filter((entrada) => {
    const textoBusqueda = busqueda.toLowerCase();
    const titulo = entrada.titulo?.toLowerCase() ?? "";
    const autor = entrada.autor?.toLowerCase() ?? "";
    const comentarios = entrada.comentarios?.toLowerCase() ?? "";
    const animo = animos.find(a => a.id === entrada.animo)?.nombre.toLowerCase() ?? "";
    const objetivosEspecificos = entrada.selected_obj
      ?.map(objetivo => objetivo.titulo?.toLowerCase() ?? "")
      .join(" ") ?? "";
    const actividades = entrada.actividades
      ?.map(actividad => actividad.titulo?.toLowerCase() ?? "")
      .join(" ") ?? "";
    return (
      titulo.includes(textoBusqueda) ||
      autor.includes(textoBusqueda) ||
      comentarios.includes(textoBusqueda) ||
      animo.includes(textoBusqueda) ||
      objetivosEspecificos.includes(textoBusqueda) ||
      actividades.includes(textoBusqueda)
    );
  });

  //VISTA
  return (
    <View className="flex-1">
      <Titulo
        onPressRecargar={() => fetchEntradas(true)}
        onBusquedaChange={setBusqueda}
      >
        Bitácora
      </Titulo>
      <View className="flex-1">
        {isLoading ? (
          <IndicadorCarga/>
        ) : error ? (
          <MensajeVacio
            mensaje={`Hubo un error al cargar las entradas.\nIntenta nuevamente.`}
            onPressRecargar={() => fetchEntradas(true)}
          />
        ) : entradasBusqueda.length === 0 ? (
          <MensajeVacio
            mensaje={`No se encontraron entradas.\n¡Comienza a registrar el progreso del paciente usando el botón ＋!`}/>
        ) : (
          <EntradasLista entradas={entradasBusqueda}/>
        )}
      </View>
      <BotonAgregar onPress={handleAgregar}/>
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