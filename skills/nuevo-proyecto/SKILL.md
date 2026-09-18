---
name: nuevo-proyecto
description: Arranca un proyecto nuevo de cero con calidad empresarial, en cualquier stack. Primero pregunta con quién trabaja y su nivel con la programación, y adapta a eso cuánto explica y qué decisiones toma por su cuenta. Después interroga y cuestiona los requisitos — alcance, usuarios, datos personales, pagos, copias de seguridad, mantenimiento — y traduce la jerga para quien no programa. Después monta estructura, convenciones y tooling: git, .gitignore, README, CLAUDE.md, .claude/settings.json y commit inicial. Trae recetas para Angular, API Node/Express + MongoDB, Vite, sitio estático y Python, más un procedimiento genérico para cualquier otro lenguaje o framework. Úsala cuando el usuario pida crear, arrancar, inicializar o montar un proyecto, repo o servicio nuevo, o normalizar un directorio sin git ni convenciones. | EN: Bootstrap a new project from scratch to enterprise standards, in any stack. First asks who it is working with and their programming level, adapting how much it explains and which decisions it makes on its own. Then interrogates and challenges requirements before writing code — scope, users, personal data, payments, backups, maintenance — and translates jargon for non-programmers. Then sets up structure, conventions and tooling. Use when the user asks to create, start, scaffold, bootstrap or initialize a new project, repo or service, or to normalize a directory that has no git or conventions.
metadata:
  version: "2.0"
  author: sistemas@igb.network
---

# Arranque de proyecto

Deja un proyecto nuevo listo para trabajar: estructura, git, documentación viva y permisos de Claude Code ya configurados. Todo en español, igual que el resto de la documentación de IGB.

## Regla de oro

**No inventes el stack.** Si el usuario no lo dice, pregúntalo antes de crear nada (pregunta 2 del Paso 1). Crear un scaffolding equivocado cuesta más que una pregunta.

**El stack lo elige el usuario, no esta skill.** `references/stacks.md` trae recetas ya escritas para los stacks que más se repiten aquí, pero son atajos, no un menú cerrado. Go, Rust, Laravel, Next.js, .NET, FastAPI, Flutter, un monorepo, lo que haga falta: se soporta igual, siguiendo el procedimiento genérico de ese mismo fichero. Nunca empujes al usuario hacia un stack conocido porque tengas la receta escrita.

## Paso 0 — ¿Con quién trabajo?

**Antes de cualquier otra cosa, pregunta con quién estás hablando.** Todo lo que viene después —cuánto explicas, qué decisiones delegas, si ofreces el stack o lo recomiendas— depende de esta respuesta. Es una sola pregunta y cambia la sesión entera:

> ¿Cómo te llamas, y cómo te describirías con la programación? Elige lo que más se parezca:
> **(a)** no programo · **(b)** estoy aprendiendo o me defiendo · **(c)** soy desarrollador

Si el usuario ya se ha identificado en la conversación, o el `CLAUDE.md` del directorio lo dice, **no lo preguntes otra vez**: dilo en voz alta ("trabajo contigo como perfil (c), corrígeme si no") y sigue.

Usa su nombre durante la sesión. No es adorno: un aviso que empieza por el nombre de quien lee —"<nombre>, esto que decidas ahora no se podrá cambiar fácilmente después"— se atiende de otra forma que un párrafo impersonal.

### Cómo cambia tu forma de trabajar

| | **(a) No programa** | **(b) Aprendiendo** | **(c) Desarrollador** |
|---|---|---|---|
| **Jerga** | Ninguna sin traducir, siempre con un ejemplo | Úsala y explícala la primera vez | Normal, sin explicar lo básico |
| **Decisiones técnicas** | Las tomas tú y pides visto bueno | Propones dos opciones con tu recomendación | Las discutes de igual a igual |
| **El stack** | No se lo preguntes: recomiéndalo y explica por qué | Recomienda y explica la alternativa descartada | Pregunta directamente cuál quiere |
| **Cada paso** | Di qué vas a hacer *antes* y qué pasó *después* | Explica el porqué, no solo el qué | Ejecuta y resume al final |
| **Los innegociables** | Explícalos por su consecuencia concreta | Explícalos por su motivo técnico | Menciónalos y sigue |
| **Errores** | "Esto es normal y se arregla así" — nunca dejarle pensando que rompió algo | Enseña a leer el mensaje de error | Pega el error y sigue |
| **Ritmo** | Un bloque de preguntas cada vez, esperando respuesta | Bloques, con contexto | Todo de golpe si ya tienes datos |

**Perfil (a) — lo que más importa.** Quien no programa no teme equivocarse en la respuesta: teme **no entender la pregunta** y quedar en evidencia. Así que nunca preguntes algo sin decir para qué sirve, ofrece siempre una opción por defecto para que le baste con asentir, y si contesta "lo que tú veas", no lo tomes como desinterés — tómalo como que la pregunta estaba mal formulada y hazla más concreta.

**Perfil (c) — el riesgo opuesto.** No le expliques lo que ya sabe; es la forma más rápida de que deje de leerte. Pero **el Bloque B se hace igual**: un ingeniero también arranca proyectos sin pensar en copias de seguridad ni en quién mantendrá esto en un año.

Anota el perfil en el `CLAUDE.md` del proyecto, para que en las siguientes sesiones no haya que volver a preguntarlo.

## Paso 1 — Interrogatorio

**No eres un generador de plantillas: eres el arquitecto que hace las preguntas incómodas antes de que cuesten caras.** Muchas de estas decisiones son casi imposibles de revertir a los seis meses. Quince minutos de preguntas ahora ahorran semanas después.

### Cómo preguntar

- **En bloques, no de una en una.** Agrupa por tema y presenta el bloque entero.
- **Sin jerga sin traducir.** Si usas un término técnico, explícalo en la misma frase con un ejemplo concreto. "Autenticación (que cada usuario entre con su cuenta y solo vea lo suyo)". Quien responde puede no ser programador, y una respuesta dada sin entender la pregunta es peor que ninguna.
- **Ofrece un valor por defecto razonado** en cada pregunta: *"Por defecto haría X, porque Y. ¿Te vale?"*. Es más fácil corregir una propuesta que responder en el vacío.
- **Nunca preguntes algo que puedas averiguar tú** mirando el disco o el repo.

### Cuestiona las respuestas

Aceptar la primera respuesta es el fallo que esta skill existe para evitar. Repregunta cuando oigas:

| Respuesta | Qué repreguntar |
|---|---|
| "Que sea escalable" | ¿Cuántos usuarios el primer mes? ¿Y en un año? Un sistema para 50 personas y otro para 50.000 no se parecen en nada, y construir el segundo cuando necesitas el primero es dinero tirado. |
| "Lo básico, simple" | Enumera lo que *no* va a llevar (sin login, sin pagos, sin subida de ficheros) y pide confirmación explícita de cada exclusión. |
| "Con inteligencia artificial / blockchain / microservicios" | ¿Qué problema concreto resuelve eso aquí? Si no hay respuesta en una frase, no entra en la versión uno. |
| "Como *(producto famoso)*" | ¿Qué parte exactamente? Nadie construye un Uber; se construye una pantalla concreta que hace una cosa concreta. |
| "Urgente / para ya" | ¿Qué es lo mínimo que tiene que funcionar para que sirva? Eso es la versión uno; el resto es lista de deseos. |
| "No sé" en algo crítico | No lo rellenes tú. Ver la regla de bloqueo más abajo. |

Hazlo con respeto y sin condescendencia: quien responde entiende su negocio mejor que tú. Lo que aporta esta skill es traducir ese conocimiento a decisiones técnicas, no corregir a nadie.

### Bloque A — Qué se construye

1. **¿Qué hace y para quién?** En dos frases y sin tecnicismos. Si no se puede explicar en dos frases, el alcance todavía no está claro y hay que acotarlo antes de escribir código.
2. **¿Quién lo usa?** ¿Público general, clientes con cuenta, personal interno? Define si hace falta autenticación y de qué tipo.
3. **¿Cuántos usuarios el primer mes y dentro de un año?** Un orden de magnitud basta. Decide si vale un servidor pequeño o hace falta pensar en escalado.
4. **¿Qué es lo mínimo que tiene que funcionar para que sirva?** Esta es la versión uno. Todo lo demás se anota en el README como futuro, no se construye ahora.

### Bloque B — Datos y riesgo *(el bloque que nadie hace y que más caro sale)*

5. **¿Guarda datos personales?** Nombres, correos, teléfonos, direcciones, documentos de identidad. Si sí: hay obligaciones legales de protección de datos y hay que decidir ya dónde se alojan y quién accede.
6. **¿Hay dinero de por medio?** Pagos, facturación, contratos. Si sí: **nunca** se guardan datos de tarjeta propios — se delega en una pasarela (Stripe, Mercado Pago, la que use la empresa). Confírmalo antes de diseñar nada.
7. **¿Qué pasa si los datos se pierden?** ¿Es una molestia o es el fin del negocio? Determina si hacen falta copias de seguridad automáticas desde el día uno, y con qué frecuencia.
8. **¿Qué pasa si el sistema se cae una tarde?** ¿Se espera, o hay que llamar a alguien? Determina si hace falta monitorización y avisos.
9. **¿Quién va a mantener esto dentro de un año?** Si la respuesta es "no lo sé", entonces la documentación y los tests no son opcionales: son la única forma de que el proyecto sobreviva a quien lo escribió.

### Bloque C — Concreción técnica

10. **Nombre** → en `kebab-case`; será el directorio y el identificador del proyecto.
11. **Stack** → pregunta abierta, no una lista cerrada. Si nombra uno con receta en `references/stacks.md` (`angular`, `api-node`, `vite`, `estatico`, `python`), úsala; si no, aplica el procedimiento genérico de ese fichero. **Si quien responde no es programador, no le pidas que elija el stack: recomiéndalo tú a partir de los bloques A y B, explica en una frase por qué, y pide su visto bueno.**
12. **Ubicación** → por defecto, un directorio `<nombre>` junto a los demás proyectos del usuario (normalmente el directorio actual o su carpeta habitual de trabajo). Confirma si va dentro de un monorepo existente.
13. **Despliegue** → dónde va a vivir: Render, Vercel, VPS, AWS, o aún ninguno. Si no se sabe, `ninguno` es una respuesta válida y el proyecto se prepara para decidirlo después.
14. **¿Cómo se llega a ese servidor?** Pregunta obligatoria en cuanto el destino sea un servidor propio (VPS, EC2, máquina de oficina). Tres respuestas posibles, y cada una cambia el despliegue entero:
    - **Público en internet** — cualquiera puede alcanzarlo; el despliegue automático es directo.
    - **Solo por VPN** (Tailscale, WireGuard, VPN corporativa) — el servidor **no es alcanzable desde fuera**, así que un runner de CI en la nube no puede desplegar sin unirse antes a esa red. Hay que resolverlo explícitamente.
    - **Solo desde la red interna** — el despliegue automático desde la nube directamente no es viable; hace falta un runner dentro.

    No la des por supuesta: es el error que produce pipelines que fallan siempre sin que se entienda por qué. Cuando toque automatizar el despliegue, la skill `ci-cd` cubre cómo resolver cada caso.
15. **Entornos** → ¿hará falta un entorno de pruebas separado del real? Para cualquier cosa con usuarios de verdad, la respuesta es sí.

### Regla de bloqueo

Las preguntas **1, 5, 6 y 10** son bloqueantes. Sin ellas no se empieza, y **no las rellenes tú con una suposición**: equivocarse en el modelo de datos personales o en el tratamiento de pagos no se arregla con un refactor, se arregla rehaciendo el proyecto y a veces con consecuencias legales.

El resto admite un valor por defecto, siempre que lo declares en voz alta: *"Asumo un entorno único porque no hay usuarios reales todavía; se puede añadir staging después."*

### Antes de escribir el primer fichero

Devuelve un **resumen de decisiones** y espera confirmación explícita:

```
Voy a crear <nombre> en <ruta>.
  Trabajo con ....... <nombre> (perfil <a|b|c>)
  Qué hace .......... <dos frases>
  Usuarios .......... <quién, cuántos>
  Versión uno ....... <lo mínimo que debe funcionar>
  Datos sensibles ... <sí/no — y qué implica>
  Stack ............. <cuál, y en una frase por qué>
  Despliegue ........ <dónde, o pendiente>
  Acceso al servidor  <público | solo VPN | solo red interna>
  Entornos .......... <uno o dos>
  NO incluye ........ <exclusiones confirmadas>
Supuestos que he asumido: <lista, o "ninguno">
¿Lo confirmas o corrijo algo?
```

Este resumen se guarda literalmente en el `CLAUDE.md` del proyecto. Es la memoria de por qué las cosas son como son, y evita que dentro de seis meses nadie sepa justificar una decisión.

## Nivel empresarial: lo innegociable

Estas siete cosas van **siempre**, aunque el proyecto parezca pequeño y aunque nadie las pida. Son justo las que no se añaden después, porque cuando duelen ya es tarde. Si alguna se omite, que sea una decisión consciente del usuario y quede escrita en el `CLAUDE.md` junto al motivo.

1. **Control de versiones desde el primer commit.** Un proyecto sin git no existe: no se puede revertir, ni saber quién cambió qué, ni trabajar en paralelo.
2. **Secretos fuera del código, siempre.** En variables de entorno, con un `.env.example` versionado. Una contraseña subida a git sigue en el historial para siempre aunque la borres después — hay que rotarla, no basta con quitarla.
3. **Separación entre pruebas y producción.** En cuanto haya usuarios reales. Probar contra la base de datos real acaba en pérdida de datos; no es una hipótesis, es cuestión de tiempo.
4. **Copias de seguridad automáticas** si el proyecto guarda datos que importan. Y **verificadas**: una copia que nunca se ha restaurado no es una copia, es una suposición.
5. **Documentación mínima viva** — `README.md` y `CLAUDE.md`. Debe bastar para que alguien nuevo arranque el proyecto sin preguntar a nadie.
6. **Una forma automática de saber si algo se rompió.** Tests, aunque sean cuatro. Sin ellos, cada cambio es una apuesta y el miedo a tocar el código crece hasta que nadie lo toca.
7. **Dependencias con versión fijada** (`package-lock.json`, `requirements.txt` con versiones exactas). Si no, el proyecto construye hoy y falla mañana sin que nadie haya cambiado nada.

Cuando el interlocutor no es programador, **explica el porqué de cada una con su consecuencia concreta**, no como una regla que hay que obedecer. "Sin copias de seguridad, si el servidor falla perdemos los contratos de los clientes y no hay forma de recuperarlos" se entiende; "hay que tener backups" no convence a nadie.

## Paso 2 — Verificar el terreno

Antes de escribir un solo fichero:

```bash
ls -A <ruta>            # ¿existe? ¿está vacío?
git -C <ruta> status    # ¿ya es un repo?
node -v && npm -v       # toolchain disponible
```

- Si el directorio **existe y tiene contenido**: para y pregunta si es un proyecto a normalizar (entonces salta al paso 3, sin sobrescribir nada) o si hay que elegir otro nombre.
- Si **ya es un repo git**: no ejecutes `git init`. Reutiliza el repo existente.
- Nunca sobrescribas un fichero existente. Si `README.md` ya está, **muestra la diferencia y pregunta** antes de tocarlo.

## Paso 3 — Estructura y tooling del stack

Lee **solo la sección del stack elegido** en `references/stacks.md` — o la sección **«Cualquier otro stack»** si no tiene receta propia.

Criterios comunes, valgan para el stack que valgan:

- **Usa el scaffolding oficial del framework** (`cargo new`, `go mod init`, `create-next-app`, `composer create-project`, `dotnet new`…) en lugar de crear carpetas a mano. El oficial trae convenciones que el ecosistema espera.
- **Verifica que la herramienta existe antes de usarla** (`command -v <bin>`). En esta máquina hay Node 22, npm 10, Python 3.14, git 2.53 y mongosh; no hay docker, gh, pnpm, yarn ni bun. Si el stack pedido necesita algo no instalado, **dilo antes de empezar** y deja que el usuario decida si lo instala o cambia de enfoque.
- **Fija la versión del runtime** en el fichero que use ese ecosistema: `.nvmrc`, `.python-version`, `go.mod`, `rust-toolchain.toml`, `.tool-versions`.
- Nada de dependencias, artefactos de build ni `.env` en git — lo cubre el `.gitignore` del paso 3.
- Secretos **siempre** en variables de entorno, nunca en el código, más un `.env.example` versionado con las mismas claves vacías.

## Paso 4 — Ficheros base (todos los stacks)

Copia las plantillas de `references/plantillas.md` y **rellénalas con los datos reales del proyecto**. No las pegues con los marcadores `<...>` sin sustituir.

| Fichero | Para qué |
|---|---|
| `.gitignore` | Base común + bloque del stack |
| `README.md` | Qué es, cómo se instala, cómo se arranca, cómo se despliega |
| `CLAUDE.md` | Contexto permanente para Claude Code: stack, comandos, convenciones, zonas sensibles |
| `.claude/settings.json` | Permisos de solo-lectura preaprobados para que no te pregunte en bucle |
| `.env.example` | Contrato de variables de entorno (si el stack usa `.env`) |
| `ESTRUCTURA.md` | Mapa de carpetas — solo si el proyecto tiene más de un módulo |
| `DESPLIEGUE.md` | Pasos de despliegue — solo si el destino no es `ninguno` |

`CLAUDE.md` es el fichero que más rinde a largo plazo: escríbelo con comandos que **has verificado que funcionan**, no con los que supones.

## Paso 5 — Verificar antes de commitear

No declares el proyecto listo sin haber ejecutado la comprobación del stack. Por orden de fuerza, ejecuta la más alta que el proyecto permita:

1. **Los tests** (`npm test`, `pytest`, `cargo test`…). Es la única que demuestra que el código *hace* algo.
2. **El build de producción**, si no hay tests todavía.
3. **Una comprobación de sintaxis** (`node --check`, `py_compile`) como último recurso. Es la más débil: un proyecto la pasa y puede estar roto de todas formas.

Si te quedas en el nivel 3, **dilo explícitamente** — "solo verifiqué sintaxis" — en lugar de dar el proyecto por comprobado.

Si algo falla:

- **Arréglalo** si es trivial (una dependencia que falta, un script mal escrito).
- **Repórtalo tal cual** si no lo es. No ocultes un build roto detrás de un commit inicial verde.

## Paso 6 — Commit inicial

```bash
git -C <ruta> init -b main     # solo si aún no es repo
git -C <ruta> add -A
git -C <ruta> status --short   # revisa que no entre node_modules, dist ni .env
git -C <ruta> commit -m "..."
```

Revisa `git status --short` **antes** del commit. Si aparece `node_modules/`, `dist/` o `.env`, el `.gitignore` está mal: corrígelo y vuelve a empezar el `add`.

Mensaje del commit inicial:

```
chore: estructura inicial del proyecto <nombre>

Stack: <stack>. Incluye configuración base, documentación
(README, CLAUDE.md) y .gitignore.
```

Añade las líneas de atribución de Claude Code si la sesión las tiene configuradas.

**Quién ejecuta esto depende del perfil** (Paso 0): con un desarrollador, entrégale el bloque de comandos y deja que los ejecute él; con quien no programa, hazlo tú y cuéntale en una frase qué acabas de guardar y para qué sirve. El flujo completo de ramas, pull requests y fusiones está en la skill `git-flujo`.

**No hagas `git push`, no crees remoto y no despliegues** salvo que el usuario lo pida explícitamente.

## Paso 7 — Cerrar

Resume en pocas líneas:

- Ruta del proyecto y stack elegido.
- Comando para arrancar en desarrollo.
- Qué quedó verificado y qué no.
- Siguiente paso concreto pendiente (crear el remoto, rellenar `.env`, primera ruta/componente).

## Qué NO hace esta skill

- No crea repositorios remotos (`gh` no está instalado en esta máquina).
- No despliega ni toca producción.
- No instala herramientas del sistema (docker, bases de datos, runtimes).
- No escribe código de negocio: deja el proyecto listo para empezar, no empezado.
