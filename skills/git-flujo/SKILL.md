---
name: git-flujo
description: Trabajar con git y con el flujo de colaboración del equipo — ramas, commits, push, pull requests, revisión, fusionar o rebasar, resolver conflictos y etiquetar versiones. Entrega los comandos exactos para que el desarrollador los ejecute, y explica qué hace cada uno a quien está aprendiendo. Cubre también qué no hacer nunca: reescribir la rama principal, subir secretos, ramas eternas. Úsala cuando el usuario hable de git, rama, commit, push, pull request, merge, rebase, conflicto, revisión de código, versionar o publicar una versión. | EN: Work with git and the team's collaboration flow — branches, commits, push, pull requests, review, merge or rebase, conflict resolution and release tagging. Hands over the exact commands for a developer to run, and explains what each one does to someone still learning. Also covers what never to do: rewriting the main branch, committing secrets, long-lived branches. Use when the user mentions git, branch, commit, push, pull request, merge, rebase, conflict, code review, versioning or cutting a release.
metadata:
  version: "1.0"
  author: sistemas@igb.network
---

# Flujo de git

Cómo se mueve el código desde tu máquina hasta la rama principal, sin romper nada por el camino.

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

## Quién ejecuta los comandos

Esto lo decide el perfil de quien tienes delante (ver `nuevo-proyecto`, Paso 0):

- **Perfil (c), desarrollador — entrégale los comandos, no los ejecutes.** Es su repositorio y su historial: debe saber exactamente qué va a pasar. Dale el bloque listo para copiar, con una línea de qué hace cada comando, y espera a que él lo ejecute. **Nunca hagas `push`, `merge` ni abras un pull request por tu cuenta.**
- **Perfil (b), aprendiendo — entrégale los comandos y explícalos.** Que los ejecute él: es la única forma de que deje de depender de ti. Explica qué hace cada uno y cómo comprobar que salió bien.
- **Perfil (a), no programa — hazlo tú**, y cuenta en una frase qué acabas de hacer y por qué ("he guardado una versión de tu trabajo; si algo se rompe, podemos volver aquí"). No le pidas que teclee comandos que no entiende.

En los tres casos: **antes de cualquier comando que reescriba el historial o publique algo, di lo que va a pasar.**

## Una cosa cada vez

**Da un comando, espera el resultado, interprétalo, y solo entonces da el siguiente.** No entregues una lista de cinco pasos para que se ejecuten de golpe: cada resultado cambia cuál es el paso siguiente, y una tanda entera obliga a la otra persona a decidir por su cuenta qué hacer con cada salida.

Tres reglas que lo hacen funcionar:

- **Nunca entregues un comando con un marcador sin rellenar.** Si necesitas un dato que aún no tienes —un nombre de servicio, un identificador, una ruta—, **ese dato es el siguiente paso**, no un `<hueco>` que la otra persona tenga que adivinar. Un comando que falla porque no se sustituyó un marcador es tiempo perdido y confianza perdida.
- **Di qué esperas ver** antes de que lo ejecute, y qué significaría cada resultado posible. Así la salida no es un jeroglífico.
- **Interpreta el resultado en voz alta** antes de continuar: qué acabas de aprender y qué descarta. Si el resultado no es concluyente, dilo en vez de seguir como si lo fuera.

Esto vale doblemente al diagnosticar algo que ya está en producción, donde un paso dado a ciegas puede romper el servicio.

## El ciclo normal

```bash
git switch -c feat/descripcion-corta   # rama nueva desde la principal
# … trabajar …
git status --short                     # revisar QUÉ se va a subir
git add -A
git commit -m "feat: descripción en presente"
git push -u origin feat/descripcion-corta
```

Y después, el pull request. Con `gh` instalado:

```bash
gh pr create --fill --base main
gh pr view --web
```

Sin `gh`, el propio `git push` imprime una URL para abrirlo en el navegador.

### El paso que nadie da y evita el 90% de los desastres

**`git status --short` antes de cada `git add`.** Mira la lista. Si aparece `node_modules/`, `dist/`, `.env` o un fichero de credenciales, **para y arregla el `.gitignore`** antes de seguir. Un secreto subido sigue en el historial aunque lo borres en el commit siguiente: hay que **rotarlo**, no basta con quitarlo.

## Ramas

- **`main` siempre desplegable.** No se trabaja directamente sobre ella.
- **Una rama por cambio**, con nombre que diga qué hace: `feat/login-google`, `fix/pago-duplicado`, `chore/actualizar-deps`.
- **Cortas.** Una rama de dos semanas acumula conflictos y nadie recuerda qué lleva dentro. Si el cambio es grande, pártelo en varios pull requests que entren por separado.
- **Actualízala antes de pedir revisión**, o revisarás sobre una base vieja:

```bash
git fetch origin
git rebase origin/main        # o: git merge origin/main
```

## Commits

- **Un commit, un cambio con sentido.** Ni "todo el día de trabajo", ni un commit por línea.
- **Mensaje con prefijo y en presente**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- **El asunto dice qué; el cuerpo dice por qué.** El qué se ve en el diff; el porqué solo está en tu cabeza, y dentro de seis meses tampoco.
- **Nunca commits con el código a medias en `main`.** En tu rama, todos los que quieras.

## Pull requests

- **Descripción que responda tres cosas**: qué cambia, por qué, y cómo se comprueba que funciona.
- **Pequeños.** Un PR de 50 líneas recibe comentarios útiles; uno de 2.000 recibe un "lgtm" y entra sin revisar de verdad.
- **Que pase el pipeline antes de pedir revisión.** Hacer revisar algo que no compila quema el tiempo de otra persona.
- **Responde a todos los comentarios**, aunque sea para decir por qué no lo cambias.

## Fusionar: cuál de los tres

| Forma | Qué deja | Cuándo |
|---|---|---|
| **Merge commit** | Todo el historial de la rama | Ramas con varios commits que cuentan una historia |
| **Squash** | Un solo commit limpio | Lo habitual: ramas con commits de "arreglando", "otra vez", "ya" |
| **Rebase** | Historial lineal, sin commit de fusión | Equipos que lo quieren lineal y saben lo que hacen |

**Squash es el mejor valor por defecto** para la mayoría de equipos: `main` queda legible y cada entrada corresponde a un cambio completo.

La regla que evita el accidente clásico: **rebasa solo lo que no has publicado.** Rebasar una rama que otra persona ya tiene descargada le reescribe el suelo bajo los pies.

## Conflictos

No son un error: son git diciéndote que dos personas tocaron lo mismo y que la máquina no puede decidir.

```bash
git status                     # qué ficheros están en conflicto
# abrir cada uno, decidir el resultado correcto, borrar los marcadores <<<<<<< ======= >>>>>>>
git add <fichero>
git rebase --continue          # o: git merge --continue
```

- **Decide con criterio, no te quedes con "el tuyo" por comodidad.** A veces el resultado correcto no es ninguna de las dos versiones.
- **Ejecuta los tests después de resolver.** Un conflicto mal resuelto compila y hace algo distinto de lo que ambos querían.
- **Si te pierdes, se sale sin daño**: `git rebase --abort` o `git merge --abort` y vuelves al punto de partida.

## Versiones

Cuando `main` tenga algo que publicar:

```bash
git tag -a v1.2.0 -m "Descripción de la versión"
git push origin v1.2.0
```

Y sube el número en **todos** los sitios donde vive: `package.json`, manifiestos, lo que aplique. Una versión a medias es peor que ninguna, porque nadie sabe cuál es la buena.

## Lo que no se hace nunca

- **`push --force` a `main`.** Reescribe lo que otros ya tienen. En tu propia rama y avisando, es legítimo — y aun así, `--force-with-lease` protege de pisar el trabajo de alguien.
- **Subir secretos.** Si pasa: rotar la credencial de inmediato. Limpiar el historial viene después y no sustituye a rotarla.
- **Commitear directamente en `main`** en un equipo.
- **Ramas de meses.** Cuanto más viven, más caro es fusionarlas.

## Cuando además hay pipeline

Un pull request debería disparar la validación automática, y la fusión a `main` el despliegue. Cómo montarlo está en la skill `ci-cd`; lo que importa aquí es el hábito: **si el pipeline está en rojo, no se fusiona.** Un `main` roto bloquea a todo el equipo, y normalizar que "está en rojo pero no pasa nada" es cómo se llega a no mirarlo nunca.

## Límites

- No ejecuta `push`, `merge`, `rebase` ni abre pull requests por su cuenta cuando trabaja con un desarrollador: entrega los comandos.
- No reescribe historial publicado.
- No crea repositorios remotos ni cambia la configuración del repositorio sin petición explícita.
- Ante un secreto en el historial, lo primero que dice es **rota la credencial ahora**; limpiar el historial es el segundo paso.
