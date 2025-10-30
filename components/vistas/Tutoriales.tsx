import { useState } from "react";
import { usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { colors } from "@/constants/colors";
import { images } from "@/constants/images";
import { Titulo } from "@/components/base/Titulo";
import { Icons, IconType } from "@/constants/icons";
import { CustomModal } from "@/components/base/Modal";
import { TarjetaOpcion } from "@/components/base/Tarjeta";
import { BotonEsquinaSuperior } from "@/components/base/Boton";
import { PacienteItem } from "@/components/vistas/SelectorPaciente";

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
        selectorPaciente ? 0.7 :
        0.7
      }
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
    <View className="mt-8 w-full items-center">
      {/* PUNTOS */}
      <View className="flex-row space-x-2 absolute top-0 left-1/2 -translate-x-1/2">
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
      <View className="mt-8 w-full flex-row gap-3">
        {/* BOTÓN: ATRÁS */}
        {paso > 0 ? (
          <Pressable onPress={() => setPaso((prev) => prev - 1)} className="flex-1">
            {({ pressed }) => (
              <View
                className={"w-full rounded-lg px-2 py-3"}
                style = {{
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
        ) : null}
        {/* BOTÓN: SIGUIENTE */}
        <Pressable onPress={() => {
          if (paso === pasosTotales - 1) {
            onClose();
          } else {
            setPaso((prev) => prev + 1);
          }
        }} className="flex-1">
          {({ pressed }) => (
            <View
              className={"w-full rounded-lg px-2 py-3"}
              style = {{
                backgroundColor: pressed ? colors.mediumlightgrey : colors.secondary,
                borderWidth: 1,
                borderColor: pressed ? colors.mediumlightgrey : colors.secondary,
              }}
            >
              <Text className="text-white font-bold text-base text-center">
                {paso === 0 ? "Iniciar tutorial" : paso === pasosTotales - 1 ? "Finalizar tutorial" : "Siguiente"}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  )
}

//TEXTO: TUTORIAL
interface TextoTutorialProps {
  children: React.ReactNode;
}
export function TextoTutorial({
  children,
}: TextoTutorialProps) {
  return (
    <Text className="text-mediumdarkgrey text-base font-medium text-justify leading-relaxed">
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
        width: 100,
        height: 100,
        backgroundColor: colors.secondary,
        elevation: 5,
      }}
    >
      <Ionicons name={iconoNombre} size={iconoTamano} color={colors.white} />
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
    <View className="flex-1 px-4 py-6">
      {/* TÍTULO */}
        {paso == 0 ? (
          null
        ) : (
          <Titulo
            subtitulo={
              paso == 1 ? "Agregar un paciente" :
              paso == 2 ? "Seleccionar un paciente" :
              undefined
            }
            subtituloTamano={"lg"}
          >
            {
              paso == 0 ? "Selector de paciente" :
              paso > 0 ? `Paso ${paso}` :
              ""
            }
          </Titulo>
        )}
      <View className="flex-1 items-center justify-center gap-4" pointerEvents="none">
        {/* IMAGEN */}
        {paso == 0 ? (
          null
        ) : (
          <View className="flex-1 w-full items-center justify-center">
            {paso == 1 ? (
              <BotonAgregarTutorial/>
            ) : paso == 2 ? (
              <View className="w-full" style={{ height: 100 }}>
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
        )}
        {/* TEXTO */}
        <View className="flex-column gap-1">
          {paso == 0 ? (
            <>
              <TextoTutorial>
                ¡Bienvenid@ a CEApp!
              </TextoTutorial>
              <TextoTutorial>
                En esta pantalla podrás seleccionar un paciente o crear uno nuevo para comenzar a usar la aplicación.
              </TextoTutorial>
            </>
          ) : paso == 1 && rol == "cuidador" ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
              <TextoTutorial>
                • Completa los datos solicitados en el formulario.
              </TextoTutorial>
              <TextoTutorial>
                • Confirma para crear un nuevo paciente.
              </TextoTutorial>
            </>
          ) : paso == 1 && rol == "profesional" ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
              <TextoTutorial>
                • Completa los datos solicitados en el formulario.
              </TextoTutorial>
              <TextoTutorial>
                • Confirma para crear un nuevo paciente.
              </TextoTutorial>
            </>
          ) : paso == 2 ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
              <TextoTutorial>
                • Completa los datos solicitados en el formulario.
              </TextoTutorial>
              <TextoTutorial>
                • Confirma para crear un nuevo paciente.
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

//TUTORIAL: INICIO
interface TutorialInicioProps {
  onClose: () => void;
  rol: string;
}
export function TutorialInicio({
  onClose,
  rol,
}: TutorialInicioProps) {
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
            paso == 0 ? "Inicio" :
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
            <View className="w-full" style={{ height: 100 }}>
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
              <TextoTutorial>
                • Completa los datos solicitados en el formulario.
              </TextoTutorial>
              <TextoTutorial>
                • Confirma para crear un nuevo paciente.
              </TextoTutorial>
            </>
          ) : paso == 1 && rol == "profesional" ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
              <TextoTutorial>
                • Completa los datos solicitados en el formulario.
              </TextoTutorial>
              <TextoTutorial>
                • Confirma para crear un nuevo paciente.
              </TextoTutorial>
            </>
          ) : paso == 2 ? (
            <>
              <TextoTutorial>
                • Pulsa el botón <Text className="font-bold">+</Text> en la esquina inferior derecha.
              </TextoTutorial>
              <TextoTutorial>
                • Completa los datos solicitados en el formulario.
              </TextoTutorial>
              <TextoTutorial>
                • Confirma para crear un nuevo paciente.
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
            <View className="w-full" style={{ height: 100 }}>
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
            <View className="w-full" style={{ height: 100 }}>
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
            <View className="w-full" style={{ height: 100 }}>
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
            paso == 0 ? "Progreso" :
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
            <View className="w-full" style={{ height: 100 }}>
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

//TUTORIAL: INFORMES
interface TutorialInformesProps {
  onClose: () => void;
  rol: string;
}
export function TutorialInformes({
  onClose,
  rol,
}: TutorialInformesProps) {
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
            paso == 0 ? "Informes" :
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
            <View className="w-full" style={{ height: 100 }}>
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
            paso == 0 ? "Calendario" :
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
            <View className="w-full" style={{ height: 100 }}>
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
            paso == 0 ? "Medicamentos" :
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
            <View className="w-full" style={{ height: 100 }}>
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
