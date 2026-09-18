# Skills de IGB para Claude Code

*[English version](README.en.md)*

Siete skills que hacen que [Claude Code](https://claude.com/claude-code) trabaje con criterio de proyecto empresarial en lugar de generar plantillas. Escritas en español y agnósticas de stack.

Se activan **igual en español que en inglés**: cada skill se anuncia en los dos idiomas, así que funcionan tanto con "quiero crear un proyecto nuevo" como con "I want to start a new project". Las instrucciones internas están en español.

La principal, `nuevo-proyecto`, **no empieza a escribir código: empieza preguntando**. Interroga sobre alcance, usuarios, datos personales, pagos, copias de seguridad y mantenimiento, cuestiona las respuestas vagas, y resume las decisiones para que las confirmes antes de crear nada.

## Instalación

### Como plugin (recomendado)

```bash
claude plugin marketplace add igbnetwork/skills-igb
claude plugin install skills-igb@skills-igb
```

Se actualiza después con:

```bash
claude plugin marketplace update skills-igb
```

### Con npm

Sin clonar nada:

```bash
npx skills-igb
```

O instalándolo de forma permanente, para poder actualizar con un comando:

```bash
npm install -g skills-igb
skills-igb            # vuelve a ejecutarlo tras cada `npm update -g skills-igb`
```

Si ya tenías una versión, la anterior se guarda como `<skill>.anterior.<fecha>` antes de reemplazarla: nunca se sobrescribe a ciegas una skill que hayas personalizado.

### Copiando las skills a mano

Si prefieres no usar ni el sistema de plugins ni npm:

```bash
git clone https://github.com/igbnetwork/skills-igb.git
cd skills-igb
./instalar.sh
```

En Windows sin WSL, desde PowerShell:

```powershell
Copy-Item -Recurse -Force skills\* "$HOME\.claude\skills\"
```

Reinicia Claude Code después de instalar. En cualquiera de las dos vías quedan en **ámbito global**: valen en todos tus proyectos, no hay que repetir la instalación en cada uno.

## Las siete skills

| Skill | Qué hace | Cómo se activa |
|---|---|---|
| **nuevo-proyecto** | Arranca un proyecto desde cero: interroga los requisitos, elige y justifica el stack, y deja git, documentación, convenciones y commit inicial listos. | `/nuevo-proyecto` o "quiero crear un proyecto nuevo" |
| **contenedores** | Empaqueta el proyecto con Docker (multi-stage) y lo sirve tras NGINX, como SPA o como reverse proxy. | "dockeriza esto", "configura NGINX" |
| **ci-cd** | Monta el pipeline de integración y despliegue continuo. Agnóstico de plataforma y de destino. | "quiero CI/CD", "despliegue automático" |
| **calidad-codigo** | Configura SonarQube o SonarCloud y traduce el informe en trabajo priorizado. | "configura SonarQube", "analiza la calidad" |
| **pruebas-carga** | Diseña y ejecuta pruebas de carga con K6 y las visualiza en Grafana. | "pruebas de carga", "cuántos usuarios aguanta" |
| **n8n** | Diseña y revisa automatizaciones: webhooks, agentes, integraciones, errores y duplicados. | "n8n", "automatización", "el bot falla a veces" |
| **ia-generativa** | Prompts, RAG, agentes, validación de salidas, coste y cómo medir si responde bien. | "el bot responde mal", "RAG", "alucina" |

No hace falta memorizar los nombres: describe lo que quieres con tus palabras y Claude elige la skill adecuada.

## Pensadas también para quien no programa

`nuevo-proyecto` asume que quien responde puede no ser técnico:

- **Traduce la jerga.** Cada término se explica en la misma frase, con un ejemplo concreto.
- **No te pide elegir la tecnología.** La recomienda a partir de lo que cuentes del negocio, explica por qué en una frase, y pide tu visto bueno.
- **Te repregunta.** Ante un "que sea escalable" o un "lo básico", pide números concretos y enumera qué va a quedar fuera para que lo confirmes.
- **Se planta en lo crítico.** Sobre datos personales y pagos no asume nada: equivocarse ahí no se corrige con un ajuste, se corrige rehaciendo el proyecto, y a veces tiene consecuencias legales.
- **Resume las decisiones antes de crear nada** y espera confirmación. Ese resumen queda escrito en el proyecto, para que dentro de seis meses se sepa por qué se hizo así.

## Lo innegociable

Todo proyecto creado con estas skills lleva siempre, aunque parezca pequeño:

1. Control de versiones desde el primer commit.
2. Secretos fuera del código, con `.env.example` versionado.
3. Separación entre pruebas y producción en cuanto haya usuarios reales.
4. Copias de seguridad automáticas —y verificadas— si guarda datos que importan.
5. `README.md` y `CLAUDE.md` suficientes para que alguien nuevo arranque sin preguntar.
6. Alguna forma automática de detectar que algo se rompió.
7. Dependencias con versión fijada.

Si se omite alguna, es una decisión consciente que queda escrita junto a su motivo.

## Honestidad sobre lo no verificado

Algunas skills configuran herramientas externas (Docker, k6) que quizá no estén instaladas. En ese caso lo dicen **antes de empezar** y marcan explícitamente que la construcción o la ejecución quedaron sin verificar. Ninguna dará por bueno algo que no haya podido comprobar.

Del mismo modo, ninguna crea repositorios remotos, despliega a producción, instala runtimes del sistema ni lanza pruebas de carga contra producción sin autorización explícita.

## Requisitos

- Claude Code instalado.
- Git.
- Lo demás depende de lo que vayas a construir; las skills comprueban qué hay disponible antes de prometer nada.

## Estructura del repositorio

```
.claude-plugin/
  marketplace.json    registro del marketplace
  plugin.json         manifiesto del plugin
skills/
  nuevo-proyecto/     SKILL.md + references/{stacks,plantillas}.md
  contenedores/       SKILL.md + references/{plantillas,nginx}.md
  ci-cd/              SKILL.md + references/destinos.md
  calidad-codigo/     SKILL.md
  pruebas-carga/      SKILL.md
  n8n/                SKILL.md
  ia-generativa/      SKILL.md
instalar.sh           instalación manual, sin sistema de plugins
```

Cada skill es un `SKILL.md` con instrucciones, más ficheros de referencia que solo se cargan cuando hacen falta. Para adaptarlas a tu organización, edita el `SKILL.md` correspondiente: son texto plano.

## Licencia

MIT.
