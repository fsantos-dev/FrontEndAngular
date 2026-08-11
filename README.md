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

- Nunca debe guardar o enviar esas credenciales al front debe todo guardarse en un vault en el back

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

# 6. Observable

Un Observable es alguien que te avisa cuando pasa algo.
El Observable es la fuente de los datos
El subscribe() es quien escucha esa fuente.

La emisora está transmitiendo música todo el día.
Esa emisora sería el Observable.

Pero tú no escuchas nada hasta que enciendes la radio.
Encender la radio sería hacer: Suscribe()

Subscribe siempre tiene que subscribirse a un observable

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

# 7. Almacenamiento de token

Lo mas recomendable es centralizar el almacenamiento del token en un servicio y no usar directamente LocalStorage
en cada lugar que se necesita

Porque mañana la empresa puede decidir:

usar localStorage (la mas usada)
usar cookies HttpOnly ( La mas segura, aqui el fronted/cliente no lo ve)
usar sessionStorage
usar IndexedDB
guardar el token solo en memoria

Si tienes 50 llamadas a localStorage, tendrás que cambiarlas todas.

Si tienes un único TokenService, cambias solo este archivo.

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'access_token';

  get(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  set(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  clear(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
```

El interceptor simplemente dice:

"Si tengo token, lo agrego. Si no tengo, envío la petición tal como fue creada."

Quien decide si esa petición está autorizada es el servidor.

# 8. Interceptors

Un Interceptor en Angular es una pieza de código que intercepta todas las peticiones HTTP que salen de tu aplicación y todas las respuestas que regresan del servidor, permitiéndote ejecutar lógica antes o después de que ocurra la comunicación.

✅ AuthInterceptor → Agrega el JWT a todas las peticiones.

con el siguiente interceptor seteamos el token para todos los consumos de servicios

```typescript
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  const token = tokenService.get();

  if (!token) {
    return next(req);
  }

  const authRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authRequest);
};
```

- En lugar de hacer esto en cada servicio:

```typescript
this.http.get('/users', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

-El interceptor lo hace una sola vez:

```typescript
const clonedReq = req.clone({
  setHeaders: {
    Authorization: `Bearer ${token}`,
  },
});

return next(clonedReq);
```

✅ ErrorInterceptor → Si el backend dice 401, hace logout y redirige al login.
Cuando se hace una peticion http de cualquier servicio este interceptor valida si el token aun es valido

- El token expiró.
- El token fue revocado. (
  El usuario cambió la contraseña.
  El administrador bloqueó la cuenta.
  El usuario cerró sesión desde otro dispositivo.
  El backend invalidó todos los tokens.)
- La firma del JWT es inválida.
- El token fue modificado.
- El usuario fue deshabilitado.
- El token pertenece a otra aplicación (audience incorrecta).
- El emisor (issuer) no es válido.

```typescript
import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};
```

---

# 9. Guards(proteccion de rutas)

✅ Guard → Protege las rutas comprobando que haya una sesión válida (generalmente token existente + no expirado).

Si el token expiro el guard no deja entrar a una ruta, por ende ni si quiera hace la peticion al backend en cambio el interceptor si hace una peticion al backend y borra el token de localstorage y retorna al login, ambos trabajan juntos de la mano el guard y el interceptor

---

# 10. Aquitectura

## service

solo dispara la petición y devuelve el Observable crudo. Ni tap, ni catchError, ni nada. Es tan simple que casi no necesita tests más allá de "¿llama al endpoint correcto?".

## store

se suscribe, y ahí sí va toda la lógica:

- tap() para guardar token y actualizar signals
- catchError() para transformar errores en algo que la UI pueda mostrar
- Navegación
- Cualquier side-effect

---

# 10. readOnly y asReadonly()

- readOnly evita que una variable cambie su valor
- en una senal evita reasignar con una nueva senal pero no evita modificar el valor de esa senal
- en un objeto evita reasignar con un nuevo objeto, pero no evita modificar una propiedad de ese objeto

Y asReadonly()
s un método que existe en cualquier WritableSignal y hace una sola cosa: te devuelve el mismo signal, pero con un tipo de TypeScript que ya no tiene .set() ni .update() en su firma pública.

Antes

```typescript
private readonly _loading = signal<boolean>(false);
// Tipo: WritableSignal<boolean>
// Tiene: _loading(), _loading.set(x), _loading.update(fn)
```

Ahora

```typescript
readonly loading = this._loading.asReadonly();
// Tipo: Signal<boolean>
// Tiene: loading()  ← solo lectura
// NO tiene: .set() ni .update() en el tipo público
```

Punto clave que ya viste antes con readonly, pero aquí aplica igual: asReadonly() no crea una copia ni un signal nuevo independiente — es una vista sobre el mismo signal original. Cuando _loading cambia (por dentro del Store, con .set()), loading() (la vista pública) refleja ese cambio automáticamente, porque en el fondo son el mismo dato reactivo.

Por qué importa en la práctica: si no usaras asReadonly() y expusieras _loading directo como público, cualquier componente podría hacer:

```typescript
this.authStore.loading.set(true); // Componente manipulando el estado del Store directamente 😬
```

Eso rompe la idea completa de tener un Store — el Store deja de ser la única fuente de verdad si cualquiera de afuera puede cambiarlo a su antojo. Con asReadonly(), el componente solo puede leer (authStore.loading()), y la única forma de que ese valor cambie es que el propio AuthStore decida cambiarlo internamente (ej. dentro de login()), que es exactamente el control que quieres en una arquitectura seria.

---

# 11. Computed()

crea un signal cuyo valor no lo defines tú directamente, sino que se calcula automáticamente a partir de otros signals. Angular vigila de qué signals depende, y cada vez que alguno de esos cambia, el computed se recalcula solo — sin que tú tengas que hacer nada.

```typescript
readonly isAuthenticated = computed(() => this._token() !== null && this._user() !== null);
```

---

# 12. Inicizalizar un valor

Hay 2 formas de inicializar un valor, en el constructor o en la senal, al final es lo mismo.

## Constructor

```typescript
constructor(private authService: AuthService) {
    // Restaurar sesión desde localStorage al cargar la app
    const storedUser = this.userService.get();
    if (storedUser) {
      this.userSignal.set(storedUser);
    }
  }
```

## Inicializar en senal

```typescript
private readonly userSignal = signal<User | null>(this.userService.get());
```

---

# 13. Store: Multiples senales vs unico store

tenemos 2 formas de crear nuestro store

## Multiples senales

- Muy fácil de entender
- Menos código
- Ideal para estados pequeños

```typescript
// Estados privados solo el store debe tener acceso a el
private readonly userSignal = signal<User | null>(null);
private readonly loadingSignal = signal(false);
private readonly errorSignal = signal<string | null>(null);

// Selectores publicos
readonly user = this.userSignal.asReadonly();
readonly loading = this.loadingSignal.asReadonly();
readonly error = this.errorSignal.asReadonly();
```

## Unico store

- Se parece muchísimo a NgRx
- Escala mejor
- Actualizaciones atómicas
- Más fácil de serializar

```typescript
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

private readonly state = signal<AuthState>({
  user: null,
  loading: false,
  error: null,
});

readonly user = computed(() => this.state().user);
readonly loading = computed(() => this.state().loading);
readonly error = computed(() => this.state().error);
```

---

# 14. Tailwind

- flex = display: flex;
- min-h-screen = min-height: 100vh;
- items-center = align-items: center; Centra verticalmente los hijos del Flex.
- justify-center = justify-content: center; Centra horizontalmente los hijos del Flex.
- bg-gray-100 = background: #f3f4f6;
- w-96 = ancho
- shadow-lg = box-shadow, una sombra grande
- text-center = text-align:center;
- font-bold = font-weight:700;
- text-2xl = font-size: 24px;
- mb-5 = margin-bottom:1.5rem;
- block = display:block:
- w-full = width : 100%;
- mt-4 = margin-top
- p-3 = padding : todos los lados
- rounded-md = Bordes redondeados.
- text-gray-600 = texto gris
- hover:underline = text-decoration: underline;

## Ordend de desarrollo

1️⃣ Layout
↓
2️⃣ Tamaños
↓
3️⃣ Espaciado
↓
4️⃣ Tipografía
↓
5️⃣ Colores
↓
6️⃣ Bordes y Sombras
↓
7️⃣ Estados
↓
8️⃣ Animaciones

💡 ¿Por qué este orden?

Porque imita cómo construyes una casa:

🏗️ Primero haces la estructura (layout).
📏 Luego decides el tamaño de las habitaciones.
🚶 Después dejas espacio para moverte.
🪑 Luego colocas los muebles (tipografía y contenido).
🎨 Pintas las paredes (colores).
✨ Añades los acabados (bordes y sombras).
💡 Instalas interruptores y puertas (estados).
🎭 Al final agregas detalles decorativos (animaciones).

## Temario

🟩 Módulo 1 – Introducción
¿Qué es Tailwind CSS?
Filosofía Utility First.
Cómo leer una clase de Tailwind.
Mobile First.

🟩 Módulo 2 – Flexbox ⭐⭐⭐⭐⭐

Aprendimos:

- flex
- flex-col
- flex-row
- justify-*
- items-*
- gap-*

Al final ya podías construir formularios y centrar elementos.

🟩 Módulo 3 – Espaciado ⭐⭐⭐⭐⭐

Vimos:

- p-*
- px-*
- py-*
- m-*
- mx-*
- my-*
- gap-*

Y una regla importante:

Usar gap antes que margin cuando sea posible.

🟩 Módulo 4 – Tamaños ⭐⭐⭐⭐⭐

Aprendimos:

- w-full
- w-screen
- max-w-*
- h-full
- min-h-screen

Y entendimos la diferencia entre tamaños relativos al padre y a la pantalla.

🟩 Módulo 5 – Tipografía ⭐⭐⭐⭐

Vimos:

- text-*
- font-bold
- font-semibold
- text-center
- text-left
- text-right
🟩 Módulo 6 – Responsive ⭐⭐⭐⭐⭐

Aprendimos:

- sm:
- md:
- lg:
- xl:

Y la filosofía Mobile First.

🟩 Módulo 7 – Colores ⭐⭐⭐⭐

Vimos:

- bg-*
- text-*
- gray-*
- blue-*
- green-*
- Escalas (100 a 900).
- hover:bg-*

🟩 Módulo 8 – Bordes y Sombras ⭐⭐⭐⭐

Aprendimos:

- border
- border-2
- border-*
- rounded
- rounded-full
- shadow
- shadow-md
- shadow-lg
🟩 Módulo 9 – Estados ⭐⭐⭐⭐⭐

Vimos:

- hover:
- focus:
- active:
- disabled:

Y entendimos que los estados modifican el comportamiento visual según la interacción del usuario.

🟩 Módulo 10 – Grid ⭐⭐⭐⭐⭐

Aprendimos:

- grid
- grid-cols-*
- gap-*

Y cuándo usar Grid en lugar de Flexbox.

🟩 Módulo 11 – Position ⭐⭐⭐⭐

Vimos:

- relative
- absolute
- fixed
- sticky
- z-*
- top-*
- bottom-*
- left-*
- right-*
🟩 Módulo 12 – Overflow ⭐⭐⭐

Aprendimos:

- overflow-hidden
- overflow-auto
- overflow-y-auto
- overflow-x-auto

🟩 Módulo 13 – Dark Mode ⭐⭐⭐⭐

Vimos:

- dark:
- dark:bg-*
- dark:text-*

Y cómo adaptar una interfaz a modo claro y oscuro.

🟩 Módulo 14 – Animaciones ⭐⭐⭐

Aprendimos:

- animate-spin
- animate-pulse
- animate-bounce
- transition
- duration-*

Y cuándo tiene sentido usar animaciones.

🟩 Módulo 15 – Buenas prácticas ⭐⭐⭐⭐⭐

Aquí consolidamos varias ideas importantes:

- Pensar primero en el layout.
- Usar Flex o Grid según el problema.
- Preferir gap sobre margin para separar elementos.
- Aprovechar las clases predefinidas antes de usar valores arbitrarios ([...]).
- Seguir el flujo de desarrollo:

---

# 15. Rxjs

- pipe()
  pipe permite agregar operadores de RxJS,
  puedes imaginarlo como una tubería.

observable.pipe(...).

- finalize()
  Es un operador va dentro de un pipe y se ejecuta siempre al terminar el Observable.
  No importa si salio bien o mal

- takeUntilDestroyed()
  Es un operador va dentro de un pipe, Este operador es exclusivo de Angular(this.destroyRef).
  takeUntilDestroyed(this.destroyRef)
  Cancela automáticamente la suscripción cuando el componente o servicio se destruye. para evitar fugas de memoria.

- subscribe(...)
  Aquí sí empieza todo.
  Sin subscribe: un observable no hace nada.
  Con subscribe: observable hace la peticion HTTP y espera la respuesta.

- next
  Se ejecuta cuando todo salió bien. va dentro del susbcribe
  next: (response) => {

}

- error
  Se ejecuta cuando el servidor responde con error. va dentro del subscribe
  error: (err) => {

}

---

# 16. primeNg

💡 Buenas prácticas extra

- p-button:

Propiedad | ¿Para qué sirve? | ¿La usarás mucho?
label | Texto del botón | ⭐⭐⭐⭐⭐
icon | Agregar iconos | ⭐⭐⭐⭐⭐
loading | Mostrar carga | ⭐⭐⭐⭐⭐
disabled | Deshabilitar | ⭐⭐⭐⭐⭐
severity | Color según intención | ⭐⭐⭐⭐⭐
fluid | Ancho completo | ⭐⭐⭐⭐⭐
rounded | Bordes redondeados | ⭐⭐⭐⭐
variant | Estilo (outlined, text...) | ⭐⭐⭐⭐
size | Tamaño | ⭐⭐⭐
raised | Elevación | ⭐⭐⭐

💡 Buenas prácticas extra

- pInputText:

Propiedad / Atributo | ¿Para qué sirve? | ¿La usarás mucho?
pInputText | Aplica el estilo y comportamiento de PrimeNG a un `<input>` HTML. | ⭐⭐⭐⭐⭐
type | Define el tipo de dato (text, email, password, number, etc.). | ⭐⭐⭐⭐⭐
formControlName | Vincula el input a un formulario reactivo de Angular. | ⭐⭐⭐⭐⭐
placeholder | Muestra un texto de ayuda cuando el campo está vacío. | ⭐⭐⭐⭐⭐
class="w-full" | Hace que el input ocupe todo el ancho disponible. | ⭐⭐⭐⭐⭐
[disabled] | Deshabilita el campo de forma dinámica. | ⭐⭐⭐⭐
readonly | Permite ver el contenido pero no modificarlo. | ⭐⭐⭐
maxlength | Limita la cantidad máxima de caracteres permitidos. | ⭐⭐⭐
autocomplete | Permite al navegador autocompletar información. | ⭐⭐⭐⭐
id | Identifica el input y permite asociarlo con un `<label>`. | ⭐⭐⭐⭐

- p-password:

Propiedad | ¿Para qué sirve? | ¿La usarás mucho?
formControlName | Vincula el componente al formulario reactivo. | ⭐⭐⭐⭐⭐
placeholder | Texto de ayuda cuando el campo está vacío. | ⭐⭐⭐⭐⭐
toggleMask | Permite mostrar u ocultar la contraseña. | ⭐⭐⭐⭐⭐
feedback | Muestra u oculta el medidor de fortaleza. | ⭐⭐⭐⭐⭐
fluid | Hace que ocupe todo el ancho disponible. | ⭐⭐⭐⭐⭐
[disabled] | Deshabilita el componente dinámicamente. | ⭐⭐⭐⭐
promptLabel | Personaliza el texto inicial del medidor. | ⭐⭐⭐
weakLabel | Texto para contraseña débil. | ⭐⭐⭐
mediumLabel | Texto para contraseña media. | ⭐⭐⭐
strongLabel | Texto para contraseña fuerte. | ⭐⭐⭐

- p-card:

Componente para agrupar la informacion relacionada
Dentro de esa caja puedes colocar:

Títulos.
Formularios.
Botones.
Imágenes.
Tablas.
Texto.

Porque p-card ya incorpora un diseño consistente con el tema de PrimeNG.

Además, deja clara tu intención.

No es lo mismo leer

```typescript
<div>
```

que leer:

```typescript
<p-card>
```

Con p-card cualquier desarrollador entiende inmediatamente:
"Aquí comienza una tarjeta."

La estructura de p-card

Normalmente una tarjeta tiene tres partes.

┌─────────────────────┐
│ Header │
├─────────────────────┤
│ │
│ Content │
│ │
├─────────────────────┤
│ Footer │
└─────────────────────┘

No siempre necesitas las tres.

1. Header

Es la parte superior.

Generalmente contiene:

Título.
Imagen.
Icono.

Ejemplo:

```typescript
<ng-template #header>

</ng-template>
```

2. Content

Es el cuerpo.

Aquí normalmente colocas:

Formularios.
Texto.
Tablas.
Componentes.

Es la parte que más usarás.

3. Footer

Va al final.

Muy usado para:

Botones.
Acciones.
Enlaces.

Ejemplo real
```typescript
<p-card>

    <h2>Iniciar sesión</h2>

    <input pInputText>

    <p-password></p-password>

    <p-button></p-button>

</p-card>
```

- p-select:

Propiedad | ¿Para qué sirve? | ¿La usarás mucho?
options | Define las opciones que aparecerán en el select. | ⭐⭐⭐⭐⭐
optionLabel | Define qué propiedad del objeto se muestra al usuario. | ⭐⭐⭐⭐⭐
optionValue | Define qué propiedad del objeto se guardará como valor. | ⭐⭐⭐⭐⭐
formControlName | Vincula el select con un formulario reactivo. | ⭐⭐⭐⭐⭐
placeholder | Texto mostrado cuando todavía no se ha seleccionado una opción. | ⭐⭐⭐⭐⭐
fluid | Hace que el select ocupe todo el ancho disponible. | ⭐⭐⭐⭐⭐
disabled | Deshabilita el componente. | ⭐⭐⭐⭐
showClear | Permite limpiar la selección realizada. | ⭐⭐⭐⭐
filter (boolen)| Permite buscar dentro de las opciones. | ⭐⭐⭐⭐
filterBy (propiedad a filtar) | Permite buscar dentro de las opciones. | ⭐⭐⭐⭐
loading | Muestra que las opciones están cargando. | ⭐⭐⭐


- pInputText = Aplica el estilo de PrimeNG a un <input>
- p-password = Campo de contraseña con funcionalidades como mostrar/ocultar el texto y validaciones visuales
- [toggleMask]="true" = Muestra el ícono para revelar u ocultar la contraseña
- p-button = Botón con estilos y estados (loading, disabled, etc.)
- p-password = Contraseñas.
- p-inputnumber = Números.
- p-inputmask = Campos con máscara (teléfono, documento, etc.).
- p-textarea = Área de texto.
- p-datepicker = Selector de fecha.
- p-select = Lista desplegable.
- p-autocomplete = Autocompletado.
- fluid = para dar ancho a inputs de ngprime ya que w-full no funciona por si solo por que no son inputs puros estan dentro de un host(p-button) por ejemplo el button html original puro esta oculto, solucion: usar las propiedades propias de primeNG, usar Usar PassThrough (pt), Usar CSS personalizado (Último recurso y menos recomendado ).

# 16. Responsabilidades de diseno con esta arquitectura

- Angular se enecarga de la logica de negocio
- Tailwind organiza y distribuye la interfaz (layout, espaciado, responsive).
- PrimeNG proporciona componentes ricos (tablas, diálogos, calendarios, botones...).
- El tema define la identidad visual (colores, radios, tipografía).

Angular → Lógica

↓

Tailwind → Layout

↓

PrimeNG → Componentes

La filosofía profesional

Cada herramienta tiene una responsabilidad.

🟦 Tailwind

Se encarga del layout.

Es decir:

- Flex
- Grid
- Responsive
- Espaciados
- Márgenes
- Padding
- Centrado
- Distribución

Ejemplo:

```typescript
<div class="flex justify-center items-center min-h-screen">
```

🟦PriemNG

Se encarga del componente.

Ejemplo:

```typescript
<p-button />

<p-table />

<p-password />

<p-dialog />

<p-datepicker />
```

PrimeNG ya implementó:

Accesibilidad
Eventos
Estados
Animaciones
Navegación con teclado
ARIA
Comportamientos complejos

No vale la pena reinventarlo.

---

# 17. Interceptor de logs

Recomendable tener un interceptor de logs,bpreferiblemente que rastree el response y el request de cada peticion http
y el correspondiente error

---

## REGLA DE ORO

Cuando una clase de Tailwind no funciona sobre un componente de PrimeNG, NO empieces a pelear con Tailwind.
Hazte estas tres preguntas, en este orden:

🥇 Opción 1 (Siempre la primera)
¿PrimeNG ya tiene una propiedad para hacerlo?
No intentes resolver con Tailwind algo que PrimeNG ya resuelve.

🥈 Opción 2
¿Puedo usar PassThrough (pt)?
Aquí Tailwind sí llega al elemento correcto.
Esta es una técnica muy usada en proyectos profesionales.

🥉 Opción 3
CSS personalizado
Solo cuando las dos anteriores no sean suficientes.
Es el último recurso.

Ejemplo:

```typescript
.my-button .p-button {
    border-radius: 9999px;
}
```

---

# 📌 Resumen

| Tema                                                                                                                          | Opciones                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. DATA User(login)**                                                                                                       | Mismo servicio que responde el token / Un servicio adiconal que lo haga aparte                                                                                                                                                                                |
| **2. Constructor vs `inject()`**                                                                                              | Ambos son válidos. En Angular moderno se suele preferir `inject()` por reducir código y facilitar algunos escenarios de pruebas e inicialización.                                                                                                             |
| **3. Configuración de environments**                                                                                          | Mantener ambientes separados (Dev, QA y Prod) con una interfaz común y configurar `angular.json` y los scripts de `package.json` para cada entorno.                                                                                                           |
| **4. APP_CONFIG centralizado**                                                                                                | Centralizar el acceso a la configuración de la aplicación mediante un único punto (`APP_CONFIG`) para evitar dependencias directas de `environment` y facilitar futuros cambios.                                                                              |
| **5. Seguridad de credenciales**                                                                                              | Nunca exponer secretos, contraseñas, API Keys privadas o credenciales en el frontend. Las integraciones con proveedores externos deben realizarse desde el backend y almacenar los secretos en un gestor seguro (Vault, User Secrets, Azure Key Vault, etc.). |
| **6. Observable**                                                                                                             | Un Observable es alguien que te avisa cuando pasa algo.                                                                                                                                                                                                       |
| en cada lugar que se necesita, lo ams usado es guardarlo en el localstorage, peor es mas seguro guardarlo en Cookies HttpOnly |
| **7. Almacenamiento de token**                                                                                                | Lo mas recomendable es centralizar el almacenamiento del token en un servicio y no usar directamente LocalStorage                                                                                                                                             |
| en cada lugar que se necesita, lo ams usado es guardarlo en el localstorage, peor es mas seguro guardarlo en Cookies HttpOnly |
| **7. Interceptors**                                                                                                           | Un Interceptor en Angular es una pieza de código que intercepta todas las peticiones HTTP que salen de tu aplicación y todas las respuestas que regresan del servidor, permitiéndote ejecutar lógica antes o después de que ocurra la comunicación.           |

---

> **Nota:** No existe una única arquitectura "correcta". La elección entre estas alternativas dependerá del tamaño del proyecto, los estándares del equipo, los requisitos del negocio y el equilibrio entre simplicidad, mantenibilidad y escalabilidad.
