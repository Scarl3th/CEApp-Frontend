export function formatearFechaDate(
  fecha: Date,
  offsetHoras: number = -3,
  UTCaUTC3: boolean = true,
) {
  if (UTCaUTC3) {
    return new Date(fecha.getTime() + offsetHoras * 60 * 60 * 1000);
  }
  return new Date(fecha.getTime() - offsetHoras * 60 * 60 * 1000);
}

//EJEMPLO
//const fechaUTC = new Date("2025-10-01T15:30:00Z"); // 15:30 UTC
//const fechaLocal = formatearFechaDate(fechaUTC, -3); // 12:30 UTC-3
//console.log(fechaLocal.toISOString()); // "2025-10-01T12:30:00.000Z"
//console.log(fechaLocal.toLocaleString("es-CL")); // "01/10/2025 12:30:00"

export function formatearFechaString(fecha: Date, opciones?: Intl.DateTimeFormatOptions) {
  const opcionesDefault: Intl.DateTimeFormatOptions = { 
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  };
  return fecha.toLocaleString("es-CL", opciones ?? opcionesDefault);
}

//EJEMPLOS DE USOS: (reemplazar fecha con la correspondiente, en formato timestamp UTC)

//const fecha = new Date("2025-10-01T15:30:00Z");

//console.log(formatearFechaString(fecha, { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
//Salida: "miércoles, 1 de octubre de 2025"

//console.log(formatearFechaString(fecha, { day: "numeric", month: "long", year: "numeric" }));
//Salida: "1 de octubre de 2025"

//console.log(
//  formatearFechaString(fecha, { 
//    weekday: "long", day: "numeric", month: "long", year: "numeric", 
//    hour: "2-digit", minute: "2-digit", hour12: false 
//  })
//);
// Salida: "miércoles, 1 de octubre de 2025 12:30"

// Solo hora:minuto
//console.log(
//  formatearFechaString(fecha, { hour: "2-digit", minute: "2-digit", hour12: false })
//);
// Salida: "12:30"

export function formatearFechaDDMMYYYY(fechaStr: string): string {
  const separador = fechaStr.includes("/") ? "/" : "-";
  const [dia, mes, anio] = fechaStr.split(separador).map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatearTiempo(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  let resultado = "";
  if (horas > 0) {
    resultado += `${horas} ${horas === 1 ? "hora" : "horas"}`;
  }
  if (mins > 0) {
    if (horas > 0) resultado += " ";
    resultado += `${mins} minutos`;
  }
  if (resultado === "") resultado = "0 min";
  return resultado;
}