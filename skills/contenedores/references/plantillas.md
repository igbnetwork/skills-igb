# Plantillas de Dockerfile y compose

Sustituye los marcadores `<...>`. Fija siempre versiones concretas: `node:22-alpine`, nunca `node:latest`.

## `.dockerignore` — escríbelo primero

```
node_modules
dist
build
.git
.gitignore
.env
.env.*
*.log
coverage
.vscode
.idea
Dockerfile
docker-compose*.yml
```

Sin esto, el contexto de build copia `node_modules` y `.git`, y cada `docker build` tarda minutos de más.

---

## SPA (Angular / Vite / React) servida por NGINX

```dockerfile
# --- etapa 1: build ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                     # antes de copiar el código: aprovecha la caché
COPY . .
RUN npm run build

# --- etapa 2: servir ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist/<carpeta-de-salida> /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

`<carpeta-de-salida>` varía: Angular deja `dist/<nombre-del-proyecto>/browser`, Vite deja `dist`. **Compruébalo en `angular.json` o `vite.config.js`** — copiar la carpeta equivocada produce un 404 silencioso.

---

## API Node / Express

```dockerfile
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev          # sin dependencias de desarrollo en producción

COPY . .

USER node                      # nunca root
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD node -e "require('http').get('http://localhost:3000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "src/server.js"]
```

Requiere un endpoint `/health` en la app. Si no existe, créalo: debe responder 200 solo cuando el servicio está realmente listo (incluida la conexión a la base de datos).

---

## `docker-compose.yml` — entorno local

```yaml
services:
  api:
    build: ./api
    ports: ["3000:3000"]
    env_file: [.env]           # los secretos entran aquí, no en la imagen
    depends_on:
      mongo: { condition: service_healthy }
    restart: unless-stopped

  web:
    build: ./web
    ports: ["8080:80"]
    depends_on: [api]
    restart: unless-stopped

  mongo:
    image: mongo:7
    volumes: ["mongo-data:/data/db"]
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mongo-data:                  # volumen nombrado: los datos sobreviven al contenedor
```

Detalles que evitan problemas reales:

- **`depends_on` con `condition: service_healthy`**, no el `depends_on` simple: el simple solo espera a que el contenedor arranque, no a que el servicio acepte conexiones, y la API falla al conectar.
- **Volumen nombrado** para la base de datos. Con un bind mount a una carpeta del host en WSL, el rendimiento de Mongo cae en picado.
- **No publiques el puerto de Mongo** (`27017`) salvo que necesites conectarte desde el host. Dentro de la red de compose, los servicios se ven por nombre.
- El host de conexión desde la API es `mongodb://mongo:27017/<db>` — el nombre del servicio, no `localhost`.
