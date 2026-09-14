# Configuraciones de NGINX

Dos papeles distintos. No mezcles las plantillas.

## 1. Servir una SPA

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Sin esta línea, recargar en /clientes/42 devuelve 404
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Assets con hash en el nombre: caché agresiva, son inmutables
    location ~* \.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # index.html NUNCA cacheado, o el usuario se queda en la versión vieja
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript
               application/xml image/svg+xml;
    gzip_min_length 1024;

    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
}
```

El error clásico: cachear `index.html` junto al resto. El navegador sigue pidiendo bundles que ya no existen y la aplicación se rompe tras cada despliegue.

## 2. Reverse proxy delante de una API

```nginx
upstream api {
    server api:3000;           # nombre del servicio en docker-compose
    keepalive 32;
}

server {
    listen 80;
    server_name <dominio>;

    client_max_body_size 10M;  # el defecto de 1M corta subidas sin aviso claro

    location /api/ {
        proxy_pass http://api/;
        proxy_http_version 1.1;

        # Sin estas cabeceras la app ve la IP del proxy y genera URLs http://
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 5s;
        proxy_read_timeout   60s;
    }

    # WebSocket, si la app lo usa
    location /ws/ {
        proxy_pass http://api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
    }
}
```

### La barra final de `proxy_pass` cambia el significado

| Configuración | `/api/usuarios` llega a la API como |
|---|---|
| `proxy_pass http://api/;` | `/usuarios` — se quita el prefijo |
| `proxy_pass http://api;` | `/api/usuarios` — se conserva |

Es la causa número uno de 404 al montar un proxy. Decide cuál quieres y compruébalo antes de dar por buena la configuración.

### Limitar tasa (opcional, recomendable en login)

```nginx
# en el bloque http
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# en el location del endpoint sensible
limit_req zone=login burst=5 nodelay;
```

## TLS

En producción, termina TLS en NGINX (certbot / Let's Encrypt) o en el balanceador del proveedor. **No generes certificados autofirmados para producción.** Si el TLS lo termina algo por delante, `X-Forwarded-Proto` es imprescindible o la app hará redirecciones infinitas.

## Verificar

```bash
nginx -t                                    # sintaxis
docker exec <contenedor> nginx -t           # dentro del contenedor
curl -I localhost:8080                      # cabeceras
curl -I localhost:8080/ruta/del/router      # ¿200 y no 404? (fallback de SPA)
```
