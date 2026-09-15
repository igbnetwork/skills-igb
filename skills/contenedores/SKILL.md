---
name: contenedores
description: Contenerizar un proyecto con Docker y servirlo detrás de NGINX — Dockerfile multi-stage, docker-compose para el entorno local, NGINX como reverse proxy o como servidor de una SPA, healthchecks y gestión de secretos. Úsala cuando el usuario hable de dockerizar, contenedores, Dockerfile, docker-compose, NGINX, reverse proxy, servir una SPA en producción o preparar una imagen para desplegar. | EN: Containerize a project with Docker and serve it behind NGINX — multi-stage Dockerfile, docker-compose for local development, NGINX as reverse proxy or SPA server, healthchecks and secret handling. Use when the user mentions Docker, containers, Dockerfile, docker-compose, NGINX, reverse proxy, serving a SPA in production, or building an image to deploy.
metadata:
  version: "1.0"
  author: sistemas@igb.network
---

# Contenedores y NGINX

Empaqueta un proyecto en una imagen reproducible y lo pone detrás de NGINX.

## Antes de empezar: comprobar el terreno

```bash
command -v docker || echo "docker NO instalado"
command -v docker compose || docker-compose version 2>/dev/null
```

**En esta máquina (WSL) no hay Docker instalado.** Eso no impide escribir los ficheros — un `Dockerfile` es texto — pero sí impide *verificar* que la imagen construye. Si no está instalado:

1. Dilo de entrada, sin rodeos.
2. Escribe igualmente los ficheros si el usuario los quiere para el repo o para CI.
3. **Marca explícitamente que no se ha verificado el build.** Nunca digas "listo" sobre una imagen que no construiste.
4. Ofrece instalar Docker Desktop con integración WSL2, o construir en CI, y deja que el usuario elija.

## Decidir la forma de la imagen

Pregunta qué se está contenerizando, porque cambia todo:

| Caso | Forma |
|---|---|
| **SPA** (Angular, Vite, React) | Multi-stage: build con Node → copiar `dist/` a una imagen `nginx:alpine`. La imagen final no lleva Node. |
| **API** (Express, FastAPI…) | Imagen del runtime, dependencias de producción, usuario no-root, `CMD` al servidor. |
| **Monorepo** | Un `Dockerfile` por servicio, orquestados con `docker-compose`. No metas todo en una imagen. |
| **Base de datos** | **No la construyas**: usa la imagen oficial (`mongo:7`, `postgres:16`) con un volumen nombrado. |

Lee la plantilla correspondiente en `references/plantillas.md`.

## Reglas que no se negocian

- **Multi-stage siempre** que haya paso de build. Una imagen de SPA que arrastra `node_modules` pesa 10× lo necesario.
- **`.dockerignore` obligatorio**, y lo primero que escribes. Sin él, `node_modules` y `.git` se copian al contexto de build y todo se vuelve lento. Mínimo: `node_modules`, `dist`, `.git`, `.env`, `*.log`.
- **Nunca un secreto en el `Dockerfile`.** Ni `ENV JWT_SECRET=...`, ni un `.env` copiado con `COPY`. Los secretos entran en tiempo de ejecución (`--env-file`, variables del orquestador). Un secreto en una capa queda en la imagen para siempre, aunque lo borres después.
- **Usuario no-root** en la imagen final (`USER node` o un `adduser` propio).
- **Versiones fijadas**: `node:22-alpine`, no `node:latest`. Una imagen que cambia sola no es reproducible.
- **Healthcheck** en todo servicio de larga vida, para que el orquestador sepa si está vivo.
- **Orden de capas por frecuencia de cambio**: primero `COPY package*.json` + `npm ci`, después `COPY . .`. Al revés invalidas la caché en cada commit.

## NGINX

Dos papeles distintos, no los confundas:

**Servidor de SPA** — el fallback a `index.html` es imprescindible: sin él, recargar en una ruta del router devuelve 404.

**Reverse proxy** — delante de una o varias APIs: TLS, cabeceras `X-Forwarded-*`, límites de tamaño y de tasa.

Ambas configuraciones están en `references/nginx.md`. Puntos que se olvidan siempre:

- `try_files $uri $uri/ /index.html;` en la SPA.
- `proxy_set_header Host` y `X-Forwarded-For` / `X-Forwarded-Proto`, o la app verá la IP del proxy y generará URLs `http://` detrás de TLS.
- `client_max_body_size` si se suben ficheros — el defecto de 1 MB corta subidas sin explicación clara.
- `gzip` activado para texto; los assets con hash en el nombre, con `Cache-Control` largo; `index.html` **nunca** cacheado.

## Verificar

Si Docker está disponible, no cierres sin ejecutar:

```bash
docker build -t <nombre>:test .
docker run --rm -p 8080:80 --env-file .env <nombre>:test
curl -fsS localhost:8080 >/dev/null && echo "responde"
docker images <nombre>:test --format '{{.Size}}'   # ¿tamaño razonable?
```

Una SPA servida por NGINX debería rondar decenas de MB. Si pasa de 300 MB, el multi-stage está mal y hay que revisarlo antes de dar por bueno el trabajo.

Si Docker no está, di exactamente qué quedó sin verificar.

## Límites

- No publica imágenes en ningún registro ni despliega a producción sin petición explícita.
- No instala Docker por su cuenta.
- No genera certificados TLS: para producción, Let's Encrypt vía certbot o el TLS del proveedor.
