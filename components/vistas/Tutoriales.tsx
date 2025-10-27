import { useState } from "react";
import { usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Platform, Pressable, Text, View } from "react-native";
import { colors } from "@/constants/colors";
import { images } from "@/constants/images";
import { Titulo } from "@/components/base/Titulo";
import { Icons, IconType } from "@/constants/icons";
import { CustomModal } from "@/components/base/Modal";
import { BotonEsquinaSuperior } from "@/components/base/Boton";
import { PacienteItem } from "@/components/vistas/SelectorPaciente";

export function BotonTutorial() {

  const ruta = decodeURIComponent(usePathname());
  if (!ruta) return null;
  const ruta_partes = ruta.split("/").filter(Boolean);
  const rol = ruta_partes[0];
  const paciente = ruta_partes[1];

  const selectorPaciente = ruta_partes.length == 1;

  //ESTADOS
  const [showTutorial, setShowTutorial] = useState(false);

  //HANDLE: TUTORIALES
  const handleTutoriales = () => {
    console.log("[tutoriales] Viendo tutorial...");
    setShowTutorial(true);
  }

  //VISTA
  return (
    <>
      {selectorPaciente && (
        <BotonEsquinaSuperior
          onPress={handleTutoriales}
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
        rol={rol}
      />
    </>
  )
}

//MODAL
interface ModalTutorialProps {
  tipo: "tutorial";
  visible: boolean;
  onClose: () => void;
  selectorPaciente?: boolean;
  rol: string;
}
export function ModalTutorial({
  tipo,
  visible,
  onClose,
  selectorPaciente = false,
  rol,
}: ModalTutorialProps) {
  return (
    <CustomModal
      tipo={tipo}
      visible={visible}
      onClose={onClose}
      onCloseOmitir={true}
      tipoTutorialHeight={
        selectorPaciente ? 0.7 : //ACÁ PUEDES CAMBIAR LA ALTURA DEL MODAL DE CADA VISTA
        0.7
      }
    >
      {selectorPaciente ? (
        <SelectorPacienteTutorial onClose={onClose} rol={rol}/>
      ) : null}
    </CustomModal>
  )
}

//FOOTER
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

//TEXTO
interface TextoTutorialProps {
  children: React.ReactNode;
}
export function TextoTutorial({
  children,
}: TextoTutorialProps) {
  return (
    <Text className="text-black text-base text-left" style = {{textAlign: "justify" }}>
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

//SELECTOR PACIENTE
interface SelectorPacienteTutorialProps {
  onClose: () => void;
  rol: string;
}
export function SelectorPacienteTutorial({
  onClose,
  rol,
}: SelectorPacienteTutorialProps) {
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
            paso == 0 ? "Selector de paciente" :
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
