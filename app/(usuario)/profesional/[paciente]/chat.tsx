import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { Titulo } from "@/components/base/Titulo";
import { colors } from "@/constants/colors";
import { Icons } from "@/constants/icons";
import { useAuth } from "@/context/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { usePathname } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, InteractionManager, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import "react-native-get-random-values"; //Tambien para generar ids aleatoreas
import { v4 as uuidv4 } from "uuid"; //Para generar ids-aleatoreos sin colisión
import { ModalTutorial, Tutoriales } from "@/components/vistas/Tutoriales";

const WS_BASE_URL = Constants.expoConfig?.extra?.wsBaseUrl;
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

export default function Chat() {

  const {user, authToken, refreshToken, setAuthToken, createApi} = useAuth();
  const pathname = usePathname(); 
  const plan_id = pathname.split("/")[2].split("-")[0];
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];

  //ESTADOS
  const [texto, setTexto] = useState("");
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [inputHeight, setInputHeight] = useState(40); // altura inicial mínima
  const [fechaUltimaLectura, setFechaUltimaLectura] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const itemRefs = useRef<Record<string, View>>({});
  const [isAtBottom, setIsAtBottom] = useState(false);
  const wsRef = useRef<WebSocket | null>(null); //Web socket
  const [connected, setConnected] = useState(false); //Web socket
  const manuallyClosed = useRef(false) //Web socket: flag para saber si el web socket se cerró manualmente
  const [fechaAperturaChat] = useState(new Date()) //Se inicializa una unica vez
  const anchoringRef = useRef(false);
  const hasAnchoredRef = useRef(false);
  const [forceAnchor, setForceAnchor] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    fetchTutoriales();
  },[authToken, refreshToken]);

  //FETCH: TUTORIAL
  const fetchTutoriales = async () => {
    const tutorialesAlmacenamiento = `tutoriales_${user?.id}`;
    if (!authToken || !refreshToken) return;
    try {
      //FETCH: TUTORIAL
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[chat] Obteniendo tutoriales en almacenamiento local...");
      const tutorialesAlmacenamientoLocal = await AsyncStorage.getItem(tutorialesAlmacenamiento);
      let tutorialesAlmacenamientoDatos: Tutoriales;
      if (tutorialesAlmacenamientoLocal) {
        tutorialesAlmacenamientoDatos = JSON.parse(tutorialesAlmacenamientoLocal) as Tutoriales;
      } else {
        console.log("[chat] No se encontraron tutoriales en el almacenamiento local...");
        console.log("[chat] Obteniendo tutoriales de la base de datos...");
        const res = await api.get("/tutoriales/");
        tutorialesAlmacenamientoDatos = res.data;
        await AsyncStorage.setItem(tutorialesAlmacenamiento, JSON.stringify(tutorialesAlmacenamientoDatos));
      }
      //HANDLE: TUTORIAL
      if (!tutorialesAlmacenamientoDatos.tutorial_chat) {
        console.log("[chat] Tutorial no visto...");
        console.log("[chat] Activando tutorial...");
        setShowTutorial(true);
        console.log("[chat] Actualizando tutorial en la base de datos...");
        await api.patch("/tutoriales/", { tutorial_chat: true });
        tutorialesAlmacenamientoDatos = { ...tutorialesAlmacenamientoDatos, tutorial_chat: true };
        console.log("[chat] Actualizando tutorial en almacenamiento local...");
        await AsyncStorage.setItem(tutorialesAlmacenamiento, JSON.stringify(tutorialesAlmacenamientoDatos));
      }
      else {
        console.log("[chat] Tutorial visto...");
      }
      setError(false);
    } catch (err) {
      console.log("[chat] Error:", err);
      setError(true);
    }
  };

  //--------- Función para conectar al WS --------------
  const connectWS = () => {

    //Verificamos que no haya una conexión antes
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("[chat] Ya existe conexión WebSocket activa, no se puede reconectar");
      return;
    }

    //creamos un web socket para recibir nuevos mensajes
    manuallyClosed.current = false;
    const socketUrl = WS_BASE_URL + `/chat/${plan_id}/?token=${authToken}`;
    const ws = new WebSocket(socketUrl);

    //----------------------------
    //  Eventos del web socket
    //----------------------------

    //Inicio de conexión 
    ws.onopen = () => {
      setConnected(true);
    };
    
    //Recepción de mensajes desde el backend al frontend
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);    
      
      //Si el backend nos da error de mensaje (sólo se nos envía a nosotros por lo que no es necesario verificar que sea nuestro)
      if (data.error && data.tempId) { //Se verifica tempId pq mensajes de auth por ejemplo no enviarian temId
        setMensajes(prev =>
          prev.map(msg =>
            msg.id === data.tempId ? { ...msg, status: "error" } : msg
          )
        );
        return;
      }

      //Ahora si es que no hay error y el mensaje es nuestro
      if(data.tempId && data.user === user?.email){
        setMensajes(prev =>
          prev.map(msg =>
            msg.id === data.tempId
              ? {
                  ...msg,
                  status: "sent",
                  fecha: data.timestamp ? new Date(data.timestamp) : msg.fecha,
                }
              : msg
          )
        );
        return;  
      }


      //Mensaje de otro usuairo
      setMensajes( (prev) => [
        ...prev, //Prev son los mensajes que ya existian
        {
          id: uuidv4(), //Se genera un id para identificarlo (pero creo que no se ocupa) 
          nombre: data.nombre,
          mensaje: data.message,
          propio: data.user === user?.email,
          fecha: data.timestamp ? new Date(data.timestamp) : new Date(), //Si el mensaje viene con timestamp null
          status: "sent",
          deleted: false
        },
      ]);
    };

    //Error en el web socket
    ws.onerror = (err) => {

      setConnected(false);
      //Actualizamos todos los mensajes propios en pending a error
      setMensajes(prev =>
        prev.map(msg =>
          msg.propio && msg.status === "pending"
            ? { ...msg, status: "error" }
            : msg
        )
      );

    };   

    //Fin de conexión con el servidor
    ws.onclose = () => {
      setConnected(false); 

      //Actualizamos todos los mensajes propios en pending a error
      setMensajes(prev =>
        prev.map(msg =>
          msg.propio && msg.status === "pending"
            ? { ...msg, status: "error" }
            : msg
        )
      );

      if (!manuallyClosed.current){
        console.log("[chat] Reintentando conexión al socket");
        setTimeout(connectWS, 10000); //Intento de reconexión cada 10 segundos 
      }

    };

    //Asignamos el ws al que acabamos de crear
    wsRef.current = ws;
  };

  //FETCH: MENSAJES
  //Función para obtener mensajes antiguos y la ultima lectura
  const fetchData  = async () => {
    setIsLoading(true);
    try {
    
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[chat] Obteniendo mensajes antiguos de base de datos...");
      const res = await api.get(`${API_BASE_URL}/chat/${plan_id}/mensajes/`);
    
      //Configuramos los mensajes para que luego se rendericen como estaba planeado en el frontend
      const oldMessages = res.data.map((msg: any) => ({
        id: msg.id,
        nombre: msg.usuario_autor,
        mensaje: msg.text,
        propio: msg.user === user?.email,
        fecha: msg.timestamp ? new Date(msg.timestamp) : new Date(), //En caso que timestamp sea null
      }));
      

      //Seteamos los mensajes que ya estaban
      setMensajes(oldMessages);
      console.log("[chat] Mensajes obtenidos...") ;

      //Ahora pedimos la ultima lectura
      console.log("[chat] Obteniendo última lectura...");
      const lecturaRes = await api.get(`${API_BASE_URL}/chat/${plan_id}/ultima-lectura/`);
      //Asignamos variable
      if (lecturaRes.data.ultima_lectura) {
          setFechaUltimaLectura(new Date(lecturaRes.data.ultima_lectura));
      }
      console.log("[chat] Última lectura obtenida");

      setError(false);
      setIsLoading(false);
      setForceAnchor(true);

    } catch (err){
      console.log("[chat] Error pidiendo información a la base de datos", err);
      setError(true);
      setIsLoading(false);
    }
    
  }

  //Función para pedir mensajes antiguos y conectamos web socket
  const init = async () => {
    await fetchData();
    connectWS();
  }

  // ------ Nos conectaos al websocket al entrar a la vista
  useEffect(() => {
    if(!plan_id) return //Si la ruta está mala (no tiene plan id)
    init();
    

    //El return corresponde a lo que pasa cuando salimos de la vista (?
    return () => {

      //Como nos salimos de la vista nosotros cerramos manualmente el websocket
      manuallyClosed.current = true;

      //Al salir de la vista actualizamos la fecha de última lectura
      const updateLectura = async () => {
        try {
          const api = createApi(authToken, refreshToken, setAuthToken);

          // Obtener último mensaje leído
          const ultimoLeido = mensajes
          .filter(msg => !msg.deleted && msg.status !== "pending")
          .slice(-1)[0];

          const ultimaLecturaBackend = ultimoLeido
          ? ultimoLeido.fecha.toISOString()
          : new Date().toISOString();

          await api.patch(`${API_BASE_URL}/chat/${plan_id}/ultima-lectura/`, {
            ultima_lectura: ultimaLecturaBackend
          });

          console.log("[chat] Última lectura actualizada");

        } catch (err) {
          console.log("[chat] Error actualizando última lectura", err);
        }
      };
      updateLectura();

      //Cerramos web socket 
      wsRef.current?.close();
    };


  }, [plan_id, authToken]);


// -------- Función pare enviar mensaje ---------------
const enviarMensaje = (textoMensajeArg?: string) => {

  //Falta intentar conectarse si es que está cerrado el websocket aqui al principio.

  const textoMensaje = textoMensajeArg ?? texto; //Esto es para ver si se llama desde reintentar o se esta enviando mensaje 

  if (!textoMensaje.trim()) return; //Si no hay mensaje 

  const nuevoMensaje = {
    id: uuidv4(), // ID temporal para la sesión y luego buscar el mensaje
    nombre: user?.nombre,
    planid: plan_id,
    mensaje: textoMensaje,
    propio: true,
    fecha: new Date(), 
    status: "pending", //Asignamos estado del mensaje (de ahi colapsa a "pending" o "error").
    deleted: false,
  };
  
  //Agregamos el mensaje de forma optimista
  setMensajes(prev => [...prev, nuevoMensaje]);
  setTexto(""); // Limpiamos input después de guardar el valor

  //Verificamos si el WebSocket está abierto antes de enviar
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify({
      planid: plan_id,
      nombre: user?.nombre,
      message: textoMensaje, 
      tempId: nuevoMensaje.id, 
      date: nuevoMensaje.fecha.toISOString()
    }));
    console.log("[chat] Mensaje enviado...");

  //Si el web socket no está abierto entonces no enviamos el mensaje
  } else {
    setMensajes(prev =>
      prev.map(msg =>
        msg.id === nuevoMensaje.id ? { ...msg, status: "error" } : msg
      )
    );
  }
};

// -------- Función para reenviar mensaje ---------------
const reenviarMensaje = (textoMensaje: string, id: any, fecha: Date) => {
  
  //Si el websocket está cerrado entonces intentamos conectarnos, si no nos deja entonces return
  if(!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
    connectWS();

    if(!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
  }


  //Si es que no está cerrado intentamos enviar el mensaje por el websocket sin agregarlo de manera optimista porque ya se envió
  wsRef.current.send(JSON.stringify({
    planid: plan_id,
    nombre: user?.nombre,
    message: textoMensaje,
    tempId: id,
    date: fecha.toISOString()
  }))

}

const formatearFecha = (fecha: Date) => {
  const opciones: Intl.DateTimeFormatOptions = { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  };
  return fecha.toLocaleDateString("es-CL", opciones);
};

  // Obtener solo fecha sin hora para comparar días
  //const getFechaDia = (fecha: any) => fecha.toISOString().split("T")[0];
  const getFechaDia = (fecha: Date) => {
    const soloFecha = new Date(fecha);
    soloFecha.setHours(0, 0, 0, 0); // resetea la hora a 00:00:00.000
    return soloFecha;
  };


  // Construir array con separadores por día y separador "nuevos mensajes"
  const mensajesConSeparadores = useMemo(() => {
    let resultado = [];
    let diaAnterior = null;
    let separadorNuevosInsertado = false;

    // No es necesario ordenarlos porque vienen ordenados desde el backennd
    const mensajesOrdenados = mensajes//.slice().sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    for (const msg of mensajesOrdenados) {
      const diaMsg = getFechaDia(msg.fecha);
      // Insertar separador de nuevos mensajes solo si:
      // - msg.fecha > fechaUltimaLectura (no se había leído aún)
      // - msg.fecha < fechaAperturaChat (llegó antes de abrir el chat)
      // - separador aún no insertado
      if (
        !separadorNuevosInsertado &&
        msg.fecha > fechaUltimaLectura && //Compara dos tipos de datos Date
        msg.fecha < fechaAperturaChat
      ) {
        resultado.push({
          id: "separador-nuevos",
          tipo: "nuevo-separador",
        });
        separadorNuevosInsertado = true;
      }

      // Insertar separador de fecha si cambia el día
      if (!diaAnterior || diaMsg.getTime() !== diaAnterior.getTime())  {
        resultado.push({
          id: `separador-fecha-${diaMsg}`,
          tipo: "separador-fecha",
          fecha: msg.fecha,
        });
        diaAnterior = diaMsg;
      }

      resultado.push({
        ...msg,
        tipo: "mensaje",
      });
    }


    return resultado;

  }, [mensajes, fechaUltimaLectura, fechaAperturaChat]);


  const handleCancelarEnvio = (id: any) => {
    setMensajes((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, deleted: true } : msg
      )
    );
  };

  //Una vez los mensajes están renderizados
  //Se hace scroll al último mensaje leído
  useEffect(() => {
    // No hacer nada si aún no hay mensajes o fecha de última lectura
    if (!mensajesConSeparadores.length || !fechaUltimaLectura || hasAnchoredRef.current) return;

    const ultimoLeidoIndex = mensajesConSeparadores
      .map((item, i) => (item.tipo === "mensaje" && item.fecha <= fechaUltimaLectura ? i : -1))
      .filter(i => i !== -1)
      .pop();

    if (ultimoLeidoIndex === undefined || ultimoLeidoIndex === -1 || !flatListRef.current) return;

    anchoringRef.current = true;

    // Espera a que React termine interacciones y luego un pequeño timeout
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: ultimoLeidoIndex, animated: true });
        hasAnchoredRef.current = true;
        requestAnimationFrame(() => { anchoringRef.current = false; });
        setForceAnchor(false); // Resetear flag después del scroll
      }, 100); // 50ms extra para asegurar que FlatList midió todos los items
    });
  }, [mensajesConSeparadores, fechaUltimaLectura]);


  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20; // margen para considerar “al final”
    setIsAtBottom(
      contentOffset.y + layoutMeasurement.height >= contentSize.height - paddingToBottom
    );
  };

  const onScrollToIndexFailed = (info) => {
    // Espera a que mida más ítems y reintenta con un cálculo aproximado
    const wait = new Promise(res => setTimeout(res, 500));
    wait.then(() => {
      flatListRef.current?.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: true,
      });
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
      }, 100);
    });
  };


  // --------------------------
  //    Render de la vista 
  // --------------------------
  return (
    
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={110}
    >

        <Titulo onPressRecargar={() => fetchData()}>
          Chat
        </Titulo>
    
        <View className="flex-1"
          style={{
            borderTopWidth: 0.5,
            borderTopColor: colors.mediumgrey,
          }}
        >

        {isLoading ? (
          <IndicadorCarga/>
        ) : error ? (
          <MensajeVacio
            mensaje={`Hubo un error al cargar los mensajes.\nIntenta nuevamente.`}
            onPressRecargar={fetchData}
          />
        ) : mensajesConSeparadores.length === 0 ? (
          <MensajeVacio
            mensaje={`Tu bandeja de chat está vacía.\n¡Empieza la conversación mandando un mensaje!`}
          />
        ) : (

            <FlatList
              ref={flatListRef}
              data={mensajesConSeparadores}
              keyExtractor={(item) => item.id.toString()}
              onScroll={handleScroll}
              onScrollToIndexFailed={onScrollToIndexFailed}
              onContentSizeChange={() => {
                // Solo auto-scroll si estoy abajo y ya se hizo el anclaje inicial
                if (
                  isAtBottom &&
                  hasAnchoredRef.current &&   // ya se hizo scroll inicial
                  !anchoringRef.current       // no estoy en medio de un scroll manual
                ) {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }
              }}

              renderItem={({ item }) => {
                
                if (item.tipo === "nuevo-separador") {
                  return (
                    <View className="flex-row items-center my-2">
                      <View className="flex-1 h-px bg-secondary" />
                      <View className="bg-secondary rounded-full px-4 py-1 items-center">
                        <Text className="text-white text-base">Nuevos mensajes</Text>
                      </View>
                      <View className="flex-1 h-px bg-secondary" />
                    </View>
                  );
                }

                if (item.tipo === "separador-fecha") {
                  return (
                    <View className="bg-mediumdarkgrey rounded-full px-4 py-1 my-2 items-center self-center">
                      <Text className="text-white text-base">{formatearFecha(item.fecha)}</Text>
                    </View>
                  );
                }

                if (item.deleted) return null; // no renderizar mensajes borrados

                // Mensajes normales
                return (
                  <View
                    ref={(ref) => {
                      if (ref && item.tipo === "mensaje") {
                        itemRefs.current[item.id] = ref;
                      }
                    }}
                    className="p-2 max-w-[80%]"
                    style={{ alignSelf: item.propio ? "flex-end" : "flex-start" }}
                  >
                    <Text className="text-black text-base font-semibold">{item.nombre}</Text>

                    <View
                      className="p-2 rounded-lg flex-row items-center"
                      style={{
                        backgroundColor:
                          item.status === "error"
                            ? colors.lightred
                            : item.propio
                            ? colors.lightblue
                            : colors.lightpurple,
                      }}
                    >
                      <Text
                        className={`text-base px-1 ${
                          item.status === "error" ? "text-red-600 font-semibold" : "text-black"
                        }`}
                      >
                        {item.mensaje}
                      </Text>

                      {item.status === "error" && (
                        <Pressable
                          onPress={() => {
                            Alert.alert(
                              "Mensaje no enviado",
                              "¿Qué quieres hacer con este mensaje?",
                              [
                                { text: "Reenviar", onPress: () => reenviarMensaje(item.mensaje, item.id, item.fecha) },
                                { text: "Borrar", style: "destructive", onPress: () => handleCancelarEnvio(item.id) },
                                { text: "Salir", style: "cancel" },
                              ]
                            );
                          }}
                        >
                          {({ pressed }) => (
                            <View>
                              <Ionicons name={"warning"} size={24} color={pressed ? colors.mediumlightgrey : "#dc2626"}/>
                            </View>
                          )}
                        </Pressable>
                      )}
                    </View>

                    <Text className="text-black text-xs text-right">
                      {item.fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                );
              }}

            />

          )}

          <View
            className="bg-light pb-4 pt-2 flex-row items-end"
            style={{
              borderTopWidth: 0.5,
              borderTopColor: colors.mediumgrey
            }}
          >
            <TextInput
              className="bg-lightgrey text-black rounded-lg p-2 flex-1"
              style={{
                minHeight: 40,
                maxHeight: 200,
                height: inputHeight,
                textAlignVertical: "top",
                color: colors.black,
              }}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={colors.mediumdarkgrey}
              value={texto}
              onChangeText={setTexto}
              multiline
              maxLength={500}
              onContentSizeChange={(e) => setInputHeight(Math.max(40, e.nativeEvent.contentSize.height))}
            />

            <Pressable
              className="ml-2 justify-center items-center"
              onPress={() => enviarMensaje()} // Lambda pq no tiene argumentos algo asi dijo chatgpt :)
            >
              {({ pressed }) => (
                <View
                  className="rounded-full p-2"
                  style={{ backgroundColor: pressed ? colors.mediumlightgrey : colors.secondary }}
                >
                  <Ionicons name={Icons["enviar"].iconName} size={24} color={"white"}/>
                </View>
              )}
            </Pressable>
          </View>

        </View>
      {/* TUTORIAL */}
      <ModalTutorial
        tipo={"tutorial"}
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
        chat={true}
        rol={rol}
      />
    </KeyboardAvoidingView>
  );
}


/*
Que quiero hacer para lo de los mensajes:
* SetMesajes de forma optimista en EnviarMensajes() con estado 'pending'
* En ws.onclose -> recorrer los mensajes y marcar los on pending con 'error'
* En ws.onerror -> recorrer los mensajes y marcar los on pending con 'error'
* En ws.onmessage -> si tiene 'error' en el msj buscar ese mensaje y marcarlo con 'error'

*/
