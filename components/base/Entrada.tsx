import { BotonRadio } from "@/components/base/Boton";
import { formatearFechaString } from "@/components/base/FormatearFecha";
import { IndicadorCarga } from "@/components/base/IndicadorCarga";
import { CustomModal } from "@/components/base/Modal";
import { colors } from "@/constants/colors";
import { Icons } from "@/constants/icons";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import React, { Dispatch, SetStateAction, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

function capitalizeFirstLetter(text: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface FormularioCampoLabelProps {
  label: string;
  asterisco?: boolean;
  tipo?: number;
}

export function FormularioCampoLabel({
  label,
  asterisco,
  tipo = 1,
}: FormularioCampoLabelProps) {
  const estilos = estilosPorTipo[tipo] || estilosPorTipo[1];
  return (
    <Text className={estilos.label}>
      {label}{" "}
      {asterisco === true && <Text style={{ color: colors.mediumred }}>*</Text>}
      {asterisco === false && (
        <Text className="text-base" style={{ color: colors.mediumgrey }}>(opcional)</Text>
      )}
    </Text>
  );
}

const estilosPorTipo: Record<
  number,
  {
    container: string;
    label: string;
    input: string;
    placeholderColor: string;
  }
> = {
  1: {
    container: "w-full",
    label: "text-primary font-semibold mb-1",
    input: "border border-primary rounded-lg text-start px-4 mb-1",
    placeholderColor: colors.mediumgrey,
  },
  2: {
    container: "w-full",
    label: "text-black font-semibold mb-1",
    input: "border border-mediumgrey rounded-lg text-start px-4 mb-1",
    placeholderColor: colors.mediumdarkgrey,
  },
};

interface CampoFormularioProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  tipo?: number;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  radioButton?: boolean;
  options?: string[];
  optionsLabel?: string[];
  desplegable?: boolean;
  open?: boolean; // estado externo
  setOpen?: (open: boolean) => void; // setter externo
  asterisco?: boolean;
}

export function FormularioCampo({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  tipo = 1,
  maxLength,
  multiline = false,
  numberOfLines,
  radioButton = false,
  options,
  desplegable = false,
  open: openProp,
  setOpen: setOpenProp,
  asterisco,
}: CampoFormularioProps) {
  const estilos = estilosPorTipo[tipo] || estilosPorTipo[1];
  const [openInternal, setOpenInternal] = React.useState(false);
  const open = openProp !== undefined ? openProp : openInternal;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenInternal;
  return (
    <View className={estilos.container}>
      {label ? (
        <FormularioCampoLabel label={label} asterisco={asterisco} tipo={tipo}/>
      ) : null}
      {radioButton && options.length > 0 ? (
        <View>
          {options.map((option) => (
            <BotonRadio
              key={option}
              label={capitalizeFirstLetter(option)}
              value={option}
              selected={value === option}
              onSelect={onChangeText}
            />
          ))}
        </View>
      ) : (
        <View className="w-full relative">
          <TextInput
            className={estilos.input}
            style={{ paddingRight: 40 }}
            placeholder={placeholder}
            placeholderTextColor={estilos.placeholderColor}
            secureTextEntry={secureTextEntry}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? "top" : "auto"}
          />
          {desplegable && (
            <Pressable
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: [{ translateY: -12 }],
              }}
              onPress={() => setOpen(!open)}
            >
              <Ionicons
                name={open ? Icons["arriba"].iconName : Icons["abajo"].iconName}
                size={24}
                color={colors.mediumgrey}
              />
            </Pressable>
          )}
          {maxLength && (
            <Text
              className="text-xs text-right mt-1"
              style={{ color: colors.mediumgrey }}
            >
              {value.length} / {maxLength}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

interface SelectItem {
  id: string;
  titulo: string;
  color?: string;
}
interface FormularioCampoSelectProps {
  label: string;
  items: SelectItem[];
  selectedId?: string;
  onChange: (id: string | undefined) => void;
  placeholder: string;
  asterisco?: boolean;
  tipo?: number;
}
export function FormularioCampoSelect({
  label,
  items,
  selectedId,
  onChange,
  placeholder,
  asterisco,
  tipo,
}: FormularioCampoSelectProps) {
  //ESTADOS
  const [open, setOpen] = useState(false);
  //HADNLE: SELECT
  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };
  const selectedItem = items.find((i: any) => i.id === selectedId);
  //VISTA
  return (
    <View className="w-full mb-2">
      <FormularioCampoLabel label={label} asterisco={asterisco} tipo={tipo}/>
      {/* CAMPO */}
      <Pressable onPress={() => setOpen(true)}>
        {({ pressed }) => (
          <View
            className="rounded-lg border px-4 py-3"
            style={{
              backgroundColor:
                pressed ? colors.mediumlightgrey :
                selectedItem?.color ? selectedItem.color :
                colors.white,
              borderColor:
                pressed ? colors.mediumlightgrey :
                selectedItem?.color ? selectedItem.color :
                colors.mediumgrey,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="flex-1"
                style={{ color: selectedItem ? colors.white : colors.mediumdarkgrey }}
              >
                {selectedItem ? selectedItem.titulo : placeholder}
              </Text>
              <Ionicons
                name={Icons["derecha"].iconName}
                size={20}
                color={selectedItem ? colors.white : colors.mediumdarkgrey}
              />
            </View>
          </View>
        )}
      </Pressable>
      {/* MODAL */}
      <CustomModal 
        visible={open}
        onClose={() => setOpen(false)}
        tipo={"expandible"}
      >
        <View className="flex-1 gap-2">
          <View className="gap-1">
            <Text className="text-black text-xl font-bold">{label}</Text>
            <Text className="text-mediumgrey text-sm">Selecciona una opción</Text>
          </View>
          <ScrollView className="flex-1">
            {items.map((item: any) => {
              const isSelected = selectedId === item.id;
              const color = item.color || colors.primary;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelect(item.id)}
                >
                  {({ pressed }) => (
                    <View
                      className="rounded-lg p-4 mb-2"
                      style={{ backgroundColor: pressed ? colors.mediumlightgrey : isSelected ? color : colors.lightgrey }}
                    >
                      <Text style={{ color: pressed ? colors.mediumdarkgrey : isSelected ? colors.white : colors.mediumdarkgrey }}>
                        {item.titulo}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </CustomModal>
    </View>
  );
}

interface ItemMultiSelect<T extends string | number> {
  id: T;
  titulo: string;
  color?: string;
}
interface FormularioCampoMultiSelectProps<T extends string | number> {
  label?: string;
  items: ItemMultiSelect<T>[];
  selected: T[];
  onChange: (selectedIds: T[]) => void;
  placeholder: string;
  placeholderSelected?: string;
  asterisco?: boolean;
  tipo?: number;
  onAddItem?: (title: string) => void;
  setToast?: React.Dispatch<React.SetStateAction<{ text1: string; text2?: string; type: "success" | "error" } | null>>;
  maxLength?: number;
}
export function FormularioCampoMultiSelect<T extends string | number>({
  label,
  items,
  selected,
  onChange,
  placeholder,
  placeholderSelected,
  asterisco,
  tipo,
  onAddItem,
  setToast,
  maxLength = 255,
}: FormularioCampoMultiSelectProps<T>) {
  //ESTADOS
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  //TOGGLE: ITEM
  const toggleItem = (id: T) => {
    if (selected.includes(id)) {
      onChange(selected.filter(i => i !== id));
    } else {
      onChange([...selected, id]);
    }
  };
  //HANDLE: ADD
  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    if (!onAddItem) return;
    try {
      setIsAdding(true);
      await onAddItem(newTitle);
      setToast?.({ text1: "Opción agregada exitosamente.", type: "success" });
      setNewTitle("");
    } catch (err) {
      setToast?.({ text1: "Hubo un problema al guardar la opción.", text2: "Intenta nuevamente.", type: "success" });
    } finally {
      setIsAdding(false);
    }
  };
  //VISTA
  return (
    <View className="mb-2">
      {/* LABEL */}
      {label && (<FormularioCampoLabel label={label} asterisco={asterisco} tipo={tipo}/>)}
      {/* CHIPS */}
      <View className="flex-row flex-wrap">
        {selected.map(id => {
          const item = items.find(i => i.id === id);
          if (!item) return null;
          const color = item.color || colors.primary;
          return (
            <Pressable
              key={id}
              onPress={() => toggleItem(id)}
            >
              {({ pressed }) => (
                <View
                  className="rounded-full px-4 py-2 mb-2 mr-2 gap-1 flex-row items-center"
                  style={{ backgroundColor: pressed ? colors.mediumlightgrey : color }}
                >
                  <Text
                    className="text-base"
                    style={{ color: colors.white }}
                  >
                    {item.titulo}
                  </Text>
                  <Ionicons name={Icons["cerrar"].iconName} size={20} color={colors.white}/>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      {/* CAMPO */}
      <Pressable onPress={() => setOpen(true)}>
        {({ pressed }) => (
          <View
            className="rounded-lg border px-4 py-3"
            style={{
              backgroundColor: pressed ? colors.mediumlightgrey : colors.white,
              borderColor: pressed ? colors.mediumlightgrey : colors.mediumgrey,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Text className="flex-1 text-base" style={{ color: colors.mediumdarkgrey }}>
                {selected.length > 0 ? `${selected.length} ${placeholderSelected}` : placeholder}
              </Text>
              <Ionicons name={Icons["derecha"].iconName} size={20} color={colors.mediumdarkgrey}/>
            </View>
          </View> 
        )}
      </Pressable>
      {/* MODAL */}
      <CustomModal
        visible={open}
        onClose={() => setOpen(false)}
        tipo={"expandible"}
      >
        <View className="flex-1 gap-2">
          <View className="gap-1">
            <Text className="text-black text-xl font-bold">{label}</Text>
            <Text className="text-mediumgrey text-sm">Selecciona una o más opciones</Text>
          </View>
          {isAdding ? (
            <IndicadorCarga/>
          ) : (
            <ScrollView className="flex-1">
              {/* ITEMS */}
              {items.map((item: any) => {
                const isSelected = selected.includes(item.id);
                const color = item.color || colors.primary;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleItem(item.id)}
                  >
                    {({ pressed }) => (
                      <View
                        className="rounded-lg p-4 mb-2"
                        style={{ backgroundColor: pressed ? colors.mediumlightgrey : isSelected ? color : colors.lightgrey }}
                      >
                        <Text style={{ color: pressed ? colors.mediumdarkgrey : isSelected ? colors.white : colors.mediumdarkgrey }}>
                          {item.titulo}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
              {/* AGREGAR NUEVA OPCIÓN */}
              {onAddItem && (
                <View className="flex-1 gap-2 flex-row items-start justify-between">
                  <View className="flex-1">
                    <TextInput
                      value={newTitle}
                      onChangeText={setNewTitle}
                      placeholder={"Agrega una nueva opción"}
                      maxLength={maxLength}
                      className="flex-1 border rounded-lg px-4 py-3 mb-2"
                      style={{ borderColor: colors.mediumgrey }}
                    />
                    {maxLength && (
                      <Text
                        className="text-xs text-right"
                        style={{ color: colors.mediumgrey }}
                      >
                        {newTitle.length} / {maxLength}
                      </Text>
                    )}
                  </View>
                  <Pressable onPress={handleAdd}>
                    {({ pressed }) => (
                      <View
                        className="rounded-lg p-3 mb-2 flex-row items-center start-right"
                        style={{
                          borderColor: pressed ? colors.mediumlightgrey : colors.secondary,
                          backgroundColor: pressed ? colors.mediumlightgrey : colors.secondary,
                        }}
                      >
                        <Ionicons name={Icons["agregar"].iconName} size={20} color={colors.white}/>
                      </View>
                    )}
                  </Pressable>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </CustomModal>
    </View>
  );
}

interface FormularioCampoFechaProps {
  fecha: Date | null;
  setFecha: Dispatch<SetStateAction<Date | null>>;
  label: string;
  placeholder: string;
  asterisco?: boolean;
  tipo?: number;
}
export function FormularioCampoFecha({
  label,
  placeholder,
  asterisco,
  tipo,
  fecha,
  setFecha
}: FormularioCampoFechaProps) {
  //ESTADOS
  const [show, setShow] = useState(false);
  //ON CHANGE
  const onChange = (event: any, selectedDate: Date | undefined) => {
    setShow(Platform.OS === "ios");
    if (selectedDate) {
      const selectedDateMediodia = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        12, 0, 0, 0
      ));
      setFecha(selectedDateMediodia);
    }
  };
  //VISTA
  return (
    <View className="mb-2">
      {/* LABEL */}
      <FormularioCampoLabel label={label} asterisco={asterisco} tipo={tipo}/>
      {/* CAMPO */}
      <Pressable onPress={() => setShow(true)}>
        {({ pressed }) => (
          <View
            className="rounded-lg border px-4 py-3"
            style={{
              backgroundColor: pressed ? colors.mediumlightgrey : colors.white,
              borderColor: pressed ? colors.mediumlightgrey : colors.mediumgrey,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Text className="flex-1 text-base" style={{ color: colors.mediumdarkgrey }}>
                {fecha ? formatearFechaString(fecha, { day: "numeric", month: "long", year: "numeric" }) : placeholder}
              </Text>
              <Ionicons name={Icons["derecha"].iconName} size={20} color={colors.mediumdarkgrey}/>
            </View>
          </View>
        )}
      </Pressable>
      {/* MODAL */}
      {show && (
        <DateTimePicker
          value={fecha || new Date()}
          mode={"date"}
          display={"default"}
          onChange={onChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

interface FormularioCampoFechaFuturaProps {
  fecha: Date | null;
  setFecha: Dispatch<SetStateAction<Date | null>>;
  label: string;
  placeholder: string;
  asterisco?: boolean;
  tipo?: number;
}
export function FormularioCampoFechaFutura({
  label,
  placeholder,
  asterisco,
  tipo,
  fecha,
  setFecha
}: FormularioCampoFechaFuturaProps) {
  //ESTADOS
  const [show, setShow] = useState(false);
  //ON CHANGE
  const onChange = (event: any, selectedDate: Date | undefined) => {
    setShow(Platform.OS === "ios");
    if (selectedDate) {
      const selectedDateMediodia = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        12, 0, 0, 0
      ));
      setFecha(selectedDateMediodia);
    }
  };
  //VISTA
  return (
    <View className="mb-2">
      {/* LABEL */}
      <FormularioCampoLabel label={label} asterisco={asterisco} tipo={tipo}/>
      {/* CAMPO */}
      <Pressable onPress={() => setShow(true)}>
        {({ pressed }) => (
          <View
            className="rounded-lg border px-4 py-3"
            style={{
              backgroundColor: pressed ? colors.mediumlightgrey : colors.white,
              borderColor: pressed ? colors.mediumlightgrey : colors.mediumgrey,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Text className="flex-1 text-base" style={{ color: colors.mediumdarkgrey }}>
                {fecha ? formatearFechaString(fecha, { day: "numeric", month: "long", year: "numeric" }) : placeholder}
              </Text>
              <Ionicons name={Icons["derecha"].iconName} size={20} color={colors.mediumdarkgrey}/>
            </View>
          </View>
        )}
      </Pressable>
      {/* MODAL */}
      {show && (
        <DateTimePicker
          value={fecha || new Date()}
          mode={"date"}
          display={"default"}
          onChange={onChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
}

interface FormularioCampoHoraProps {
  hora: Date | null;
  setHora: Dispatch<SetStateAction<Date | null>>;
  label: string;
  placeholder: string;
  asterisco?: boolean;
  tipo?: number;
}
export function FormularioCampoHora({
  label,
  placeholder,
  asterisco,
  tipo,
  hora,
  setHora
}: FormularioCampoHoraProps) {
  //ESTADOS
  const [show, setShow] = useState(false);
  //VISTA
  return (
    <View className="mb-2">
      {/* LABEL */}
      <FormularioCampoLabel label={label} asterisco={asterisco} tipo={tipo}/>
      {/* CAMPO */}
      <Pressable onPress={() => setShow(true)}>
        {({ pressed }) => (
          <View
            className="rounded-lg border px-4 py-3"
            style={{
              backgroundColor: pressed ? colors.mediumlightgrey : colors.white,
              borderColor: pressed ? colors.mediumlightgrey : colors.mediumgrey,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Text className="flex-1 text-base" style={{ color: colors.mediumdarkgrey }}>
                {hora ? formatearFechaString(hora, {hour: '2-digit', minute:'2-digit'}) : placeholder}
              </Text>
              <Ionicons name={Icons["derecha"].iconName} size={20} color={colors.mediumdarkgrey}/>
            </View>
          </View>
        )}
      </Pressable>
      {/* MODAL */}
      {show && (
        <DateTimePicker
          value={hora || new Date()}
          mode={"time"}
          display={"default"}
          onChange={(e, selected) => { setShow(false); if(selected) setHora(selected); }}
        />
      )}
    </View>
  );
}

//FORMULARIO CAMPO: INFORME
interface FormularioCampoInformeProps {
  label: string;
  helpText1?: string;
  helpText2?: string;
  informe: any | null;
  setInforme: React.Dispatch<React.SetStateAction<any | null>>;
  placeholder1: string;
  placeholder2: string;
  isLoading?: boolean;
  asterisco?: boolean;
  tipoLabel?: number;
}
export function FormularioCampoInforme({
  label,
  helpText1 = "",
  helpText2 = "",
  informe,
  setInforme,
  placeholder1,
  placeholder2,
  asterisco,
  tipoLabel = 2,
}: FormularioCampoInformeProps) {
  //TRANSFORMAR PESO
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  //HANDLE: SELECCIONAR INFORME
  const handleSeleccionarInforme = async () => {
    try {
      console.log("[informes: agregar-informe] Seleccionando informe...");
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });
      console.log("[informes: agregar-informe] Respuesta:", res);
      if (res.canceled || !res.assets || res.assets.length <= 0) {
        console.log("[informes: agregar-informe] Selección cancelada..");
      } else if (res.assets[0].size && res.assets[0].size > 20 * 1024 * 1024) {
        console.log("[informes: agregar-informe] Archivo demasiado grande...");
        Alert.alert("Error", "El informe no puede superar los 20 MB. Intenta nuevamente.");
      } else {
        setInforme(res.assets[0]);
      }
    } catch (err) {
      console.error("[informes: agregar-informe] Error al seleccionar informe:", err);
      Alert.alert("Error", "No se pudo seleccionar el informe. Intenta nuevamente.");
    }
  };
  return (
    <View className="w-full mb-2">
      <FormularioCampoLabel
        label={label}
        asterisco={asterisco}
        tipo={tipoLabel}
      />
      {informe ? (
        <View className="bg-primary rounded-full px-4 py-2 mb-2 gap-2 flex-row items-center justify-between">
          <View
            className="gap-2 flex-row items-center justify-left"
            style={{ flexShrink: 1, flexGrow: 1 }}
          >
            <Ionicons name={Icons["informe"].iconName} size={24} color={colors.white}/>
            <View
              className="gap-0.5 flex-column"
              style={{ flexShrink: 1 }}
            >
              <Text
                className="text-white font-semibold text-base"
              >
                {informe.name}
              </Text>
              <Text className="text-white text-xs">
                {formatBytes(informe.size)}
              </Text>
            </View>
          </View>
          <Pressable onPress={() => setInforme(null)}>
            {({ pressed }) => (
              <View
                className="rounded-full p-1"
                style={{ backgroundColor: pressed ? colors.mediumlightgrey : colors.primary }}
              >
                <Ionicons name={Icons["eliminar"].iconName} size={24} color={colors.white} />
              </View>
            )}
          </Pressable>
        </View>
      ) : null}
      <Pressable onPress={handleSeleccionarInforme}>
        {({ pressed }) => (
          <View
            className="w-full rounded-lg p-4 flex-column items-center justify-center"
            style={{
              backgroundColor: pressed ? colors.mediumlightgrey : colors.white,
              borderColor: colors.mediumgrey,
              borderWidth: 1,
            }}
          >
            <Ionicons
              name={Icons["upload"].iconName}
              size={40}
              color={colors.mediumdarkgrey}
            />
            <Text
              className="text-base"
              style={{ color: colors.mediumdarkgrey }}
            >
              {informe ? placeholder2 : placeholder1}
            </Text>
            <Text
              className="text-sm mt-2"
              style={{ color: colors.mediumgrey }}
            >
              {helpText1 && <>{helpText1}{helpText2 ? "\n" : ""}</>}
              {helpText2 && <>{helpText2}</>}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );}