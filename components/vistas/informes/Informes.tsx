import { BotonAgregar, BotonDescargar, BotonDetalles, BotonVer } from "@/components/base/Boton";
import { formatearFechaDDMMYYYY } from "@/components/base/FormatearFecha";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { TarjetaTresPuntos } from "@/components/base/Tarjeta";
import { Titulo, TituloSeccion } from "@/components/base/Titulo";
import { CustomToast } from "@/components/base/Toast";
import { EspacioUsadoBarra } from "@/components/vistas/informes/Componentes";
import { colors } from "@/constants/colors";
import { Icons } from "@/constants/icons";
import { useAuth } from "@/context/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as FileSystem from 'expo-file-system';
import { EncodingType, readAsStringAsync, StorageAccessFramework, writeAsStringAsync } from 'expo-file-system/legacy';
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, View } from "react-native";

//INFORME
interface Informe {
  id: string;
  titulo: string;
  autor_creacion: string;
  fecha_creacion: string;
  tamano: string;
}

//ICONO: INFORME
export function InformeIcono(
  { onPress }: { onPress: () => void }
) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View 
          className="rounded-full p-2 justify-center items-center"
          style={{ backgroundColor: pressed ? colors.mediumgrey : colors.primary }}
        >
          <Ionicons name={Icons["informe"].iconName} size={48} color={colors.white}/>
          <View 
            className="absolute bottom-0 right-0 rounded-full p-1"
            style={{ backgroundColor: pressed ? colors.mediumgrey : colors.secondary }}
          >
            <Ionicons name={Icons["ver"].iconName} size={14} color={colors.white} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

//ÍTEM: INFORME
interface InformeItemProps {
  informe: Informe;
  onChange: () => void;
  setToast: React.Dispatch<
    React.SetStateAction<{
      text1: string;
      text2?: string;
      type: "success" | "error";
    } | null>
  >;
}
const InformeItem = ({ informe, onChange, setToast }: InformeItemProps) => {
  
  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const isProfesional = user?.role === "profesional";
  const router = useRouter();
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];
  const paciente = ruta_partes[1];
  const [pacienteID] = paciente.split("-");

  //ESTADOS
  const [isDescargando, setIsDescargando] = useState(false);

  //HANDLE: VER
  const handleVer = async () => {
    try {
      console.log("[informes] Viendo informe...");
      router.push(`/${rol}/${paciente}/informes/informe-ver?id=${informe.id}`);
    } catch (err) {
      console.log("[informes] Error:", err);
      Alert.alert("Error", "No se pudo abrir el informe. Intenta nuevamente.");
    }
  }

  //HANDLE: DESCARGAR
  const handleDescargar = async () => {
    
    setIsDescargando(true);
    console.log("[informes] Descargando informe...");
    
    try {

      //Preguntamos por la url al backend
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.get(`/informes/${pacienteID}/${informe.id}`);
      console.log(res.data);
      const url = res.data.url;
      const fileName = `${informe.titulo}.pdf`;

      // Ruta en caché
      const destination = new FileSystem.Directory(FileSystem.Paths.cache,"informes");
      if(!destination.exists){
        destination.create();
      }
      
      // Descargar el archivo en caché
      const output = await FileSystem.File.downloadFileAsync(url, destination, {idempotent: true});
      console.log(`[informes] Archivo descargado en ${output.uri}`);

      // Selección de carpeta y petición de permisos
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        return;
      } else {
        console.log(permissions.directoryUri);
      }

      //Guardar en carpeta seleccionada
      const fileString = await readAsStringAsync(output.uri, { encoding: EncodingType.Base64 });
      await StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/pdf')
            .then(async (uri) => {
              await writeAsStringAsync(uri, fileString, { encoding: EncodingType.Base64 });
              Alert.alert("Archivo descargado correctamente");
            })
      //setToast({ text1: "Informe descargado correctamente", type: "success" });
      //Saqué el toast porque se veía detrás del modal, el alert se sobrepone y queda mejor

    } catch (error) {
      console.error(error);
      Alert.alert("Error", `El archivo no pudo ser descargado`);
      //setToast({ text1: "Informe no se pudo descargar.", type: "error" });
    } finally {
      setIsDescargando(false);
    }
  };

  //VISTA
  return (
    <TarjetaTresPuntos
      titulo={informe.titulo}
      subtitulo={`Autor: ${informe.autor_creacion}\nFecha: ${formatearFechaDDMMYYYY(informe.fecha_creacion)}`}
      icono={<InformeIcono onPress={handleVer}/>}
      iconoFondoColor={colors.primary}
      tipoModal={"expandible"}
      tresPuntosContenido={
        <>
          <BotonVer onPress={handleVer} tipo={"horizontal"}/>
          <BotonDescargar onPress={handleDescargar} tipo={"horizontal"} isLoading={isDescargando}/>
          <BotonDetalles tipo={"horizontal"} tipoModal={"expandible"}>
            <View className="gap-1">
              <TituloSeccion
                children={"Tamaño del archivo:"}
                respuesta={informe.tamano}
              />
            </View>
          </BotonDetalles>
        </>
      }
    />
  );
};

//LISTA: INFORMES
interface InformesListaProps {
  informes: Informe[];
  onChange: () => void;
  setToast: React.Dispatch<
    React.SetStateAction<{
      text1: string;
      text2?: string;
      type: "success" | "error";
    } | null>
  >;
}
export function InformesLista({ informes, onChange, setToast }: InformesListaProps) {
  return (
    <FlatList
      data={informes}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <InformeItem informe={item} onChange={onChange} setToast={setToast}/>}
      contentContainerStyle={{ paddingBottom: 55 }}
    />
  );
};

//VISTA: INFORMES
export function Informes() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const isProfesional = user?.role === "profesional";
  const router = useRouter();
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];
  const paciente = ruta_partes[1];
  const [pacienteID] = paciente.split("-");

  const espacioMaximo = 500 * 1024 * 1024;

  //ESTADOS
  const [informes, setInformes] = useState<Informe[]>([]);
  const [espacioUsado, setEspacioUsado] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState<{ text1: string; text2?: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchInformes();
  }, [authToken, refreshToken]);

  useEffect(() => {
    fetchEspacioUsado();
  }, []);

  //FETCH: ESPACIO
  const fetchEspacioUsado = async () => {
    try {
      console.log("[informes] Obteniendo espacio usado de la base de datos...");
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.get("/usuario/" + pacienteID + "/espacio-usado/");
      setEspacioUsado(res.data.usado);
    } catch(err) {
      console.log("[informes] Error al obtener espacio usado:", err);
    }
  };

  //FETCH: INFORMES
  const fetchInformes = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[informes] Obteniendo informes de la base de datos...");
      const res = await api.get("/informes/" + pacienteID + "/metadata/");
      //console.log(res.data);
      setInformes(res.data);
      setError(false);
    } catch(err) {
      console.log("[informes] Error:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  //HANDLE: AGREGAR-OBSERVACION
  const handleAgregarInforme = () => {
    console.log("[informes] Agregando informe...");
    router.push(`/${rol}/${paciente}/informes/informe-agregar`);
  }

  //FILTRO
  const informesBusqueda = informes.filter((informe) => {
    const textoBusqueda = busqueda.toLowerCase();
    const titulo = informe.titulo?.toLowerCase() ?? "";
    return (
      titulo.includes(textoBusqueda)
    );
  });

  //VISTA
  return (
    <View className="flex-1">
      <Titulo
        onPressRecargar={fetchInformes}
        onBusquedaChange={setBusqueda}
      >
        Informes
      </Titulo>
      {isLoading ? (
        <IndicadorCarga/>
      ) : error ? (
        <MensajeVacio
          mensaje={`Hubo un error al cargar los informes.\nIntenta nuevamente.`}
          onPressRecargar={fetchInformes}
        />
      ) : informes.length === 0 ? (
        <MensajeVacio mensaje={`Aún no tienes informes.\n¡Comienza a planificar el trabajo del paciente usando el botón ＋!`}/>
      ) : (
        <>
          <EspacioUsadoBarra
            espacioUsado={espacioUsado}
            espacioMaximo={espacioMaximo}
          />
          <InformesLista
            informes={informesBusqueda}
            onChange={fetchInformes}
            setToast={setToast}
          />
        </>
      )}
      <BotonAgregar onPress={handleAgregarInforme}/>
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