import { useEffect, useRef, useState } from "react";
import { useNavigation, usePathname, useRouter } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useAuth } from "@/context/auth";
import { Boton } from "@/components/base/Boton";
import { Titulo } from "@/components/base/Titulo";
import { DescartarCambiosContext } from "@/context/DescartarCambios";
import { EspacioUsadoBarra } from "@/components/vistas/informes/Componentes";
import { FormularioCampo, FormularioCampoInforme } from "@/components/base/Entrada";

export function InformeFormulario() {

  const { authToken, refreshToken, createApi, setAuthToken } = useAuth();
  const router = useRouter();
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];
  const paciente = ruta_partes[1];
  const navigation = useNavigation();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];
  const espacioMaximo = 500 * 1024 * 1024;

  //ESTADOS
  const [titulo, setTitulo] = useState("");
  const [informe, setInforme] = useState<any>(null);
  const [espacioUsado, setEspacioUsado] = useState(0);
  const [isLoadingBoton, setIsLoadingBoton] = useState(false);
  const datosIniciales = useRef({ titulo: "" });

  useEffect(() => {
    if (!titulo && informe) {
      setTitulo(informe.name);
    }
  }, [informe]);

  useEffect(() => {
    fetchEspacioUsado();
  }, []);

  //FETCH: ESPACIO
  const fetchEspacioUsado = async () => {
    try {
      console.log("[informes: informe-agregar] Obteniendo espacio usado de la base de datos...");
      const api = createApi(authToken, refreshToken, setAuthToken);
      const res = await api.get("/usuario/" + pacienteID + "/espacio-usado");
      setEspacioUsado(res.data.usado);
    } catch(err) {
      console.log("[informes: informe-agregar] Error al obtener espacio usado:", err);
    }
  };

  const hayCambios = () => {
    return (
      titulo != datosIniciales.current.titulo ||
      informe != null
    )
  }

  //DESCARTAR CAMBIOS
  useEffect(() => {
    const beforeRemoveListener = navigation.addListener('beforeRemove', (e) => {
      if (!hayCambios()) {return}
      e.preventDefault();
      Alert.alert(
        "¿Descartar cambios?",
        "Tienes cambios sin guardar. ¿Estás segur@ de que quieres salir?",
        [
          {
            text: "No",
            style: "cancel",
            onPress: () => {}
          },
          {
            text: "Salir",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          }
        ]
      );
    });
    return () => beforeRemoveListener();
  }, [navigation, titulo, informe]);

  //DESCARTAR CAMBIOS
  const handleDescartarCambios = (path) => {
    if (hayCambios()) {
      Alert.alert(
        "¿Descartar cambios?",
        "Tienes cambios sin guardar. ¿Estás segur@ de que quieres salir?",
        [
          {
            text: "No",
            style: "cancel",
            onPress: () => {}
          },
          {
            text: "Salir",
            style: "destructive",
            onPress: () => router.push(path),
          }
        ]
      );
    } else {
      router.push(path);
    }
  };

  //HANDLE: GUARDAR
  const handleGuardar = async () => {
    if (!titulo || !informe) {
      console.log("[informes: informe-agregar] Error. Por favor, completa todos los campos obligatorios marcados con *...");
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios marcados con *.");
      return;
    }
    if (espacioUsado + informe.size > espacioMaximo) {
      console.log("[informes: informe-agregar] Error. No tienes suficiente espacio para subir este archivo...");
      Alert.alert("Error", "No tienes suficiente espacio para subir este archivo.");
      return;
    }
    setIsLoadingBoton(true);
    try {
      if (!authToken || !refreshToken) return;
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[informe: informe-agregar] Guardando informe:", { pacienteID, titulo, informe });
      {
        //GUARDAR INFORME 
        console.log("informe.type:", informe?.mimeType);
        // Crear FormData correctamente
        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("informe", {
          uri: informe.uri,        // ruta real del archivo en el dispositivo
          name: informe.name,      // nombre original
          type: informe.mimeType || "application/pdf", // tipo MIME
        }as any);
        const res = await api.post("/informes/" + pacienteID + "/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 5000
        });
        router.push(`/${rol}/${paciente}/informes?success=1`);
      }
    } catch(err) {
      console.log("[informes: informe-agregar] Error:", err); 
      Alert.alert(
        "Error",
        "El informe no pudo ser guardado. Intenta nuevamente.",
        [{text: "OK"}]
      )
    } finally {
      setIsLoadingBoton(false);
    }
  };
    
  //VISTA
  return (
    <DescartarCambiosContext.Provider value={{ handleDescartarCambios }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={130}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 2, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <Titulo> 
          Agregar informe
        </Titulo>
        <View className="gap-2">
          <FormularioCampo
            label={"Título"}
            value={titulo}
            onChangeText={setTitulo}
            placeholder={"Ingresa un título"}
            maxLength={255}
            asterisco={true}
            tipo={2}
          />
          <FormularioCampoInforme
            label={"Informe"}
            placeholder1={"Selecciona un informe"}
            placeholder2={"Cambiar informe"}
            helpText1={"Formatos aceptados: .pdf"}
            helpText2={"Tamaño máximo: 20 MB"}
            informe={informe}
            setInforme={setInforme}
            asterisco={true}
          />
          <EspacioUsadoBarra
            espacioUsado={espacioUsado}
            espacioMaximo={espacioMaximo}
          />
          <Boton
            texto={"Guardar"}
            onPress={handleGuardar}
            isLoading={isLoadingBoton}
            tipo={3}
          />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </DescartarCambiosContext.Provider>
  );

}