export type IconType = 
    | "play-circle-outline"          //ACTIVIDADES
    | "notifications-circle-outline" //ACTUALIZACIONES
    | "arrow-back"                   //ATRÁS
    | "add"                          //AGREGAR
    | "clipboard-outline"            //BITÁCORA
    | "search"                       //BÚSQUEDA
    | "search-circle"                //BÚSQUEDA (CÍRCULO)
    | "calendar-outline"             //CALENDARIO
    | "close"                        //CERRAR
    | "log-out-outline"              //CERRAR SESIÓN
    | "chatbubble-ellipses-outline"  //CHAT
    | "checkmark"                    //CHECKMARK
    | "mail-open"                    //CORREO
    | "person-remove"                //DESHABILITAR, DESVINCULAR
    | "information-circle"           //DETALLES
    | "download"                     //DESCARGAR
    | "create-outline"               //EDITAR
    | "trash-outline"                //ELIMINAR
    | "send"                         //ENVIAR
    | "people-outline"               //EQUIPO
    | "ellipse"                      //INACTIVO
    | "home-outline"                 //INICIO
    | "folder-outline"               //INFORMES
    | "document"                     //INFORME
    | "medkit-outline"               //MEDICAMENTOS
    | "menu"                         //MENÚ
    | "list-circle"                  //OBJETIVOS ESPECÍFICOS
    | "checkmark-circle"             //OBJETIVOS ESPECÍFICOS (LOGRADO)
    | "contrast"                     //OBJETIVOS ESPECÍFICOS (MEDIANAMENTE LOGRADO)
    | "close-circle"                 //OBJETIVOS ESPECÍFICOS (NO LOGRADO)
    | "eye-outline"                  //OBSERVACIONES
    | "eye"                          //OBSERVACION
    | "heart-circle-outline"         //PACIENTE
    | "bulb-outline"                 //PLAN
    | "bulb"                 //PLAN
    | "bar-chart-outline"            //PROGRESO
    | "refresh"                      //RECARGAR
    | "refresh-circle"               //RECARGAR (CÍRCULO)
    | "person-circle-outline"        //USUARIO
    | "person-add"                   //VINCULAR
      //DIRECCIONES
    | "chevron-up"                   //ARRIBA
    | "chevron-forward"              //DERECHA
    | "chevron-back"              //IZQUIERDA
    | "chevron-down"                 //ABAJO
    //OTROS
    | "ellipsis-vertical"            //TRES PUNTOS
    | "radio-button-off"
    | "radio-button-on"
    | "play-circle"
    | "cloud-upload-outline"
    | "expand"
    | "person"
    | "time-outline"
    | "trending-up"
;

export const Icons: Record<
  string,
  { iconName: IconType; label: string, description: string}
> = {
  actividades: { iconName: "play-circle-outline", label: "Actividades", description: "Registro de actividades terapéuticas" },
  actividad: { iconName: "play-circle", label: "Actividad", description: "" },
  actualizaciones: { iconName: "notifications-circle-outline", label: "Actualizaciones", description: "" },
  atras: { iconName: "arrow-back", label: "Atrás", description: "" },
  agregar: { iconName: "add", label: "Agregar", description: "" },
  bitacora: { iconName: "clipboard-outline", label: "Bitácora", description: "Registro de sesiones terapéuticas" },
  busqueda: { iconName: "search", label: "Búsqueda", description: "" },
  busqueda_circulo: { iconName: "search-circle", label: "Búsqueda", description: "" },
  calendario: { iconName: "calendar-outline", label: "Calendario", description: "Visualiza y gestiona eventos" },
  cerrar: { iconName: "close", label: "Cerrar", description: "" },
  cerrar_sesion: { iconName: "log-out-outline", label: "Cerrar sesión", description: "" },
  chat: { iconName: "chatbubble-ellipses-outline", label: "Chat", description: "Comunicación con otros profesionales" },
  checkmark: { iconName: "checkmark", label: "Checkmark", description: "" },
  correo: { iconName: "mail-open", label: "Correo", description: "" },
  detalles: { iconName: "information-circle", label: "Detalles", description: "" },
  deshabilitar: { iconName: "person-remove", label: "Deshabilitar", description: "" },
  desvincular: { iconName: "person-remove", label: "Desvincular", description: "" },
  descargar: { iconName: "download", label: "Descargar", description: "" },
  editar: { iconName: "create-outline", label: "Editar", description: "" },
  eliminar: { iconName: "trash-outline", label: "Eliminar", description: "" },
  enviar: { iconName: "send", label: "Enviar", description: "" },
  equipo: { iconName: "people-outline", label: "Equipo", description: "Gestión del equipo de trabajo" },
  inactivo: { iconName: "ellipse", label: "Inactivo", description: "" },
  inicio: { iconName: "home-outline", label: "Inicio", description: "" },
  informes: { iconName: "folder-outline", label: "Informes", description: "Almacenamiento de informes" },
  informe: { iconName: "document", label: "Informe", description: "" },
  medicamentos: { iconName: "medkit-outline", label: "Medicamentos", description: "Registro y control de medicamentos" },
  menu: { iconName: "menu", label: "Menú", description: "" },
  objetivos_especificos: { iconName: "list-circle", label: "Objetivos específicos", description: "" },
  objetivos_especificos_logrado: { iconName: "checkmark-circle", label: "Objetivos específicos (logrado)", description: "" },
  objetivos_especificos_medianamente_logrado: { iconName: "contrast", label: "Objetivos específicos (medianamente logrado)", description: "" },
  objetivos_especificos_no_logrado: { iconName: "close-circle", label: "Objetivos específicos (no logrado)", description: "" },
  observaciones: { iconName: "eye-outline", label: "Observaciones", description: "Notas y comentarios sobre el paciente" },
  observacion: { iconName: "eye", label: "Observaciones", description: "" },
  paciente: { iconName: "heart-circle-outline", label: "Paciente", description: "" },
  plan: { iconName: "bulb-outline", label: "Plan", description: "Objetivos generales y específicos" },
  progreso: { iconName: "bar-chart-outline", label: "Progreso", description: "" },
  recargar: { iconName: "refresh", label: "Recargar", description: "" },
  recargar_circulo: { iconName: "refresh-circle", label: "Recargar", description: "" },
  usuario: { iconName: "person", label: "Usuario", description: "" },
  usuario_circulo: { iconName: "person-circle-outline", label: "Usuario", description: "" },
  vincular: { iconName: "person-add", label: "Vincular", description: "" },
  //DIRECCIONES
  arriba: { iconName: "chevron-up", label: "Forward", description: "" },
  derecha: { iconName: "chevron-forward", label: "Forward", description: "" },
  izquierda: { iconName: "chevron-back", label: "Back", description: "" },
  abajo: { iconName: "chevron-down", label: "Forward", description: "" },
  //OTROS
  tresPuntos: { iconName: "ellipsis-vertical", label: "tresPuntos", description: "" },
  botonRadioOn: { iconName: "radio-button-on", label: "botonRadioOn", description: "" },
  botonRadioOff: { iconName: "radio-button-off", label: "botonRadioOff", description: "" },
  upload: { iconName: "cloud-upload-outline", label: "upload", description: "" },
  ver: { iconName: "expand", label: "ver", description: "" },
  tiempo: { iconName: "time-outline", label: "ver", description: "" },
  progresion: { iconName: "trending-up", label: "ver", description: "" },
};