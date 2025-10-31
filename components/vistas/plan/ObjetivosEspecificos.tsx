import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, ScrollView, View } from "react-native";
import { useAuth } from "@/context/auth";
import { Icons } from "@/constants/icons";
import { colors } from "@/constants/colors";
import { Badge } from "@/components/base/Badge";
import { CustomToast } from "@/components/base/Toast";
import { CustomModal } from "@/components/base/Modal";
import { TextoBloque } from "@/components/base/TextoBloque";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { Titulo, TituloSeccion } from "@/components/base/Titulo";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { formatearFechaString } from "@/components/base/FormatearFecha";
import { TarjetaExpandible, TarjetaPequeña } from "@/components/base/Tarjeta";
import { ObjetivoEspecificoFormularioModal } from "./ObjetivoEspecificoFormulario";
import { BotonAgregar, BotonDetalles, BotonDesvincular, BotonEditar, BotonEliminar, BotonVincular, BotonTab } from "@/components/base/Boton";
import { useLocalSearchParams } from "expo-router";

//OBJETIVO ESPECÍFICO
interface Profesional {
  id: string;
  nombre: string;
}
interface ObjetivoEspecifico {
  id: string;
  titulo: string;
  estado: 1 | 2 | 3; //1: Logrado; 2: Medianamente logrado; 3: No logrado
  descripcion?: string;
  vinculado?: boolean;
  autor_creacion: string;
  fecha_creacion: Date;
  autor_modificacion?: string;
  fecha_modificacion?: Date;
  clasificacion: 1 | 2; //1: Activo; 2: Inactivo
}
const estadosMap: Record<number, string> = {
  1: "Logrado (L)",
  2: "Medianamente logrado (ML)",
  3: "No logrado (NL)",
};
const clasificacionMap: Record<number, string> = {
  1: "Activo",
  2: "Inactivo",
};

//ICONO: OBJETIVO ESPECÍFICO
interface ObjetivoEspecificoIconoProps {
  estado: 1 | 2 | 3;
  clasificacion: 1 | 2;
}
export function ObjetivoEspecificoIcono({
  estado,
  clasificacion
}: ObjetivoEspecificoIconoProps) {
  return (
    <View className="rounded-full justify-center items-center">
      <Ionicons
        name={
          clasificacion === 2 ? Icons["inactivo"].iconName :
          estado === 1 ? Icons["objetivos_especificos_logrado"].iconName :
          estado === 2 ? Icons["objetivos_especificos_medianamente_logrado"].iconName :
          estado === 3 ? Icons["objetivos_especificos_no_logrado"].iconName :
          Icons["inactivo"].iconName
        }
        size={30}
        color={
          clasificacion === 2 ? colors.white :
          estado === 1 ? colors.mediumgreen :
          estado === 2 ? colors.mediumyellow :
          estado === 3 ? colors.mediumred :
          colors.white
        }
      />
    </View>
  );
}

//ITEM: OBJETIVO ESPECÍFICO
interface ObjetivoEspecificoItemProps {
  objetivoEspecifico: ObjetivoEspecifico;
  onChange: () => void;
  setToast: React.Dispatch<
    React.SetStateAction<{
      text1: string;
      text2?: string;
      type: "success" | "error";
    } | null>
  >;
  objetivoGeneralID?: string;
}
export const ObjetivoEspecificoItem = ({
  objetivoEspecifico,
  onChange,
  setToast,
  objetivoGeneralID
}: ObjetivoEspecificoItemProps) => {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const isProfesional = user?.role === "profesional";

  //ESTADOS
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const { paciente } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];

  //FETCH: PROFESIONALES (VINCULADOS AL OBJETIVO ESPECÍFICO)
  const fetchProfesionales = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[plan] Obteniendo profesionales vinculados al objetivo específico:", objetivoEspecifico.id);
      const res = await api.get(`/objetivo-especifico/${objetivoEspecifico.id}/profesionales/`);
      setProfesionales(res.data);
      setError(false);
    } catch (err) {
      console.log("[plan] Error:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  //HANDLE: EDITAR
  const handleEditar = (visible: boolean) => {
    console.log("[plan] Editando objetivo específico:", objetivoEspecifico.id);
    setShowEditar(visible);
  };

  //HANDLE: ELIMINAR
  const handleEliminar = () => {
    Alert.alert(
      "Eliminar objetivo específico",
      `¿Estás segur@ de que quieres eliminar "${objetivoEspecifico.titulo}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: async () => {
            try {
              console.log("[plan] Eliminando objetivo específico:", objetivoEspecifico.id);
              const api = createApi(authToken, refreshToken, setAuthToken);
              const res = await api.delete(`/objetivos-especificos/${objetivoEspecifico.id}/`);
              console.log("[plan] Objetivo específico eliminado correctamente...");

              //Agregamos un log de que eliminamos objetivo específico
              if (user?.role === "profesional") {
                try {
                  const payload = 
                  {
                    "elemento": "objetivo especifico",
                    "nombre_elemento": objetivoEspecifico.titulo,
                    "accion": "eliminar",
                  }
                  await api.post(`/logs/${pacienteID}/`, payload);
                  console.log("[LOGs] Log de edición objetivo específico creado");
                } catch (err) {
                  console.error("[LOGs] Error creando log de edición objetivo específico");
                }
              }


              setToast({ text1: "Objetivo específico eliminado exitosamente.", type: "success" });
              onChange();
            } catch (err) {
              console.error("[plan] Error eliminando objetivo específico:", err);
              setToast({ text1: "Hubo un problema al eliminar el objetivo específico.", text2: "Intenta nuevamente.", type: "error" });
              onChange();
            }
          }
        }
      ]
    );
  };
  
  //HANDLE: VINCULAR
  const handleVincular =  async () => {
    console.log("[plan] Vinculando al objetivo específico:", objetivoEspecifico.id);
    const api = createApi(authToken, refreshToken, setAuthToken);
    try {
      const res = await api.post(`/objetivo-especifico/${objetivoEspecifico.id}/profesionales/`);
      console.log("[plan] Usuario vinculado:", res.data);
      setToast({ text1: "Vinculado exitosamente.", type: "success" });
      onChange();
    } catch(err) {
      console.log("[plan] Error:", err);
      setToast({ text1: "Hubo un problema al vincularse.", text2: "Intenta nuevamente.", type: "error" });
      onChange();
    }
  };

  //HANDLE: DESVINCULAR
  const handleDesvincular = async () => {
    console.log("[plan] Desvinculando del objetivo específico:", objetivoEspecifico.id);
    const api = createApi(authToken, refreshToken, setAuthToken);
    try {
      const res = await api.delete(`/objetivo-especifico/${objetivoEspecifico.id}/profesionales/`)
      console.log("[plan] Usuario desvinculado", res.data);
      setToast({ text1: "Desvinculado exitosamente.", type: "success" });
      onChange();
    } catch(err){
      console.log("[plan] Error:", err);
      setToast({ text1: "Hubo un problema al desvincularse.", text2: "Intenta nuevamente.", type: "error" });
      onChange();
    } 
  };

  //VISTA
  return (
    <View className="relative">
      {/* BADGE */}
      {objetivoEspecifico.vinculado === true && (
        <Badge
          fondoColor={colors.secondary}
          texto={"Vinculado"}
          textoColor={colors.white}
        />
      )}
      {/* TARJETA */}
      <TarjetaExpandible
        titulo={objetivoEspecifico.titulo}
        subtitulo={`Estado: ${estadosMap[objetivoEspecifico.estado]}`}
        icono={<ObjetivoEspecificoIcono estado={objetivoEspecifico.estado} clasificacion={objetivoEspecifico.clasificacion}/>}
        iconoFondoColor={
          objetivoEspecifico.clasificacion === 2 ? colors.mediumgrey :
          objetivoEspecifico.estado === 1 ? colors.lightgreen :
          objetivoEspecifico.estado === 2 ? colors.lightyellow :
          objetivoEspecifico.estado === 3 ? colors.lightred :
          colors.mediumgrey 
        }
        expandidoContenido={
          <View className="gap-4">
            {objetivoEspecifico.descripcion && objetivoEspecifico.descripcion.length > 0 && (<TextoBloque texto={objetivoEspecifico.descripcion}/>)}
            <View className="gap-2">
              {/* OPCIONES */}
              <TituloSeccion children={"Opciones:"}/>
              <View className="gap-2">
                {/* ACCIONES */}
                <View className="flex-row flex-wrap items-center justify-between gap-1" style={{ flexShrink: 1 }}>
                  {isProfesional ? (
                    objetivoEspecifico.vinculado === true ? (
                      <>
                        <BotonDesvincular onPress={handleDesvincular}/>
                        <BotonEditar onPress={() => handleEditar(true)}/>
                        <BotonEliminar onPress={handleEliminar}/>
                      </>
                    ) : (
                      <BotonVincular onPress={handleVincular}/>
                    )
                  ) : null}
                  <BotonDetalles tipoModal={"expandible"} onOpen={fetchProfesionales}>
                    <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
                      <View className="gap-1">
                        <TituloSeccion
                          children={"Autor:"}
                          respuesta={`${objetivoEspecifico.autor_creacion} (${formatearFechaString(objetivoEspecifico.fecha_creacion, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })})`}
                        />
                        {objetivoEspecifico.autor_modificacion && objetivoEspecifico.fecha_modificacion && (
                          <TituloSeccion
                            children={"Última modificación:"}
                            respuesta={`${objetivoEspecifico.autor_modificacion} (${formatearFechaString(objetivoEspecifico.fecha_modificacion, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })})`}
                          />
                        )}
                        <TituloSeccion
                          children={"Clasificación:"}
                          respuesta={clasificacionMap[objetivoEspecifico.clasificacion]}
                        />
                        <TituloSeccion children={"Profesionales vinculados:"} />
                        {isLoading ? (
                          <IndicadorCarga/>
                        ) : error ? (
                          <MensajeVacio
                            mensaje={`Hubo un error al cargar los profesionales vinculados al objetivo específico.\nIntenta nuevamente.`}
                            onPressRecargar={fetchProfesionales}
                          />
                        ) : profesionales.length === 0 ? (
                          <MensajeVacio mensaje={"El objetivo específico aún no tiene profesionales vinculados."}/>
                        ) : (
                          profesionales.map((profesional, index) => (
                            <TarjetaPequeña
                              key={index}
                              titulo={profesional.nombre}
                              icono={<Ionicons name={Icons["usuario"].iconName} size={24} color="black"/>}
                            />
                          ))
                        )}
                      </View>
                    </ScrollView>
                  </BotonDetalles>
                </View>
              </View>
            </View>
          </View>
        }
      />
      {/* MODAL */}
      {objetivoGeneralID && (
        <ObjetivoEspecificoFormularioModal
          visible={showEditar}
          onClose={() => {
            handleEditar(false);
            onChange();
          }}
          onSuccess={() => {
            handleEditar(false);
            onChange();
            setToast({ text1: "Objetivo específico guardado exitosamente.", type: "success" });
          }}
          edicion={true}
          objetivoEspecificoID={objetivoEspecifico.id}
          objetivoGeneralID={objetivoGeneralID}
        />
      )}
    </View>
  );
};

//LISTA: OBJETIVOS ESPECÍFICOS
interface ObjetivosEspecificosListaProps {
  objetivosEspecificos: ObjetivoEspecifico[];
  onChange: () => void;
  setToast: React.Dispatch<
    React.SetStateAction<{
      text1: string;
      text2?: string;
      type: "success" | "error";
    } | null>
  >;
  objetivoGeneralID: string;
}
export function ObjetivosEspecificosLista({
  objetivosEspecificos,
  onChange,
  setToast,
  objetivoGeneralID
}: ObjetivosEspecificosListaProps) {
  return (
    <FlatList
      data={objetivosEspecificos}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ObjetivoEspecificoItem objetivoEspecifico={item} onChange={onChange} setToast={setToast} objetivoGeneralID={objetivoGeneralID}/>}
      contentContainerStyle={{ paddingBottom: 55 }}
    />
  );
};

//MODAL: OBJETIVOS ESPECÍFICOS
interface ObjetivosEspecificosModalProps {
  visible: boolean;
  onClose: () => void;
  objetivoGeneralID: string;
}
export function ObjetivosEspecificosModal({
  visible,
  onClose,
  objetivoGeneralID,
}: ObjetivosEspecificosModalProps) {
  
  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  if (!user) return null;
  const isProfesional = user?.role === "profesional";

  //ESTADOS
  const [objetivosEspecificos, setObjetivosEspecificos] = useState<ObjetivoEspecifico[]>([]);
  const [showActivos, setShowActivos] = useState(true);
  const [showInactivos, setShowInactivos] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [showAgregar, setShowAgregar] = useState(false);
  const [toast, setToast] = useState<{ text1: string; text2?: string; type: "success" | "error" } | null>(null); 

  useEffect(() => {
    if (visible) fetchObjetivosEspecificos();
  }, [visible, authToken, refreshToken]);

  //FETCH: OBJETIVOS ESPECÍFICOS
  const fetchObjetivosEspecificos = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[plan] Obteniendo objetivos específicos del objetivo general:", objetivoGeneralID);
      const res = await api.get(`/objetivos/${objetivoGeneralID}/especificos/`);
      const objetivosEspecificosFechas: ObjetivoEspecifico[] = res.data.map((oe: any) => ({
        ...oe,
        fecha_creacion: new Date(oe.fecha_creacion),
        fecha_modificacion: oe.fecha_modificacion ? new Date(oe.fecha_modificacion) : null,
      }));
      setObjetivosEspecificos(objetivosEspecificosFechas);
      setError(false);
    } catch (err) {
      console.log("[plan] Error:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  //HANDLE: AGREGAR-OBJETIVO-ESPECIFICO
  const handleAgregarObjetivoEspecifico = (visible: boolean) => {
    console.log("[plan] Agregando objetivo específico del objetivo:", objetivoGeneralID);
    setShowAgregar(visible);
  };

  //FILTRO: BÚSQUEDA
  const objetivosEspecificosBusqueda = objetivosEspecificos.filter((objetivoEspecifico: ObjetivoEspecifico) => {
    const textoBusqueda = busqueda.toLowerCase();
    const titulo = objetivoEspecifico.titulo?.toLowerCase() ?? "";
    const estado = estadosMap[objetivoEspecifico.estado]?.toLowerCase() ?? "";
    const descripcion = objetivoEspecifico.descripcion?.toLowerCase() ?? "";
    const autor_creacion = objetivoEspecifico.autor_creacion?.toLowerCase() ?? "";
    const autor_modificacion = objetivoEspecifico.autor_modificacion?.toLowerCase() ?? "";
    const clasificacion = clasificacionMap[objetivoEspecifico.clasificacion]?.toLowerCase() ?? "";
    return (
      titulo.includes(textoBusqueda) ||
      estado.includes(textoBusqueda) ||
      descripcion.includes(textoBusqueda) ||
      autor_creacion.includes(textoBusqueda) ||
      autor_modificacion.includes(textoBusqueda) ||
      clasificacion.includes(textoBusqueda)
    );
  });

  //FILTRO: CLASIFICACIÓN
  const objetivosEspecificosFiltrados = objetivosEspecificosBusqueda.filter(objetivoEspecifico => {
    if (showActivos && objetivoEspecifico.clasificacion === 1) return true;
    if (showInactivos && objetivoEspecifico.clasificacion === 2) return true;
    return false;
  });
  
  //VISTA
  return (
    <CustomModal visible={visible} onClose={onClose} tipo={"-y"}>
      <View className="flex-1">
        {/* TÍTULO */}
        <Titulo
          subtitulo={"Objetivos específicos"}
          onPressRecargar={fetchObjetivosEspecificos}
          onBusquedaChange={setBusqueda}
        >
          Plan de trabajo
        </Titulo>
        {/* PESTAÑAS */}
        <View className="flex-row justify-around bg-lightgrey rounded-xl my-2 ">
          <BotonTab
            label="Activos"
            active={showActivos}
            onPress={() => {setShowActivos(!showActivos); setShowInactivos(!showInactivos)}}
          />
          <BotonTab
            label="Inactivos"
            active={showInactivos}
            onPress={() => {setShowInactivos(!showInactivos); setShowActivos(!showActivos)}}
          />
        </View>
        {/* CUERPO */}
        {isLoading ? (
          <IndicadorCarga/>
        ) : error ? (
          <MensajeVacio
            mensaje={`Hubo un error al cargar los objetivos específicos.\nIntenta nuevamente.`}
            onPressRecargar={fetchObjetivosEspecificos}
          />
        ) : objetivosEspecificosFiltrados.length === 0 ? (
          <MensajeVacio
            mensaje={
              `No se encontraron objetivos específicos ${
                showActivos ? "activos" :
                showInactivos ? "inactivos" :
                null
              }.\n${
                isProfesional ? "¡Comienza a planificar el trabajo del paciente usando el botón ＋!" :
                "¡Revisa aquí cuando los profesionales los planifiquen!"
              }`
            }
          />
        ) : (
          <ObjetivosEspecificosLista
            objetivosEspecificos={objetivosEspecificosFiltrados}
            onChange={fetchObjetivosEspecificos}
            setToast={setToast}
            objetivoGeneralID={objetivoGeneralID}
          />
        )}
        {isProfesional ? <BotonAgregar onPress={() => handleAgregarObjetivoEspecifico(true)}/> : null}
        {toast && (
          <CustomToast
            text1={toast.text1}
            text2={toast.text2}
            type={toast.type}
            onHide={() => setToast(null)}
          />
        )}
        {/* MODAL */}
        <ObjetivoEspecificoFormularioModal
          visible={showAgregar}
          onClose={() => {
            handleAgregarObjetivoEspecifico(false);
            fetchObjetivosEspecificos();
          }}
          onSuccess={() => {
            handleAgregarObjetivoEspecifico(false);
            fetchObjetivosEspecificos();
            setToast({ text1: "Objetivo específico guardado exitosamente.", type: "success" });
          }}
          edicion={false}
          objetivoEspecificoID={"-1"}
          objetivoGeneralID={objetivoGeneralID}
        />
      </View>
    </CustomModal>
  );
}