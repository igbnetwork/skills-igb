---
name: auditar-proyecto
description: Auditar un proyecto que ya existe y devolver un veredicto priorizado de su estado — secretos expuestos, dependencias sin soporte, ausencia de control de versiones, tests, documentación, despliegue o copias de seguridad, y riesgo de continuidad si se va quien lo mantiene. Es la puerta de entrada: detecta de qué está hecho, revisa cada frente y dice qué skill arregla cada hallazgo. No modifica nada, solo lee e informa. Úsala cuando el usuario pida auditar, revisar, diagnosticar o evaluar un proyecto, repositorio o servidor ya hecho, pregunte en qué estado está algo heredado, o quiera saber qué le falta a un proyecto. | EN: Audit an existing project and return a prioritized verdict on its state — exposed secrets, unsupported dependencies, missing version control, tests, documentation, deployment or backups, and continuity risk if whoever maintains it leaves. It is the entry point: it detects what the project is made of, reviews every front, and names which skill fixes each finding. It changes nothing, it only reads and reports. Use when the user asks to audit, review, diagnose or assess an existing project, repository or server, asks what state some inherited system is in, or wants to know what a project is missing.
metadata:
  version: "1.0"
  author: sistemas@igb.network
---

# Auditar un proyecto

Coger algo que ya existe y decir en qué estado está, con consecuencias concretas y por orden de urgencia.

## Regla absoluta: no tocas nada

**La auditoría solo lee.** No instala, no actualiza, no arregla, no reinicia servicios, no crea ficheros, no ejecuta el proyecto. Ni siquiera lo que parezca inofensivo.

Dos motivos, y el segundo es el que importa: un proyecto heredado hace cosas que nadie recuerda, y arreglar durante la auditoría destruye la foto del estado real. Primero se sabe qué hay; arreglar es una decisión posterior, del usuario, y con su propia skill.

Si encuentras algo **urgente** —un secreto expuesto, un puerto abierto con datos detrás—, **dilo en el momento**, no lo guardes para el informe final. Pero sigue sin tocarlo.

## Adapta el nivel a quien tienes delante

Si el `CLAUDE.md` del proyecto dice con quién trabajas y su perfil, respétalo; si no, pregúntalo. La diferencia aquí es grande: a quien no programa se le informa **en consecuencias** —"si mañana se va quien montó esto, nadie sabe desplegarlo"—; a quien desarrolla, en hallazgos técnicos con su ubicación exacta.

## Una cosa cada vez

**Da un comando, espera el resultado, interprétalo, y solo entonces da el siguiente.** En una auditoría esto no es cortesía: cada resultado decide dónde mirar después. Un volcado de quince comandos produce quince salidas que nadie interpreta.

Nunca entregues un comando con un marcador sin rellenar: si necesitas un dato que aún no tienes, **ese dato es el siguiente paso**.

**Si el proyecto está en una máquina que no alcanzas** —un servidor remoto, otra red—, no intentes acceder: entrega los comandos uno a uno y pide el resultado. Funciona igual de bien y es más seguro.

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

## Paso 1 — Qué es esto

Antes de juzgar nada, averigua de qué está hecho. Empieza por el listado del directorio y déjate guiar por lo que aparezca:

- **Fichero de dependencias** (`package.json`, `requirements.txt`, `go.mod`, `composer.json`) → el lenguaje, el framework y sus versiones. Es el documento que más dice en menos espacio.
- **`.git/`** → está versionado. Si falta, ese es ya el primer hallazgo grave.
- **`Dockerfile`, `docker-compose.yml`** → cómo se empaqueta.
- **`.github/`, `.gitlab-ci.yml`, `Jenkinsfile`** → si hay automatización.
- **Carpetas `models/`, `data/`, ficheros `.pkl`, `.onnx`** → hay modelos entrenados; entra en juego `mlops`.
- **Nada reconocible** → pregunta al usuario para qué sirve antes de seguir. Auditar a ciegas produce informes inútiles.

Resume en una frase qué es antes de pasar al Paso 2. Si no puedes, es que aún no lo sabes.

## Paso 2 — Los seis frentes

Revísalos en este orden. Los dos primeros son los que pueden costar dinero o datos **hoy**.

### 1. Secretos y accesos

- **Secretos en el repositorio**: busca `.env` versionado, claves y contraseñas en el código o en la configuración. Un secreto en git sigue en el historial aunque se borrara después.
- **Secretos en el historial**, aunque ya no estén en los ficheros actuales.
- **Qué está expuesto**: puertos abiertos, servicios accesibles desde internet, endpoints sin autenticación.
- Si encuentras un secreto real: **la primera recomendación es rotarlo ya**. Limpiar el historial viene después y no sustituye a rotarlo.

### 2. Dependencias sin soporte

- **Versiones del framework y del runtime**, y si siguen recibiendo parches de seguridad. Un framework de hace cinco años no es "estable": es "sin parches".
- **Vulnerabilidades conocidas** en las dependencias.
- **Cuánto duele actualizar**: no basta con decir "está viejo". Di si es un salto de versión menor o una reescritura, porque de eso depende que se haga o no.

### 3. Control de versiones

- ¿Está en git? ¿Hay remoto, o solo vive en esa máquina? **Un proyecto que solo existe en un servidor es un proyecto a un fallo de disco de desaparecer.**
- ¿Hay artefactos o dependencias versionados que no deberían?
- ¿El historial dice algo, o son commits de "cambios"?

### 4. Poder cambiarlo sin miedo

- **¿Hay tests?** Sin ellos cada cambio es una apuesta, y el miedo crece hasta que nadie toca el código.
- **¿Hay análisis de calidad?** Deuda técnica y vulnerabilidades que nadie ha mirado.
- **¿Se puede arrancar en local** siguiendo solo lo que está escrito?

### 5. Despliegue y operación

- **¿Cómo llega a producción?** Si es "entra alguien por SSH y copia", eso es un hallazgo.
- **¿Está documentado?** ¿Sabría hacerlo otra persona?
- **¿Cómo se vuelve atrás** si un despliegue sale mal?
- **¿Alguien se entera si se cae?** Un servicio sin vigilancia se descubre roto cuando llama un cliente.

### 6. Continuidad

El frente que nadie audita y el que más caro sale:

- **¿Hay copias de seguridad de los datos, y se ha restaurado alguna?** Una copia sin restaurar nunca no es una copia, es una suposición.
- **¿Quién sabe cómo funciona esto?** Si la respuesta es una sola persona, ese es el mayor riesgo del proyecto, por encima de cualquier problema técnico.
- **¿Está escrito en algún sitio** lo que solo está en la cabeza de alguien?

## Lo que falta también es un hallazgo

El error más común al auditar es informar solo de lo que está mal y callar lo que **no está**. Un problema se ve; una ausencia no: hay que ir a buscarla a propósito.

Por cada frente del Paso 2, responde las tres preguntas, en este orden:

1. **¿Lo tiene?** Sí, no, o a medias.
2. **Si no lo tiene, ¿qué pasa por eso?** En consecuencias concretas para este proyecto, no en abstracto. No *"faltan tests"*, sino *"cualquier cambio en el cálculo de comisiones puede romper algo y nadie se entera hasta que un cliente reclama"*.
3. **¿Merece la pena aquí?** Una ausencia no siempre es un defecto. Un script que se ejecuta una vez al mes no necesita pipeline de despliegue, y decir que le falta es ruido. **Justifica por qué sí lo necesita este proyecto**, o no lo listes.

Ese tercer filtro es lo que separa una auditoría útil de una lista de deseos copiada. Si no sabes decir por qué este proyecto en concreto necesita algo, no lo recomiendes.

Escribe cada ausencia como una línea del informe, igual que un defecto: qué falta, qué provoca, y qué skill lo monta.

## Paso 3 — Priorizar por consecuencia

Un informe de 80 hallazgos no lo lee nadie. Cinco bien ordenados sí. Tres niveles, definidos por lo que pasa, no por su nombre técnico:

| Nivel | Significa | Ejemplos |
|---|---|---|
| **Ahora** | Puede costar dinero o datos esta semana | Secreto expuesto, datos accesibles sin autenticación, sin copias de seguridad |
| **Pronto** | Va a doler y cada mes es más caro | Framework sin parches, sin control de versiones, nadie más sabe desplegarlo |
| **Cuando toque** | Mejora real, sin urgencia | Sin tests, sin CI, documentación escasa |

Ordena por consecuencia, no por facilidad. Y **si un frente no lo pudiste comprobar, dilo explícitamente** en vez de omitirlo: un hueco silencioso se lee como "está bien".

## Paso 4 — El informe

```
AUDITORÍA — <proyecto>            <fecha>

Qué es .......... <una frase>
Hecho con ....... <lenguaje, framework y versión>
Estado general .. <una frase honesta>

AHORA
  1. <Hallazgo en consecuencias> — <dónde> → skill `<cual>`
PRONTO
  2. …
CUANDO TOQUE
  3. …

Lo que NO pude comprobar: <lista, o "nada">
```

Cada hallazgo, tres cosas: **qué pasa si no se arregla**, **dónde está**, y **qué skill lo arregla**.

## Paso 5 — Qué skill arregla cada cosa

Aquí es donde la auditoría deja de ser un diagnóstico y se convierte en un plan. Por cada hallazgo, nombra la skill correspondiente:

Cada fila incluye por qué suele importar. Úsalo como punto de partida, pero **sustituye el porqué genérico por el de este proyecto**: el motivo real es siempre más convincente que el motivo de manual.

| Lo que encontraste — o lo que falta | Por qué importa | Skill que lo monta |
|---|---|---|
| Sin git, sin README, sin convenciones | No se puede volver atrás, ni saber qué cambió, ni que otro arranque el proyecto sin preguntar | `nuevo-proyecto` (modo normalizar) |
| Sin ramas ni pull requests; se trabaja sobre la principal | Un cambio a medias deja la rama principal rota, y nadie revisa nada antes de que entre | `git-flujo` |
| Despliegue manual, sin automatizar, sin entornos separados | Depende de que una persona concreta lo haga bien cada vez, y se prueba contra datos reales | `ci-cd` |
| Servicio expuesto directo, sin proxy ni TLS, sin empaquetar | Tráfico sin cifrar, sin límite de tasa y sin registro; y el entorno no se puede reproducir | `contenedores` |
| Sin análisis estático, deuda técnica sin medir | Los fallos y las vulnerabilidades conocidas se descubren en producción | `calidad-codigo` |
| Nadie sabe cuánta carga aguanta | El límite se descubre el día que más importa que aguante | `pruebas-carga` |
| Automatizaciones frágiles, duplicadas o sin control de errores | Fallan en silencio y la misma lógica arreglada en un sitio sigue rota en los otros dos | `n8n` |
| Bot o función con IA sin validar salidas, sin medir, sin control de coste | El modelo se sale de formato y rompe el paso siguiente; y la factura se descubre a fin de mes | `ia-generativa` |
| Modelos entrenados sin validación honesta ni línea base | Resultados que parecen excelentes en pruebas y fracasan en producción | `modelos-predictivos` |
| Modelos en producción sin versionar ni vigilar | Un modelo degradado no se cae: sigue respondiendo y solo acierta menos, durante meses | `mlops` |

**No lo arregles ahí mismo.** Presenta el plan, deja que el usuario elija por dónde empezar, y entonces se invoca la skill que toque. Que la auditoría termine en obras es exactamente lo que rompe la foto que acabas de tomar.

## Límites

- No modifica, instala, actualiza ni ejecuta nada del proyecto auditado.
- No accede a servidores por su cuenta: entrega los comandos.
- No informa de un frente que no comprobó como si estuviera bien.
- No recomienda algo solo porque esté en la lista: si no sabe decir por qué **este** proyecto lo necesita, no lo lista.
- No exagera la gravedad para que suene importante, ni la suaviza para no incomodar. Un secreto expuesto es urgente; la falta de tests no lo es.
- Ante un secreto real encontrado, lo primero que dice es **rótalo ahora**, antes de seguir con el resto del informe.
