# Plantillas de ficheros base

Sustituye **todos** los marcadores `<...>` por los datos reales antes de escribir el fichero.

---

## `.gitignore`

Bloque común, siempre:

```gitignore
# Dependencias
node_modules/
.venv/
__pycache__/

# Build
dist/
build/
.angular/
*.tsbuildinfo

# Entorno — nunca versionar secretos
.env
.env.local
.env.*.local

# Logs y temporales
*.log
npm-debug.log*
.DS_Store
*.swp

# Editor
.vscode/
.idea/

# WSL
*:Zone.Identifier

# Datos y respaldos
salida/
backups/
*.tar.gz
*.dump
```

Añade según el stack:

- **angular** → `.angular/cache/`, `/coverage`, `/e2e/*.js`
- **api-node** → `uploads/`, `tmp/`
- **vite** → `.vite/`, `dist-ssr/`
- **python** → `*.pyc`, `.pytest_cache/`, `*.egg-info/`

`.env.example` **sí** se versiona. `.env` **nunca**.

---

## `README.md`

````markdown
# <nombre>

<Una o dos frases: qué resuelve y para quién.>

## Stack

- <Runtime y versión: Node 22 / Python 3.14>
- <Framework: Angular 20 / Express 5 / Vite>
- <Base de datos, si aplica: MongoDB>

## Requisitos

- Node 22+ y npm 10+
- <Acceso a la base de datos, credenciales, VPN… lo que haga falta>

## Instalación

```bash
npm install
cp .env.example .env   # y rellenar los valores reales
```

## Desarrollo

```bash
npm run dev
```

Disponible en <http://localhost:PUERTO>.

## Build

```bash
npm run build
```

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `<VAR>` | Sí | <para qué sirve> |

## Despliegue

Ver `DESPLIEGUE.md`.
````

---

## `CLAUDE.md`

El fichero de mayor rendimiento a largo plazo. Solo comandos **verificados**, nada supuesto.

```markdown
# <nombre>

<Qué es el proyecto, en dos frases.>

## Stack

- <Runtime, framework, base de datos, con versiones reales>

## Comandos

| Acción | Comando |
|---|---|
| Instalar | `npm install` |
| Desarrollo | `npm run dev` |
| Build | `npm run build` |
| Tests | `npm test` |
| Lint | `npm run lint` |

## Estructura

- `src/<carpeta>/` — <responsabilidad>
- `src/<carpeta>/` — <responsabilidad>

## Con quién se trabaja

- <Nombre> — perfil <(a) no programa | (b) aprendiendo | (c) desarrollador>.
- Ajusta el nivel de explicación a ese perfil. Si entra otra persona, pregúntaselo y anótalo aquí.

## Convenciones

- Documentación y mensajes de commit en español.
- Commits con prefijo: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Secretos siempre en `.env`; al añadir una variable, replicarla en `.env.example`.
- <Convención propia del stack: naming de componentes, estructura de rutas…>

## Zonas sensibles

- <Ficheros o módulos que no se tocan sin avisar: migraciones, auth, facturación…>
- No ejecutar despliegues ni tocar producción sin confirmación explícita.
```

---

## `.claude/settings.json`

Preaprueba lo de solo lectura para no encadenar preguntas de permiso. Nada destructivo aquí.

```json
{
  "permissions": {
    "allow": [
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git branch:*)",
      "Bash(git show:*)",
      "Bash(npm run build:*)",
      "Bash(npm run lint:*)",
      "Bash(npm test:*)",
      "Bash(npm ls:*)",
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Bash(grep:*)",
      "Bash(find:*)",
      "Bash(node --check:*)"
    ]
  }
}
```

Deliberadamente **fuera** de la lista: `git push`, `git commit`, `npm install`, `rm`, y cualquier comando de despliegue. Esos se preguntan siempre.

---

## `.env.example`

Mismas claves que `.env`, con valores vacíos o de ejemplo evidente. Jamás un secreto real.

```
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/<nombre>

# Seguridad — generar con: openssl rand -hex 32
JWT_SECRET=

# CORS
CORS_ORIGIN=http://localhost:4200
```

---

## `vercel.json` (frontend SPA en Vercel)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## `DESPLIEGUE.md`

```markdown
# Despliegue — <nombre>

## Entorno

- Plataforma: <Render | Vercel | VPS>
- URL: <https://...>
- Rama que despliega: `main`

## Variables de entorno en la plataforma

| Variable | Dónde se configura |
|---|---|
| `<VAR>` | <panel de Render/Vercel → Environment> |

Las variables se configuran **en el panel de la plataforma**, nunca en el repositorio.

## Pasos

1. `npm run build` en local y comprobar que compila.
2. `git push origin main`.
3. <Acción en la plataforma: build automático o despliegue manual.>
4. Verificar: <endpoint de salud o pantalla que confirma que subió bien>.

## Rollback

<Cómo volver atrás: redeploy de la versión anterior desde el panel, o revert + push.>
```
