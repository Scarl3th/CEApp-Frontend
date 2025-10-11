import { Titulo } from "@/components/base/Titulo";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
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
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});


export function VisualizadorPDF(){

  const params = useLocalSearchParams();
  const id = params.id;
  //Con esta id, deberíamos hacer un fetch hacia el backend
  //para saber la uri real del informe

  const uri = 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf';

  return (
      <PdfViewer
        source={{ uri: uri }}
        style={{ flex: 1 }}
      />
  );

}