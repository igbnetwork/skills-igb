# IGB Skills for Claude Code

*[Versión en español](README.md)*

Five skills that make [Claude Code](https://claude.com/claude-code) work to enterprise project standards instead of generating boilerplate. The instructions are written in Spanish; every skill is discoverable in both Spanish and English, so it triggers whichever language you prompt in.

The main one, `nuevo-proyecto`, **does not start writing code — it starts asking**. It interrogates scope, users, personal data, payments, backups and maintenance, challenges vague answers, and summarizes its decisions for you to confirm before creating anything.

## Installation

### As a plugin (recommended)

```bash
claude plugin marketplace add igbnetwork/skills-igb
claude plugin install skills-igb@skills-igb
```

Update later with:

```bash
claude plugin marketplace update skills-igb
```

### Copying the skills manually

```bash
git clone https://github.com/igbnetwork/skills-igb.git
cd skills-igb
./instalar.sh
```

On Windows without WSL, from PowerShell:

```powershell
Copy-Item -Recurse -Force skills\* "$HOME\.claude\skills\"
```

Restart Claude Code afterwards. Either way they install **globally**: they work across all your projects, with no per-project setup.

## The five skills

| Skill | What it does | How to trigger it |
|---|---|---|
| **nuevo-proyecto** | Bootstraps a project from scratch: interrogates requirements, picks and justifies the stack, and leaves git, docs, conventions and an initial commit in place. | `/nuevo-proyecto` or "I want to start a new project" |
| **contenedores** | Packages the project with Docker (multi-stage) and serves it behind NGINX, as a SPA or a reverse proxy. | "dockerize this", "set up NGINX" |
| **ci-cd** | Builds the continuous integration and delivery pipeline. Platform- and target-agnostic. | "I want CI/CD", "automated deployment" |
| **calidad-codigo** | Configures SonarQube or SonarCloud and turns the report into prioritized work. | "set up SonarQube", "analyze code quality" |
| **pruebas-carga** | Designs and runs load tests with K6 and visualizes them in Grafana. | "load testing", "how many users can it handle" |

You don't need to memorize the names: describe what you want in your own words and Claude picks the right skill.

## Built for non-programmers too

`nuevo-proyecto` assumes whoever answers may not be technical:

- **It translates jargon.** Every technical term is explained in the same sentence, with a concrete example.
- **It doesn't make you pick the technology.** It recommends one from what you say about the business, explains why in a sentence, and asks for your sign-off.
- **It pushes back.** Given "make it scalable" or "just the basics", it asks for real numbers and lists what will be left out so you can confirm.
- **It refuses to guess on what matters.** On personal data and payments it assumes nothing: getting those wrong isn't fixed with a tweak, it's fixed by rebuilding the project, sometimes with legal consequences.
- **It summarizes decisions before creating anything** and waits for confirmation. That summary is written into the project, so six months later the reasoning is still there.

## The non-negotiables

Every project created with these skills always gets, however small it looks:

1. Version control from the first commit.
2. Secrets out of the code, with a versioned `.env.example`.
3. Separation between testing and production as soon as there are real users.
4. Automated — and verified — backups if it stores data that matters.
5. A `README.md` and `CLAUDE.md` good enough for a newcomer to start without asking anyone.
6. Some automated way to know something broke.
7. Pinned dependency versions.

Skipping one is a deliberate decision, recorded alongside its reason.

## Honesty about what wasn't verified

Some skills configure external tools (Docker, k6) that may not be installed. When that happens they say so **before starting** and explicitly mark the build or run as unverified. None of them will call something done that it could not check.

Likewise, none of them create remote repositories, deploy to production, install system runtimes, or run load tests against production without explicit authorization.

## Repository layout

```
.claude-plugin/
  marketplace.json    marketplace registry
  plugin.json         plugin manifest
skills/
  nuevo-proyecto/     SKILL.md + references/{stacks,plantillas}.md
  contenedores/       SKILL.md + references/{plantillas,nginx}.md
  ci-cd/              SKILL.md + references/destinos.md
  calidad-codigo/     SKILL.md
  pruebas-carga/      SKILL.md
instalar.sh           manual install, no plugin system
```

Each skill is a `SKILL.md` of instructions plus reference files loaded only when needed. To adapt them to your organization, edit the relevant `SKILL.md` — it's plain text.

## License

MIT.
