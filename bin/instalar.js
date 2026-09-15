#!/usr/bin/env node
import { cp, mkdir, rename, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILLS = ['nuevo-proyecto', 'contenedores', 'ci-cd', 'calidad-codigo', 'pruebas-carga'];

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const origen = join(raiz, 'skills');
const destino = join(homedir(), '.claude', 'skills');

const marca = (s) => (process.stdout.isTTY ? `\x1b[2m${s}\x1b[0m` : s);

try {
  await access(origen);
} catch {
  console.error(`No encuentro las skills en ${origen}. ¿Paquete incompleto?`);
  process.exit(1);
}

console.log(`Instalando skills de IGB en ${destino}\n`);
await mkdir(destino, { recursive: true });

let instaladas = 0;
for (const s of SKILLS) {
  const desde = join(origen, s);
  if (!existsSync(desde)) {
    console.log(`  omitida (no está en el paquete): ${s}`);
    continue;
  }
  const hasta = join(destino, s);
  if (existsSync(hasta)) {
    // Nunca se sobrescribe a ciegas: la versión previa puede estar personalizada.
    const respaldo = `${hasta}.anterior.${Date.now()}`;
    await rename(hasta, respaldo);
    console.log(`  actualizada: ${s}  ${marca(`(la previa se guardó en ${respaldo.split('/').pop()})`)}`);
  } else {
    console.log(`  instalada:   ${s}`);
  }
  await cp(desde, hasta, { recursive: true });
  instaladas++;
}

console.log(`\n${instaladas} skills instaladas. Reinicia Claude Code y escribe /nuevo-proyecto para empezar.`);
