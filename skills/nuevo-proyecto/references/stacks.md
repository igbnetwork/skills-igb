# Recetas por stack

Lee **solo la sección del stack elegido**.

Las cinco primeras secciones son **atajos para los stacks que más se repiten aquí**, no un menú cerrado. Para cualquier otro lenguaje o framework — Go, Rust, Next.js, Laravel, .NET, FastAPI, Flutter, Astro, un monorepo… — salta directo a **«Cualquier otro stack»** al final: el resultado es igual de completo, solo que la receta se deriva en el momento.

Toolchain verificado en esta máquina: Node 22, npm 10, Python 3.14, git 2.53, mongosh 2.3. **No** hay docker, gh, pnpm, yarn ni bun. Si el stack pedido necesita otro runtime (Go, Rust, PHP, .NET, Java…), compruébalo con `command -v` antes de prometer nada.

---

## `angular` — SPA Angular

Encaja con SPAs de gestión: Angular + Material o ng-bootstrap.

```bash
npx --yes @angular/cli@latest new <nombre> --style=scss --routing --ssr=false --skip-git
```

Estructura que deja el CLI, respétala:

```
src/app/
  core/          servicios singleton, interceptores, guards
  shared/        componentes, pipes y directivas reutilizables
  features/      un módulo o carpeta por funcionalidad
  environments/  environment.ts y environment.prod.ts
```

- Las URLs de API van en `src/environments/`, **nunca** hardcodeadas en los servicios.
- Si el proyecto consume la API de IGB, crea `core/services/api.service.ts` con la base URL leída del environment y un `HttpInterceptor` para el JWT.
- Scripts ya incluidos por el CLI: `start`, `build`, `test`, `lint`.

**Verificación:** `npm install && npx ng build`

---

## `api-node` — API Node + Express + MongoDB

API REST clásica: rutas, controladores, modelos y middleware separados.

```bash
mkdir -p <nombre>/src/{routes,controllers,models,middleware,config,utils} <nombre>/src/__tests__
cd <nombre> && npm init -y
npm i express mongoose dotenv cors helmet
```

`package.json` con `"type": "module"` y:

```json
"scripts": {
  "start": "node src/server.js",
  "dev":   "node --watch src/server.js",
  "test":  "node --test"
}
```

Node 22 trae `--watch` y un runner de tests integrados: no hace falta `nodemon` ni instalar un framework de tests.

**`"test": "node --test"`, sin ruta.** Pasarle un directorio (`node --test src/__tests__/`) falla con `Cannot find module`: Node interpreta el argumento como un módulo a ejecutar, no como una carpeta a explorar. Sin argumentos, descubre solo los ficheros `*.test.js` del proyecto.

Reparto de responsabilidades:

| Carpeta | Contiene |
|---|---|
| `routes/` | Solo define rutas y las enlaza a un controlador |
| `controllers/` | Lógica de petición/respuesta, sin acceso directo a mongoose |
| `models/` | Esquemas de mongoose |
| `middleware/` | Auth JWT, validación, manejo de errores |
| `config/` | Conexión a Mongo, carga de variables de entorno |

Variables de entorno mínimas para `.env.example`:

```
PORT=3000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
CORS_ORIGIN=http://localhost:4200
```

`JWT_SECRET` y `MONGODB_URI` **nunca** con valor real en `.env.example` ni en el repo.

### Tests desde el primer día

El punto 6 de «Nivel empresarial» exige una forma automática de detectar que algo se rompió, así que la API nace con tests. La clave es que **no dependan de una base de datos**: si la necesitan, no se pueden ejecutar en CI ni en una máquina recién clonada, y acaban abandonados.

Para conseguirlo, separa la construcción de la app de su arranque:

- `src/app.js` exporta `crearApp()`, que monta Express y devuelve la app **sin escuchar ni conectar a Mongo**.
- `src/server.js` conecta a Mongo y llama a `crearApp().listen(...)`.

Así los tests importan `crearApp()`, lo levantan en el **puerto 0** (el sistema asigna uno libre, y no chocan con un servidor de desarrollo ya arrancado) y comprueban lo que no necesita datos: que una ruta inexistente devuelve 404 en JSON, que una entrada inválida devuelve 400, que las cabeceras de seguridad están, y que `/health` responde 503 mientras no haya base de datos.

Cuatro tests así bastan para arrancar. Los que sí necesiten Mongo van aparte, en un script propio, y nunca contra la base de datos real.

**Verificación:** `npm install && npm test`

Comprobar solo la sintaxis (`node --check`) no basta: un proyecto puede pasarlo y estar roto. Si por lo que sea aún no hay tests, dilo explícitamente en vez de dar el proyecto por verificado.

---

## `vite` — Frontend Vite (JS/React/Vue)

Frontend ligero con ESLint, típicamente desplegado en Vercel o similar.

```bash
npm create vite@latest <nombre> -- --template <vanilla|react|vue>
cd <nombre> && npm install && npm i -D eslint
```

- Variables de entorno con prefijo `VITE_` (si no, Vite no las expone al cliente).
- Ficheros `.env.development` y `.env.production`, más `.env.example` versionado.
- Si el destino es Vercel, añade `vercel.json` con el rewrite de SPA (ver `plantillas.md`).

**Verificación:** `npm install && npm run build`

---

## `estatico` — Sitio HTML/CSS/JS sin build

Referencia viva en la casa: `INTERNET-IGB/index.html`.

```
<nombre>/
  index.html
  assets/{css,js,img}/
```

Sin `package.json` ni dependencias. Para servirlo en local: `python3 -m http.server 8080`.

**Verificación:** abrir `index.html` y comprobar que no hay rutas absolutas rotas (`grep -rn 'src="/\|href="/' .`).

---

## `python` — Script o utilidad Python

Para informes, migraciones y tareas puntuales sobre una base de datos.

```bash
mkdir -p <nombre>/src && cd <nombre>
python3 -m venv .venv && . .venv/bin/activate
python3 -m pip install --upgrade pip
```

- `requirements.txt` explícito y con versiones fijadas (`pymongo==4.x`, no `pymongo`).
- `.venv/` **siempre** en `.gitignore`.
- Configuración por variables de entorno vía `python-dotenv`, nunca credenciales en el código.
- Si el script genera informes, que escriba en una carpeta `salida/` ignorada por git.

**Verificación:** `. .venv/bin/activate && python3 -m py_compile src/*.py`

---

## Cualquier otro stack

Para lenguajes o frameworks sin receta escrita arriba. El objetivo no es improvisar: es **derivar la receta de la fuente correcta** y dejar el proyecto igual de completo.

### 1. Comprobar el toolchain

```bash
command -v <binario> && <binario> --version
```

Si falta, **para y dilo**. Ofrece las opciones reales (instalarlo, usar otro stack, trabajar en contenedor) y deja que el usuario elija. No instales runtimes del sistema por tu cuenta ni sigas adelante con un sustituto que nadie pidió.

### 2. Usar el scaffolding oficial

Siempre por delante de crear carpetas a mano: trae la estructura que el ecosistema espera y que las herramientas asumen.

| Ecosistema | Comando de arranque |
|---|---|
| Go | `go mod init <módulo>` |
| Rust | `cargo new <nombre>` |
| Next.js | `npx create-next-app@latest <nombre>` |
| Astro / Svelte / Nuxt | `npm create <astro\|svelte\|nuxt>@latest` |
| Laravel | `composer create-project laravel/laravel <nombre>` |
| .NET | `dotnet new <plantilla> -o <nombre>` |
| Java / Kotlin | `gradle init` o Spring Initializr |
| FastAPI / Django | `python3 -m venv .venv` + `pip install`, o `django-admin startproject` |
| Flutter | `flutter create <nombre>` |

Si no conoces el comando actual del framework, **no lo inventes**: busca la documentación oficial (WebSearch o el agente `web-fetch`) y confirma el comando vigente antes de ejecutarlo. Una plantilla obsoleta se paga durante toda la vida del proyecto.

### 3. Adaptar los ficheros base

Las plantillas de `plantillas.md` son casi todas independientes del stack. Traduce lo específico:

| Concepto | Dónde se concreta en cada stack |
|---|---|
| Versión del runtime | `.nvmrc`, `.python-version`, `go.mod`, `rust-toolchain.toml`, `.tool-versions` |
| Manifiesto de dependencias | `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, `composer.json`, `*.csproj` |
| Comandos de la tabla de `CLAUDE.md` | Los reales del stack: `cargo run`, `go test ./...`, `dotnet build`, `php artisan serve`… |
| Artefactos a ignorar | `target/`, `bin/`, `obj/`, `vendor/`, `.next/`, `__pycache__/` |
| Permisos de `.claude/settings.json` | Los de lectura/build del stack (`Bash(cargo check:*)`, `Bash(go build:*)`…). Nunca los destructivos. |

Para el `.gitignore`, parte del bloque común de `plantillas.md` y añade el del ecosistema — la plantilla oficial de <https://github.com/github/gitignore> es una buena base.

### 4. Verificar

Todo stack tiene una comprobación barata que demuestra que el esqueleto compila o arranca. Ejecútala antes del commit inicial:

`cargo check` · `go build ./...` · `dotnet build` · `npm run build` · `python3 -m py_compile` · `mvn compile`

Si no encuentras ninguna, al menos ejecuta el arranque en desarrollo y comprueba que no cae. **No cierres el paso 4 de la skill sin una verificación real ejecutada.**
