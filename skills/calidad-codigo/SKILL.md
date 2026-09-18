---
name: calidad-codigo
description: Configurar y explotar análisis estático de calidad y seguridad con SonarQube o SonarCloud — sonar-project.properties, quality gates, cobertura de tests conectada al análisis, integración en el pipeline y lectura de resultados para priorizar deuda técnica. Úsala cuando el usuario hable de SonarQube, SonarCloud, quality gate, análisis estático, cobertura, deuda técnica, code smells o vulnerabilidades en el código. | EN: Configure and exploit static quality and security analysis with SonarQube or SonarCloud — sonar-project.properties, quality gates, test coverage wired into the analysis, pipeline integration, and reading results to prioritize technical debt. Use when the user mentions SonarQube, SonarCloud, quality gate, static analysis, code coverage, technical debt, code smells or code vulnerabilities.
metadata:
  version: "1.0"
  author: sistemas@igb.network
---

# Calidad de código (SonarQube)

Pone análisis estático sobre el proyecto y convierte el resultado en trabajo priorizado.

## Adapta el nivel a quien tienes delante

Si el `CLAUDE.md` del proyecto dice con quién trabajas y su perfil, respétalo. Si no lo sabes y la conversación no lo deja claro, **pregúntalo antes de empezar**: *¿te explico el porqué de cada paso, o voy al grano?*

- **Con quien no programa:** nada de jerga sin traducir, tú tomas las decisiones técnicas y pides visto bueno, y dices qué vas a hacer antes y qué pasó después. Los errores son normales y se arreglan — que nunca se quede pensando que rompió algo.
- **Con quien desarrolla:** al grano, sin explicar lo básico, y discutiendo las decisiones de igual a igual.

Lo que **no** cambia con el perfil son las comprobaciones de seguridad ni las advertencias sobre lo que no has podido verificar. Esas van siempre, y en el idioma de la consecuencia real.

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

## Paso 0 — SonarCloud o SonarQube

Decisión previa a todo, porque cambia la configuración entera:

| | SonarCloud | SonarQube autoalojado |
|---|---|---|
| Infraestructura | Ninguna (SaaS) | Servidor propio + PostgreSQL |
| Coste | Gratis en repos públicos, de pago en privados | Licencia de la edición + servidor |
| Cuándo | Por defecto, salvo que el código no pueda salir | Si hay requisito de que el código no salga de la red |

**No asumas cuál.** Pregúntalo. Si va autoalojado, la puesta en marcha del servidor es una tarea aparte (Docker + volumen persistente + PostgreSQL); no la mezcles con configurar el análisis.

## Paso 1 — `sonar-project.properties`

En la raíz del proyecto. Lo mínimo que importa:

```properties
sonar.projectKey=<organizacion>_<nombre>
sonar.projectName=<nombre>
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.spec.ts,**/*.test.js
sonar.exclusions=**/node_modules/**,**/dist/**,**/*.spec.ts
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.sourceEncoding=UTF-8
```

Errores que invalidan el análisis entero:

- **`sonar.exclusions` sin `dist/` ni `node_modules/`** → Sonar analiza código compilado y dependencias, y el informe se llena de ruido inútil.
- **Tests dentro de `sonar.sources` sin declararlos en `sonar.tests`** → cuentan como código de producción y hunden las métricas.
- **Ruta de cobertura equivocada** → Sonar informa 0 % de cobertura aunque los tests pasen. Verifica que el fichero existe **después** de correr los tests, antes de lanzar el análisis.

## Paso 2 — Cobertura de verdad

Sonar no ejecuta tus tests: **lee un informe que tú generas antes**. El orden es obligatorio:

```bash
npm test -- --coverage        # genera coverage/lcov.info
ls -la coverage/lcov.info     # comprobar que existe y no está vacío
# y solo entonces, el análisis de Sonar
```

Si el proyecto no tiene tests, la cobertura será 0 y eso es un dato honesto, no un fallo de configuración. Dilo tal cual en vez de maquillarlo.

## Paso 3 — Quality gate

El gate por defecto de Sonar aplica sobre **código nuevo**, no sobre todo el histórico. Eso es lo correcto: un proyecto heredado nunca pasaría un gate global, y bloquear todo desde el día uno hace que el equipo lo desactive.

- Empieza con el gate por defecto (*Sonar way*).
- Endurece después, cuando el equipo ya convive con él.
- No bajes el umbral para que pase un PR: o se arregla el problema, o se marca como *won't fix* con justificación escrita.

## Paso 4 — Integrarlo en el pipeline

Va en la etapa `scan`, **después** de `test` (necesita la cobertura) y **antes** de `deploy`. Requiere dos secretos en la plataforma de CI: `SONAR_TOKEN` y, si es autoalojado, `SONAR_HOST_URL`. Nunca en el YAML.

Si el pipeline aún no existe, usa la skill `ci-cd` primero.

## Paso 5 — Leer el resultado

El informe no es una lista de tareas: es materia prima. Priorízala así:

1. **Vulnerabilidades y security hotspots** — primero, siempre.
2. **Bugs** — fallos reales de lógica detectados.
3. **Code smells con alta duplicación** — el mejor retorno por esfuerzo.
4. **El resto** — no lo persigas a ciegas; mucho *smell* es ruido en contexto.

Al reportar al usuario, da números concretos y una recomendación, no un volcado del panel.

## Límites

- No levanta el servidor de SonarQube ni gestiona su licencia.
- No configura tokens en la plataforma de CI: eso es manual, en el panel.
- No modifica el quality gate para que un análisis pase.
