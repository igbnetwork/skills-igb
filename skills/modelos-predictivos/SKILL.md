---
name: modelos-predictivos
description: Plantear, entrenar y evaluar modelos de machine learning clásico sobre datos propios — predecir bajas de clientes, impagos o averías, detectar operaciones anómalas, clasificar texto o incidencias. Cubre si el problema merece un modelo, qué datos hacen falta, fuga de información, línea base, validación temporal, clases desbalanceadas, y elegir el umbral según el coste real de cada error. Úsala cuando el usuario hable de predecir, clasificar, detectar anomalías, scoring, churn, riesgo, o de entrenar un modelo con sus datos históricos. | EN: Frame, train and evaluate classical machine learning models on your own data — predicting churn, defaults or failures, detecting anomalous transactions, classifying text or tickets. Covers whether the problem deserves a model at all, what data is required, data leakage, baselines, time-based validation, class imbalance, and choosing the threshold from the real cost of each error. Use when the user mentions prediction, classification, anomaly detection, scoring, churn, risk, or training a model on historical data.
metadata:
  version: "1.0"
  author: sistemas@igb.network
---

# Modelos predictivos

Modelos que alguien usa para decidir algo, no experimentos que acaban en un cuaderno.

## Adapta el nivel a quien tienes delante

Si el `CLAUDE.md` del proyecto dice con quién trabajas y su perfil, respétalo; si no, pregúntalo. Con quien no programa, habla de aciertos y errores en casos concretos, nunca de métricas sueltas: "de cada 10 clientes que marca, 7 se iban de verdad" se entiende; "precisión 0.7" no. Lo que no cambia con el perfil son las advertencias sobre datos personales ni sobre decisiones automáticas que afectan a personas.

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

## Paso 0 — ¿Merece la pena un modelo?

Cuatro preguntas. **Si alguna falla, no empieces**: te ahorras semanas.

1. **¿Qué decisión va a cambiar?** Si la predicción no dispara ninguna acción —llamar al cliente, revisar la operación, mandar un técnico—, no la construyas. Un panel con predicciones que nadie mira es trabajo tirado.
2. **¿Existe el dato de lo que pasó?** Para aprender hace falta el resultado histórico: quién se dio de baja, qué pago resultó fraudulento. Sin esa columna no hay aprendizaje supervisado. Y ojo: *"lo sabemos pero no está registrado"* significa que no lo tienes.
3. **¿Hay suficientes casos del suceso raro?** No importa tener un millón de filas si solo 30 son bajas. Con menos de unos cientos de casos positivos, el modelo memoriza en vez de aprender.
4. **¿Una regla simple ya lo resuelve?** "Cliente con dos impagos seguidos" puede capturar la mayor parte del valor sin modelo, sin mantenimiento y siendo explicable a un cliente o a un regulador. **Pruébala primero.**

Cuando alguien pide "usar IA" sin responder a esto, tu trabajo es traducir la petición en un problema concreto, no ponerte a entrenar.

## Paso 1 — Definir bien el problema

- **El momento de la predicción.** ¿Qué se sabe exactamente **cuando hay que decidir**? Todo lo posterior está prohibido. Esta pregunta previene el error del Paso 3.
- **La ventana.** "Se dará de baja" no significa nada; "se dará de baja en los próximos 30 días" sí.
- **El coste de cada error, en dinero o en molestia.** Molestar a un cliente que no se iba cuesta poco; perder a uno que sí se iba cuesta mucho. Esa asimetría decide el umbral del Paso 5, no una fórmula.

## Paso 2 — Los datos

- **Una fila por unidad de decisión**, con las columnas tal y como estaban en ese momento.
- **Datos personales:** si entran, hay obligaciones legales. Usa lo mínimo necesario y valora seudonimizar los identificadores.
- **Nada de variables protegidas** —ni sus sustitutos evidentes, como el código postal— en decisiones que afectan a personas. Un modelo aprende y amplifica el sesgo del histórico sin avisar.
- **Documenta de dónde sale cada columna.** En seis meses nadie recordará qué significaba `estado_2`.

## Paso 3 — Fuga de información: el fallo que más proyectos mata

**Fuga** es entrenar con información que no existirá cuando toque predecir de verdad. Produce resultados espectaculares en pruebas y un fracaso absoluto en producción.

Señales de alarma:

- **Un resultado demasiado bueno.** Un 99% de acierto casi siempre es fuga, no genialidad. Sospecha antes de celebrar.
- **Columnas rellenadas después del hecho.** `fecha_baja`, `motivo_cancelacion`, `importe_devuelto` — existen *porque* ocurrió lo que quieres predecir.
- **Agregados calculados sobre todo el histórico**, incluido el futuro de cada fila.
- **Preparar los datos antes de separar** entrenamiento y validación: normalizar o imputar con estadísticas de todo el conjunto filtra el futuro hacia atrás.

La comprobación que lo caza casi siempre: por cada columna, pregunta **"¿esto lo tendría el día que hay que decidir?"**. Si la respuesta es "no" o "depende", fuera.

## Paso 4 — Línea base y validación

**Entrena primero lo tonto.** La regla del Paso 0, o "predice siempre la clase mayoritaria". Es tu vara de medir: un modelo que no la supera claramente no compensa su coste de mantenimiento, por elegante que sea.

Sobre la validación:

- **Si los datos tienen tiempo, separa por tiempo.** Entrena con lo viejo, valida con lo nuevo. Una separación aleatoria deja que el modelo vea el futuro y te miente.
- **Un conjunto final que no tocas** hasta el final. Si ajustas mirando el mismo conjunto una y otra vez, acabas ajustando a él.
- **Empieza por un modelo simple.** Una regresión logística o un árbol con refuerzo resuelven la mayoría de los casos tabulares, se entrenan en segundos y se explican. Redes neuronales solo si lo simple se queda corto y sabes por qué.

## Paso 5 — Evaluar como lo verá el negocio

- **La exactitud engaña con clases desbalanceadas.** Si el 2% se da de baja, predecir "nadie se va" acierta el 98% y no sirve de nada. No la uses como métrica principal.
- **Piensa en precisión y cobertura.** De los que marca, ¿cuántos lo eran? De los que lo eran, ¿a cuántos pilló? Suben y bajan en sentidos opuestos: **elige cuál te importa más según el coste del Paso 1.**
- **El umbral es una decisión de negocio, no técnica.** Un modelo da una probabilidad; dónde cortas depende de cuánto duele cada tipo de error y de cuántos casos puede atender el equipo al día. Preséntalo así: *"con este umbral marca 40 al día y acierta 7 de cada 10"*.
- **Mira en qué se equivoca**, no solo cuánto. Si falla sistemáticamente en un grupo concreto, tienes un problema de datos o de equidad, no de ajuste.

## Paso 6 — Entregar

Un modelo sin forma de usarse no está terminado. Tres formas, de menos a más esfuerzo:

1. **Por lotes** — se ejecuta cada noche y deja resultados en una tabla. Cubre la mayoría de los casos; empieza aquí.
2. **Bajo demanda** — un servicio que responde en el momento. Solo si la decisión es inmediata.
3. **Dentro de otro sistema** — embebido donde se toma la decisión.

En los tres: guarda **qué versión del modelo hizo cada predicción**, y registra la predicción junto al resultado real cuando se conozca. Sin eso no podrás saber si sigue funcionando. Lo que viene después —versionado, despliegue, vigilancia— está en la skill `mlops`.

## Límites

- No promete rendimiento sin haber validado fuera del conjunto de entrenamiento.
- No entrena con datos personales sin que el usuario sepa cuáles y lo apruebe.
- No automatiza decisiones que afectan a personas —conceder, denegar, cancelar— sin revisión humana y sin que el usuario lo decida explícitamente.
- Ante un resultado sospechosamente bueno, **busca la fuga antes de dar la buena noticia**.
