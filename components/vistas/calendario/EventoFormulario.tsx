import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useAuth } from "@/context/auth";
import { Boton } from "@/components/base/Boton";
import { Titulo } from "@/components/base/Titulo";
import { colors, colorsUser } from "@/constants/colors";
import { MensajeVacio } from "@/components/base/MensajeVacio";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { DescartarCambiosContext } from "@/context/DescartarCambios";
import { FormularioCampo, FormularioCampoFechaFutura, FormularioCampoHora, FormularioCampoSelect } from "@/components/base/Entrada";

export function EventoFormulario() {

  const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
  const router = useRouter();
  const isProfesional = user?.role === "profesional";
  const navigation = useNavigation();
  //id: ID del evento
  //Si es agregar, id es undefined
  //Si es editar, id es evento.id
  const { paciente, id, date } = useLocalSearchParams();
  const modoEdicion = !!id; 
  const pacienteString = Array.isArray(paciente) ? paciente[0] : paciente;
  const [pacienteID, pacienteEncodedNombre] = pacienteString?.split("-") ?? [null, null];
    
  //ESTADOS 
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState<Date | null>(new Date(`${date}T12:00:00Z`));
  const [descripcion, setDescripcion] = useState("");
  const [hora_inicio, setHora_inicio] = useState<Date | null>(null);
  const [hora_termino, setHora_termino] = useState<Date | null>(null);
  const [diaSemana, setDiaSemana] = useState<number | null>(null);
  const [diaMensual, setDiaMensual] = useState<number | null>(null);
  const [id_plan, setId_plan] = useState(null);
  const [id_profesional, setId_profesional] = useState(null);
  const [color, setColor] = useState("");
  const [tipo, setTipo] = useState("");
  const [equipo, setEquipo] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBoton, setIsLoadingBoton] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    if (pacienteID) {
      setId_plan(Number(pacienteID));
    }
    setIsLoading(false);
  }, [pacienteID]);

  useEffect(() => {
    fetchPacientes();
    if (!isProfesional) {
      fetchEquipo();
    }
  }, [authToken, refreshToken]);

  const datosIniciales = useRef(
    { 
      titulo: "", 
      descripcion: "", 
      fecha: null,
      hora_inicio: null,
      hora_termino: null,
      diaSemana: null,
      diaMensual: null,
      id_plan: pacienteID,
      id_profesional: null,
      color: "",
      tipo: ""
    }
  );

  useEffect(() => {
    if (modoEdicion) {
      if (!authToken || !refreshToken) return;
      const api = createApi(authToken, refreshToken, setAuthToken);
      api
        .get("/eventos/" + id + "/")
        .then((res: any) => {
          const data = res.data;
          console.log(res.data);
          setTitulo(data.title);
          setDescripcion(data.descripcion);
          setDiaSemana(data.dia_semana);
          setDiaMensual(data.dia_mensual);
          setId_plan(data.plan);
          setId_profesional(data.profesional);
          setColor(data.color);
          setTipo(data.tipo);
          setFecha(new Date(`${data.fecha}T12:00:00Z`));
          const [year, month, day] = data.fecha.split("-").map(Number);
          let [hours, minutes, seconds] = data.hora_inicio.split(":").map(Number);
          const dateHora_inicio = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds || 0));
          let dateHora_termino;
          if(data.hora_termino){
            [hours, minutes, seconds] = data.hora_termino.split(":").map(Number);
            dateHora_termino = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds || 0));
          }
          else{dateHora_termino = null}
          setHora_inicio(dateHora_inicio);
          if(dateHora_termino){setHora_termino(dateHora_termino)} else{setHora_termino(null)};
          datosIniciales.current = {
            titulo: data.title,
            fecha: new Date(`${data.fecha}T12:00:00Z`),
            descripcion: data.descripcion,
            hora_inicio: hora_inicio,
            hora_termino: hora_termino,
            diaSemana: data.diaSemana,
            diaMensual: data.diaMensual,
            id_plan: data.plan,
            id_profesional: data.profesional,
            color: data.color,
            tipo: data.tipo
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
        titulo: "", 
        fecha: null,
        descripcion: "", 
        hora_inicio: null,
        hora_termino: null,
        diaSemana: null,
        diaMensual: null,
        id_plan: pacienteID,
        id_profesional: null,
        color: "",
        tipo: "",
    };
      setIsLoading(false);
    }
  }, [modoEdicion, id, authToken, refreshToken]);

  const hayCambios = () => {
    return (
      titulo != datosIniciales.current.titulo ||
      fecha != datosIniciales.current.fecha ||
      descripcion != datosIniciales.current.descripcion ||
      hora_inicio != datosIniciales.current.hora_inicio ||
      hora_termino != datosIniciales.current.hora_termino ||
      diaSemana != datosIniciales.current.diaSemana ||
      diaMensual != datosIniciales.current.diaMensual ||
      id_plan != datosIniciales.current.id_plan ||
      id_profesional != datosIniciales.current.id_profesional ||
      color != datosIniciales.current.color ||
      tipo != datosIniciales.current.tipo
    )
  }

  //FETCH: PROFESIONALES
  const fetchEquipo = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    console.log("[evento-agregar] Obteniendo equipo de la base de datos...");
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      const plan_id = pacienteID;
      const res = await api.get(`plan-trabajo/${plan_id}/profesionales`);
      console.log("[evento-agregar] Respuesta:", res.data);
      // Transformo los datos para el elemento formulario
      const equipoTransformado = res.data.map((persona) => ({
        titulo: `${persona.nombre.trim()} - ${persona.cargo}`,
        id: persona.id,
        color: colors.primary
      }));
      setEquipo(equipoTransformado);
      setIsLoading(false);
      setError(false);
    } catch (err) {
      console.log("[evento-agregar] Error:", err);
      setIsLoading(false);
      setError(true);
    }
  };

  //FETCH: PACIENTES
   const fetchPacientes = async () => {
    if (!authToken || !refreshToken) return;
    setIsLoading(true);
    try {
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log("[evento-agregar] Obteniendo pacientes de la base de datos...");
      const res = isProfesional
      ? (await api.get("/profesional-plan-trabajo/"))
      : (await api.get("/cuidador-plan-trabajo/"));
      console.log("[evento-agregar] Respuesta:", res.data);
      // Transformo los datos para el elemento formulario
      const pacientesTransformado = res.data.map((persona) => ({
        titulo: `${persona.nombre.trim()}`,
        id: persona.id,
        color: colors.primary
      }));
      setPacientes(pacientesTransformado);
      setIsLoading(false);
      setError(false);
    } catch (err) {
      console.log("[evento-agregar] Error:", err);
      setIsLoading(false);
      setError(true);
    }
  }

  //DESCARTAR CAMBIOS
  useEffect(() => {
    const beforeRemoveListener = navigation.addListener("beforeRemove", (e) => {
      if (!hayCambios()) return;
      e.preventDefault();
      Alert.alert(
        "¿Descartar cambios?",
        "Tienes cambios sin guardar. ¿Estás segur@ de que quieres salir?",
        [
          { text: "No", style: "cancel" },
          { text: "Salir", style: "destructive", onPress: () => navigation.dispatch(e.data.action) }
        ]
      );
    });
    return () => beforeRemoveListener();
  }, [navigation, titulo, descripcion, hora_inicio, hora_termino, diaSemana, diaMensual, id_plan, id_profesional, color, tipo]);

  const handleDescartarCambios = (path) => {
    if (hayCambios()) {
      Alert.alert(
        "¿Descartar cambios?",
        "Tienes cambios sin guardar. ¿Estás segur@ de que quieres salir?",
        [
          { text: "No", style: "cancel" },
          { text: "Salir", style: "destructive", onPress: () => router.push(path) }
        ]
      );
    } else {
      router.push(path);
    }
  };

  //HANDLE: GUARDAR
  const handleGuardar = async () => {
    // Validación: Campos obligatorios no ingresados
    if (!titulo || !hora_inicio || !color || !tipo || !fecha) {
      console.log(titulo);
      console.log(hora_inicio);
      console.log(color);
      console.log(tipo);
      console.log(fecha);
      Alert.alert("Error", "Por favor, completa todos los campos marcados con *.");
        return;
    }
    else if(tipo === "semanal" && diaSemana === null){
      console.log(diaSemana);
      Alert.alert("Error", "Por favor, completa todos los campos marcados con *.");
        return;
    }
    else if(tipo === "mensual" && !diaMensual){
      Alert.alert("Error", "Por favor, completa todos los campos marcados con *.");
        return;
    }
    // Validación: Hora no puede estar en el pasado
    //const Hora_inicioSeleccionada = new Date(); 
    //Hora_inicioSeleccionada.setHours(hora_inicio!.getHours(), hora_inicio!.getMinutes(), hora_inicio!.getSeconds());
    const ahora = new Date();
    //const ahoraLocal = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    //console.log(Hora_inicioSeleccionada,ahora);
    if(fecha && tipo === "unico"){
      console.log(ahora.getUTCDate());
      console.log(fecha.getUTCDate());
      console.log(hora_inicio < ahora);
      if ((ahora.getUTCDate() === fecha.getUTCDate()) && (hora_inicio < ahora)) {
        Alert.alert("Error", "No puedes seleccionar una hora que ya pasó.");
        return;
      }
    }
    // Validación: Hora término no puede ser menor a hora inicio
    if(hora_termino){
      hora_termino.setFullYear(hora_inicio.getUTCFullYear());
      hora_termino.setMonth(hora_inicio.getUTCMonth());
      hora_termino.setDate(hora_inicio.getUTCDate());
      if(hora_termino < hora_inicio){
        Alert.alert("Error", "La hora de término del evento debe ser después de la hora de inicio");
        return;
      }
    }
    setIsLoadingBoton(true);
    try {
      if (!authToken || !refreshToken) return;
      const api = createApi(authToken, refreshToken, setAuthToken);
      console.log(fecha);
      const yyyy = fecha.getUTCFullYear();
      const mm = String(fecha.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(fecha.getUTCDate()).padStart(2, "0");
      const payload = {
        title: titulo,
        descripcion: descripcion,
        hora_inicio: hora_inicio,
        hora_termino: hora_termino ? hora_termino: null,
        dia_semana: diaSemana,
        dia_mensual: diaMensual,
        plan: Number(pacienteID),
        profesional: id_profesional,
        color: color,
        tipo: tipo,
        fecha: `${yyyy}-${mm}-${dd}`
      };

      if (modoEdicion) {
        console.log("[editar-evento] Editando evento...");
        const res = await api.put(`/eventos/${id}/`, payload, { timeout: 5000 });
        if (isProfesional) {
          router.push(`/profesional/${paciente}/calendario?success=1`);
        } else {
          router.push(`/cuidador/${paciente}/calendario?success=1`);
        }
      } else {
        console.log("[agregar-evento] Agregando evento...")
        console.log(payload.fecha);
        const res = await api.post(`/eventos/`, payload, { timeout: 5000 });
        if (isProfesional) {
          router.push(`/profesional/${paciente}/calendario?success=1`);
        } else {
          router.push(`/cuidador/${paciente}/calendario?success=1`);
        }
      }
    } catch (err) {
      console.log("Error guardando evento:", err);
      Alert.alert(
        "Error",
        modoEdicion ? "Hubo un problema al editar el evento. Intenta nuevamente." : "Hubo un problema al crear el evento. Intenta nuevamente.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoadingBoton(false);
    }
  };

  // VISTA
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
            {modoEdicion ? "Editar evento" : "Agregar evento"}
          </Titulo>
          {isLoading ? (
            <IndicadorCarga/>
          ) : error ? (
            <MensajeVacio
              mensaje={`Hubo un error al cargar la información.\nIntenta nuevamente.`}
              onPressRecargar={() => {
                fetchPacientes();
                if (!isProfesional) {
                  fetchEquipo();
                }
              }}
            />
          ) : (
            <View className="gap-2">
              <FormularioCampo
                label={"Título"}
                placeholder={"Ingresa un título"}
                value={titulo}
                onChangeText={setTitulo}
                maxLength={255}
                asterisco={true}
                tipo={2}
              />
              <FormularioCampo
                label={"Tipo de evento"}
                value={tipo}
                onChangeText={setTipo}
                radioButton
                options={["unico", "semanal", "mensual"]}
                asterisco
                tipo={2}
              />
              {tipo === "semanal" && (
                <FormularioCampoSelect
                  label={"Día de la semana"}
                  placeholder={"Selecciona un día"}
                  items={[
                  { id: 0, titulo: "Domingo", color: colors.mediumdarkishgrey },
                  { id: 1, titulo: "Lunes", color: colors.mediumdarkishgrey },
                  { id: 2, titulo: "Martes", color: colors.mediumdarkishgrey },
                  { id: 3, titulo: "Miércoles", color: colors.mediumdarkishgrey},
                  { id: 4, titulo: "Jueves", color: colors.mediumdarkishgrey},
                  { id: 5, titulo: "Viernes", color: colors.mediumdarkishgrey},
                  { id: 6, titulo: "Sábado", color: colors.mediumdarkishgrey},
                  ]}
                  selectedId={diaSemana}
                  onChange={setDiaSemana}
                  asterisco={true}
                  tipo={2}
                />
              )}
              {tipo === "mensual" && (
                <FormularioCampo
                  label={"Día del mes"}
                  placeholder={"Ingresa un día del 1 al 31"}
                  value={diaMensual ? diaMensual.toString() : ""}
                  onChangeText={(text) => setDiaMensual(Number(text))}
                  keyboardType={"numeric"}
                  maxLength={2}
                  asterisco={true}
                  tipo={2}
                />
              )}
              <FormularioCampoFechaFutura
                label={`Fecha${tipo != "unico" ? " de inicio" : ""}`}
                placeholder={`Selecciona una fecha${tipo != "unico" ? " de inicio" : ""}`}
                fecha={fecha}
                setFecha={setFecha}
                asterisco={true}
                tipo={2}
              />
              <FormularioCampoHora
                label={"Hora de inicio"}
                hora={hora_inicio}
                setHora={setHora_inicio}
                placeholder={"Ingresa una hora"}
                asterisco={true}
                tipo={2}
              />
              <FormularioCampoHora
                label={"Hora de término"}
                placeholder={"Ingresa una hora"}
                hora={hora_termino}
                setHora={setHora_termino}
                asterisco={false}
                tipo={2}
              />
              {(!isProfesional) &&
                <FormularioCampoSelect
                  label={"Profesional"}
                  placeholder={"Selecciona un profesional"}
                  items={equipo}
                  selectedId={id_profesional}
                  onChange={setId_profesional}
                  asterisco={true}
                  tipo={2}
                />
              }
              <FormularioCampoSelect
                label={"Paciente"}
                placeholder={"Selecciona un paciente"}
                items={pacientes}
                selectedId={id_plan}
                onChange={setId_plan}
                asterisco={true}
                tipo={2}
              />
              <FormularioCampo
                label={"Descripción"}
                placeholder={"Ingresa una descripción"}
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                maxLength={4000}
                asterisco={false}
                tipo={2}
              />
              <FormularioCampoSelect
                label={"Color"}
                placeholder={"Selecciona un color"}
                items={colorsUser}
                selectedId={color}
                onChange={setColor}
                asterisco={true}
                tipo={2}
              />
              <Boton texto={"Guardar"} onPress={handleGuardar} isLoading={isLoadingBoton} tipo={3}/>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </DescartarCambiosContext.Provider>
  );
};