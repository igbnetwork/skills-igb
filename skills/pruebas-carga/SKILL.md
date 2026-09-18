---
name: pruebas-carga
description: Diseñar y ejecutar pruebas de carga y rendimiento con K6, y visualizar los resultados en Grafana — escenarios smoke, load, stress y soak, thresholds como criterio de aprobación, métricas y percentiles, salida a Prometheus o InfluxDB y paneles de Grafana. Úsala cuando el usuario hable de K6, pruebas de carga, estrés, rendimiento, latencia, throughput, cuántos usuarios aguanta, Grafana u observabilidad. | EN: Design and run load and performance tests with K6, and visualize results in Grafana — smoke, load, stress and soak scenarios, thresholds as pass/fail criteria, metrics and percentiles, Prometheus or InfluxDB output and Grafana dashboards. Use when the user mentions K6, load testing, stress testing, performance, latency, throughput, how many users it can handle, Grafana or observability.
metadata:
  version: "1.0"
  author: sistemas@igb.network
---

# Pruebas de carga (K6 + Grafana)

Mide cuánto aguanta un sistema y deja el resultado visible en un panel.

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

## Regla de seguridad, antes que nada

**Nunca lances una prueba de carga contra producción sin autorización explícita del usuario, en este mismo hilo.** Una prueba de carga es indistinguible de un ataque de denegación de servicio: puede tumbar el servicio, disparar el autoescalado y su factura, o hacer que el proveedor bloquee la IP.

Antes de ejecutar nada, confirma las tres:

1. **Qué entorno** — staging siempre que sea posible. Si es producción, que el usuario lo diga con esas palabras.
2. **Qué ventana horaria** — fuera de horas de uso real.
3. **Quién está avisado** — si hay más gente usando el sistema, tienen que saberlo.

Si el objetivo es un dominio que no es del usuario, **no la ejecutes**.

## Adapta el nivel a quien tienes delante

Si el `CLAUDE.md` del proyecto dice con quién trabajas y su perfil, respétalo. Si no lo sabes y la conversación no lo deja claro, **pregúntalo antes de empezar**: *¿te explico el porqué de cada paso, o voy al grano?*

- **Con quien no programa:** nada de jerga sin traducir, tú tomas las decisiones técnicas y pides visto bueno, y dices qué vas a hacer antes y qué pasó después. Los errores son normales y se arreglan — que nunca se quede pensando que rompió algo.
- **Con quien desarrolla:** al grano, sin explicar lo básico, y discutiendo las decisiones de igual a igual.

Lo que **no** cambia con el perfil son las comprobaciones de seguridad ni las advertencias sobre lo que no has podido verificar. Esas van siempre, y en el idioma de la consecuencia real.

## Paso 0 — Comprobar herramientas

```bash
command -v k6 || echo "k6 NO instalado"
```

No está instalado en esta máquina. Se puede escribir el script igual, pero **no podrás ejecutarlo**: dilo antes de empezar y no des resultados por supuestos. Instalación en WSL/Debian: repositorio oficial de Grafana (`dl.k6.io`).

## Paso 1 — Elegir el tipo de prueba

No todas responden la misma pregunta. Elige según lo que se quiera saber:

| Tipo | Pregunta que responde | Forma |
|---|---|---|
| **Smoke** | ¿El script funciona y el sistema responde? | 1-2 usuarios, 1 min. **Siempre la primera.** |
| **Load** | ¿Aguanta la carga esperada? | Rampa hasta N usuarios, sostener, bajar |
| **Stress** | ¿Dónde se rompe? | Rampas crecientes hasta que falla |
| **Soak** | ¿Se degrada con el tiempo? | Carga media durante horas. Detecta fugas de memoria |
| **Spike** | ¿Sobrevive a un pico súbito? | Subida brusca, sostener poco, bajar |

**Empieza siempre por smoke.** Lanzar una prueba de estrés con un script que tiene un bug solo te dice que el script está mal.

## Paso 2 — Thresholds, no impresiones

Un test sin `thresholds` no aprueba ni suspende: solo imprime números. Define el criterio **antes** de ejecutar:

```javascript
thresholds: {
  http_req_duration: ['p(95)<500'],   // 95% por debajo de 500 ms
  http_req_failed:   ['rate<0.01'],   // menos del 1% de errores
  checks:            ['rate>0.99'],
}
```

Sobre métricas:

- **Razona en percentiles, nunca en media.** La media esconde la cola; p95 y p99 son lo que sufre el usuario real.
- **`http_req_duration` no incluye el tiempo de `sleep`.** No confundas duración de petición con tiempo de iteración.
- **Usa `check()` para validar el contenido de la respuesta.** Un 200 con un cuerpo de error cuenta como éxito si solo miras el código de estado.
- **Datos de prueba realistas.** Pedir mil veces el mismo id mide la caché, no el sistema.

## Paso 3 — Grafana

Dos montajes posibles:

- **Grafana Cloud k6** — sin infraestructura, el panel viene hecho. Lo más rápido.
- **Autoalojado** — k6 exporta a Prometheus (`K6_PROMETHEUS_RW_SERVER_URL`) o InfluxDB, y Grafana lee de ahí. Requiere levantar ambos; con Docker es lo más práctico, y para eso está la skill `contenedores`.

En el panel, como mínimo: peticiones por segundo, p95 y p99 de latencia, tasa de error, y usuarios virtuales activos. Las cuatro juntas en el mismo eje temporal — una latencia alta solo se interpreta viendo cuánta carga había en ese momento.

## Paso 4 — Reportar

No entregues el volcado de k6. Entrega:

- **El veredicto**: ¿pasó los thresholds, sí o no?
- **Los números que importan**: p95, p99, tasa de error, RPS sostenido.
- **Dónde empezó a degradarse**, si lo hubo.
- **La hipótesis del cuello de botella**, marcada como hipótesis si no la comprobaste.

Si la prueba no llegó a ejecutarse, dilo. Un informe de rendimiento inventado es peor que no tener informe.

## Límites

- No ejecuta contra producción sin autorización explícita en el hilo.
- No ejecuta contra dominios de terceros.
- No instala k6, Grafana ni Prometheus por su cuenta.
- No optimiza el código a partir de los resultados salvo que se le pida: primero se mide y se reporta.
