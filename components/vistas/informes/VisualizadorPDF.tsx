import { Titulo } from "@/components/base/Titulo";
import { useAuth } from "@/context/auth";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import Pdf from "react-native-pdf";

interface Props {
  source: { uri: string; headers?: Record<string, string> };
  style?: any;
  webviewStyle?: any;
  noLoader?: boolean;
}

const Loader = () => (
  <View style={styles.loaderContainer}>
    <ActivityIndicator size="large" />
  </View>
);

export function PdfViewer({ source, style, noLoader }: Props) {

  const [localPdfUri, setLocalPdfUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number> (0);
  const [totalPages, setTotalPages] = useState<number> (0);
  const params = useLocalSearchParams();
  const id = params.id;

  useEffect(() => {
    let mounted = true;

    const downloadPdf = async () => {
      try {
        setLoading(true);

        // Limpiar archivos previos
        const cachedPdf = FileSystem.cacheDirectory + "temp.pdf";
        await FileSystem.deleteAsync(cachedPdf, { idempotent: true });

        // Descargar PDF remoto al cache
        const downloadRes = await FileSystem.downloadAsync(source.uri, cachedPdf, {
          headers: source.headers,
        });

        if (mounted) {
          setLocalPdfUri(downloadRes.uri);
        }
      } catch (error) {
        console.error("Error descargando PDF:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    downloadPdf();

    return () => {
      mounted = false;
    };
  }, [source.uri]);

  if (loading || !localPdfUri) {
    return !noLoader ? <Loader /> : <View style={styles.loaderContainer} />;
  }

  return (
    <View style={[styles.container, style]}>
      <Titulo>{`Informe ${id} (${page}/${totalPages})`}</Titulo>
      <Pdf
        source={{ uri: localPdfUri, cache: true }}
        style={styles.pdf}
        onLoadComplete={(numberOfPages) => setTotalPages(numberOfPages)}
        onPageChanged={(page) => setPage(page)}
        onError={(error) => {
          console.error("PDF error:", error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pdf: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});


export function VisualizadorPDF(){

  const {authToken, refreshToken, createApi, setAuthToken, user} = useAuth();
  const params = useLocalSearchParams();
  const id = params.id;
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];
  const paciente = ruta_partes[1];
  const [pacienteID] = paciente.split("-");

  const [url, setUrl] = useState<string | null>(null);

  const fetchInforme = async () => {
  try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.get(`/informes/${pacienteID}/${id}`);


      //Guardar log si es profesional
      if (user?.role === "profesional") {
        try {
          const api = createApi(authToken, refreshToken, setAuthToken);
          const payload = 
          {
            "elemento": "informe",
            "accion": "descargar",
            "nombre_elemento": res.titulo,
          }
          await api.post(`/logs/${pacienteID}/`, payload);
          console.log("[LOGs] Log de descargar informe creado");
        } catch (err) {
          console.error("[LOGs] Error creando log de descargar informe");
        }
      }
      
      setUrl(res.data.url);
  } catch (error: any) {
      console.error("Error:", error.response?.data?.message || error.message);
      Alert.alert("Error", "No se pudo obtener el informe. Intenta nuevamente.");
    }
  };
  
  useEffect(() => {
      fetchInforme();
  }, [authToken, refreshToken]);

  return (
    <>
     {url &&
      <PdfViewer
        source={{ uri: url }}
        style={{ flex: 1 }}
      />
     }
    </>
  );

}