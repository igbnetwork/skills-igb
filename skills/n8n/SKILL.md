---
name: n8n
description: Diseñar, revisar y mantener automatizaciones en n8n — workflows con webhooks, agentes de IA, integraciones con CRM y mensajería, gestión de estado y memoria, manejo de errores, reintentos y duplicados, y control de versiones de los workflows. Cubre los problemas que aparecen cuando una automatización pasa de prueba a producción: workflows gigantes, lógica duplicada, hojas de cálculo usadas como base de datos y credenciales mal guardadas. Úsala cuando el usuario hable de n8n, automatización, workflow, webhook, nodo, bot de atención, integración entre sistemas, o de arreglar una automatización que falla de forma intermitente. | EN: Design, review and maintain n8n automations — workflows with webhooks, AI agents, CRM and messaging integrations, state and memory handling, error handling, retries and deduplication, and version control for workflows. Covers what breaks when an automation goes from demo to production: oversized workflows, duplicated logic, spreadsheets used as databases, and mishandled credentials. Use when the user mentions n8n, automation, workflow, webhook, node, support bot, system integration, or fixing an automation that fails intermittently.
metadata:
  version: "1.0"
  author: sistemas@igb.network
---

# n8n

Automatizaciones que aguantan producción, no solo la demo.

## Adapta el nivel a quien tienes delante

Si el `CLAUDE.md` del proyecto dice con quién trabajas y su perfil, respétalo. Si no, pregúntalo antes de empezar: *¿te explico el porqué de cada paso, o voy al grano?* Con quien no programa, nada de jerga sin traducir y las decisiones técnicas las tomas tú pidiendo visto bueno. Lo que no cambia con el perfil son las advertencias de seguridad ni las de coste.

## Avisa si hay versión nueva

Al empezar a trabajar con esta skill, comprueba **una vez** si hay una versión más reciente:

```bash
npm view skills-igb version
```

Compárala con la instalada: `claude plugin list` si vino como plugin, o mira `~/.claude/skills/` si se instaló con npm.

- **Si hay una más nueva, dilo antes de empezar** y ofrece actualizar: *"hay una versión más reciente, ¿la actualizo antes de seguir?"*. No la instales por tu cuenta — es su máquina.
- **Si el usuario acepta**, actualiza y después **confirma en voz alta qué versión quedó instalada** y recuérdale que **Claude Code necesita reiniciarse** para cargarla. Una actualización silenciosa deja a la gente creyendo que usa algo que todavía no usa.
- **Si no hay red o el comando falla**, no te bloquees: dilo en una línea y sigue con la versión que haya.

Comandos de actualización, según cómo se instaló:

```bash
npx skills-igb                                    # instalado por npm
claude plugin marketplace update skills-igb && \
  claude plugin update skills-igb@skills-igb      # instalado como plugin
```

## Una cosa cada vez

**Da un comando, espera el resultado, interprétalo, y solo entonces da el siguiente.** No entregues una lista de cinco pasos para que se ejecuten de golpe: cada resultado cambia cuál es el paso siguiente, y una tanda entera obliga a la otra persona a decidir por su cuenta qué hacer con cada salida.

Tres reglas que lo hacen funcionar:

- **Nunca entregues un comando con un marcador sin rellenar.** Si necesitas un dato que aún no tienes —un nombre de servicio, un identificador, una ruta—, **ese dato es el siguiente paso**, no un `<hueco>` que la otra persona tenga que adivinar. Un comando que falla porque no se sustituyó un marcador es tiempo perdido y confianza perdida.
- **Di qué esperas ver** antes de que lo ejecute, y qué significaría cada resultado posible. Así la salida no es un jeroglífico.
- **Interpreta el resultado en voz alta** antes de continuar: qué acabas de aprender y qué descarta. Si el resultado no es concluyente, dilo en vez de seguir como si lo fuera.

Esto vale doblemente al diagnosticar algo que ya está en producción, donde un paso dado a ciegas puede romper el servicio.

## Antes de tocar nada: mira lo que ya existe

Si hay un MCP de n8n conectado, **léelo antes de proponer**. Un workflow nuevo que duplica lógica existente es peor que no tenerlo.

- Lista los workflows y fíjate en cuáles están activos.
- Busca nodos con el mismo nombre repetidos entre workflows — normalizar teléfonos, detectar idioma, validar la respuesta del modelo. Eso es lógica duplicada esperando a divergir.
- Mira si hay nodos `Error Trigger`. Si faltan, ese workflow falla en silencio.

Sin MCP, pide al usuario que exporte el JSON del workflow y trabájalo sobre el fichero.

## Los seis fallos que hunden una automatización en producción

Búscalos siempre al revisar, en este orden. Los tres primeros son los que más daño hacen.

### 1. Una hoja de cálculo usada como base de datos

Google Sheets para guardar memoria de conversación o estado es el atajo más común y el que peor escala:

- **Límites de peticiones.** La API corta a partir de cierto volumen. Cuando llegan muchos mensajes a la vez, unos se escriben y otros no, sin error visible para el usuario final.
- **Carreras entre escrituras.** Dos mensajes del mismo contacto a la vez leen la misma fila, y el segundo pisa lo que escribió el primero. La conversación "se olvida" de cosas de forma aleatoria — un fallo que no se reproduce y vuelve loco a quien lo busca.
- **Sin transacciones ni índices.** Buscar una fila entre decenas de miles es lento y cada búsqueda cuesta una llamada.

Sirve perfectamente para **registro y auditoría**, donde perder una fila no rompe nada y a la gente le gusta poder mirarlo. No sirve como **estado operativo**. Cuando el volumen crezca, ese estado va a Redis (memoria de conversación, con caducidad) o Postgres (datos que deben persistir). Plantéalo como una migración por etapas, no como rehacerlo todo.

### 2. Workflows demasiado grandes

Un workflow de más de 40 nodos ya cuesta de leer; pasados 100, nadie se atreve a tocarlo y los cambios se hacen añadiendo nodos al lado en vez de corrigiendo los que hay.

Trocéalo con **sub-workflows** por responsabilidad: recepción y normalización, decisión de la IA, acciones sobre sistemas externos, notificaciones. Cada uno se prueba por separado y se reutiliza desde varios sitios.

**Empieza por lo duplicado.** Lo que aparece en tres workflows —normalizar teléfonos, detectar idioma, validar la salida del modelo— es lo primero que debe salir a un sub-workflow: hoy son tres copias que ya han empezado a divergir, y cada arreglo hay que hacerlo tres veces.

### 3. Sin control de versiones

Si el número de versión vive en el nombre del workflow o en el de un nodo, no hay control de versiones: hay copias. No se puede ver qué cambió entre dos versiones, ni volver atrás, ni saber quién tocó qué.

**Exporta el JSON de cada workflow a un repositorio git.** Es un fichero de texto: `git diff` te dice exactamente qué nodo cambió. Con eso ya puedes revertir y revisar. Automatizarlo es mejor, pero exportar a mano tras cada cambio importante ya resuelve el 80%.

### 4. Webhooks sin defensa

Un webhook es una URL pública: cualquiera que la conozca puede invocarla.

- **Verifica el origen.** Firma compartida, cabecera secreta, o comprobación de que el payload trae lo que debe. No te fíes solo de que la URL sea difícil de adivinar.
- **Deduplica.** Los emisores reintentan ante un error o un timeout, así que el mismo evento llegará dos veces. Guarda el identificador del mensaje y descarta los repetidos — si no, el bot responde dos veces o se duplica un registro en el CRM.
- **Responde rápido.** Contesta 200 en cuanto recibas y sigue procesando después. Si tardas, el emisor asume fallo y reintenta, y multiplicas el problema.

### 5. Errores que nadie ve

- **`Error Trigger` en todo workflow activo**, y que avise por un canal que alguien mire de verdad.
- **Distingue el fallo del usuario del fallo del sistema.** Que un contacto no exista en el CRM es un caso normal, no un error; el error es que el CRM no responda.
- **Reintentos solo en lo que se puede repetir sin daño.** Reintentar una consulta es gratis; reintentar "enviar mensaje" o "crear oportunidad" duplica cosas de cara al cliente.
- **Que el fallo tenga salida visible.** Si el modelo falla, un mensaje de disculpa es mejor que el silencio: el silencio parece que lo ignoras.

### 6. Credenciales fuera de su sitio

Siempre en el almacén de credenciales de n8n, nunca escritas en un nodo de código ni en la URL de una petición. Una clave dentro de un nodo viaja en el JSON exportado y acaba en el repositorio.

## Cuando el workflow lleva un agente de IA

Los patrones específicos de IA —prompts, memoria, RAG, validación de salidas, coste— están en la skill `ia-generativa`. Los dos que no puedes saltarte:

- **Valida siempre la salida del modelo** antes de usarla. Si esperas JSON, parséalo y comprueba los campos; el modelo devolverá algo distinto tarde o temprano y el nodo siguiente reventará con un error incomprensible.
- **Deja siempre una puerta para el humano.** Que una persona pueda silenciar al bot para un contacto concreto y responder ella. Sin eso, el primer caso raro se convierte en un cliente enfadado sin salida.

## Verificar

No des un workflow por bueno sin ejecutarlo:

1. **Caso normal** — el camino feliz, de principio a fin.
2. **Caso raro** — payload incompleto, contacto inexistente, el modelo devuelve algo inesperado.
3. **El mismo evento dos veces** — ¿deduplica, o duplica?
4. **Con el servicio externo caído** — ¿avisa, o falla en silencio?

Si no puedes ejecutarlo tú, **dilo claramente** y deja escrita la lista de comprobaciones para quien pueda.

## Límites

- No activa ni desactiva workflows en producción sin petición explícita.
- No ejecuta workflows que envíen mensajes reales a clientes para "probar".
- No toca credenciales ni las lee.
- No borra ni reescribe un workflow existente: propone los cambios y deja que el usuario decida.
