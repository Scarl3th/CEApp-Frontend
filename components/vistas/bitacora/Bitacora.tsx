import { FlatList, Text, View } from "react-native";
import React, { useEffect, useRef, useState  } from "react";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/auth";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";
import { CustomModal } from "@/components/base/Modal";
import { Etiqueta } from "@/components/base/Etiqueta";
import { CustomToast } from "@/components/base/Toast";
import { BotonAgregar, BotonEliminar } from "@/components/base/Boton";
import { TextoBloque } from "@/components/base/TextoBloque";
import { TarjetaExpandible } from "@/components/base/Tarjeta";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { Titulo, TituloSeccion } from "@/components/base/Titulo";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { ModalTutorial, Tutoriales } from "@/components/vistas/Tutoriales";
import { formatearFechaString, formatearTiempo } from "@/components/base/FormatearFecha";
import { FormularioCampo, FormularioCampoSelect, FormularioCampoMultiSelect } from "@/components/base/Entrada";

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
export const EntradaItem = ({
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

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const isProfesional = user?.role === "profesional";
  const router = useRouter();
  const { paciente, recargar, success } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];

  //ALMACENAMIENTO LOCAL
  const datosAlmacenamiento = `bitacora_${pacienteID}`;
  const fechaAlmacenamiento = `bitacora_${pacienteID}_fecha`;

  //ESTADOS
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [objetivosEspecificos, setObjetivosEspecificos] = useState([]);
  const [objetivosGenerales, setObjetivosGenerales] = useState<ObjetivoGeneral[]>([]);
  const [equipo, setEquipo] = useState<Profesional[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("1");
  const [sprofesionales, setSProfesionales] = useState([]);
  const [sanimos, setSAnimos] = useState([]);
  const [maxDuracion, setMaxDuracion] = useState("");
  const [sObjetivosEspecificos, setSObjetivosEspecificos] = useState([]);
  const [sObjetivosGenerales, setSObjetivosGenerales] = useState([]);
  const [toast, setToast] = useState<{ text1: string; text2?: string; type: "success" | "error" } | null>(null);
  const [showModalFiltro, setShowModalFiltro] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const recargarNuevaEntrada = useRef(recargar === "1");

  useEffect(() => {
    fetchTutoriales();
    fetchEntradas();
    fetchObjetivosGenerales();
    fetchEquipo();
    fetchObjetivosEspecificos();
  }, [authToken, refreshToken]);

  useEffect(() => {
    if (success) {
      setToast({ text1: "Entrada guardada exitosamente.", type: "success" });
    }
  }, [success]);

  useEffect(() => {
    if(maxDuracion === "none"){
      setMaxDuracion("");
    }
  }),[maxDuracion];

  //FETCH: TUTORIAL
  const fetchTutoriales = async () => {
    const tutorialesAlmacenamiento = `tutoriales_${user?.id}`;
    if (!authToken || !refreshToken) return;
    try {
      //FETCH: TUTORIAL
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[bitácora] Obteniendo tutoriales en almacenamiento local...");
      const tutorialesAlmacenamientoLocal = await AsyncStorage.getItem(tutorialesAlmacenamiento);
      let tutorialesAlmacenamientoDatos: Tutoriales;
      if (tutorialesAlmacenamientoLocal) {
        tutorialesAlmacenamientoDatos = JSON.parse(tutorialesAlmacenamientoLocal) as Tutoriales;
      } else {
        console.log("[bitacora] No se encontraron tutoriales en el almacenamiento local...");
        console.log("[bitácora] Obteniendo tutoriales de la base de datos...");
        const res = await api.get("/tutoriales/");
        tutorialesAlmacenamientoDatos = res.data;
        await AsyncStorage.setItem(tutorialesAlmacenamiento, JSON.stringify(tutorialesAlmacenamientoDatos));
      }
      //HANDLE: TUTORIAL
      if (!tutorialesAlmacenamientoDatos.tutorial_bitacora) {
        console.log("[bitácora] Tutorial no visto...");
        console.log("[bitácora] Activando tutorial...");
        setShowTutorial(true);
        console.log("[bitácora] Actualizando tutorial en la base de datos...");
        await api.patch("/tutoriales/", { tutorial_bitacora: true });
        tutorialesAlmacenamientoDatos = { ...tutorialesAlmacenamientoDatos, tutorial_bitacora: true };
        console.log("[bitácora] Actualizando tutorial en almacenamiento local...");
        await AsyncStorage.setItem(tutorialesAlmacenamiento, JSON.stringify(tutorialesAlmacenamientoDatos));
      }
      else {
        console.log("[bitácora] Tutorial visto...");
      }
      setError(false);
    } catch (err) {
      console.log("[bitácora] Error:", err);
      setError(true);
    }
  };

  //FETCH: ENTRADAS
  const fetchEntradas = async (forzarRecargar = false) => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);

    const api = createApi(authToken, refreshToken, setAuthToken);

    //Creamos un log de que se accedió a la información de las bitácoras si el usuario es un profecional
    if (user?.role === "profesional") {
      try {
        const payload = 
        {
          "elemento": "bitacora",
          "accion": "acceder",
        }

        await api.post(`/logs/${pacienteID}/`, payload);
        console.log("[LOGs] Log de acceso a la bitácora creado");
      } catch (err) {
        console.error("[LOGs] Error creando log de acceso a la bitácora");
      }
    }
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
      console.log(entradasFechas);
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

  //OBJETIVO GENERAL
  interface ObjetivoGeneral {
    id: string;
    titulo: string;
    descripcion: string;
    categoria: string;
    color: string;
    autor_creacion: string;
    fecha_creacion: Date;
    autor_modificacion?: string;
    fecha_modificacion?: Date;
    clasificacion: 0 | 1 | 2;
  }
  const clasificacionMap: Record<number, string> = {
    0: "En construcción",
    1: "En progreso",
    2: "Completado",
  };

  //ALMACENAMIENTO LOCAL
  const datosObjetivosGeneralesAlmacenamiento = `plan_objetivos_general_${pacienteID}`;
  const fechaObjetivosGeneralesAlmacenamiento = `plan_objetivos_general_${pacienteID}_fecha`;
  const recargarObjetivosGenerales = useRef(recargar === "1");

  //FETCH: OBJETIVOS GENERALES
  const fetchObjetivosGenerales = async (recargarForzar = false) => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const ahora = Date.now();
      const cachefechaObjetivosGeneralesAlmacenamiento = await AsyncStorage.getItem(fechaObjetivosGeneralesAlmacenamiento);
      const cachedatosObjetivosGeneralesAlmacenamiento = await AsyncStorage.getItem(datosObjetivosGeneralesAlmacenamiento);
      const tiempo = 5 * 60 * 1000;
      if (cachefechaObjetivosGeneralesAlmacenamiento && cachedatosObjetivosGeneralesAlmacenamiento && !recargarObjetivosGenerales.current && !recargarForzar) {
        const cacheFecha = parseInt(cachefechaObjetivosGeneralesAlmacenamiento, 10);
        if (ahora - cacheFecha < tiempo ) {
          console.log("[bitácora] Obteniendo objetivos generales del almacenamiento local...");
          const objetivosGeneralesFechas: ObjetivoGeneral[] = JSON.parse(cachedatosObjetivosGeneralesAlmacenamiento).map((og: any) => ({
            ...og,
            fecha_creacion: new Date(og.fecha_creacion),
            fecha_modificacion: og.fecha_modificacion ? new Date(og.fecha_modificacion) : null,
          }));
          setObjetivosGenerales(objetivosGeneralesFechas);
          setIsLoading(false);
          setError(false);
          return;
        }
      }
      //SIN CACHÉ VÁLIDO
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[bitácora] Obteniendo objetivos generales de la base de datos...");
      const res = await api.get("/objetivos/" + pacienteID + "/");
      const objetivosGeneralesFechas: ObjetivoGeneral[] = res.data.map((og: any) => ({
        ...og,
        fecha_creacion: new Date(og.fecha_creacion),
        fecha_modificacion: og.fecha_modificacion ? new Date(og.fecha_modificacion) : null,
      }));
      setObjetivosGenerales(objetivosGeneralesFechas);
      setIsLoading(false);
      setError(false);
      await AsyncStorage.setItem(datosObjetivosGeneralesAlmacenamiento, JSON.stringify(res.data));
      await AsyncStorage.setItem(fechaObjetivosGeneralesAlmacenamiento, ahora.toString());
      if (recargarObjetivosGenerales.current) {
        recargarObjetivosGenerales.current = false;
      }
    } catch (err) {
      console.log("[plan] Error:", err);
      setIsLoading(false);
      setError(true);
    };
  };

  //PROFESIONAL
  interface Profesional {
    id: string;
    nombre: string;
    cargo: string;
    institucion: string;
    correo: string;
  }

  //FETCH: EQUIPO
  const fetchEquipo = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    console.log("[bitácora] Obteniendo equipo de la base de datos...");
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.get(`plan-trabajo/${pacienteID}/profesionales`);
      console.log("[bitácora] Respuesta:", res.data);
      setEquipo(res.data);
      //console.log(res.data);
      setIsLoading(false);
      setError(false);
    } catch (err) {
      console.log("[bitácora] Error:", err);
      setIsLoading(false);
      setError(true);
    }
  }

  const equipoFormateado = equipo.map(u => ({
    id: u.id.toString(),       // siempre mejor string si vas a usarlo como selectId
    titulo: u.nombre.trim(),   // quitamos espacios extra
    color: colors.primary,     // color igual para todos
  }));

  //FETCH: OBJETIVOS ESPECÍFICOS
  const fetchObjetivosEspecificos = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    console.log("[bitácora] Obteniendo objetivos específicos de la base de datos...");
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.get(`bitacora/${pacienteID}/especificos/`);
      console.log("[bitácora] Respuesta:", res.data);
      setObjetivosEspecificos(res.data);
      console.log(res.data);
      setIsLoading(false);
      setError(false);
    } catch (err) {
      console.log("[bitácora] Error:", err);
      setIsLoading(false);
      setError(true);
    }
  }



  //HANDLE: AGREGAR
  const handleAgregar = () => {
    console.log("[bitácora] Agregando entrada...")
    router.push(`/profesional/${paciente}/bitacora/entrada-agregar`);
  }

  //FILTRO
  const entradasFiltradas = entradas.filter((entrada) => {

    //Búsqueda
    let bus;
    if(busqueda.length){
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
      bus = titulo.includes(textoBusqueda) ||
                  autor.includes(textoBusqueda) ||
                  comentarios.includes(textoBusqueda) ||
                  animo.includes(textoBusqueda) ||
                  objetivosEspecificos.includes(textoBusqueda) ||
                  actividades.includes(textoBusqueda)
    } else { bus = true; }

    //Profesional
    let pro;
    if(sprofesionales.length){
      pro = sprofesionales.includes(String(entrada.id_autor));
    } else { pro = true; }

    //Ánimo
    let ani;
    if(sanimos.length){
      ani = sanimos.includes(entrada.animo);
    } else { ani = true; }

    //Duración
    let dur;
    if(maxDuracion){
      if(maxDuracion === "1hr"){
        dur = (entrada.duracion <= 60);
      }
      else if(maxDuracion === "2hrs"){
        dur = (entrada.duracion <= 120);
      }
      else{
        dur = (entrada.duracion > 120);
      }
    } else { dur = true; }

    //Objetivos Específicos
    let oes;
    if(sObjetivosEspecificos.length){
      oes = entrada.selected_obj.some((obj: any) =>
        sObjetivosEspecificos.includes(obj.id)
      );
    } else { oes = true; }

    //Objetivos Generales
    let ogs;
    if(sObjetivosGenerales.length){
      ogs = entrada.objetivos_generales.some((obj: any) =>
        sObjetivosGenerales.includes(obj.id)
      );
    } else { ogs = true; }

    return (
      bus && pro && ani && dur && oes && ogs
    );
   
  });

  const entradasOrdenadas = [...entradasFiltradas].sort((a, b) => {
    switch (orden) {
      case "1":
        // Fecha ascendente
        return new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime();
      case "2":
        // Fecha descendente
        return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime();
      case "3":
        // Título ascendente
        return a.titulo.localeCompare(b.titulo);
      case "4":
        // Título descendente
        return b.titulo.localeCompare(a.titulo);
      default:
        return 0;
    }
  });

  //VISTA
  return (
    <View className="flex-1">
      {/* TÍTULO */}
      <Titulo
        onPressRecargar={() => fetchEntradas(true)}
        onPressFiltro={() => setShowModalFiltro(true)}
      >
        Bitácora
      </Titulo>
      {/* CUERPO */}
      <View className="flex-1">
        {isLoading ? (
          <IndicadorCarga/>
        ) : error ? (
          <MensajeVacio
            mensaje={`Hubo un error al cargar las entradas.\nIntenta nuevamente.`}
            onPressRecargar={() => fetchEntradas(true)}
          />
        ) : entradasOrdenadas.length === 0 ? (
          <MensajeVacio
            mensaje={`No se encontraron entradas.\n¡Comienza a registrar el progreso del paciente usando el botón ＋!`}/>
        ) : (
          <EntradasLista entradas={entradasOrdenadas}/>
        )}
      </View>
      {/* MODAL: FITLRO */}
      <CustomModal
        tipo={"expandible"}
        visible={showModalFiltro}
        onClose={() => setShowModalFiltro(false)}
      >
        <View className="flex-1 p-2 gap-4 justify-center">

          <Text className="text-primary text-xl font-bold">
            Ordenamiento
          </Text>
          <FormularioCampoSelect
            label="Ordenar por"
            placeholder="Seleccione una opción"
            items={[
              {id: "1", titulo: "Fecha de creación (Mayor a menor)", color: colors.primary},
              {id: "2", titulo: "Fecha de creación (Menor a mayor)", color: colors.primary},
              {id: "3", titulo: "Alfabéticamente (A a la Z)", color: colors.primary},
              {id: "4", titulo: "Alfabéticamente (Z a la A)", color: colors.primary}
            ]}
            selectedId={orden}
            onChange={setOrden}
          />
          
          <View className="flex-row items-center justify-between">
            <Text className="text-primary text-xl font-bold flex-1">
              Filtros
            </Text>
            <BotonEliminar texto="Quitar filtros" tipo={"horizontal"} onPress={()=>{
              setMaxDuracion("");
              setBusqueda("");
              setSAnimos([]);
              setSObjetivosEspecificos([]);
              setSObjetivosGenerales([]);
              setSProfesionales([]);
            }}/>
          </View>
          
          <FormularioCampo
            label="Por texto"
            placeholder="Ingresa texto para buscar"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <FormularioCampoMultiSelect
            label="Por profesional"
            items={equipoFormateado}
            selected={sprofesionales}
            onChange={setSProfesionales}
            placeholder="Selecciona profesionales"
            placeholderSelected="Profesionales"
          />
          <FormularioCampoMultiSelect
            label="Por estado de ánimo"
            items={[
              { id: "Feliz", titulo: "😊 Feliz" },
              { id: "Triste", titulo: "😢 Triste" },
              { id: "Molesto", titulo: "😡 Molesto" },
              { id: "Entusiasmado", titulo: "🤩 Entusiasmado" },
              { id: "Sorprendido", titulo: "😮 Sorprendido" },
              { id: "Confundido", titulo: "😕 Confundido" },
              { id: "Cansado", titulo: "🥱 Cansado" },
              { id: "Neutral", titulo: "😐 Neutral" },
            ]}
            selected={sanimos}
            onChange={setSAnimos}
            placeholder="Selecciona estados de ánimo"
            placeholderSelected="Estados de ánimo"
          />
          <FormularioCampoSelect
            label="Por duración máxima"
            placeholder="Seleccione una opción"
            items={[
              {id: "1hr", titulo: "Hasta 1 hora", color: colors.primary},
              {id: "2hrs", titulo: "Hasta 2 horas", color: colors.primary},
              {id: "+2hrs", titulo: "Más de 2 horas", color: colors.primary},
              {id: "none", titulo: "Sin límite", color: colors.white}
            ]}
            selectedId={maxDuracion}
            onChange={setMaxDuracion}
          />
          <FormularioCampoMultiSelect
            label="Por objetivo general"
            items={objetivosGenerales}
            selected={sObjetivosGenerales}
            onChange={setSObjetivosGenerales}
            placeholder="Selecciona objetivos generales"
            placeholderSelected="Objetivos generales"
          />
          <FormularioCampoMultiSelect
            label="Por objetivo específico"
            items={objetivosEspecificos}
            selected={sObjetivosEspecificos}
            onChange={setSObjetivosEspecificos}
            placeholder="Selecciona objetivos específicos"
            placeholderSelected="Objetivos específicos"
          />
          
          
        </View>
      </CustomModal>
      {/* TUTORIAL */}
      <ModalTutorial
        tipo={"tutorial"}
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
        bitacora={true}
        rol={rol}
      />
      {/* BOTÓN FLOTANTE */}
      {isProfesional ? <BotonAgregar onPress={handleAgregar}/> : null}
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