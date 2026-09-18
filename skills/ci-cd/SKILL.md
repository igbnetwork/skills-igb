---
name: ci-cd
description: Montar o arreglar un pipeline de integración y despliegue continuo — lint, tests, build, escaneo de calidad y seguridad, y despliegue por entornos. Agnóstico de plataforma (GitHub Actions, GitLab CI, Jenkins) y de destino (Render, Vercel, AWS, VPS). Úsala cuando el usuario hable de CI, CD, pipeline, workflow, despliegue automático, entornos de staging y producción, o automatizar el paso a producción. | EN: Set up or fix a continuous integration and delivery pipeline — lint, tests, build, quality and security scanning, and environment-based deployment. Platform-agnostic (GitHub Actions, GitLab CI, Jenkins) and target-agnostic (Render, Vercel, AWS, VPS). Also covers deploying to a server that is not reachable from the internet: VPN, bastion or jump host, SSM Session Manager, and self-hosted runners. Use when the user mentions CI, CD, pipeline, workflow, automated deployment, staging and production environments, or shipping to production automatically.
metadata:
  version: "1.0"
  author: sistemas@igb.network
---

# CI/CD

Automatiza el camino de commit a producción, con puertas de calidad reales entre medias.

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

## Estado de partida

No des por hecho GitHub Actions: pregunta cuál usa el equipo. Y comprueba si `gh` está instalado antes de proponer comandos que lo usen.

**Antes de escribir el job de deploy, averigua si el destino es alcanzable desde internet.** Un servidor detrás de una VPN —Tailscale, WireGuard, VPN corporativa— o en una red interna no admite un despliegue directo desde un runner en la nube, por muy correcto que sea el resto del pipeline. Es la causa más común de un CI que valida bien y despliega nunca.

## Adapta el nivel a quien tienes delante

Si el `CLAUDE.md` del proyecto dice con quién trabajas y su perfil, respétalo. Si no lo sabes y la conversación no lo deja claro, **pregúntalo antes de empezar**: *¿te explico el porqué de cada paso, o voy al grano?*

- **Con quien no programa:** nada de jerga sin traducir, tú tomas las decisiones técnicas y pides visto bueno, y dices qué vas a hacer antes y qué pasó después. Los errores son normales y se arreglan — que nunca se quede pensando que rompió algo.
- **Con quien desarrolla:** al grano, sin explicar lo básico, y discutiendo las decisiones de igual a igual.

Lo que **no** cambia con el perfil son las comprobaciones de seguridad ni las advertencias sobre lo que no has podido verificar. Esas van siempre, y en el idioma de la consecuencia real.

## Paso 1 — Fijar las tres variables

| Variable | Pregunta | Efecto |
|---|---|---|
| **Plataforma** | ¿GitHub, GitLab, Jenkins, otra? | Determina el fichero: `.github/workflows/*.yml`, `.gitlab-ci.yml`, `Jenkinsfile` |
| **Destino** | ¿Render, Vercel, AWS, VPS, ninguno? | Determina el paso de deploy. Ver `references/destinos.md` |
| **Alcance del destino** | Si es un servidor propio: ¿tiene IP pública abierta, o se llega por VPN o por un bastión? | Si es privado, el runner no puede alcanzarlo sin unirse antes a la red. Ver `references/destinos.md` |
| **Disparadores** | ¿Qué ramas y eventos? | Lo normal: PR → validar; push a `main` → validar y desplegar |

Si el usuario no sabe la plataforma, **recomienda GitHub Actions** si el código ya está en GitHub: es lo que menos infraestructura pide. Pero que la elección sea suya.

## Paso 2 — Diseñar las etapas

Orden por coste creciente. Lo barato primero, para fallar pronto:

```
1. setup      checkout + runtime + caché de dependencias
2. install    instalación reproducible (npm ci, no npm install)
3. lint       formato y estilo
4. test       unitarios, con cobertura
5. build      compilación de producción
6. scan       calidad (SonarQube) y dependencias vulnerables
7. deploy     solo en la rama de producción, y solo si todo lo anterior pasó
```

Reglas:

- **`npm ci`, nunca `npm install`** en CI. `ci` respeta el lockfile; `install` puede moverlo y hace el build no reproducible.
- **Cachea dependencias** por hash del lockfile. Sin caché, cada ejecución reinstala todo.
- **Fija la versión del runtime** en el workflow, y que coincida con `.nvmrc` / `.python-version`. Un CI en Node 20 y un local en Node 22 produce fallos que nadie reproduce.
- **`deploy` va condicionado** a rama y a que las etapas previas pasen. Nunca un deploy que corre en paralelo con los tests.
- **Timeout en todos los jobs.** Sin él, un cuelgue consume minutos de runner hasta el límite de la cuenta.

## Paso 3 — Secretos

- **Jamás** un secreto en el YAML del pipeline. Van en el almacén de la plataforma (GitHub Secrets, GitLab CI/CD variables, credenciales de Jenkins).
- Referencia por nombre: `${{ secrets.NOMBRE }}`.
- Los secretos **no se exponen a workflows disparados por PR de forks**. Si el pipeline los necesita, separa el job de validación del de deploy.
- Documenta en `DESPLIEGUE.md` qué secretos hacen falta y dónde se configuran. No sus valores.

## Paso 4 — Entornos

Mínimo dos, y que se distingan:

- **staging** — despliega solo desde una rama de integración. Sirve para validar antes de producción.
- **producción** — solo desde `main`, y con aprobación manual si el despliegue no es trivialmente reversible.

Cada entorno con su propio juego de variables. Nunca la base de datos de producción apuntada desde staging.

## Paso 5 — Verificar

Un pipeline que nunca se ejecutó no está terminado. Antes de darlo por bueno:

1. Ejecuta **en local** cada comando del pipeline (`npm ci && npm run lint && npm test && npm run build`). Si falla en local, fallará en CI.
2. Valida la sintaxis del YAML (`python3 -c "import yaml,sys;yaml.safe_load(open('...'))"`).
3. Di claramente que la ejecución real en la plataforma queda pendiente hasta el primer push. **No afirmes que el pipeline funciona hasta haber visto una ejecución verde.**

## Entregar el trabajo

Con un desarrollador, **entrégale los comandos en vez de ejecutarlos**: crear la rama, commitear el workflow, subirlo y abrir el pull request. Es su pipeline y debe saber exactamente qué entra. La skill `git-flujo` tiene el flujo completo.

Con quien no programa, hazlo tú y explícale qué acaba de quedar automatizado y qué verá cuando falle.

## Límites

- No crea repositorios remotos ni configura secretos en la plataforma: eso lo hace el usuario en su panel.
- No despliega a producción por su cuenta.
- No inventa nombres de servicios ni de recursos cloud. Si no sabes el destino real, deja el paso de deploy marcado como pendiente y dilo.
