# Cómo generar un apk

Algunas consideraciones para generar el apk:

* Se debe crear un directorio solo con la carpeta de frontend (sin el node modules para que no se demore tanto y luego se usa `npm install` dentro del frontend nomás) 
* **Los comandos se deben ejecturar en una terminal dentro de la carpeta frontend creada** , pues **eas** espera que el archivo "package.json" esté en la raíz.
* Es necesario tener una cuenta en la plataforma de expo: https://expo.dev/go

---

### Pasos:

* Instalar eas build con `npm install -g eas-cli`
* Agregar esto al apartado "android" en app.config.js:

```
  android: {

    adaptiveIcon: {

      foregroundImage: "./assets/images/CEAppLogo.png",
       backgroundColor: "#ffffff"

    },
     edgeToEdgeEnabled: true,
     
     permissions: \[
        "READ\_EXTERNAL\_STORAGE",
        "WRITE\_EXTERNAL\_STORAGE",
        "READ\_MEDIA\_IMAGES",
        "READ\_MEDIA\_VIDEO",
        "READ\_MEDIA\_AUDIO"
      ],

      package:  <nombre arbitrario>  <-- Generalmente es algo como "com.<nombre_usuario>.<nombre-app>"
   }
```

---
### Configuracion de variables
* borrar `import "dotenv/config";` en app.config.js

* En la consola, agregar variables definidas en .env con los siguientes comandos:
```
  eas secret:create --name API\_BASE\_URL --value http://<tu\_ip>:8000
```
```
  eas secret:create --name WS\_BASE\_URL --value ws://<tu\_ip>:8000/ws
```

* Posiblemente salga <span style="color: red;"> Error </span> y solicite agregar mas cosas al app.config.js (seguir instrucciones de la consola):
```
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "<lo entrega la consola>"
      }
    }
  }
}
```

* Correr nuevamente los comandos para agregar las variables
* Seleccionar "Yes" para configurar el proyecto y "String" para secret type

---
### Configuraciones para hacer el build

* Instalar expo dev client `npx expo install expo-dev-client`
* Ingresar cuenta de expo con `eas login`
* Ejecutar `eas build:configure`
* Si te lo pide: agregar projectId en app.config.js según lo indicado en la consola y ejecutar nuevamente `eas build:configure`
* Seleccionar "All" para las plataformas deseadas 

---
### Realizar el build

* Ejecutar (para Android) `eas build --profile development --platform android`
* Luego aparecerá en la consola un QR para descargar la aplicación
* Instalar el apk y abrir desde el celular
* Ejecutar expo como siempre `npx expo start`
* Escanear el código QR de la consola desde la app.
* Listo! debería funcionar igual que como funciona con Expo Go de aquí en adelante (espero)






