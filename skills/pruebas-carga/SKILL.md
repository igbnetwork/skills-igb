---
name: pruebas-carga
description: Diseñar y ejecutar pruebas de carga y rendimiento con K6, y visualizar los resultados en Grafana — escenarios smoke/load/stress/soak, thresholds como criterio de aprobación, métricas y percentiles, salida a Prometheus o InfluxDB y paneles de Grafana. Úsala cuando el usuario hable de K6, pruebas de carga, estrés, rendimiento, latencia, throughput, cuántos usuarios aguanta, Grafana, observabilidad o dashboards de métricas.
metadata:
  version: "1.0"
  author: sistemas@igb.network
---

# Pruebas de carga (K6 + Grafana)

Mide cuánto aguanta un sistema y deja el resultado visible en un panel.

## Regla de seguridad, antes que nada

**Nunca lances una prueba de carga contra producción sin autorización explícita del usuario, en este mismo hilo.** Una prueba de carga es indistinguible de un ataque de denegación de servicio: puede tumbar el servicio, disparar el autoescalado y su factura, o hacer que el proveedor bloquee la IP.

Antes de ejecutar nada, confirma las tres:

1. **Qué entorno** — staging siempre que sea posible. Si es producción, que el usuario lo diga con esas palabras.
2. **Qué ventana horaria** — fuera de horas de uso real.
3. **Quién está avisado** — si hay más gente usando el sistema, tienen que saberlo.

Si el objetivo es un dominio que no es del usuario, **no la ejecutes**.

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
