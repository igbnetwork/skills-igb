---
name: mlops
description: Llevar modelos a producción y mantenerlos vivos — reproducibilidad de los entrenamientos, seguimiento de experimentos, registro y versionado de modelos, despliegue por lotes o bajo demanda, puesta en marcha progresiva, vigilancia de deriva y de degradación, y cuándo reentrenar. Cubre el problema propio de los modelos: no se caen, simplemente empeoran en silencio. Úsala cuando el usuario hable de poner un modelo en producción, versionarlo, monitorizarlo, reentrenar, deriva de datos, MLflow, o de un modelo que funcionaba y ya no. | EN: Take models to production and keep them alive — training reproducibility, experiment tracking, model registry and versioning, batch or on-demand deployment, progressive rollout, drift and decay monitoring, and when to retrain. Covers the failure mode specific to models: they do not crash, they quietly get worse. Use when the user mentions putting a model in production, versioning it, monitoring, retraining, data drift, MLflow, or a model that used to work and no longer does.
metadata:
  version: "1.0"
  author: sistemas@igb.network
---

# MLOps

Un modelo en producción no es código desplegado: es código **más** datos **más** un mundo que cambia. Los tres se mueven, y el tercero no avisa.

## Adapta el nivel a quien tienes delante

Si el `CLAUDE.md` del proyecto dice con quién trabajas y su perfil, respétalo; si no, pregúntalo. Con quien no programa, explica la deriva con un ejemplo de su negocio —"el modelo aprendió con los clientes de hace dos años y los de ahora se comportan distinto"— en vez de con nombres de técnicas.

## Una cosa cada vez

**Da un comando, espera el resultado, interprétalo, y solo entonces da el siguiente.** No entregues una lista de cinco pasos para que se ejecuten de golpe: cada resultado cambia cuál es el paso siguiente, y una tanda entera obliga a la otra persona a decidir por su cuenta qué hacer con cada salida.

Tres reglas que lo hacen funcionar:

- **Nunca entregues un comando con un marcador sin rellenar.** Si necesitas un dato que aún no tienes —un nombre de servicio, un identificador, una ruta—, **ese dato es el siguiente paso**, no un `<hueco>` que la otra persona tenga que adivinar. Un comando que falla porque no se sustituyó un marcador es tiempo perdido y confianza perdida.
- **Di qué esperas ver** antes de que lo ejecute, y qué significaría cada resultado posible. Así la salida no es un jeroglífico.
- **Interpreta el resultado en voz alta** antes de continuar: qué acabas de aprender y qué descarta. Si el resultado no es concluyente, dilo en vez de seguir como si lo fuera.

Esto vale doblemente al diagnosticar algo que ya está en producción, donde un paso dado a ciegas puede romper el servicio.

## La diferencia que lo explica todo

Un servicio roto devuelve errores y alguien lo ve en cinco minutos. **Un modelo degradado sigue respondiendo con total normalidad**: mismas latencias, mismos códigos 200, cero errores en los registros. Solo acierta menos. Puede llevar meses así, tomando peores decisiones cada día, sin que nadie lo note.

Todo lo que sigue existe para acortar ese "nadie lo nota".

## Paso 0 — Empieza por lo mínimo que resuelve

No montes una plataforma para un modelo que se ejecuta una vez al mes. Por orden, y **para si ya te vale**:

1. **Reproducibilidad** — poder regenerar el mismo modelo. Innegociable.
2. **Versionado del modelo** — saber cuál está en producción y poder volver al anterior.
3. **Registro de predicciones** — guardar qué predijo, cuándo, con qué versión.
4. **Vigilancia** — enterarte de que empeora.
5. **Reentrenamiento** — automatizado solo cuando el manual ya moleste.

La mayoría de equipos necesitan 1-3 y creen que necesitan una plataforma entera.

## Paso 1 — Reproducibilidad

Un modelo que no se puede volver a generar no se puede arreglar ni auditar. Para reproducir hace falta fijar **cuatro** cosas, y casi todo el mundo olvida la segunda:

| Qué | Cómo |
|---|---|
| **Código** | Commit de git |
| **Datos** | Instantánea o consulta con fecha de corte. "La tabla de clientes" cambia cada día: sin corte, no hay reproducción |
| **Parámetros** | En un fichero de configuración versionado, no escritos dentro del código |
| **Entorno** | Versiones fijadas de las librerías. Un cambio de versión altera resultados en silencio |

Y fija las semillas aleatorias. No garantiza reproducción exacta en todos los casos, pero elimina la variación evitable.

## Paso 2 — Seguimiento de experimentos

En cuanto pruebes más de tres configuraciones, dejarás de recordar cuál dio qué. Registra por cada ejecución: parámetros, métricas, versión de los datos, commit y el artefacto resultante.

Herramientas como MLflow lo cubren. Pero **un CSV disciplinado ya supera con creces al "lo tengo en un cuaderno"**: la herramienta importa menos que el hábito.

## Paso 3 — Registro y versionado de modelos

- **Un modelo es un artefacto versionado**, como una imagen de contenedor. Ni el disco de alguien, ni un fichero llamado `modelo_final_v2_bueno.pkl`.
- **Etiqueta el entorno**: cuál está en producción, cuál en pruebas, cuál retirado.
- **Guarda con cada versión sus métricas y sus datos de entrenamiento.** Cuando alguien pregunte por qué el modelo decidió algo hace ocho meses —y en decisiones que afectan a personas, preguntarán—, esto es lo único que te salva.
- **Volver atrás debe ser trivial.** Si revertir exige reentrenar, no tienes registro.

## Paso 4 — Desplegar sin apostar

Nunca cambies el modelo de golpe para todo el mundo.

- **En sombra** — el nuevo predice en paralelo, sin efecto real, y comparas sus decisiones con las del antiguo sobre tráfico real. La forma más barata de detectar un desastre.
- **Progresivo** — un porcentaje pequeño primero, subiendo si se comporta.
- **Vuelta atrás preparada** antes de empezar. Si revertir no está probado, no está.

Y una trampa cara: **las transformaciones del entrenamiento y las de producción deben ser el mismo código**. Si se reimplementan aparte, divergen, y el modelo recibe datos distintos de aquellos con los que aprendió. Falla en silencio, que es lo peor.

## Paso 5 — Vigilar

Tres niveles, del más rápido al más fiable:

1. **Entradas** — ¿los datos que llegan se parecen a los del entrenamiento? Un cambio brusco en la distribución de una columna, o un aumento de valores vacíos, suele ser un fallo en el origen. Es la señal más temprana.
2. **Salidas** — ¿la distribución de predicciones se mueve? Si marcaba el 3% y ahora marca el 15%, pasa algo, aunque no sepas aún el qué.
3. **Acierto real** — el único que importa de verdad, y **llega tarde**: para saber si acertaste al predecir una baja a 30 días, hay que esperar 30 días. Móntalo igualmente, sabiendo que informa del pasado.

Vigila también **lo aburrido**: que el proceso por lotes se ejecute, que no haya predicciones vacías, que la latencia aguante. Un modelo excelente que dejó de ejecutarse hace tres semanas es el fallo más común y el más tonto.

**Alertas que alguien mire.** Una alerta que salta todos los días se ignora a la semana, y entonces es peor que no tenerla.

## Paso 6 — Reentrenar

- **Por deriva detectada o por calendario**, no por intuición. Y el calendario solo tiene sentido si sabes a qué ritmo cambia tu negocio.
- **Reentrenar no es desplegar.** El modelo nuevo pasa por las mismas comprobaciones que el primero, incluida la comparación contra el que está en producción. **Si no lo supera, no entra.**
- **Cuidado con el bucle de realimentación.** Si el modelo decide a quién llamas, y reentrenas con lo que pasó, solo aprende de aquellos a quienes llamaste. Se refuerza a sí mismo y se estrecha. Se rompe reservando una porción aleatoria fuera de su decisión.
- **El histórico muy viejo puede estorbar.** Si el negocio cambió, los datos de antes del cambio enseñan lo que ya no es cierto.

## Límites

- No despliega un modelo a producción sin petición explícita.
- No automatiza reentrenamientos sin que exista antes la comparación que impide que entre un modelo peor.
- No promete que un modelo sigue funcionando sin datos de acierto real: hasta entonces, di que es una suposición razonable, no un hecho.
- Ante "el modelo ya no funciona", **diagnostica por orden**: ¿se está ejecutando?, ¿llegan bien los datos?, ¿cambiaron las entradas?, ¿cambió el mundo? La última es la única que se arregla reentrenando, y es la que todos asumen primero.
