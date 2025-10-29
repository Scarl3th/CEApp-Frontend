import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View, Text, Switch } from "react-native";
import { useAuth } from "@/context/auth";
import { Boton } from "@/components/base/Boton";
import { Titulo } from "@/components/base/Titulo";
import { FormularioCampo, FormularioCampoFecha, CampoListaStrings, FormularioCampoExtendedSelect, FormularioCampoSelect } from "@/components/base/Entrada";
import { colors } from "@/constants/colors";
import { DescartarCambiosContext } from "@/context/DescartarCambios";

const tiposDiscapacidad = [
  {
    id: 1,
    nombre: "Discapacidad física o motora",
    tipo: "Física",
    descripcion:
      "Afecta la movilidad, coordinación o fuerza del cuerpo, dificultando el desplazamiento o manipulación de objetos.",
    icon: "walk-outline",
    bgColor: colors.lightblue,
    iconColor: colors.mediumblue,
  },
  {
    id: 2,
    nombre: "Discapacidad sensorial",
    tipo: "Sensorial",
    descripcion:
      "Involucra la pérdida o disminución de alguno de los sentidos, principalmente la vista o la audición.",
    icon: "eye-outline",
    bgColor: colors.lightpurple,
    iconColor: colors.mediumdarkgrey,
  },
  {
    id: 3,
    nombre: "Discapacidad intelectual",
    tipo: "Intelectual",
    descripcion:
      "Implica limitaciones significativas en el razonamiento, aprendizaje y adaptación a las demandas diarias.",
    icon: "bulb-outline",
    bgColor: colors.lightyellow,
    iconColor: colors.mediumyellow,
  },
  {
    id: 4,
    nombre: "Discapacidad psicosocial o mental",
    tipo: "Mental",
    descripcion:
      "Deriva de condiciones de salud mental que afectan el comportamiento, las emociones o la interacción social.",
    icon: "person-outline",
    bgColor: colors.lightred,
    iconColor: colors.mediumred,
  },
  {
    id: 5,
    nombre: "Discapacidad múltiple",
    tipo: "Múltiple",
    descripcion:
      "Combina dos o más tipos de discapacidad, generando necesidades de apoyo más complejas.",
    icon: "apps-outline",
    bgColor: colors.lightgreen,
    iconColor: colors.mediumgreen,
  },
];

const gradosAutismo = [
  {
    id: "1",
    titulo: "Grado 1 - Necesita ayuda",
    color: colors.primary,
  },
  {
    id: "2",
    titulo: "Grado 2 - Necesita ayuda notable",
    color: colors.primary,
  },
  {
    id: "3",
    titulo: "Grado 3 - Necesita ayuda muy notable",
    color: colors.primary,
  },
];

const opcionesDiscapacidad = [
  { id: "true", titulo: "Sí", color: colors.mediumgreen },
  { id: "false", titulo: "No", color: colors.mediumred },
  { id: "null", titulo: "Omitir", color: colors.mediumgrey },
];


export function PacienteFormulario(){

    const { authToken, refreshToken, createApi, setAuthToken, user } = useAuth();
    const router = useRouter();
    const navigation = useNavigation();
    const { paciente, id } = useLocalSearchParams();
    const modoEdicion = !!id; 
    const isProfesional = user?.role === "profesional";
  
    // ESTADOS
    const [nombre, setNombre] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
    const [edad, setEdad] = useState<number | null>(null);
    const [sexo, setSexo] = useState("");
    const [grado, setGrado] = useState("");
    const [condiciones_adicionales, setCondicionesAdicionales] = useState<string[]>([]);
    const [presenta_discapacidad, setPresentaDiscapacidad] = useState<boolean | null>(null);
    const valorSeleccionado = presenta_discapacidad === null 
    ? "null" 
    : presenta_discapacidad 
      ? "true" 
      : "false";
    const [tipo_de_discapacidad, setTipoDiscapacidad] = useState<number | null>(null);
    const [isLoadingBoton, setIsLoadingBoton] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const datosIniciales = useRef({
        nombre: "",
        edad: null,
        fechaNacimiento: null,
        sexo: "",
        grado: "",
        condiciones_adicionales: [],
        presenta_discapacidad: null,
        tipo_de_discapacidad: null
    });

    //FETCH: PACIENTE
    const fetchPaciente = async () =>{
      if(modoEdicion){
        if (!authToken || !refreshToken) return;
        const api = createApi(authToken, refreshToken, setAuthToken);
        console.log("[paciente-editar] Obteniendo información del paciente:", id);
        /*
        api
          .get("/paciente/" + id + "/")
          .then((res: any) => {
            const data = res.data;
            setNombre(data.nombre);
            setFechaNacimiento(data.fechaNacimiento);
            setEdad(data.edad);
            setSexo(data.sexo);
            setGrado(data.grado);
            setCondicionesAdicionales(data.condiciones_adicionales);
            setPresentaDiscapacidad(data.presenta_discapacidad);
            setTipoDiscapacidad(data.tipo_de_discapacidad)
            datosIniciales.current = {
                nombre: data.nombre,
                edad: data.edad,
                fechaNacimiento: data.fechaNacimiento,
                sexo: data.sexo,
                grado: data.grado,
                condiciones_adicionales: data.condiciones_adicionales,
                presenta_discapacidad: data.presenta_discapacidad,
                tipo_de_discapacidad: data.tipo_de_discapacidad
            };
            setIsLoading(false);
          })
          .catch((err: any) => {
            console.log("[paciente-editar] Error:", err); 
            setIsLoading(false);
          })
          */
          setIsLoading(false); //Borrar después
      }
      else{
        datosIniciales.current = {
            nombre: "",
            edad: null,
            fechaNacimiento: null,
            sexo: "",
            grado: "",
            condiciones_adicionales: [],
            presenta_discapacidad: null,
            tipo_de_discapacidad: null
        };
        setIsLoading(false);
      }
    }

    useEffect(() => {
        //fetchPaciente();
      }, [authToken, refreshToken]);
    

    const hayCambios = () => {
      return (
        nombre != datosIniciales.current.nombre ||
        edad != datosIniciales.current.edad ||
        fechaNacimiento != datosIniciales.current.fechaNacimiento ||
        sexo != datosIniciales.current.sexo ||
        grado != datosIniciales.current.grado ||
        condiciones_adicionales != datosIniciales.current.condiciones_adicionales ||
        presenta_discapacidad != datosIniciales.current.presenta_discapacidad ||
        tipo_de_discapacidad != datosIniciales.current.tipo_de_discapacidad
      )
    }

    //DESCARTAR CAMBIOS
    useEffect(() => {
      const beforeRemoveListener = navigation.addListener("beforeRemove", (e) => {
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
              onPress: () => {
                if(modoEdicion){router.push(`/cuidador/${id}-${paciente}`)}
                else{router.push(`/cuidador`)}
              },
            }
          ]
        );
      });
      return () => beforeRemoveListener();
    }, [navigation, nombre, edad, fechaNacimiento, sexo, grado, condiciones_adicionales, presenta_discapacidad, tipo_de_discapacidad]);
    
    //DESCARTAR CAMBIOS
    const handleDescartarCambios = () => {
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
              onPress: () => {
                if(modoEdicion){router.push(`/cuidador/${id}-${paciente}`)}
                else{router.push(`/cuidador`)}
              },
            }
          ]
        );
      } else {
        if(modoEdicion){router.push(`/cuidador/${id}-${paciente}`)}
        else{router.push(`/cuidador`)};
      }
    };
    
    // HANDLE: GUARDAR
    const handleGuardar = async () => {
      if (!nombre || !fechaNacimiento || !sexo || !edad ) {
        Alert.alert("Error", "Por favor, completa todos los campos marcados con *.");
        return;
      }
      setIsLoadingBoton(true);
      const payload = { 
        nombre,
        fechaNacimiento,
        edad,
        sexo,
        grado, //Talvez cambiar a number
        condiciones_adicionales,
        presenta_discapacidad,
        tipo_de_discapacidad
      }
      console.log("Guardando paciente:", payload);
      
      try {
        const api = createApi(authToken, refreshToken, setAuthToken);

        if (modoEdicion) {
          console.log("[editar-evento] Editando evento...");
          //const res = await api.put(`/paciente/${id}/`, payload, { timeout: 5000 });
          //console.log("[paciente-editar] Respuesta:", res.data);
        } else {
          console.log("[agregar-evento] Agregando evento...")
          //const res = await api.post(`/cuidador-plan-trabajo/`, payload, { timeout: 5000 });
          //console.log("[paciente-agregar] Respuesta:", res.data);
        }
        router.push("/cuidador?success=1");
        
        //AGREGAR PACIENTE ANTIGUO:
        //const res = await api.post("/cuidador-plan-trabajo/", { nombre, fechaNacimiento, sexo });
        //console.log("[Agregar paciente] Respuesta:", res.data);
        
      } catch(err) {
        if(modoEdicion){
          console.log("[paciente-editar] Error:", err);
          Alert.alert(
            "Error",
            "Hubo un problema al editar el paciente. Intenta nuevamente.",
            [{text: "OK"}]
          )
        } else {
          console.log("[paciente-agregar] Error:", err);
          Alert.alert(
            "Error",
            "Hubo un problema al agregar el paciente. Intenta nuevamente.",
            [{text: "OK"}]
          )
        }
      } finally {
        setIsLoadingBoton(false);
      }
    };
  
    return (
      <DescartarCambiosContext.Provider value={{ handleDescartarCambios }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Titulo>{modoEdicion? "Editar paciente" : "Agregar paciente"}</Titulo>
          <View className="gap-2">
            <FormularioCampo
              label={"Nombre"}
              value={nombre}
              onChangeText={setNombre}
              placeholder={"Ingresa un nombre"}
              maxLength={255}
              asterisco={true}
              tipo={2}
            />
            <FormularioCampoFecha
              fecha={fechaNacimiento}
              setFecha={setFechaNacimiento}
              label={"Fecha de nacimiento"}
              placeholder={"Ingresa fecha de nacimiento"}
              asterisco={true}
              tipo={2}
            />
            <FormularioCampo
              label="Edad"
              value={edad ? edad.toString() : ""}
              onChangeText={(text) => setEdad(Number(text))}
              placeholder="Ingresa edad"
              keyboardType="numeric"
              asterisco
              maxLength={3}
              tipo={2}
            />
            <FormularioCampo
              label={"Sexo"}
              value={sexo}
              onChangeText={setSexo}
              radioButton
              options={["Masculino", "Femenino", "Otro"]}
              asterisco={true}
              tipo={2}
            />
            <FormularioCampoSelect
              label="Grado de Autismo"
              placeholder="Selecciona un grado"
              items={gradosAutismo}
              selectedId={grado}
              onChange={setGrado}
              tipo={2}
            />
            {/* Condiciones adicionales */}
            <CampoListaStrings 
              label="Condiciones Adicionales"
              value={condiciones_adicionales}
              onChange={setCondicionesAdicionales}
              placeholder="Agrega una condición adicional"
              tipo={2}
            />

            {/* Presenta Discapacidad */}
            <FormularioCampoSelect
              label="Presenta Discapacidad"
              placeholder="Selecciona una opción"
              items={opcionesDiscapacidad}
              selectedId={valorSeleccionado}
              onChange={(id) => {
                if (id === "true") setPresentaDiscapacidad(true);
                else if (id === "false") setPresentaDiscapacidad(false);
                else setPresentaDiscapacidad(null);
              }}
              tipo={2}
            />

            {/* Tipo de discapacidad */}
            {presenta_discapacidad &&
              <FormularioCampoExtendedSelect
                label="Tipo de discapacidad"
                placeholder="Selecciona un tipo"
                items={tiposDiscapacidad.map((t) => ({
                  id: t.id,
                  titulo: t.nombre,
                  descripcion: t.descripcion,
                  icon: t.icon,
                  color: t.iconColor,   // color principal
                  bgColor: t.bgColor,   // fondo del icono
                  iconColor: t.iconColor,
                }))}
                selectedId={tipo_de_discapacidad}
                onChange={setTipoDiscapacidad}
                tipo={2}
              />
            }

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