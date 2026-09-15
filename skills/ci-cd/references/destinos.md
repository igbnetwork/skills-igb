# Destinos de despliegue

Elige según lo que la empresa **ya paga**, no según lo que sea más moderno. Confírmalo con el usuario antes de escribir el paso de deploy.

## Antes de elegir

Averigua **qué usa ya el equipo** en lugar de proponer algo nuevo: mira si hay un `vercel.json`, un `render.yaml`, un `Procfile` o credenciales de algún proveedor en la configuración del repositorio. Reutilizar el proveedor que ya se paga y se sabe operar vale más que la plataforma técnicamente mejor.

Si el destino es AWS, **no elijas por tu cuenta**: hay que confirmar qué servicios tiene contratados la organización. Un pipeline contra servicios que no existen es ruido, y uno contra los equivocados genera coste.

---

## Render

Despliega solo desde git. El pipeline **no sube artefactos**: valida, y Render construye al detectar el push.

- Variables de entorno: panel de Render → Environment. Nunca en el repo.
- El CI se queda en `lint → test → build → scan`. El deploy lo dispara el push a la rama conectada.
- Si hace falta control desde el pipeline, Render ofrece un *deploy hook* (una URL secreta): guárdala como secreto de CI y llámala con `curl` en el job de deploy.
- El plan gratuito duerme el servicio tras inactividad: la primera petición tarda. No lo confundas con un problema de rendimiento de la app.

## Vercel

- Conectado a git, igual que Render: cada push genera un *preview deployment*, y `main` va a producción.
- Variables con prefijo `VITE_` / `NEXT_PUBLIC_` quedan **expuestas al navegador**. Nunca pongas un secreto detrás de esos prefijos.
- Para una SPA hace falta el rewrite a `index.html` en `vercel.json`, o las rutas del router dan 404 al recargar.
- Desde CI: `vercel deploy --prod --token=$VERCEL_TOKEN`, con el token como secreto.

## VPS por SSH

- Clave SSH privada como secreto del CI; **nunca** con contraseña interactiva.
- Despliegue por `rsync` del build, y recarga del servicio (`systemctl reload <servicio>` o `pm2 reload`).
- Deja siempre la versión anterior en el servidor para poder revertir: despliega a un directorio nuevo y cambia un enlace simbólico. Revertir es entonces mover el enlace, no volver a construir.
- Fija `known_hosts` en el pipeline; desactivar la verificación del host abre la puerta a un ataque de intermediario.

## Servidor solo accesible por VPN (Tailscale, WireGuard, VPN corporativa)

**Comprueba esto antes de escribir el job de deploy.** Si el servidor no tiene puerto abierto a internet, un runner de GitHub Actions o GitLab CI **no puede alcanzarlo**: el job se quedará colgado hasta agotar el timeout, con un error de conexión que no explica la causa real. Es el fallo más frecuente y más desconcertante al automatizar el despliegue a infraestructura privada.

Pregunta directa al usuario: *¿tu servidor tiene una IP pública con el puerto SSH abierto, o solo llegas a él por VPN?*

Tres salidas, por orden de preferencia:

### a) El runner se une a la VPN durante el job

La más limpia: el runner entra en la red privada, despliega y sale. Con Tailscale, su acción oficial de GitHub levanta un **nodo efímero** que se desconecta y se borra al terminar el job.

Lo que hay que preparar, y que el usuario debe hacer en el panel porque tú no tienes acceso:

1. Credenciales para el CI en la consola de Tailscale — un **OAuth client** (preferible: no caduca de golpe y se revoca solo) o una **auth key efímera**. Se guardan como secretos del CI, nunca en el YAML.
2. Una **etiqueta** para el runner, por ejemplo `tag:ci`, declarada en las ACLs del tailnet.
3. Una **regla de ACL** que permita a `tag:ci` llegar **solo** al servidor de despliegue y **solo** al puerto que necesite. No le des al CI acceso a toda la red: un token filtrado abriría el tailnet entero.

En el YAML, el paso de unirse a la VPN va **antes** del de desplegar, y luego se usa el nombre MagicDNS o la IP `100.x.y.z` del servidor, no su IP pública.

**No copies de memoria la versión de la acción ni sus parámetros**: consulta la documentación oficial de Tailscale para la versión vigente y fíjala explícitamente. Lo mismo para WireGuard o una VPN corporativa, donde normalmente habrá que levantar el túnel a mano en un paso previo.

### b) Un runner dentro de la propia red

Instalar un *self-hosted runner* en el servidor de destino o en otra máquina de la red. Ventaja: no hace falta abrir nada ni gestionar credenciales de VPN, porque el runner sale hacia fuera en lugar de recibir conexiones.

Inconveniente serio: **el runner ejecuta el código de cualquier pull request**. En un repositorio público eso es una vía directa a ejecutar código arbitrario dentro de tu red. Úsalo solo en repositorios privados, y aun así limita qué workflows pueden correr en él.

### c) Abrir el servidor a internet

La peor, y a menudo la que se elige por inercia. Si se hace, que sea con el puerto SSH restringido por grupo de seguridad a rangos de IP concretos, nunca a `0.0.0.0/0`. **Si ya accedéis por VPN, abrir SSH al mundo solo añade superficie de ataque sin aportar nada**: merece la pena revisar el grupo de seguridad y cerrarlo.

---

## AWS — **confirmar antes de usar**

No elijas por tu cuenta. Cada servicio implica un pipeline distinto:

| Si la empresa paga | El pipeline hace | Requiere |
|---|---|---|
| **S3 + CloudFront** | `aws s3 sync dist/` + invalidación de caché | Bucket y distribución ya creados |
| **EC2** | Igual que "VPS por SSH" | Acceso SSH, grupo de seguridad. **Comprueba antes si la instancia se alcanza por VPN en vez de por su IP pública** — ver la sección anterior |
| **ECS / Fargate + ECR** | Construir imagen → push a ECR → actualizar servicio | Docker, repositorio ECR, definición de tarea |
| **Amplify** | Conectado a git, como Vercel | Poco trabajo de CI |

En todos los casos: autenticación con **OIDC** desde el CI (rol asumible) en lugar de claves de acceso de larga vida guardadas como secretos. Las claves estáticas se filtran y no caducan.

**Si no sabes qué servicios hay contratados, deja el job de deploy escrito pero comentado, con una nota de qué falta por confirmar.** Es más honesto que inventar nombres de buckets o de clústeres.
