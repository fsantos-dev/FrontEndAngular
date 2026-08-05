# 📘 Guía de Buenas Prácticas para Angular

> Este documento recopila decisiones de arquitectura, patrones y buenas prácticas comunes en proyectos empresariales con Angular y Featured-Based

---

# 1. Data user(login)

2 formas de traer toda la informacion del usuario como roles, si esta activo etc

## ✅Opción A: Login devuelve todo de una vez (respuesta "gorda")

```typescript
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    isActive: boolean;
    roles: string[];
    permissions: string[];
  };
  expiresAt: string;
}
```

## Ventajas:

- Una sola petición HTTP → más rápido, menos latencia
- No necesitas hacer un segundo GET /users/me inmediatamente después de loguear
- Simplifica el flujo: login → ya tienes todo lo que necesitas para pintar el header, validar roles, etc.

## Desventajas:

- Si el usuario refresca la página (F5), el token sigue en localStorage pero perdiste el objeto user en memoria (porque los signals se resetean). Tendrías que decodificar el JWT o hacer otra petición igual.
- Si la info de "roles" o "permisos" cambia mientras el usuario tiene la sesión abierta (alguien le quita un permiso desde el panel admin), el frontend no se entera hasta que vuelva a loguear.

## ✅Opción B: Login solo devuelve token, luego pides el perfil aparte

## Ventajas:

- Al refrescar la página, simplemente vuelves a llamar getCurrentUser() con el token que ya tienes en localStorage → siempre tienes info fresca
- Separación de responsabilidades más limpia: el endpoint de auth solo autentica, el de users da datos de perfil
- Si necesitas roles/permisos actualizados en cualquier momento, puedes volver a pedir el perfil sin re-loguear

## Desventajas:

- Una petición extra al cargar la app (mínimo overhead, pero existe)

```typescript
// 1. Login → solo token
export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
}

// 2. Con el token, pides el perfil, en el token esta la informacion del usuario y sabemos a quien responder
getCurrentUser(): Observable<User> {
  return this.http.get<User>('/api/users/me');
}
```

## Recomendación

La opción B es el estándar en la mayoría de proyectos serios, especialmente en banca/pagos por una razón muy concreta: el patrón de "rehidratar sesión al refrescar".

---

# 2. constructor vs injeccion

## Constructor

Podemos usar constructor en las clases

```typescript
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}
}
```

## Injeccion de dependencias

O podemos usar la injeccion de dependendias, Es menos código y facilita las pruebas.

```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
}
```

# 3. Configuracion de environments

Una carpeta de environments, con los tres ambientes Prod, Dev y QA y ppreferiblemente con una interfaz para todos

- environment.model.ts ejemplo

```typescript
export interface Environment {
  production: boolean;
  apiUrl: string;
  apiKey?: string;
  appVersion: string;
  enableLogging: boolean;
}
```

- environment.ts (desarrollo)

```typescript
import { Environment } from './environment.model';
export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appVersion: '1.0.0-dev',
  enableLogging: true,
};
```

- environment.prod.ts (produccion)

```typescript
import { Environment } from './environment.model';
export const environment: Environment = {
  production: true,
  apiUrl: 'http://localhost:3000/api',
  appVersion: '1.0.0',
  enableLogging: false,
};
```

- environment.qa.ts (pruebas)

```typescript
import { Environment } from './environment.model';
export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appVersion: '1.0.0-qa',
  enableLogging: true,
};
```

y configurar el angular.json para que se adapte al enviroment en el ambiente correspondiente
Para cuando se ejecute ng build --configuration 'ambiente'

```typescript
"build": {
  "configurations": {
    "production": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.production.ts"
        }
      ]
    },
    "qa": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.qa.ts"
        }
      ]
    },
  }
}
```

- y los scripts correspondientes del package.json

```typescript
"scripts": {
    "ng": "ng",
    "start": "ng serve",
    "start:qa": "ng serve -c qa",
    "start:prod": "ng serve -c production",
    "build": "ng build",
    "build:prod": "ng build -c production",
    "build:qa": "ng build -c qa",
    "watch": "ng build --watch --configuration development"
  },
```

# 4. Crear un archivo central.

- Tenemos el escenario en el que todos dependen directamente de environment. Si mañana decides cambiar la forma de obtener la configuración (por ejemplo, desde un config.json o un servicio), tendrás que modificar muchos archivos.
  entonces teniendo un APP_CONFIG. en el core Ahora toda la aplicación conoce únicamente APP_CONFIG, como unico punto de acesso.

```typescript
import { environment } from '../../../environments/environment';

export const APP_CONFIG = {
  apiUrl: environment.apiUrl,
  production: environment.production,
  appVersion: environment.appVersion,
  enableLogging: environment.enableLogging,
};
```

- También centralizas transformaciones
  Supongamos que mañana quieres que la URL nunca termine en /.

En vez de hacer esto en cada servicio:

```typescript
environment.apiUrl.replace(/\/$/, '');
```

lo haces una sola vez:

```typescript
export const APP_CONFIG = {
  apiUrl: environment.apiUrl.replace(/\/$/, ''),
};
```

Todos los servicios reciben ya la URL correcta.

# 5. Seguridad de cualquier llave, json de conexion e informacion sensible,

La regla de oro que se usa en la industria

Una pregunta muy simple:

¿Si un usuario abre las herramientas del navegador y ve este valor, pasa algo?

- No pasa nada → puede estar en Angular (environment, APP_CONFIG o app.config.json).
- Sí pasa algo → debe quedarse en el backend (ASP.NET, Vault, User Secrets, Azure Key Vault, etc.).

- Entonces tenemos un escenario si un proveedor por ejemplo punto red nos entrega sus servicios y nos da credenciales de conexion y password, este consumo no deberia hacerse desde el front(angular), debe hacerse desde el back y exponer un servicio al front asi el le entrega solo lo que necesita al back y el back hace la peticion al proveedor.

- Nunca debe guardar o enviar esas credenciales al front debe todo guadrase en un vault en el back

- Encriptar las llaves en angular y dejarlas ahi mismo aun sigue siendo inseguro, eso ofusca la informacion y al hace mas dificil entenderla pero no evita el problema. las llaves de encriptacion igual estaran en el front o tendran que llegar ahi para poder desencriptarla.

> 💡 **La regla que usan los arquitectos de software**

Existe una frase muy conocida en el desarrollo de software:

> **"Never trust the client."**  
> _"Nunca confíes en el cliente."_

### ¿Qué significa?

El **cliente (frontend o navegador)** está bajo el control del usuario, **no de tu empresa**.

Por esa razón, **nunca debes asumir que la información enviada desde el frontend es correcta, segura o confiable**. Todas las validaciones críticas y reglas de negocio deben verificarse nuevamente en el **backend**.

## ¿Qué haría un desarrollador profesional?

Si en una reunión te dicen:

"El frontend va a consumir directamente Puntored con este usuario y contraseña."

Lo correcto es levantar la mano y decir algo como:

"Hay un riesgo de seguridad. Esas credenciales quedarían expuestas porque el código se ejecuta en el navegador. ¿El proveedor ofrece un SDK para frontend, OAuth o una clave pública para hacerlo de manera segura? Si no, sería más seguro hacer la integración desde el backend."

Eso no significa negarte a desarrollar la funcionalidad, sino informar del riesgo y proponer una alternativa más segura.

---

# 5. Observable

Se recomienda el los servicios http retornar un observable para poder suscribirme donde se va a utilizar el servicio

Ojo si no retornamos observable y retornamos por ejemplo void aquí hay un problema importante.
HttpClient devuelve un Observable, pero tú lo estás ignorando.

```typescript
login(credentials: LoginRequest): void {

    this.http.post<LoginResponse>(url, credentials)
        .subscribe(response => {
            console.log(response);
        });

}
```

Nadie podrá hacer:

```typescript
this.authService.login(data).subscribe(...);
```

Porque ahora la función devuelve void.

## ✅Opción A: Suscribirse dentro del servicio (menos flexible)

```typescript
login(credentials: LoginRequest): void {

    this.http.post<LoginResponse>(url, credentials)
        .subscribe(response => {
            console.log(response);
        });

}
```

Esto funciona, pero el componente ya no puede reaccionar al resultado.

No puede saber:

- si el login fue exitoso,
- si ocurrió un error,
- cuándo terminó la petición.

Toda esa lógica queda "encerrada" en el servicio.

## ✅Opción A: Retornar el Observable (la práctica más común)

```typescript
login(credentials: LoginRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(url, credentials);

}
```

Ahora quien llame al servicio decide qué hacer.

Por ejemplo, en un Store:

```typescript
this.authService.login(data).subscribe({
  next: (response) => {
    // Guardar token
  },
  error: (err) => {
    // Mostrar mensaje
  },
});
```

## Recomendación
un servicio debe encargarse de comunicarse con la API, no de decidir qué hacer con la respuesta. Al devolver un Observable, el mismo método puede reutilizarse desde distintos componentes o Stores, cada uno manejando el resultado según sus necesidades. Esa separación de responsabilidades hace el código más limpio, reutilizable y fácil de mantener.


---

# 📌 Resumen

| Tema                                 | Opciones                                                                                                                                                                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. DATA User(login)**              | Mismo servicio que responde el token / Un servicio adiconal que lo haga aparte                                                                                                                                                                                |
| **2. Constructor vs `inject()`**     | Ambos son válidos. En Angular moderno se suele preferir `inject()` por reducir código y facilitar algunos escenarios de pruebas e inicialización.                                                                                                             |
| **3. Configuración de environments** | Mantener ambientes separados (Dev, QA y Prod) con una interfaz común y configurar `angular.json` y los scripts de `package.json` para cada entorno.                                                                                                           |
| **4. APP_CONFIG centralizado**       | Centralizar el acceso a la configuración de la aplicación mediante un único punto (`APP_CONFIG`) para evitar dependencias directas de `environment` y facilitar futuros cambios.                                                                              |
| **5. Seguridad de credenciales**     | Nunca exponer secretos, contraseñas, API Keys privadas o credenciales en el frontend. Las integraciones con proveedores externos deben realizarse desde el backend y almacenar los secretos en un gestor seguro (Vault, User Secrets, Azure Key Vault, etc.). |

---

> **Nota:** No existe una única arquitectura "correcta". La elección entre estas alternativas dependerá del tamaño del proyecto, los estándares del equipo, los requisitos del negocio y el equilibrio entre simplicidad, mantenibilidad y escalabilidad.
