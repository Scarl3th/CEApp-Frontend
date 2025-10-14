import * as Notifications from "expo-notifications";

import { Medicamento } from "./Medicamentos";

//Función para configurar las notificaciones
export async function configurarNotificaciones() {

    console.log("[Medicamentos notificaciones] Configurando  notificaciones");

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
        alert("Se requieren permisos para mostrar recordatorios de medicamentos.");
        return;
    }

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
        }),
    });
}


//Función para programar los recordatorios
export async function programarRecordatorios(medicamentos: Medicamento[]) {
  
    //Limpia notificaciones previas
    console.log("[Medicamentos notificaciones] limpiando notificaciones anteriores");
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = new Date();

    //Recorremos todos los medicamentos
    console.log("[Medicamentos notificaciones] Creando nuevas notificaciones");
    for (const med of medicamentos) {
        if (!med.recordatorioActivo) continue;
        
        //Recorremos los dias donde se repite
        for (const dia of med.dias) {

            //Por cada dia recorremos las horas donde tiene activado recordatorio
            for (const horarioStr of med.horarios) {

             
                const horario = new Date(horarioStr);
                const hora = horario.getHours();
                const minuto = horario.getMinutes();
                const recordatorioMin = med.recordatorio || 0;
                

                //Calculamos la fecha exacta del próximo trigger
                let triggerDate = new Date();
                triggerDate.setHours(hora)
                triggerDate.setMinutes(minuto - recordatorioMin);
                triggerDate.setSeconds(0);

                //El modelo ocupa 1 = lunes ... 7 domingo 
                //Expo ocupa 1=Domingo ... 7=Sábado
                const weekday = dia+1 === 8 ?  0 : dia+1 ;

                console.log(`[Medicamentos notificaciones] Programando ${med.nombre} para ${triggerDate}`);

                const trigger: Notifications.WeeklyTriggerInput = {
                    type:  Notifications.SchedulableTriggerInputTypes.WEEKLY,
                    hour: triggerDate.getHours(),
                    minute: triggerDate.getMinutes(),
                    weekday: weekday
                }


                // Programar notificación para que se repita una vez cada semana
                await Notifications.scheduleNotificationAsync({
                content: {
                    title: "💊 Recordatorio de medicamento",
                    body: `En ${recordatorioMin} minutos, ${med.paciente} debe tomar ${med.nombre} (${med.dosis || ""})`,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                    trigger,
                });

            }
        }
    }

  const notificacionesProgramadas = await Notifications.getAllScheduledNotificationsAsync();

  console.log(`[Medicamentos notificaciones] Notificaciones programadas`);
  for (const not of notificacionesProgramadas){      
    console.log(`${not.content.body} at ${not.trigger.hour}:${not.trigger.minute} the day ${not.trigger.weekday}`);
  } 


}