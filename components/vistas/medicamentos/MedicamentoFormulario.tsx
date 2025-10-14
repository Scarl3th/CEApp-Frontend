import { Boton } from "@/components/base/Boton";
import { FormularioCampo, FormularioCampoHora, FormularioCampoMultiSelect, FormularioCampoSelect } from "@/components/base/Entrada";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { Titulo } from "@/components/base/Titulo";
import { colors, colorsUser } from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { DescartarCambiosContext } from "@/context/DescartarCambios";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Switch, Text, View } from "react-native";
import { configurarNotificaciones, programarRecordatorios } from "./Notificaciones";


async function sincronizarNotificaciones(api: any) {
  try {
    // Configuración de notificaciones
    await configurarNotificaciones();

    // Consulta para obtener los medicamentos de todos los planes de trabajo del usuario
    console.log("[login notificaciones] Obteniendo medicamentos para notificaciones");
    const res = await api.get("/medicamentos/");
    console.log(res.data);

    // Programar recordatorios en base a los medicamentos obtenidos
    await programarRecordatorios(res.data);

  } catch (error) {
    console.error("Error al sincronizar medicamentos:", error);
  }
}

export function MedicamentoFormulario() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const router = useRouter();
  const isProfesional = user?.role === "profesional";
  const navigation = useNavigation();
  
  //id: ID del medicamento
  //Si es agregar, id es undefined
  //Si es editar, id es medicamento.id
  const { paciente, id } = useLocalSearchParams();
  const modoEdicion = !!id; 
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];

  //ESTADOS
  const [nombre, setNombre] = useState("");
  const [dosis, setDosis] = useState("");
  const [dias, setDias] = useState([]);
  const [frecuencia, setFrecuencia] = useState<number | null>(null);
  const [horarios, setHorarios] = useState<(Date | null)[]>([]);
  const [color, setColor] = useState("");
  const [recordatorio, setRecordatorio] = useState<number>(0);
  const[recordatorioActivo, setRecordatorioActivo] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBoton, setIsLoadingBoton] = useState(false);
  const [error, setError] = useState(false);
  
  const datosIniciales = useRef(
    { 
        nombre: '', 
        dosis: '', 
        dias: null,
        frecuencia: null,
        horarios: [],
        color: '',
        recordatorio: null,
        recordatorioActivo: false
    }
  );

  useEffect(() => {
    if (modoEdicion) {
      if (!authToken || !refreshToken) return;
      const api = createApi(authToken, refreshToken, setAuthToken);
      api
        .get(`/medicamentos/${pacienteID}/${id}`) 
        .then((res: any) => {

          const data = res.data;
          setNombre(data.nombre);
          setDosis(data.dosis);
          setDias(data.dias);
          setFrecuencia(data.frecuencia);
          setHorarios(data.horarios);
          setColor(data.color);
          setRecordatorio(data.recordatorio);
          setRecordatorioActivo(data.recordatorioActivo);

          datosIniciales.current = {
            nombre: data.nombre,
            dosis: data.dosis,
            dias: data.dias,
            frecuencia: data.frecuencia,
            horarios: data.horarios,
            color: data.color,
            recordatorio: data.recordatorio,
            recordatorioActivo: data.recordatorioActivo
          };

          setIsLoading(false);
        })
        .catch((err: any) => {
          console.log(err);
          setIsLoading(false);
        });
    } else {
      const colorAleatorio = colorsUser[Math.floor(Math.random() * colorsUser.length)].id;
      setColor(colorAleatorio);
      datosIniciales.current = { 
        nombre: '', 
        dosis: '', 
        dias: null,
        frecuencia: null,
        horarios: [],
        color: '',
        recordatorio: null,
        recordatorioActivo: false
    };
      setIsLoading(false);
    }
  }, [modoEdicion, id, authToken, refreshToken]);

  const arraysIguales = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    return a.every((item, index) => {
      if (item instanceof Date && b[index] instanceof Date)
        return item.getTime() === b[index].getTime();
      return item === b[index];
    });
  };

  const hayCambios = () => {
    return (
      nombre !== (datosIniciales.current.nombre ?? "") ||
      dosis !== (datosIniciales.current.dosis ?? "") ||
      !arraysIguales(dias, datosIniciales.current.dias) ||
      frecuencia !== datosIniciales.current.frecuencia ||
      !arraysIguales(horarios.map(h => h ? new Date(h) : null),
                    datosIniciales.current.horarios.map(h => h ? new Date(h) : null)) ||
      color !== (datosIniciales.current.color ?? "") ||
      recordatorio !== (datosIniciales.current.recordatorio ?? 0) ||
      recordatorioActivo !== (datosIniciales.current.recordatorioActivo ?? false)
    );
  };

  // DESCARTAR CAMBIOS AL SALIR
  useEffect(() => {
    const beforeRemoveListener = navigation.addListener('beforeRemove', (e) => {
      if (!hayCambios()) return;
      e.preventDefault();
      Alert.alert(
        "¿Descartar cambios?",
        "Tienes cambios sin guardar. ¿Estás segur@ de que quieres salir?",
        [
          { text: "No", style: "cancel", onPress: () => {} },
          { text: "Salir", style: "destructive", onPress: () => navigation.dispatch(e.data.action) }
        ]
      );
    });
    return () => beforeRemoveListener();
  }, [navigation, nombre, dosis, dias, frecuencia, horarios, color, recordatorio, recordatorioActivo]);

  const handleDescartarCambios = (path) => {
    if (hayCambios()) {
      Alert.alert(
        "¿Descartar cambios?",
        "Tienes cambios sin guardar. ¿Estás segur@ de que quieres salir?",
        [
          { text: "No", style: "cancel", onPress: () => {} },
          { text: "Salir", style: "destructive", onPress: () => router.push(path) }
        ]
      );
    } else {
      router.push(path);
    }
  };

  // HANDLE: GUARDAR
    const handleGuardar = async () => {
  
      // Validación: Campos obligatorios no ingresados
      if (!nombre || !dosis || !color || !dias || !frecuencia) {
        Alert.alert("Error", "Por favor, completa todos los campos obligatorios marcados con *.");
          return;
      }
      else if(recordatorioActivo && !recordatorio){
        Alert.alert("Error", "Por favor, completa todos los campos obligatorios marcados con *.");
          return;
      }
      
      setIsLoadingBoton(true);
  
      try {
        if (!authToken || !refreshToken) return;
        const api = createApi(authToken, refreshToken, setAuthToken);
        const payload = {
          nombre: nombre, 
          dosis: dosis, 
          dias: dias,
          frecuencia: frecuencia,
          horarios: horarios,
          color: color,
          recordatorio: recordatorio,
          recordatorioActivo: recordatorioActivo
        };
        
  
        if (modoEdicion) {
          console.log("[editar-medicamento] Editando medicamento...");
          const res = await api.put(`/medicamentos/${pacienteID}/${id}/`, payload, { timeout: 5000 });
          sincronizarNotificaciones(api);
          router.push(`/cuidador/${paciente}/medicamentos?success=1`);
        } else {
          console.log("[agregar-medicamento] Agregando medicamento...")
          const res = await api.post(`/medicamentos/${pacienteID}/`, payload, { timeout: 5000 });
          sincronizarNotificaciones(api);
          router.push(`/cuidador/${paciente}/medicamentos?success=1`);
        }
      } catch (err) {
        console.log("Error guardando medicamento:", err);
        Alert.alert("Error", modoEdicion ? "Hubo un problema al editar el medicamento. Intenta nuevamente." : "Hubo un problema al crear el medicamento. Intenta nuevamente.", [{ text: "OK" }]);
      } finally {
        setIsLoadingBoton(false);
      }
    };

  //HANDLE: SET HORA
  const handleSetHorarios = (index: number, nuevaHora: Date | null) => {
    const nuevos = [...horarios];
    nuevos[index] = nuevaHora;
    setHorarios(nuevos);
  };

  const MAX_MINUTOS = 120; // ejemplo: 2 horas

  const handleSetRecordatorio = (text: string) => {
    // aceptar solo números
    let num = text.replace(/[^0-9]/g, "");
    if (num) {
      const valor = parseInt(num, 10);
      if (valor > MAX_MINUTOS) {
        num = String(MAX_MINUTOS); // limitar al máximo
      }
    }
    setRecordatorio(Number(num));
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
        <Titulo>{modoEdicion ? "Editar medicamento" : "Agregar medicamento"}</Titulo>
        {isLoading ? (
          <IndicadorCarga/>
        ) : (
          <View className="gap-2">

            {/* Nombre */}
            <FormularioCampo
                label="Nombre"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del medicamento"
                maxLength={255}
                asterisco
                tipo={2}
            />

            {/* Dosis */}
            <FormularioCampo
                label="Dosis"
                value={dosis}
                onChangeText={setDosis}
                placeholder="Dosis que corresponde en cada toma"
                multiline
                maxLength={4000}
                asterisco
                tipo={2}
            />

            {/* Días */}
            <FormularioCampoMultiSelect
                label="Días de la semana"
                items={[
                  { id: 0, titulo: "Domingo", color: colors.primary },
                  { id: 1, titulo: "Lunes", color: colors.primary },
                  { id: 2, titulo: "Martes", color: colors.primary },
                  { id: 3, titulo: "Miércoles", color: colors.primary },
                  { id: 4, titulo: "Jueves", color: colors.primary },
                  { id: 5, titulo: "Viernes", color: colors.primary },
                  { id: 6, titulo: "Sábado", color: colors.primary },
                ]}
                selected={dias}
                onChange={setDias}
                placeholder="Selecciona uno o más días"
                placeholderSelected="día(s) seleccionado(s)"
                asterisco={true}
                tipo={2}
            />

            {/* Frecuencia */}
            <FormularioCampo
                label="Frecuencia"
                value={frecuencia ? frecuencia.toString() : ""}
                onChangeText={(text) => setFrecuencia(Number(text))}
                placeholder="Cantidad de dosis por día"
                keyboardType="numeric"
                asterisco
                maxLength={2}
                tipo={2}
            />
            {/* Horarios */}
            {Array.from({ length: frecuencia }).map((_, i) => (
                <FormularioCampoHora
                  key={i}
                  label={`Hora (frecuencia ${i + 1})`}
                  placeholder="Seleccionar hora"
                  hora={horarios[i] ? new Date(horarios[i]) : null}
                  setHora={(h) => handleSetHorarios(i, h)}
                  asterisco
                  tipo={2}
                />
              ))
            }

            {/* Activar Recordatorio */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Text className="text-black font-semibold mb-1" style={{ marginRight: 10 }}>Recordatorio</Text>
              <Switch
                value={recordatorioActivo}
                onValueChange={setRecordatorioActivo}
                trackColor={{ false: colors.mediumgrey, true: colors.primary }}
                thumbColor={recordatorioActivo ? colors.secondary : "#f4f3f4"}
              />
            </View>

            {/* Minutos recordatorio */}
            {recordatorioActivo && (
              <FormularioCampo
                label="Minutos de anticipación del recordatorio"
                placeholder="Ej: 30"
                value={recordatorio}
                onChangeText={handleSetRecordatorio}
                keyboardType="numeric"
                maxLength={3} // evita escribir números largos
                tipo={2}
                asterisco={true}
              />
            )}


            {/* Color del evento */}
            <FormularioCampoSelect
                label="Color"
                items={colorsUser}
                selectedId={color}
                onChange={setColor}
                placeholder="Selecciona un color"
                asterisco={true}
                tipo={2}
            />
            <Boton texto="Guardar" onPress={handleGuardar} isLoading={isLoadingBoton} tipo={3}/>
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </DescartarCambiosContext.Provider>
  );

}
