import { Alert, View } from "react-native";
import React, { useEffect, useState, useRef } from "react"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from "@/context/auth";
import { Boton } from "@/components/base/Boton";
import { Titulo } from "@/components/base/Titulo";
import { CustomModal } from "@/components/base/Modal";
import { FormularioCampo } from "@/components/base/Entrada";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { DescartarCambiosContext } from "@/context/DescartarCambios";

//MODAL: OBJETIVO ESPECÍFICO FORMULARIO
interface ObjetivoEspecificoFormularioModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  edicion: boolean;
  objetivoEspecificoID: string;
  objetivoGeneralID: string;  
}
export function ObjetivoEspecificoFormularioModal({
  visible,
  onClose,
  onSuccess,
  edicion,
  objetivoEspecificoID,
  objetivoGeneralID,
}: ObjetivoEspecificoFormularioModalProps) {

  const { authToken, refreshToken, createApi, setAuthToken } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const { paciente } = useLocalSearchParams();
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];
    
  //ESTADOS
  const [objetivoEspecifico, setObjetivoEspecifico] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [estado, setEstado] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBoton, setIsLoadingBoton] = useState(false);
  const datosIniciales = useRef({ titulo: "", estado: "", descripcion: "" });

  useEffect(() => {
    if (!edicion) {
      setTitulo("");
      setEstado("");
      setDescripcion("");
    }
  }, [visible])

  useEffect(() => {
    if (edicion) {
      if (!authToken || !refreshToken) return;
      console.log("[plan: objetivo-especifico-agregar] Obteniendo información del objetivo específico:", objetivoEspecificoID);
      const api = createApi(authToken, refreshToken, setAuthToken);
      api
        .get("/objetivos-especificos/" + objetivoEspecificoID + "/")
        .then((res: any) => {
          const data = res.data;
          setObjetivoEspecifico(data);
          setTitulo(data.titulo);
          setEstado(data.estado_display);
          setDescripcion(data.descripcion);
          datosIniciales.current = {
            titulo: data.titulo,
            estado: data.estado_display,
            descripcion: data.descripcion,
          };
          setIsLoading(false);
        })
        .catch((err: any) => {
          console.log("[plan: objetivo-especifico-agregar] Error:", err);
          setIsLoading(false);
        });
    } else {
      datosIniciales.current = {
        titulo: "",
        estado: "",
        descripcion: "",
      };
      setIsLoading(false);
    }
  }, [edicion, objetivoEspecificoID, authToken, refreshToken]);

  const hayCambios = () => {
    return (
      titulo != datosIniciales.current.titulo ||
      estado != datosIniciales.current.estado ||
      descripcion != datosIniciales.current.descripcion
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
  }, [navigation, titulo, estado, descripcion]);

  //DESCARTAR CAMBIOS
  const handleDescartarCambios = (path: any) => {
    if (hayCambios()) {
      Alert.alert(
        "¿Descartar cambios?",
        "Tienes cambios sin guardar. ¿Estás segur@ de que quieres salir?",
        [
          { text: "No", style: "cancel", onPress: () => {} },
          { text: "Salir", style: "destructive", onPress: () => router.push(path) },
        ]
      );
    } else {
      router.push(path);
    }
  };

  //HANDLE: CERRAR MODAL
  const handleCerrarModal = () => {
    if (hayCambios()) {
      Alert.alert(
        "¿Descartar cambios?",
        "Tienes cambios sin guardar. ¿Estás segur@ de que quieres salir?",
        [
          { text: "No", style: "cancel" },
          { text: "Salir", style: "destructive", onPress: () => onClose() },
        ]
      );
    } else {
      onClose();
    }
  };
  
  //HANDLE: GUARDAR
  const handleGuardar = async () => {
    if (!titulo || !estado) {
      console.log("[plan: objetivo-especifico-agregar] Error. Por favor, completa todos los campos obligatorios marcados con *...");
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios marcados con *.");
      return;
    }
    setIsLoadingBoton(true);
    try {
      if (!authToken || !refreshToken) return;
      const api = createApi(authToken, refreshToken, setAuthToken);
      if (edicion) {
        console.log("[plan: objetivo-especifico-agregar] Editando objetivo específico:", { pacienteID, titulo, estado, descripcion });
        {
          const res = await api.put("objetivos-especificos/" + objetivoEspecificoID + "/", {titulo: titulo,
                                                                                            estado: estado,
                                                                                            descripcion: descripcion},
                                                                                           {timeout: 5000})
          console.log("[plan: objetivo-especifico-agregar] Respuesta:", res.data);
          onSuccess();
        }
      } else {
        console.log("[plan: objetivo-especifico-agregar] Creando objetivo específico:", { pacienteID, titulo, estado, descripcion });
        {
          const res = await api.post(`objetivos/${objetivoGeneralID}/especificos/`, {titulo: titulo,
                                                                                     estado: estado,
                                                                                     descripcion: descripcion},
                                                                                    {timeout: 5000})
          console.log("[plan: objetivo-especifico-agregar] Respuesta:", res.data);
          onSuccess();
        }
      }
    } catch(err) {
      console.log("[plan: objetivo-especifico-agregar] Error:", err); 
      Alert.alert(
        "Error",
        "Hubo un problema al guardar el objetivo específico. Intenta nuevamente.",
        [{text: "OK"}]
      )
    } finally {
      setIsLoadingBoton(false);
    }
  };
    
  //VISTA
  return (
    <CustomModal visible={visible} onClose={handleCerrarModal} tipo={"-y"}>
      <DescartarCambiosContext.Provider value={{ handleDescartarCambios }}>
        <KeyboardAwareScrollView
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1, padding: 8 }} 
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={24}
        >
          <Titulo>
            {edicion ? "Editar objetivo específico" : "Agregar objetivo específico"}
          </Titulo>
          {isLoading ? (
            <IndicadorCarga/>
          ) : (
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
              <FormularioCampo
                label={"Estado"}
                value={estado}
                onChangeText={setEstado}
                radioButton
                options={["No logrado", "Medianamente logrado", "Logrado"]}
                asterisco={true}
                tipo={2}
              />
              <FormularioCampo
                label={"Descripción"}
                value={descripcion}
                onChangeText={setDescripcion}    
                placeholder={"Ingresa una descripción"}
                multiline
                maxLength={4000}
                asterisco={false}
                tipo={2}
              />
              <Boton
                texto={"Guardar"}
                onPress={handleGuardar}
                isLoading={isLoadingBoton}
                tipo={3}
              />
            </View>
          )}
        </KeyboardAwareScrollView>
      </DescartarCambiosContext.Provider>
    </CustomModal>
  );
};