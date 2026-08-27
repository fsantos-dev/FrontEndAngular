# Docker - Frontend

El frontend Angular está containerizado mediante un Dockerfile multi-stage.

## Multi-stage build

La primera etapa utiliza Node.js para instalar las dependencias y generar el build de producción de Angular.

La segunda etapa utiliza Nginx para servir los archivos estáticos generados.

La imagen final no contiene Node.js, npm ni `node_modules`.

## Configuración

El build utiliza la configuración `production` de Angular.

Las configuraciones específicas del ambiente se definen mediante los archivos de environment de Angular.

## Puerto

Nginx escucha en el puerto `80` dentro del contenedor.