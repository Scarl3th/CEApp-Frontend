import { useState } from "react";
import { usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useFonts, Poppins_500Medium, Poppins_800ExtraBold } from "@expo-google-fonts/poppins";
import { colors } from "@/constants/colors";
import { images } from "@/constants/images";
import { Titulo } from "@/components/base/Titulo";
import { Icons, IconType } from "@/constants/icons";
import { CustomModal } from "@/components/base/Modal";
import { TarjetaOpcion } from "@/components/base/Tarjeta";
import { BotonEsquinaSuperior } from "@/components/base/Boton";
import { PacienteItem } from "@/components/vistas/SelectorPaciente";
import { HeaderPaciente } from "@/components/layout/Header";
import { InformeItem } from "@/components/vistas/informes/Informes";
import { EspacioUsadoBarra } from "@/components/vistas/informes/Componentes";
import { TarjetaTresPuntos } from "@/components/base/Tarjeta";

//TUTORIALES
export interface Tutoriales {
  id: string;
  tutorial_selector_paciente: boolean;
  tutorial_inicio: boolean;
  tutorial_plan: boolean;
  tutorial_progreso: boolean;
  tutorial_bitacora: boolean;
  tutorial_chat: boolean;
  tutorial_informes: boolean;
  tutorial_calendario: boolean;
  tutorial_medicamentos: boolean;
}

//TUTORIALES
export function Tutoriales() {
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];
  //ESTADOS
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTutorialSelectorPaciente, setShowTutorialSelectorPaciente] = useState(false);
  const [showTutorialInicio, setShowTutorialInicio] = useState(false);
  const [showTutorialPlan, setShowTutorialPlan] = useState(false);
  const [showTutorialProgreso, setShowTutorialProgreso] = useState(false);
  const [showTutorialBitacora, setShowTutorialBitacora] = useState(false);
  const [showTutorialChat, setShowTutorialChat] = useState(false);
  const [showTutorialInformes, setShowTutorialInformes] = useState(false);
  const [showTutorialCalendario, setShowTutorialCalendario] = useState(false);
  const [showTutorialMedicamentos, setShowTutorialMedicamentos] = useState(false);
  //VISTA
  return (
    <View className="flex-1">
      <Titulo>
        Tutoriales
      </Titulo>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 55 }}
      >
        <TarjetaOpcion
          titulo={Icons["inicio"].label}
          subtitulo={"Descubre lo esencial para manejarte dentro de CEApp."}
          icono={<Ionicons name={Icons["inicio"].iconName} size={40} color={"white"}/>}
          iconoFondoColor={colors.primary}
          tarjetaColor={colors.lightgrey}
          onPress={() => {
            setShowTutorialInicio(true);
            setShowTutorial(true);
          }}
        />
        <TarjetaOpcion
          titulo={"Selector de paciente"}
          subtitulo={"Descubre cómo agregar y seleccionar a tus pacientes para comenzar a trabajar con ellos."}
          icono={<Ionicons name={Icons["paciente"].iconName} size={40} color={"white"}/>}
          iconoFondoColor={colors.primary}
          tarjetaColor={colors.lightgrey}
          onPress={() => {
            setShowTutorialSelectorPaciente(true);
            setShowTutorial(true);
          }}
        />
        <TarjetaOpcion
          titulo={Icons["plan"].label + " de trabajo"}
          subtitulo={"Descubre cómo gestionar tus objetivos generales y objetivos específicos."}
          icono={<Ionicons name={Icons["plan"].iconName} size={40} color={"white"}/>}
          iconoFondoColor={colors.primary}
          tarjetaColor={colors.lightgrey}
          onPress={() => {
            setShowTutorialPlan(true);
            setShowTutorial(true);
          }}
        />
        <TarjetaOpcion
          titulo={Icons["progreso"].label}
          subtitulo={"Descubre cómo revisar el progreso de tu plan de trabajo."}
          icono={<Ionicons name={Icons["progreso"].iconName} size={40} color={"white"}/>}
          iconoFondoColor={colors.primary}
          tarjetaColor={colors.lightgrey}
          onPress={() => {
            setShowTutorialProgreso(true);
            setShowTutorial(true);
          }}
        />
        <TarjetaOpcion
          titulo={Icons["bitacora"].label}
          subtitulo={"Descubre cómo registrar y revisar tus sesiones terapéuticas."}
          icono={<Ionicons name={Icons["bitacora"].iconName} size={40} color={"white"}/>}
          iconoFondoColor={colors.primary}
          tarjetaColor={colors.lightgrey}
          onPress={() => {
            setShowTutorialBitacora(true);
            setShowTutorial(true);
          }}
        />
        {rol === "profesional" && (
          <TarjetaOpcion
            titulo={Icons["chat"].label}
            subtitulo={"Descubre cómo comunicarte con otros profesionales."}
            icono={<Ionicons name={Icons["chat"].iconName} size={40} color={"white"}/>}
            iconoFondoColor={colors.primary}
            tarjetaColor={colors.lightgrey}
            onPress={() => {
              setShowTutorialChat(true);
              setShowTutorial(true);
            }}
          />
        )}
        <TarjetaOpcion
          titulo={Icons["informes"].label}
          subtitulo={"Descubre cómo subir, ver y descargar informes centralizadamente."}
          icono={<Ionicons name={Icons["informes"].iconName} size={40} color={"white"}/>}
          iconoFondoColor={colors.primary}
          tarjetaColor={colors.lightgrey}
          onPress={() => {
            setShowTutorialInformes(true);
            setShowTutorial(true);
          }}
        />
        <TarjetaOpcion
          titulo={Icons["calendario"].label}
          subtitulo={"Descubre cómo revisar y registrar eventos en tu calendario personal."}
          icono={<Ionicons name={Icons["calendario"].iconName} size={40} color={"white"}/>}
          iconoFondoColor={colors.primary}
          tarjetaColor={colors.lightgrey}
          onPress={() => {
            setShowTutorialCalendario(true);
            setShowTutorial(true);
          }}
        />
        <TarjetaOpcion
          titulo={Icons["medicamentos"].label}
          subtitulo={"Descubre cómo revisar y registrar los medicamentos del paciente."}
          icono={<Ionicons name={Icons["medicamentos"].iconName} size={40} color={"white"}/>}
          iconoFondoColor={colors.primary}
          tarjetaColor={colors.lightgrey}
          onPress={() => {
            setShowTutorialMedicamentos(true);
            setShowTutorial(true);
          }}
        />
      </ScrollView>
      {/* TUTORIAL */}
      <ModalTutorial
        tipo={"tutorial"}
        visible={showTutorial}
        onClose={() => {
          setShowTutorial(false);
          setShowTutorialSelectorPaciente(false);
          setShowTutorialInicio(false);
          setShowTutorialPlan(false);
          setShowTutorialProgreso(false);
          setShowTutorialBitacora(false);
          setShowTutorialChat(false);
          setShowTutorialInformes(false);
          setShowTutorialCalendario(false);
          setShowTutorialMedicamentos(false);
        }}
        selectorPaciente={showTutorialSelectorPaciente}
        inicio={showTutorialInicio}
        plan={showTutorialPlan}
        progreso={showTutorialProgreso}
        bitacora={showTutorialBitacora}
        chat={showTutorialChat}
        informes={showTutorialInformes}
        calendario={showTutorialCalendario}
        medicamentos={showTutorialMedicamentos}
        rol={rol}
      />
    </View>
  );
}

//BOTÓN: TUTORIAL
export function BotonTutorial() {
  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];
  const paciente = ruta_partes[1];
  const selectorPaciente = ruta_partes.length == 1;
  const inicio = ruta_partes.length == 2;
  const plan = ruta_partes.length == 3 && ruta_partes[2] == "plan";
  const bitacora = ruta_partes.length == 3 && ruta_partes[2] == "bitacora";
  const chat = ruta_partes.length == 3 && ruta_partes[2] == "chat";
  const progreso = ruta_partes.length == 4 && ruta_partes[3] == "progreso";
  const informes = ruta_partes.length == 3 && ruta_partes[2] == "informes";
  const calendario = ruta_partes.length == 3 && ruta_partes[2] == "calendario";
  const medicamentos = ruta_partes.length == 3 && ruta_partes[2] == "medicamentos";
  //ESTADOS
  const [showTutorial, setShowTutorial] = useState(false);
  //VISTA
  return (
    <>
      {(selectorPaciente || inicio || plan || bitacora || chat || progreso || informes || calendario || medicamentos) && (
        <BotonEsquinaSuperior
          onPress={() => setShowTutorial(true)}
          fondoBoton={colors.primary}
          iconName={Icons["tutoriales"].iconName}
          tipo={"derecha"}
          horizontal={selectorPaciente ? 16 : 60}
        />
      )}
      <ModalTutorial
        tipo={"tutorial"}
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
        selectorPaciente={selectorPaciente}
        inicio={inicio}
        plan={plan}
        bitacora={bitacora}
        chat={chat}
        progreso={progreso}
        informes={informes}
        calendario={calendario}
        medicamentos={medicamentos}
        rol={rol}
      />
    </>
  )
}

//MODAL: TUTORIAL
interface ModalTutorialProps {
  tipo: "tutorial";
  visible: boolean;
  onClose: () => void;
  selectorPaciente?: boolean;
  inicio?: boolean;
  plan?: boolean,
  bitacora?: boolean;
  chat?: boolean;
  progreso?: boolean;
  informes?: boolean;
  calendario?: boolean;
  medicamentos?: boolean;
  rol: string;
}
export function ModalTutorial({
  tipo,
  visible,
  onClose,
  selectorPaciente = false,
  inicio = false,
  plan = false,
  bitacora = false,
  chat = false,
  progreso = false,
  informes = false,
  calendario = false,
  medicamentos = false,
  rol,
}: ModalTutorialProps) {
  return (
    <CustomModal
      tipo={tipo}
      visible={visible}
      onClose={onClose}
      onCloseOmitir={true}
      //ACÁ PUEDES CAMBIAR LA ALTURA DEL MODAL DE CADA VISTA
      tipoTutorialHeight={
        0.8
      }
      padding={"p-0"}
    >
      {selectorPaciente ? (
        <TutorialSelectorPaciente onClose={onClose} rol={rol}/>
      ) : inicio ? (
        <TutorialInicio onClose={onClose} rol={rol}/>
      ) : plan ? (
        <TutorialPlan onClose={onClose} rol={rol}/>
      ) : bitacora ? (
        <TutorialBitacora onClose={onClose} rol={rol}/>
      ) : chat ? (
        <TutorialChat onClose={onClose} rol={rol}/>
      ) : progreso ? (
        <TutorialProgreso onClose={onClose} rol={rol}/>
      ) : informes ? (
        <TutorialInformes onClose={onClose} rol={rol}/>
      ) : calendario ? (
        <TutorialCalendario onClose={onClose} rol={rol}/>
      ) : medicamentos ? (
        <TutorialMedicamentos onClose={onClose} rol={rol}/>
      ) : null}
    </CustomModal>
  )
}

//FOOTER: TUTORIAL
interface FooterTutorialProps {
  paso: number;
  setPaso: React.Dispatch<React.SetStateAction<number>>; 
  pasosTotales: number;
  onClose: () => void;
}
function FooterTutorial({
  paso,
  setPaso,
  pasosTotales,
  onClose,
}: FooterTutorialProps) {
  return (
    <View className="mt-8 px-4 w-full">
      {/* PUNTOS */}
      <View className="flex-row justify-center space-x-2 mb-4">
        {Array.from({ length: pasosTotales }).map((_, index) => (
          <View
            key={index}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: index === paso ? colors.secondary : colors.mediumlightgrey,
            }}
          />
        ))}
      </View>
      {/* BOTONES */}
      <View className="flex-row w-full gap-3">
        {/* BOTÓN ATRÁS */}
        {paso > 0 && (
          <Pressable onPress={() => setPaso(prev => prev - 1)} className="flex-1">
            {({ pressed }) => (
              <View
                className="w-full rounded-lg px-2 py-3"
                style={{
                  backgroundColor: pressed ? colors.mediumlightgrey : colors.white,
                  borderWidth: 1,
                  borderColor: pressed ? colors.mediumlightgrey : colors.secondary,
                }}
              >
                <Text className="text-secondary font-bold text-base text-center">
                  Atrás
                </Text>
              </View>
            )}
          </Pressable>
        )}
        {/* BOTÓN SIGUIENTE */}
        <Pressable
          onPress={() => {
            if (paso === pasosTotales - 1) {
              onClose();
            } else {
              setPaso(prev => prev + 1);
            }
          }}
          className="flex-1"
        >
          {({ pressed }) => (
            <View
              className="w-full rounded-lg px-2 py-3"
              style={{
                backgroundColor: pressed ? colors.mediumlightgrey : colors.secondary,
                borderWidth: 1,
                borderColor: pressed ? colors.mediumlightgrey : colors.secondary,
              }}
            >
              <Text className="text-white font-bold text-base text-center">
                {paso === 0
                  ? "Iniciar tutorial"
                  : paso === pasosTotales - 1
                  ? "Finalizar tutorial"
                  : "Siguiente"}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

//TEXTO: TUTORIAL
interface TextoTutorialProps {
  children: React.ReactNode;
}
export function TextoTutorial({
  children,
}: TextoTutorialProps) {
  return (
    <Text className="text-mediumdarkgrey text-lg font-medium leading-relaxed">
      {children}
    </Text>
  )
}

//BOTÓN: AGREGAR
interface BotonAgregarTutorialProps {
  iconoNombre?: IconType;
  iconoTamano?: number;
}
export function BotonAgregarTutorial({
  iconoNombre = Icons["agregar"].iconName,
  iconoTamano = 85,
}: BotonAgregarTutorialProps) {
  return (
    <View
      className="rounded-full my-4 justify-center items-center"
      style={{
        width: 80,
        height: 80,
        backgroundColor: colors.secondary,
        elevation: 5,
      }}
    >
      <Ionicons name={iconoNombre} size={iconoTamano} color={colors.white} />
    </View>
  );
}

//TUTORIAL: INICIO
interface TutorialInicioProps {
  onClose: () => void;
  rol: string;
}
export function TutorialInicio({
  onClose,
}: TutorialInicioProps) {
  const [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_800ExtraBold,
  });
  const [paso, setPaso] = useState(0);
  const pasosTotales = 6;
  return (
    <View className="flex-1 py-8 gap-4">
      {/* BANNER */}
      <View
        className={`flex-1 w-full ${paso == 0 || paso == 5 ? "items-end" : "items-center"} justify-center`}
        style={{
          backgroundColor: colors.lightblue,
          minHeight: 200,
          maxHeight: 200,
          position: paso == 0 || paso == 5 ? "relative" : undefined, 
        }}
        pointerEvents="none"
      >
        {paso == 0 || paso == 5 ? (
          <>
            <Image
              source={images.CEO}
              style={{
                width: 180,
                height: 180,
                resizeMode: "contain",
                position: "absolute",
                top: 30,
                left: 16,
              }}
            />
            <View className="flex-1 px-4">
              <View className="flex-1 flex-column justify-center">
                <Text
                  className="text-primary font-bold text-xl text-right w-full"
                  style={{
                    includeFontPadding: false,
                  }}
                >
                  ¡Bienvenid@ a
                </Text>
                <Text
                  className="text-primary text-4xl text-right w-full"
                  style={{
                    fontFamily: "Poppins_500Medium",
                    includeFontPadding: false,
                  }}
                >
                  <Text style={{ fontFamily: "Poppins_800ExtraBold" }}>
                    CEA
                  </Text>
                  pp!
                </Text>
              </View>
            </View>            
          </>
        ) : paso == 1 ? (
          <View
            className="bg-primary p-4 rounded-full"
            style={{
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3.5,
              elevation: 2,
            }}
          >
            <Ionicons name={Icons["inicio"].iconName} color={colors.white} size={80}/>
          </View>
        ) : paso == 2 ? (
          <View className="w-full">
            <HeaderPaciente nombre={"Santiago González"}/>
          </View>
        ) : paso == 3 ? (
          <View
            className="bg-primary p-4 rounded-full"
            style={{
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3.5,
              elevation: 2,
            }}
          >
            <Ionicons name={Icons["menu"].iconName} color={colors.white} size={80}/>
          </View>
        ) : paso == 4 ? (
          <View
            className="bg-primary p-4 rounded-full"
            style={{
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3.5,
              elevation: 2,
            }}
          >
            <Ionicons name={Icons["tutoriales"].iconName} color={colors.white} size={80}/>
          </View>
        ) : null}
      </View>
      {/* CUERPO */}
      <View className="flex-1 p-4 gap-4 justify-start">
        {/* TÍTULO */}
        <Titulo>
          {paso == 0 ? "¡Bienvenid@! 👋" :
          paso == 1 ? "Inicio" :
          paso == 2 ? "Paciente" :
          paso == 3 ? "Navegación" :
          paso == 4 ? "Tutoriales" :
          paso == 5 ? "¡Tutorial completado! 👏" :
          ""}
        </Titulo>
        {/* TEXTO */}
        <View className="px-4 gap-4 flex-column">
          {paso == 0 ? (
            <>
              <TextoTutorial>
                Soy <Text className="font-bold text-primary">CEO</Text>, tu guía dentro de CEApp.
              </TextoTutorial>
              <TextoTutorial>
                <Text className="font-bold text-primary">CEApp</Text> es una plataforma diseñada para potenciar el trabajo colaborativo en el cuidado de personas con autismo.
              </TextoTutorial>
              <TextoTutorial>
                Este es tu <Text className="font-bold text-primary">inicio</Text>, el punto de partida donde tendrás todo a mano.
              </TextoTutorial>
            </>
          ) : paso == 1 ? (
            <>
              <TextoTutorial>En la pantalla de inicio encontrarás:</TextoTutorial>
              <TextoTutorial>• Atajos a acciones y herramientas importantes.</TextoTutorial>
              <TextoTutorial>• Métricas sobre el progreso de tu paciente.</TextoTutorial>
            </>
          ) : paso == 2 ? (
            <>
              <TextoTutorial>Debajo del encabezado, verás una barra roja que muestra el paciente cuyo plan de trabajo estás revisando.</TextoTutorial>
              <TextoTutorial>Puedes presionar la barra roja para:</TextoTutorial>
              <TextoTutorial>• Ver información del paciente.</TextoTutorial>
              <TextoTutorial>• Cambiar de paciente.</TextoTutorial>
            </>
          ) : paso == 3 ? (
            <>
              <TextoTutorial>
                En cualquier momento, puedes navegar entre pantallas presionando el botón <Ionicons name={Icons["menu"].iconName} size={16}/>, ubicado en la esquina superior izquierda.
              </TextoTutorial>
            </>
          ) : paso == 4 ? (
            <>
              <TextoTutorial>
                Incluimos tutoriales para la mayoría de nuestras herramientas.
              </TextoTutorial>
              <TextoTutorial>
                En cualquier momento, puedes volver a revisar el tutorial presionando el botón <Ionicons name={Icons["tutoriales"].iconName} size={16}/>, ubicado en la esquina superior derecha.
              </TextoTutorial>
            </>
          ) : paso == 5 ? (
            <>
              <TextoTutorial>
                Explora CEApp a tu ritmo y prueba todas sus herramientas.
              </TextoTutorial>
            </>
          ) : null}
        </View>
      </View>
      {/* FOOTER */}
      <FooterTutorial
        paso={paso}
        setPaso={setPaso}
        pasosTotales={pasosTotales}
        onClose={onClose}
      />
    </View>
  );
}

//TUTORIAL: CALENDARIO
interface TutorialCalendarioProps {
  onClose: () => void;
  rol: string;
}
export function TutorialCalendario({
  onClose,
  rol,
}: TutorialCalendarioProps) {
  const [paso, setPaso] = useState(0);
  const pasosTotales = 4;
  return (
    <View className="flex-1 py-8 gap-4">
      {/* BANNER */}
      <View
        className={`flex-1 w-full items-center justify-center`}
        style={{
          backgroundColor: colors.lightblue,
          minHeight: 200,
          maxHeight: 200,
        }}
        pointerEvents="none"
      >
        {paso == 0 ? (
          <>
            <View
              className="bg-primary p-4 rounded-full"
              style={{
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3.5,
                elevation: 2,
              }}
            >
              <Ionicons name={Icons["calendario"].iconName} color={colors.white} size={80}/>
            </View>            
          </>
        ) : paso == 3 ? (
          <View
            className="bg-primary p-4 rounded-full"
            style={{
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3.5,
              elevation: 2,
            }}
          >
            <Ionicons name={Icons["agregar"].iconName} color={colors.white} size={80}/>
          </View>
        ) : paso == 1 ? (
          <View className="flex-1 p-4 items-center justify-center">
            <TarjetaTresPuntos
              titulo="Sesión de terapia"
              iconoFondoColor={colors.primary}
              subtituloAlternativo={
                <View className="gap-1">
                  <Text className="text-mediumdarkgrey text-sm">
                      {"04:00 PM - 05:00 PM"}
                    </Text>
                    <View className="gap-1 flex-row items-center">
                      <Ionicons name={Icons["usuario"].iconName} size={15} color={colors.mediumgrey}/>
                      <Text className="text-mediumdarkgrey text-sm">
                        {"María Pérez"}
                      </Text>
                    </View>
                    <View className="gap-1 flex-row items-center">
                      <Ionicons name={Icons["paciente"].iconName} size={15} color={colors.mediumgrey}/>
                      <Text className="text-mediumdarkgrey text-sm">
                        {"Santiago González"}
                      </Text>
                    </View>
                </View>
              }
            />
          </View>
        ) : paso == 2 ? (
          <View
            className="bg-primary p-4 rounded-full"
            style={{
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3.5,
              elevation: 2,
            }}
          >
            <Ionicons name={Icons["tresPuntos"].iconName} color={colors.white} size={80}/>
          </View>
        ) : null}
      </View>
      {/* CUERPO */}
      <View className="flex-1 p-4 justify-start">
        {/* TÍTULO */}
        <Titulo>
          {paso == 0 ? "Tu calendario" :
          paso == 3 ? "Crear eventos" :
          paso == 1 ? "Ver eventos" :
          paso == 2 ? "Opciones" :
          ""}
        </Titulo>
        {/* TEXTO */}
        <View className="px-4 gap-4 flex-column">
          {paso == 0 ? (
            <>
              <TextoTutorial>
                Esta es tu pantalla de <Text className="font-bold text-primary">calendario</Text>, donde vas a poder visualizar y gestionar tus eventos.
              </TextoTutorial>
            </>
          ) : paso == 3 ? (
            <>
              <TextoTutorial>Puedes crear eventos presionando el botón <Ionicons name={Icons["agregar"].iconName} size={16}/>, ubicado en la esquina inferior derecha.</TextoTutorial>
              <TextoTutorial>Una vez listo, presiona el botón <Text className="font-bold text-secondary">guardar</Text>.</TextoTutorial>
            </>
          ) : paso == 1 ? (
            <>
              <TextoTutorial>Puedes ver una lista de los distintos eventos dentro de tu calendario, seleccionando entre las distintas fechas del calendario.</TextoTutorial>
            </>
          ) : paso == 2 ? (
            <>
              <TextoTutorial>
                Puedes presionar el botón <Ionicons name={Icons["tresPuntos"].iconName} size={16}/> ubicado a la derecha de cada evento para:
              </TextoTutorial>
              <TextoTutorial>• Editar el evento.</TextoTutorial>
              <TextoTutorial>• Eliminar el evento.</TextoTutorial>
            </>
          ) : null}
        </View>
      </View>
      {/* FOOTER */}
      <FooterTutorial
        paso={paso}
        setPaso={setPaso}
        pasosTotales={pasosTotales}
        onClose={onClose}
      />
    </View>
  );
}

//TUTORIAL: INFORMES
interface TutorialInformesProps {
  onClose: () => void;
  rol: string;
}
export function TutorialInformes({
  onClose,
}: TutorialInformesProps) {
  const [paso, setPaso] = useState(0);
  const pasosTotales = 5;
  return (
    <View className="flex-1 py-8 gap-4">
      {/* BANNER */}
      <View
        className={`flex-1 w-full items-center justify-center`}
        style={{
          backgroundColor: colors.lightblue,
          minHeight: 200,
          maxHeight: 200,
        }}
        pointerEvents="none"
      >
        {paso == 0 ? (
          <>
            <View
              className="bg-primary p-4 rounded-full"
              style={{
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3.5,
                elevation: 2,
              }}
            >
              <Ionicons name={Icons["informes"].iconName} color={colors.white} size={80}/>
            </View>            
          </>
        ) : paso == 3 ? (
          <View
            className="bg-primary p-4 rounded-full"
            style={{
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3.5,
              elevation: 2,
            }}
          >
            <Ionicons name={Icons["agregar"].iconName} color={colors.white} size={80}/>
          </View>
        ) : paso == 1 ? (
          <View className="flex-1 p-4 items-center justify-center">
            <InformeItem
              informe={{
                id: "1",
                titulo: "Evaluación de habilidades",
                autor_creacion: "María Pérez",
                fecha_creacion: "13/11/2025",
                tamano: "",
              }}
              onChange={() => {}}
              setToast={() => {}}
            />
          </View>
        ) : paso == 2 ? (
          <View
            className="bg-primary p-4 rounded-full"
            style={{
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3.5,
              elevation: 2,
            }}
          >
            <Ionicons name={Icons["tresPuntos"].iconName} color={colors.white} size={80}/>
          </View>
        ) : paso == 4 ? (
          <View
            className="bg-light p-4 rounded-lg"
            style={{
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3.5,
              elevation: 2,
            }}
          >
            <EspacioUsadoBarra
              espacioUsado={250 * 1024 * 1024}
              espacioMaximo={500 * 1024 * 1024}
            />
          </View>
        ) : null}
      </View>
      {/* CUERPO */}
      <View className="flex-1 p-4 justify-start">
        {/* TÍTULO */}
        <Titulo>
          {paso == 0 ? "Informes" :
          paso == 3 ? "Subir informes" :
          paso == 1 ? "Ver informes" :
          paso == 2 ? "Opciones" :
          paso == 4 ? "Espacio" :
          ""}
        </Titulo>
        {/* TEXTO */}
        <View className="px-4 gap-4 flex-column">
          {paso == 0 ? (
            <>
              <TextoTutorial>
                Esta es tu pantalla de <Text className="font-bold text-primary">informes</Text>, donde vas a poder subir, ver y descargar informes que sean relevantes para el plan de trabajo de tu paciente.
              </TextoTutorial>
            </>
          ) : paso == 3 ? (
            <>
              <TextoTutorial>Puedes subir informes presionando el botón <Ionicons name={Icons["agregar"].iconName} size={16}/>, ubicado en la esquina inferior derecha.</TextoTutorial>
              <TextoTutorial>Podrás subir un archivo de tu dispositivo que cumpla con ciertos requerimientos.</TextoTutorial>
              <TextoTutorial>Una vez listo, presiona el botón <Text className="font-bold text-secondary">guardar</Text>.</TextoTutorial>
            </>
          ) : paso == 1 ? (
            <>
              <TextoTutorial>Puedes ver una lista de los distintos informes subidos dentro del plan de trabajo de tu paciente.</TextoTutorial>
            </>
          ) : paso == 2 ? (
            <>
              <TextoTutorial>
                Puedes presionar el botón <Ionicons name={Icons["tresPuntos"].iconName} size={16}/> ubicado a la derecha de cada informe para:
              </TextoTutorial>
              <TextoTutorial>• Ver el contenido del informe.</TextoTutorial>
              <TextoTutorial>• Descargar el informe.</TextoTutorial>
              <TextoTutorial>• Ver más información.</TextoTutorial>
            </>
          ) : paso == 4 ? (
            <>
              <TextoTutorial>
                Puedes subir hasta 500 MB de archivos en cada plan de trabajo.
              </TextoTutorial>
              <TextoTutorial>
                La barra de progreso indica tu espacio usado.
              </TextoTutorial>
            </>
          ) : null}
        </View>
      </View>
      {/* FOOTER */}
      <FooterTutorial
        paso={paso}
        setPaso={setPaso}
        pasosTotales={pasosTotales}
        onClose={onClose}
      />
    </View>
  );
}

//TUTORIAL: MEDICAMENTOS
interface TutorialMedicamentosProps {
  onClose: () => void;
  rol: string;
}
export function TutorialMedicamentos({
  onClose,
  rol,
}: TutorialMedicamentosProps) {
  const [paso, setPaso] = useState(0);
  const pasosTotales = rol === "cuidador" ? 5 : 2;
  const horarios = [
    new Date("2025-10-30T07:00:00"),
    new Date("2025-10-30T14:00:00"),
    new Date("2025-10-30T21:00:00"),
  ];

  return (
    <View className="flex-1 py-8 gap-4">
      {/* BANNER */}
      <View
        className={`flex-1 w-full items-center justify-center`}
        style={{
          backgroundColor: colors.lightblue,
          minHeight: 200,
          maxHeight: 200,
        }}
        pointerEvents="none"
      >
        {paso == 0 ? (
          <>
            <View
              className="bg-primary p-4 rounded-full"
              style={{
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3.5,
                elevation: 2,
              }}
            >
              <Ionicons name={Icons["medicamentos"].iconName} color={colors.white} size={80}/>
            </View>            
          </>
        ) : paso == 1 ? (
          <View className="flex-1 p-4 items-center justify-center">
            <TarjetaTresPuntos
              titulo="Paracetamol 500mg"
              iconoFondoColor={colors.primary}
              subtituloAlternativo={
                <View className="gap-1">
                  <View className="flex-row items-center gap-1">
                    <Ionicons
                      name="receipt-outline"
                      size={15}
                      color={colors.mediumgrey}
                    />
                    <Text className="text-mediumdarkgrey text-sm">1 tableta</Text>
                  </View>
                  <View className="flex-row flex-wrap gap-2 mt-1">
                    {horarios.map((hora, index) => (
                      <View
                        key={index}
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Text className="text-white text-sm">
                          {hora.toLocaleTimeString("es-CL", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              }
              tresPuntosContenido={
                rol === "cuidador" ? (
                  <View></View>
                ) : null
              }
            />
          </View>
        ) : paso == 3 ? (
          <View
            className="bg-primary p-4 rounded-full"
            style={{
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3.5,
              elevation: 2,
            }}
          >
            <Ionicons name={Icons["agregar"].iconName} color={colors.white} size={80}/>
          </View>
        ) : paso == 4 ? (
          <View className="flex-1 p-4 items-center justify-center">
            <TarjetaTresPuntos
              titulo="💊 Recordatorio de medicamento"
              iconoFondoColor={colors.primary}
              subtitulo={"En 15 minutos, Santiago González debe tomar Paracetamol 500mg (1 tableta)"}
            />
          </View>
        ) : paso == 2 ? (
          <View
            className="bg-primary p-4 rounded-full"
            style={{
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3.5,
              elevation: 2,
            }}
          >
            <Ionicons name={Icons["tresPuntos"].iconName} color={colors.white} size={80}/>
          </View>
        ) : null}
      </View>
      {/* CUERPO */}
      <View className="flex-1 p-4 justify-start">
        {/* TÍTULO */}
        <Titulo>
          {paso == 0 ? "Medicamentos" :
          paso == 1 ? "Ver medicamentos" :
          paso == 3 ? "Registrar medicamentos" :
          paso == 4 ? "Recordatorios" :
          paso == 2 ? "Opciones" :
          ""}
        </Titulo>
        {/* TEXTO */}
        <View className="px-4 gap-4 flex-column">
          {paso == 0 ? (
            <>
              <TextoTutorial>
                {`Esta es tu pantalla de `}<Text className="font-bold text-primary">medicamentos</Text>{`, donde vas a poder visualizar ${rol === "cuidador" ? "y registrar " : " "}los medicamentos de tu paciente`}.
              </TextoTutorial>
            </>
          ) : paso == 1 ? (
            <>
              <TextoTutorial>Puedes ver una lista de los distintos medicamentos de tu paciente, seleccionando entre los distintos días de la semana.</TextoTutorial>
            </>
          ) : rol === "cuidador" && paso == 3 ? (
            <>
              <TextoTutorial>Puedes registrar los medicamentos de tu paciente presionando el botón <Ionicons name={Icons["agregar"].iconName} size={16}/>, ubicado en la esquina inferior derecha.</TextoTutorial>
              <TextoTutorial>Una vez listo, presiona el botón <Text className="font-bold text-secondary">guardar</Text>.</TextoTutorial>
            </>
          ) : rol === "cuidador" && paso == 4 ? (
            <>
              <TextoTutorial>Al registrar medicamentos, también puedes configurar recordatorios para los medicamentos que necesites y elegir cuánto antes quieres recibir la notificación.</TextoTutorial>
            </>
          ) : rol === "cuidador" && paso == 2 ? (
            <>
              <TextoTutorial>Puedes presionar el botón <Ionicons name={Icons["tresPuntos"].iconName} size={16}/> ubicado a la derecha de cada medicamento para:</TextoTutorial>
              <TextoTutorial>• Editar el medicamento.</TextoTutorial>
              <TextoTutorial>• Eliminar el medicamento.</TextoTutorial>
            </>
          ) : null}
        </View>
      </View>
      {/* FOOTER */}
      <FooterTutorial
        paso={paso}
        setPaso={setPaso}
        pasosTotales={pasosTotales}
        onClose={onClose}
      />
    </View>
  );
}


//TUTORIAL: SELECTOR PACIENTE
interface TutorialSelectorPacienteProps {
  onClose: () => void;
  rol: string;
}
export function TutorialSelectorPaciente({
  onClose,
  rol,
}: TutorialSelectorPacienteProps) {
  const [paso, setPaso] = useState(0);
  const pasosTotales = 3;
  return (
    <View className="flex-1 py-8 gap-4">
      {/* BANNER */}
      <View
        className={`flex-1 w-full ${paso == 0 || paso == 5 ? "items-end" : "items-center"} justify-center`}
        style={{
          backgroundColor: colors.lightblue,
          minHeight: 200,
          maxHeight: 200,
          position: paso == 0 || paso == 5 ? "relative" : undefined, 
        }}
        pointerEvents="none"
      >
        {paso == 0 || paso == 5 ? (
          <>
            <Image
              source={images.CEO}
              style={{
                width: 180,
                height: 180,
                resizeMode: "contain",
                position: "absolute",
                top: 30,
                left: 16,
              }}
            />
            <View className="flex-1 px-4">
              <View className="flex-1 flex-column justify-center">
                <Text
                  className="text-primary font-bold text-xl text-right w-full"
                  style={{
                    includeFontPadding: false,
                  }}
                >
                  ¡Bienvenid@ a
                </Text>
                <Text
                  className="text-primary text-4xl text-right w-full"
                  style={{
                    fontFamily: "Poppins_500Medium",
                    includeFontPadding: false,
                  }}
                >
                  <Text style={{ fontFamily: "Poppins_800ExtraBold" }}>
                    CEA
                  </Text>
                  pp!
                </Text>
              </View>
            </View>            
          </>
        ) : paso == 1 ? (
          <View className="flex-1 w-full p-4 justify-center" style={{ height: 100 }}>
            <PacienteItem
              paciente={{
                id: "1",
                nombre: "Santiago González",
                cuidador: "María González",
              }}
              isProfesional={rol === "profesional"}
            />
          </View>
        ) : paso == 2 ? (
          <View
            className="bg-primary p-4 rounded-full"
            style={{
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3.5,
              elevation: 2,
            }}
          >
            <Ionicons name={Icons["agregar"].iconName} color={colors.white} size={80}/>
          </View>
        ) : null}
      </View>
      {/* CUERPO */}
      <View className="flex-1 p-4 gap-4 justify-start">
        {/* TÍTULO */}
        <Titulo>
          {paso == 0 ? "Selección de paciente" :
          paso == 1 ? "Ver pacientes" :
          paso == 2 ? "Agregar un paciente" :
          ""}
        </Titulo>
        {/* TEXTO */}
        <View className="px-4 gap-4 flex-column">
          {paso == 0 ? (
            <>
              <TextoTutorial>
                {`Esta es tu pantalla de `}<Text className="font-bold text-primary">selección de paciente</Text>{`, donde vas a poder visualizar ${rol === "cuidador" ? "y crear " : "y unirte a "}los planes de trabajo de tus pacientes.`}
              </TextoTutorial>
            </>
          ) : paso == 1 ? (
            <>
              <TextoTutorial>Puedes ver una lista de tus distintos pacientes.</TextoTutorial>
              <TextoTutorial>Presiona un paciente para acceder a su plan de trabajo.</TextoTutorial>
            </>
          ) : paso == 2 ? (
            <>
              <TextoTutorial>Puedes agregar un paciente presionando el botón <Ionicons name={Icons["agregar"].iconName} size={16}/>, ubicado en la esquina inferior derecha.</TextoTutorial>
              {rol === "cuidador" ? (
                <>
                  <TextoTutorial>Tendrás que ingresar información básica del paciente en los campos solicitados.</TextoTutorial>
                  <TextoTutorial>Una vez listo, presiona el botón <Text className="font-bold text-secondary">guardar</Text>.</TextoTutorial>
                </>
              ) : (
                <>
                  <TextoTutorial>Tendrás que solicitar un código al cuidador del paciente e ingresarlo en el campo provisto.</TextoTutorial>
                  <TextoTutorial>Una vez listo, presiona el botón <Text className="font-bold text-secondary">ingresar</Text>.</TextoTutorial>
                </>
              )}
            </>
          ) : null}
        </View>
      </View>
      {/* FOOTER */}
      <FooterTutorial
        paso={paso}
        setPaso={setPaso}
        pasosTotales={pasosTotales}
        onClose={onClose}
      />
    </View>
  );
}

//TUTORIAL: PLAN
interface TutorialPlanProps {
  onClose: () => void;
  rol: string;
}
export function TutorialPlan({
  onClose,
  rol,
}: TutorialPlanProps) {
  const [paso, setPaso] = useState(0);
  const pasosTotales = 3;
  return (
    <View className="flex-1 px-4 py-6">
      <View className="flex-1 items-center justify-start gap-4" pointerEvents="none">
        {/* TÍTULO */}
        <Titulo
          subtitulo={
            paso == 1 ? "Agregar un paciente" :
            paso == 2 ? "Seleccionar un paciente" :
            undefined
          }
          subtituloTamano={"base"}
        >
          {
            paso == 0 ? "Plan de trabajo" :
            paso > 0 ? `Paso ${paso}` :
            ""
          }
        </Titulo>
        {/* IMAGEN */}
        <View
          className="flex-1 w-full items-center justify-center"
          style={{
            backgroundColor: colors.primary,
            height: 160,
          }}
        >
          {paso == 0 ? (
            <View className="flex-row items-center bg-primary p-5 rounded-2xl shadow-md gap-4">
      <Ionicons
        name={Icons["plan"].iconName}
        size={70}
        color="white"
      />
      <View className="flex-1">
        <Text className="text-white text-xl font-semibold">
          Plan de trabajo
        </Text>
        <Text className="text-white/80">
          Revisa y gestiona tus objetivos semanales
        </Text>
      </View>
    </View>
          ) : paso == 1 ? (
            <BotonAgregarTutorial/>
          ) : paso == 2 ? (
            <View className="w-full" style={{ height: 80 }}>
              <PacienteItem
                paciente={{
                  id: "1",
                  nombre: "Santiago González",
                  cuidador: "María González",
                }}
                isProfesional={rol === "profesional"}
              />
            </View>
          ) : null}
        </View>
        {/* TEXTO */}
        <View className="flex-column gap-1">
          {paso == 0 ? (
            <>
              <TextoTutorial>
                ¡Bienvenid@ a CEApp!</TextoTutorial>
              <TextoTutorial>
                En esta pantalla podrás seleccionar un paciente o crear uno nuevo para comenzar a usar la aplicación.
              </TextoTutorial>
            </>
          ) : paso == 1 && rol == "cuidador" ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
            </>
          ) : paso == 1 && rol == "profesional" ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
            </>
          ) : paso == 2 ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
            </>
          ) : null}
        </View>
      </View>
      {/* FOOTER */}
      <FooterTutorial
        paso={paso}
        setPaso={setPaso}
        pasosTotales={pasosTotales}
        onClose={onClose}
      />
    </View>
  );
}

//TUTORIAL: BITÁCORA
interface TutorialBitacoraProps {
  onClose: () => void;
  rol: string;
}
export function TutorialBitacora({
  onClose,
  rol,
}: TutorialBitacoraProps) {
  const [paso, setPaso] = useState(0);
  const pasosTotales = 3;
  return (
    <View className="flex-1 px-4 py-6">
      <View className="flex-1 items-center justify-start gap-4" pointerEvents="none">
        {/* TÍTULO */}
        <Titulo
          subtitulo={
            paso == 1 ? "Agregar un paciente" :
            paso == 2 ? "Seleccionar un paciente" :
            undefined
          }
          subtituloTamano={"base"}
        >
          {
            paso == 0 ? "Bitácora" :
            paso > 0 ? `Paso ${paso}` :
            ""
          }
        </Titulo>
        {/* IMAGEN */}
        <View
          className="flex-1 w-full items-center justify-center"
          style={{
            height: 160,
          }}
        >
          {paso == 0 ? (
            <Image
              source={images.CEO}
              style={{
                width: Platform.OS === "web" ? 40 : 160,
                height: Platform.OS === "web" ? 40 : 160,
              }}
              resizeMode={"contain"}
            />
          ) : paso == 1 ? (
            <BotonAgregarTutorial/>
          ) : paso == 2 ? (
            <View className="w-full" style={{ height: 80 }}>
              <PacienteItem
                paciente={{
                  id: "1",
                  nombre: "Santiago González",
                  cuidador: "María González",
                }}
                isProfesional={rol === "profesional"}
              />
            </View>
          ) : null}
        </View>
        {/* TEXTO */}
        <View className="flex-column gap-1">
          {paso == 0 ? (
            <>
              <TextoTutorial>
                ¡Bienvenid@ a CEApp!</TextoTutorial>
              <TextoTutorial>
                En esta pantalla podrás seleccionar un paciente o crear uno nuevo para comenzar a usar la aplicación.
              </TextoTutorial>
            </>
          ) : paso == 1 && rol == "cuidador" ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
            </>
          ) : paso == 1 && rol == "profesional" ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
            </>
          ) : paso == 2 ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
            </>
          ) : null}
        </View>
      </View>
      {/* FOOTER */}
      <FooterTutorial
        paso={paso}
        setPaso={setPaso}
        pasosTotales={pasosTotales}
        onClose={onClose}
      />
    </View>
  );
}

//TUTORIAL: CHAT
interface TutorialChatProps {
  onClose: () => void;
  rol: string;
}
export function TutorialChat({
  onClose,
  rol,
}: TutorialChatProps) {
  const [paso, setPaso] = useState(0);
  const pasosTotales = 3;
  return (
    <View className="flex-1 px-4 py-6">
      <View className="flex-1 items-center justify-start gap-4" pointerEvents="none">
        {/* TÍTULO */}
        <Titulo
          subtitulo={
            paso == 1 ? "Agregar un paciente" :
            paso == 2 ? "Seleccionar un paciente" :
            undefined
          }
          subtituloTamano={"base"}
        >
          {
            paso == 0 ? "Chat" :
            paso > 0 ? `Paso ${paso}` :
            ""
          }
        </Titulo>
        {/* IMAGEN */}
        <View
          className="flex-1 w-full items-center justify-center"
          style={{
            height: 160,
          }}
        >
          {paso == 0 ? (
            <Image
              source={images.CEO}
              style={{
                width: Platform.OS === "web" ? 40 : 160,
                height: Platform.OS === "web" ? 40 : 160,
              }}
              resizeMode={"contain"}
            />
          ) : paso == 1 ? (
            <BotonAgregarTutorial/>
          ) : paso == 2 ? (
            <View className="w-full" style={{ height: 80 }}>
              <PacienteItem
                paciente={{
                  id: "1",
                  nombre: "Santiago González",
                  cuidador: "María González",
                }}
                isProfesional={rol === "profesional"}
              />
            </View>
          ) : null}
        </View>
        {/* TEXTO */}
        <View className="flex-column gap-1">
          {paso == 0 ? (
            <>
              <TextoTutorial>
                ¡Bienvenid@ a CEApp!</TextoTutorial>
              <TextoTutorial>
                En esta pantalla podrás seleccionar un paciente o crear uno nuevo para comenzar a usar la aplicación.
              </TextoTutorial>
            </>
          ) : paso == 1 && rol == "cuidador" ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
            </>
          ) : paso == 1 && rol == "profesional" ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
            </>
          ) : paso == 2 ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
            </>
          ) : null}
        </View>
      </View>
      {/* FOOTER */}
      <FooterTutorial
        paso={paso}
        setPaso={setPaso}
        pasosTotales={pasosTotales}
        onClose={onClose}
      />
    </View>
  );
}

//TUTORIAL: PROGRESO
interface TutorialProgresoProps {
  onClose: () => void;
  rol: string;
}
export function TutorialProgreso({
  onClose,
  rol,
}: TutorialProgresoProps) {
  const [paso, setPaso] = useState(0);
  const pasosTotales = 3;
  return (
    <View className="flex-1 px-4 py-6">
    </View>
  );
}