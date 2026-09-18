#!/usr/bin/env bash
# Instala las skills de IGB en Claude Code (ámbito global, para todos tus proyectos).
set -euo pipefail

DESTINO="$HOME/.claude/skills"
ORIGEN="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Instalando skills de IGB en $DESTINO"
mkdir -p "$DESTINO"

for s in nuevo-proyecto contenedores ci-cd calidad-codigo pruebas-carga n8n ia-generativa; do
  [ -d "$ORIGEN/skills/$s" ] || { echo "  omitida (no está en el paquete): $s"; continue; }
  if [ -d "$DESTINO/$s" ]; then
    cp -r "$DESTINO/$s" "$DESTINO/$s.anterior.$(date +%Y%m%d%H%M%S)"
    echo "  actualizada: $s  (la versión previa se guardó como $s.anterior.*)"
    rm -rf "$DESTINO/$s"
  else
    echo "  instalada:   $s"
  fi
  cp -r "$ORIGEN/skills/$s" "$DESTINO/$s"
done

echo
echo "Listo. Reinicia Claude Code y escribe /nuevo-proyecto para empezar."
