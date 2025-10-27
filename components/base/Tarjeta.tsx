import { CustomModal } from "@/components/base/Modal";
import { colors } from "@/constants/colors";
import { IconType, Icons } from "@/constants/icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

//TARJETA: EXPANDIBLE
interface TarjetaExpandibleProps {
  titulo: string;
  subtitulo?: string;
  icono?: React.ReactNode;
  iconoFondoColor?: string;
  expandidoDefecto?: boolean;
  expandidoContenido?: React.ReactNode;
  expandidoColor?: string;
}
export function TarjetaExpandible({
  titulo,
  subtitulo,
  icono,
  iconoFondoColor = colors.primary,
  expandidoDefecto = false,
  expandidoContenido,
  expandidoColor = colors.mediumdarkgrey,
}: TarjetaExpandibleProps) {
  const [expandido, setExpandido] = useState(expandidoDefecto);
  return (
    <View
      className="rounded-lg my-2 mx-0.5 overflow-hidden"
      style={{
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.5,
        elevation: 2,
      }}
    >
      <Pressable onPress={() => setExpandido(!expandido)}>
        {({ pressed }) => (
          <View
            className="flex-row items-center"
            style={{
              backgroundColor: pressed ? colors.lightmediumgrey : colors.lightgrey,
              
            }}
          >
            {icono && (
              <View
                className="p-2 flex items-center justify-center"
                style={{
                  backgroundColor: pressed ? colors.mediumgrey : iconoFondoColor,
                  alignSelf: "stretch",
                }}
              >
                {icono}
              </View>
            )}
            <View className="flex-1 p-4 flex-row items-center justify-between gap-2">
              <View className="flex-1 gap-1 flex-column items-left justify-center">
                <Text className="text-black text-lg font-bold">{titulo}</Text>
                {subtitulo && <Text className="text-mediumdarkgrey text-sm">{subtitulo}</Text>}
              </View>
              <View>
                <Ionicons
                  name={expandido ? Icons["arriba"].iconName : Icons["abajo"].iconName}
                  size={24}
                  color={expandidoColor}
                />
              </View>
            </View>
          </View>
        )}
      </Pressable>
      {expandido && expandidoContenido && (
        <>
          <View
            style={{
              height: 1,
              backgroundColor: colors.mediumgrey,
              opacity: 0.4,
            }}
          />
          <View
            className="p-4"
            style={{ backgroundColor: colors.lightgrey }}
          >
            {expandidoContenido}
          </View>
        </>
      )}
    </View>
  );
}

//TARJETA: MENÚ
interface TarjetaMenuProps {
  titulo: string;
  iconoNombre: IconType;
  onPress: () => void;
  fondoColor?: string;
  textoColor?: string;
  iconoColor?: string;
}
export function TarjetaMenu({
  titulo,
  iconoNombre,
  onPress,
  fondoColor = colors.lightgrey,
  textoColor = colors.black,
  iconoColor = colors.black,
}: TarjetaMenuProps) {
  return (
    <Pressable onPress={onPress} className="rounded-lg">
      {({ pressed }) => (
        <View
          className={"flex-row items-center rounded-lg px-6 py-2"}
          style={{
            backgroundColor: pressed ? colors.mediumlightgrey : fondoColor,
          }}
        >
          <View className="mr-3">
            <Ionicons name={iconoNombre} size={24} color={iconoColor} />
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-semibold"
              style={{ color: textoColor }}
            >
              {titulo}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

//TARJETA: PEQUEÑA
interface TarjetaPequeñaProps {
  titulo: string;
  subtitulo?: string[];
  icono?: React.ReactNode;
}
export function TarjetaPequeña({
  titulo,
  subtitulo,
  icono
}: TarjetaPequeñaProps) {
  return (
    <View className="bg-lightgrey rounded-lg px-2 py-1 mb-1 flex-row items-center">
      {icono && <View className="mr-2">{icono}</View>}
      <View className="flex-1">
        <Text className="text-black text-base font-bold">{titulo}</Text>
        {subtitulo && (
          <Text className="text-mediumdarkgrey">{subtitulo}</Text>
        )}
      </View>
    </View>
  );
}

//TARJETA: SELECTOR
interface TarjetaSelectorProps {
  titulo: string;
  subtitulo?: string[];
  onPress: () => void;
  icono?: React.ReactNode;
  iconoColor?: string;
  tarjetaColor?: string;
  tarjetaEstilo?: string;
  tituloEstilo?: string;
  subtituloEstilo?: string;
}
export function TarjetaSelector({
  titulo,
  subtitulo,
  onPress,
  icono,
  iconoColor = colors.mediumdarkgrey,
  tarjetaColor = colors.lightgrey,
  tarjetaEstilo = "p-4 my-2",
  tituloEstilo = "text-black text-lg font-bold",
  subtituloEstilo = "text-mediumdarkgrey text-base",
}: TarjetaSelectorProps) {
  return (
    <Pressable onPress={onPress} className="rounded-lg">
      {({ pressed }) => (
        <View
          className={`flex-row items-center rounded-lg ${tarjetaEstilo}`}
          style={{
            backgroundColor: pressed ? colors.mediumlightgrey : tarjetaColor,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3.5,
            elevation: 2,
          }}
        >
          {icono && <View className="mr-3">{icono}</View>}
          <View className="flex-1">
            <Text className={`${tituloEstilo}`}>{titulo}</Text>
            {subtitulo && (
              <Text className={`${subtituloEstilo}`}>
                {subtitulo}
              </Text>
            )}
          </View>
          <Ionicons name={Icons["derecha"].iconName} size={20} color={iconoColor} />
        </View>
      )}
    </Pressable>
  );
}

type MensajeCardProps = {
  titulo: string;
  mensajes: string[];
  onPressRecargar?: () => void;
};
export function MensajeCard({ titulo, mensajes }: MensajeCardProps) {
  return (
    <View
      className="rounded-lg shadow-lg p-4 mb-5 mt-2"
      style = {{ backgroundColor: colors.lightyellow }}
    >
      <Text className="text-lg font-bold text-black mb-3">{titulo}</Text>
      {mensajes.map((linea: string, index: number) => (
        <Text key={index} className="text-base text-mediumdarkgrey mb-2">
          • {linea}
        </Text>
      ))}
    </View>
  );
};

//TARJETA: TRES PUNTOS
interface TarjetaTresPuntosProps {
  tarjetaColor?: string;
  tresPuntosColor?: string;
  titulo: string;
  subtitulo?: string;
  subtituloAlternativo?: React.ReactNode;
  descripcion?: string;
  icono?: React.ReactNode;
  iconoFondoColor?: string;
  tipoModal?: "expandible";
  tresPuntosContenido?: React.ReactNode;
}
export function TarjetaTresPuntos({
  tarjetaColor = colors.lightgrey,
  tresPuntosColor = colors.black,
  titulo,
  subtitulo,
  subtituloAlternativo,
  descripcion,
  icono,
  iconoFondoColor = colors.primary,
  tipoModal = "expandible",
  tresPuntosContenido,
}: TarjetaTresPuntosProps) {
  const limiteCaracteres = 44;
  const [open, setOpen] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const necesitaVerMas = descripcion && (descripcion.length > limiteCaracteres || descripcion.split("\n").length > 1);
  return (
    <>
      <View
        className="rounded-lg my-2 mx-0.5 flex-row items-center"
        style={{
          backgroundColor: tarjetaColor,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3.5,
          elevation: 2,
        }}
      >
        {/* ICONO IZQUIERDO */}
        {icono ? (
          <View
            className="rounded-tl-lg rounded-bl-lg p-2 flex items-center justify-center"
            style={{
              backgroundColor: iconoFondoColor,
              alignSelf: "stretch",
            }}
          >
            {icono}
          </View>
        ) : (
          <View
            className="rounded-tl-lg rounded-bl-lg p-2 flex items-center justify-center"
            style={{
              backgroundColor: iconoFondoColor,
              alignSelf: "stretch",
            }}
          />
        )}
        {/* CONTENIDO PRINCIPAL */}
        <View className="flex-1 p-4 gap-1 flex-column items-left justify-center">
          {/* TÍTULO */}
          <Text className={`text-black font-bold text-lg`}>{titulo}</Text>
          {/* SUBTÍTULO */}
          {subtitulo && (
            <Text className="text-mediumdarkgrey text-sm">{subtitulo}</Text>
          )}
          {/* SUBTITULO ALTERNATIVO */}
          {subtituloAlternativo && (
            <>
              {subtituloAlternativo}
            </>
          )}
          {/* DESCRIPCIÓN */}
          {descripcion && (
            <View className="bg-light rounded-lg p-2 mt-1">
              <Text
                className="text-black text-base"
                numberOfLines={expandido ? undefined : 1}
                ellipsizeMode="tail"
              >
                {expandido ? descripcion : descripcion.length > limiteCaracteres ? descripcion.slice(0, limiteCaracteres) + "…" : descripcion}
              </Text>
              {necesitaVerMas && (
                <Text
                  onPress={() => setExpandido(!expandido)}
                  className="text-mediumdarkgrey text-sm text-right"
                  style={{
                    textDecorationLine: "underline"
                  }}
                >
                  {expandido ? "ver menos" : "ver más"}
                </Text>
              )}
            </View>
          )}
        </View>
        {/* TRES PUNTOS */}
        {tresPuntosContenido ? (
          <Pressable
            onPress={() => setOpen(true)}
            className="pr-2 pt-2"
          >
            {({ pressed: iconoPressed }) => (
              <View
                className="rounded-full p-2"
                style={{
                  backgroundColor: iconoPressed
                    ? colors.lightmediumgrey
                    : tarjetaColor,
                }}
              >
                <Ionicons
                  name={Icons["tresPuntos"].iconName}
                  size={24}
                  color={tresPuntosColor}
                />
              </View>
            )}
          </Pressable>
        ) : null}
      </View>
      {/* MODAL */}
      {tresPuntosContenido && (
        <CustomModal
          visible={open}
          onClose={() => setOpen(false)}
          tipo={tipoModal}
        >
          <View className="flex-1 p-2 gap-4 justify-center">
            <Text className="text-primary text-xl font-bold">Opciones</Text>
            <ScrollView>{tresPuntosContenido}</ScrollView>
          </View>
        </CustomModal>
      )}
    </>
  );
}


interface TarjetaOpcionProps {
  onPress?: () => void;
  tarjetaColor?: string;
  antetitulo?: string;
  titulo: string;
  tituloTamano?: string;
  subtitulo?: string;
  icono?: React.ReactNode;
  iconoFondoColor?: string;
  opcionIconoNombre?: IconType; 
  opcionIconoColor?: string; 
  opcionOnPress?: () => void;
}
export function TarjetaOpcion({
  onPress,
  tarjetaColor = colors.lightgrey,
  antetitulo,
  titulo,
  tituloTamano = "text-lg",
  subtitulo,
  icono,
  iconoFondoColor = colors.primary,
  opcionIconoNombre,
  opcionIconoColor = colors.black,
  opcionOnPress,
}: TarjetaOpcionProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-lg my-2 mx-0.5"
      style={{
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.5,
        elevation: 2,
      }}
    >
      {({ pressed }) => (
        <View
          className={"rounded-lg flex-row items-center"}
          style={{ backgroundColor: onPress && pressed ? colors.mediumlightgrey : tarjetaColor }}
        >
          {icono && (
            <View
              className="rounded-tl-lg rounded-bl-lg p-2 flex items-center justify-center"
              style={{
                backgroundColor: onPress && pressed ? colors.mediumgrey : iconoFondoColor,
                alignSelf: "stretch",
              }}
            >
              {icono}
            </View>
          )}
          <View className="flex-1 p-4 gap-1 flex-column items-left justify-center">
            {antetitulo && (<Text className={`text-mediumdarkgrey text-sm`}>{antetitulo}</Text>)}
            <Text className={`text-black font-bold ${tituloTamano}`}>{titulo}</Text>
            {subtitulo && (<Text className={`text-mediumdarkgrey text-sm`}>{subtitulo}</Text>)}
          </View>
          {opcionIconoNombre && (
            <Pressable onPress={opcionOnPress} className="mr-2">
              {({ pressed: iconoPressed }) => (
                <View
                  className="rounded-full p-2"
                  style={{ backgroundColor: pressed || iconoPressed ? colors.mediumlightgrey : tarjetaColor }}
                >
                  <Ionicons name={opcionIconoNombre} size={24} color={opcionIconoColor}/>
                </View>
              )}
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}
export function TarjetaInicio({
  onPress,
  titulo,
  subtitulo,
  icono,
  tarjetaColor = colors.lightgrey,
  fullWidth = false,
}: {
  onPress: () => void;
  titulo: string;
  subtitulo: string[];
  icono?: IconType;
  tarjetaColor?: string;
  fullWidth?: boolean;
}) {
  const subtituloes = Array.isArray(subtitulo) ? subtitulo : [subtitulo];
  const subtituloesTexto = subtituloes.join(" / ");
  return (
    <Pressable
      onPress={onPress}
      className="rounded-lg"
      style={{
        width: fullWidth ? "100%" : "48%",
      }}
    >
      {({ pressed }) => (
        <View
          className="rounded-lg p-4 my-2 mx-0.5 gap-1 items-center justify-start"
          style = {{
            backgroundColor: pressed ? colors.mediumlightgrey : tarjetaColor,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3.5,
            elevation: 2,
          }}
        >
          {icono && (
            <Ionicons
              name={icono}
              size={30}
              color={colors.black}
              style={{ alignSelf: "center", marginBottom: 4 }}
            />
          )}
          <Text className="text-base font-semibold text-center" style={{ color: colors.black }}
          >
            {titulo}
          </Text>
          <Text className="text-sm text-center" style={{ color: colors.mediumdarkgrey }}>
            {subtituloesTexto}
          </Text>
        </View>
      )}
    </Pressable>
  );
}