import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { colors } from "@/constants/colors";
import { IconType, Icons } from "@/constants/icons";
import { CustomModal } from "@/components/base/Modal";

//BOTÓN
interface BotonProps {
  onPress: () => void;
  isLoading?: boolean;
  isLoadingTexto?: string;
  texto: string;
  tipo?: number;
}
const estilosPorTipo: Record<number, { boton: string; botonColor: string, texto: string }> = {
  1: { //BOTÓN: INICIAR SESIÓN, REGISTRAR
    boton: "w-full rounded-lg py-4 my-2",
    botonColor: colors.primary,
    texto: "text-white text-center font-semibold text-base",
  },
  2: { //BOTÓN: REGISTRAR
    boton: "w-full rounded-lg border border-secondary py-4 my-2",
    botonColor: colors.white,
    texto: "text-secondary text-center font-semibold text-base",
  },
  3: { //BOTÓN: GUARDAR
    boton: "w-full rounded-lg py-4 my-2",
    botonColor: colors.secondary,
    texto: "text-white text-center font-bold text-base",
  },
};
export function Boton({
  onPress,
  isLoading = false,
  isLoadingTexto = "Cargando",
  texto,
  tipo = 1
}: BotonProps) {
  //EFECTO DE CARGA
  const estilos = estilosPorTipo[tipo] || estilosPorTipo[1];
  const [dots, setDots] = useState("");
  useEffect(() => {
    if (!isLoading) {
      setDots("");
      return;
    }
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, [isLoading]);
  //VISTA
  return (
    <Pressable
      onPress={isLoading ? undefined : onPress}
      disabled={isLoading}
    >
    {({ pressed }) => (
      <View
        className={`${estilos.boton} ${isLoading ? "opacity-50" : "opacity-100"}`}
        style={{ backgroundColor: pressed || isLoading ? colors.mediumlightgrey : estilos.botonColor }}
      >
        <Text className={estilos.texto}>
          {isLoading ? `${isLoadingTexto}${dots}` : texto}
        </Text>
      </View>
    )}
  </Pressable>
  );
}

//BOTÓN: ACCIÓN
interface BotonAccionProps {
  onPress: () => void;
  isLoading?: boolean;
  isLoadingTexto?: string;
  fondoColor: string;
  texto?: string;
  textoColor?: string;
  textoSizeVertical?: number;
  textoSizeHorizontal?: number;
  iconoNombre: IconType;
  iconoColor: string;
  small?: boolean;
  tipo?: string;
}
export function BotonAccion({
  onPress,
  isLoading = false,
  isLoadingTexto = "Cargando",
  fondoColor,
  texto,
  textoColor = colors.black,
  textoSizeVertical = 10,
  textoSizeHorizontal = 14,
  iconoNombre,
  iconoColor,
  small = false,
  tipo = "vertical",
}: BotonAccionProps) {
  //EFECTO DE CARGA
  const [dots, setDots] = useState("");
  useEffect(() => {
    if (!isLoading) {
      setDots("");
      return;
    }
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, [isLoading]);
  const contenido = isLoading ? `${isLoadingTexto}${dots}` : texto;
  if (tipo === "vertical") {
    //VISTA: TIPO VERTICAL
    return (
      <Pressable
        onPress={isLoading ? undefined : onPress}
        className={`flex-row items-center justify-center ${small ? "" : "flex-1"}`}
        style={[
          { position: "relative", minHeight: 30 },
          small
            ? { width: "25%", flexGrow: 0, flexShrink: 0 }
            : { flexGrow: 1, flexShrink: 1, flexBasis: 0 },
        ]}
        disabled={isLoading}
      >
        {({ pressed }) => (
          <View
            className="flex-1 p-2 rounded-lg flex-columns items-center justify-center"
            style={{ backgroundColor: pressed || isLoading ? colors.mediumgrey : fondoColor }}
          >
            <Ionicons name={iconoNombre} size={24} color={iconoColor} />
            {contenido && (
              <Text
                className="text-center font-semibold ml-1"
                style={{ color: textoColor, fontSize: textoSizeVertical }}
              >
                {contenido}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    );
  } else {
    //VISTA: TIPO HORIZONTAL
    return (
      <Pressable
        onPress={isLoading ? undefined : onPress}
        className="flex-row items-center justify-center flex-1"
        disabled={isLoading}
      >
        {({ pressed }) => (
          <View
            className="flex-1 py-2 px-4 mb-2 rounded-lg flex-row items-center justify-left"
            style={{ backgroundColor: pressed || isLoading ? colors.mediumgrey : fondoColor }}
          >
            <Ionicons name={iconoNombre} size={24} color={iconoColor} />
            {contenido && (
              <Text
                className="text-base font-semibold ml-2"
                style={{ color: textoColor, fontSize: textoSizeHorizontal }}
              >
                {contenido}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    );
  }
}

//BOTÓN: ACCIÓN PEQUEÑO

interface BotonAccionIconProps {
  onPress: () => void;
  isLoading?: boolean;
  isLoadingTexto?: string;
  iconoNombre: keyof typeof Ionicons.glyphMap; // asegura nombres válidos de Ionicons
  iconoColor?: string;
  size?: number;
}

export function BotonAccionIcon({
  onPress,
  isLoading = false,
  isLoadingTexto = "",
  iconoNombre,
  iconoColor = "#000",
  size = 22,
}: BotonAccionIconProps) {

  // EFECTO DE CARGA
  const [dots, setDots] = useState("");
  useEffect(() => {
    if (!isLoading) {
      setDots("");
      return;
    }
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, [isLoading]);

  //VISTA
  return (
    <Pressable onPress={isLoading ? undefined : onPress} disabled={isLoading}>
      {({ pressed }) => (
        <View style={{ opacity: pressed || isLoading ? 0.5 : 1 }}>
          {isLoading ? (
            <ActivityIndicator size="small" color={iconoColor} />
          ) : (
            <Ionicons name={iconoNombre} size={size} color={iconoColor} />
          )}
          {isLoadingTexto ? (
            <Text style={{ fontSize: 10, textAlign: "center", color: iconoColor }}>
              {isLoadingTexto}
              {dots}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

//BOTÓN: AGREGAR
interface BotonAgregarProps {
  onPress: () => void;
  iconoNombre?: IconType;
  iconoTamano?: number;
}
export function BotonAgregar({
  onPress,
  iconoNombre = Icons["agregar"].iconName,
  iconoTamano = 40,
}: BotonAgregarProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full justify-center items-center shadow-lg"
      style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        elevation: 5,
        zIndex: 100,
      }}
    >
      {({ pressed }) => (
        <View
          className="w-full h-full rounded-full justify-center items-center"
          style={{ backgroundColor: pressed ? colors.mediumlightgrey : colors.secondary }}
        >
          <Ionicons name={iconoNombre} size={iconoTamano} color={colors.white} />
        </View>
      )}
    </Pressable>
  );
}

//BOTÓN: BUSCAR
export function BotonBuscar(
  { onPress }: { onPress: () => void }
) {
  return (
    <Pressable onPress={onPress} accessibilityLabel="Buscar contenido">
      {({ pressed }) => (
        <Ionicons name={Icons["busqueda_circulo"].iconName} size={40} color={pressed ? colors.mediumlightgrey : colors.mediumgrey}/>
      )}
    </Pressable>
  );
}

// BOTÓN: CHECKBOX
interface BotonCheckboxProps {
  label: string;
  value: string;
  checked: boolean;
  onToggle: (value: string) => void;
}
export function BotonCheckbox({
  label,
  value,
  checked,
  onToggle,
}: BotonCheckboxProps) {
  return (
    <Pressable
      onPress={() => onToggle(value)}
      className="flex-row items-center"
    >
      <View
        className="w-5 h-5 mr-2 rounded border justify-center items-center"
        style={{
          backgroundColor: checked ? colors.primary : colors.white,
          borderColor: checked ? colors.primary : colors.mediumgrey,
        }}
      >
        {checked && (
          <Ionicons name={Icons["checkmark"].iconName} size={14} color={"white"}/>
        )}
      </View>
      <Text style={{ color: colors.mediumdarkgrey }}>{label}</Text>
    </Pressable>
  );
}

//BOTÓN: DESVINCULAR
interface BotonDesvincularProps {
  onPress: () => void;
  texto?: string;
}
export function BotonDesvincular({
  onPress,
  texto = "Desvincularse",
}: BotonDesvincularProps) {
  return (
    <BotonAccion
      onPress={onPress}
      fondoColor={colors.lightred}
      texto={texto}
      textoSizeVertical={9}
      iconoNombre={Icons["desvincular"].iconName}
      iconoColor={colors.mediumred}
      tipo={"vertical"}
    />
  );
}

//BOTÓN: DESVINCULAR
interface BotonDeshabilitarProps {
  onPress: () => void;
  texto?: string;
  tipo?: string;
}
export function BotonDeshabilitar({
  onPress,
  texto = "Deshabilitar",
  tipo = "vertical,"
}: BotonDeshabilitarProps) {
  return (
    <BotonAccion
      onPress={onPress}
      fondoColor={colors.lightred}
      texto={texto}
      textoSizeVertical={9}
      iconoNombre={Icons["desvincular"].iconName}
      iconoColor={colors.mediumred}
      tipo={tipo}
    />
  );
}

//BOTÓN: DESCARGAR 
interface BotonDescargarProps {
  onPress: () => void;
  isLoading?: boolean;
  texto?: string;
  tipo?: string;
}
export function BotonDescargar({
  onPress,
  isLoading = false,
  texto = "Descargar",
  tipo = "vertical",
}: BotonDescargarProps) {
  return (
    <BotonAccion
      onPress={onPress}
      isLoading={isLoading}
      isLoadingTexto={"Descargando"}
      texto={texto}
      iconoNombre={Icons["descargar"].iconName}
      iconoColor={colors.mediumblue}
      fondoColor={colors.lightblue}
      tipo={tipo}
    />
  );
}

//BOTÓN: DETALLES
interface BotonDetallesProps {
  onOpen?: () => void;
  children: React.ReactNode;
  tipoModal?: "0" | "1" | "expandible";
  texto?: string;
  small?: boolean;
  tipo?: string;
}
export function BotonDetalles({
  onOpen,
  children,
  tipoModal = "1",
  texto = "Detalles",
  small = false,
  tipo = "vertical",
}: BotonDetallesProps) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
    if (onOpen) onOpen();
  };
  return (
    <>
      <BotonAccion
        onPress={handleOpen}
        fondoColor={colors.lightblue}
        texto={texto}
        iconoNombre={Icons["detalles"].iconName}
        iconoColor={colors.mediumblue}
        small={small}
        tipo={tipo}
      />
      <CustomModal visible={open} onClose={() => setOpen(false)} tipo={tipoModal}>
        <View className="flex-1 p-2 gap-4 justify-center">
          <Text className="text-primary text-xl font-bold">
            Detalles
          </Text>
          <ScrollView>
            {children}
          </ScrollView>
        </View>
      </CustomModal>
    </>
  );
}

//BOTÓN: DESCRIPCIÓN
interface BotonDescripcionProps {
  onOpen?: () => void;
  children: React.ReactNode;
  tipoModal?: "0" | "1" | "expandible";
  texto?: string;
  small?: boolean;
  tipo?: string;
}
export function BotonDescripcion({
  onOpen,
  children,
  tipoModal = "1",
  texto = "Detalles",
  small = false,
  tipo = "vertical",
}: BotonDescripcionProps) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
    if (onOpen) onOpen();
  };
  return (
    <>
      <BotonAccionIcon
        onPress={handleOpen}
        iconoNombre={Icons["detalles"].iconName}
        iconoColor={colors.mediumblue}
      />
      <CustomModal visible={open} onClose={() => setOpen(false)} tipo={tipoModal}>
        <View className="flex-1 p-2 gap-4 justify-center">
          <Text className="text-primary text-xl font-bold">
            Descripción
          </Text>
          <ScrollView>
            {children}
          </ScrollView>
        </View>
      </CustomModal>
    </>
  );
}

//BOTÓN: EDITAR
interface BotonEditarProps {
  onPress: () => void;
  texto?: string;
}
export function BotonEditar({
  onPress,
  texto = "Editar",
}: BotonEditarProps) {
  return (
    <BotonAccion
      onPress={onPress}
      fondoColor={colors.lightgreen}
      texto={texto}
      iconoNombre={Icons["editar"].iconName}
      iconoColor={colors.mediumgreen}
    />
  );
}

//BOTÓN: ELIMINAR 
interface BotonEliminarProps {
  onPress: () => void;
  texto?: string;
  tipo?: string;
}
export function BotonEliminar({
  onPress,
  texto = "Eliminar",
  tipo = "vertical",
}: BotonEliminarProps) {
  return (
    <BotonAccion
      onPress={onPress}
      fondoColor={colors.lightred}
      texto={texto}
      iconoNombre={Icons["eliminar"].iconName}
      iconoColor={colors.mediumred}
      tipo={tipo}
    />
  );
}

//BOTÓN: ESQUINA SUPERIOR
interface BotonEsquinaSuperiorProps {
  onPress: () => void;
  fondoBoton?: string;
  iconName: IconType;
  color?: string;
  size?: number;
  tipo: "izquierda" | "derecha";
}
export function BotonEsquinaSuperior({
  onPress,
  fondoBoton = colors.light,
  iconName,
  color = "white",
  size = 40,
  tipo,
}: BotonEsquinaSuperiorProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          position: "absolute",
          top: 10,
          left: tipo === "izquierda" ? 16 : undefined,
          right: tipo === "derecha" ? 16 : undefined,
          zIndex: 10,
        },
      ]}
    >
      {({ pressed }) => (
        <View
          className="rounded-full p-0.25"
          style={{ backgroundColor: pressed ? colors.mediumlightgrey : fondoBoton }}
        >
          <Ionicons name={iconName} size={size} color={color} />
        </View>
      )}
    </Pressable>
  );
}

//BOTÓN: PLAN
export function BotonPlan({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full justify-center items-center shadow-lg"
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        elevation: 5,
        zIndex: 100,
      }}
    >
      {({ pressed }) => (
        <View
          className="w-full h-full justify-center items-center rounded-full"
          style={{ backgroundColor: pressed ? colors.mediumlightgrey : colors.secondary }}
        >
          <Ionicons name={Icons["plan"].iconName} size={30} color={colors.white} />
        </View>
      )}
    </Pressable>
  );
}


//BOTÓN: PROGRESO
export function BotonProgreso({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full justify-center items-center shadow-lg"
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        elevation: 5,
        zIndex: 100,
      }}
    >
      {({ pressed }) => (
        <View
          className="w-full h-full justify-center items-center rounded-full"
          style={{ backgroundColor: pressed ? colors.mediumlightgrey : colors.secondary }}
        >
          <Ionicons name={Icons["progreso"].iconName} size={30} color={colors.white} />
        </View>
      )}
    </Pressable>
  );
}

//BOTÓN: RECARGAR
type BotonRecargarProps = {
  onPress: () => void;
  tipo?: number;
};
export function BotonRecargar({
  onPress,
  tipo = 1
}: BotonRecargarProps ) {
  if (tipo === 1) {
    return (
      <Pressable onPress={onPress} accessibilityLabel="Recargar contenido">
        {({ pressed }) => (
          <Ionicons name={Icons["recargar_circulo"].iconName} size={40} color={pressed ? colors.mediumlightgrey : colors.mediumgrey}/>
        )}
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
    >
      {({ pressed }) => (
        <View
          className="bg-secondary rounded-lg p-2 my-2 flex-row items-center justify-center"
          style={{ backgroundColor: pressed ? colors.mediumlightgrey : colors.secondary }}
        >
          <Ionicons name={Icons["recargar"].iconName} size={24} color={colors.white} style={{ marginRight: 4 }}/>
          <Text className="text-white font-bold text-base">Intentar nuevamente</Text>
        </View>
      )}
    </Pressable>
  );
}

//BOTÓN: RADIO
interface BotonRadioProps {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
}
export function BotonRadio({
  label,
  value,
  selected,
  onSelect,
}: BotonRadioProps) {
  return (
    <Pressable
      onPress={() => onSelect(value)}
      className="flex-row items-center mb-2"
    >
      <View className="mr-2">
        {selected ? (
          <Ionicons name={Icons["botonRadioOn"].iconName} size={24} color={colors.primary}/>
        ) : (
          <Ionicons name={Icons["botonRadioOff"].iconName} size={24} color={colors.primary}/>
        )}
      </View>
      <Text className="text-gray-800">{label}</Text>
    </Pressable>
  );
}

//BOTÓN: VER 
interface BotonVerProps {
  onPress: () => void;
  texto?: string;
  tipo?: string;
}
export function BotonVer({
  onPress,
  texto = "Ver",
  tipo = "vertical",
}: BotonVerProps) {
  return (
    <BotonAccion
      onPress={onPress}
      fondoColor={colors.lightblue}
      texto={texto}
      iconoNombre={Icons["ver"].iconName}
      iconoColor={colors.mediumblue}
      tipo={tipo}
    />
  );
}

//BOTÓN: VINCULAR
interface BotonVincularProps {
  onPress: () => void;
  texto?: string;
}
export function BotonVincular({
  onPress,
  texto = "Vincularse",
}: BotonVincularProps) {
  return (
    <BotonAccion
      onPress={onPress}
      fondoColor={colors.lightgreen}
      texto={texto}
      iconoNombre={Icons["vincular"].iconName}
      iconoColor={colors.mediumgreen}
    />
  );
}

interface BotonTabProps {
  label: string;
  active: boolean;
  today?: boolean;
  onPress: () => void;
}


//BOTÓN: TAB
export function BotonTab({
  label,
  active,
  today,
  onPress 
}: BotonTabProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      className="flex-1 py-2 rounded-lg items-center"
      style={{
        backgroundColor: active ? colors.primary : "transparent",
        borderWidth: today ? 2 : 0,
        borderColor: today ? colors.secondary : "transparent",
      }}
    >
    <Text className={`font-semibold text-lg items-center justify-center`}
          style={{ color: active ? colors.white : colors.primary }}>
          {label}
    </Text>
    </TouchableOpacity>
  )
};