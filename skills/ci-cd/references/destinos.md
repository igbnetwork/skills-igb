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

## AWS — **confirmar antes de usar**

No elijas por tu cuenta. Cada servicio implica un pipeline distinto:

| Si la empresa paga | El pipeline hace | Requiere |
|---|---|---|
| **S3 + CloudFront** | `aws s3 sync dist/` + invalidación de caché | Bucket y distribución ya creados |
| **EC2** | Igual que "VPS por SSH" | Acceso SSH, grupo de seguridad |
| **ECS / Fargate + ECR** | Construir imagen → push a ECR → actualizar servicio | Docker, repositorio ECR, definición de tarea |
| **Amplify** | Conectado a git, como Vercel | Poco trabajo de CI |

En todos los casos: autenticación con **OIDC** desde el CI (rol asumible) en lugar de claves de acceso de larga vida guardadas como secretos. Las claves estáticas se filtran y no caducan.

**Si no sabes qué servicios hay contratados, deja el job de deploy escrito pero comentado, con una nota de qué falta por confirmar.** Es más honesto que inventar nombres de buckets o de clústeres.
