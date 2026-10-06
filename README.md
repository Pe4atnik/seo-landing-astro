# SEO Landing for Astro

[Русская версия](README.ru.md)

Astro-focused, upstream-compatible fork of [`aleksandr-alhoff/seo-landing`](https://github.com/aleksandr-alhoff/seo-landing). It gives coding agents a safe workflow to audit, build, and improve technically sound SEO landing pages and multi-route Astro sites.

This fork keeps useful generic/static-HTML guidance from upstream, then adds Astro-specific source/output auditing, route contracts, layouts and components, image pipelines, islands, accessibility, evidence boundaries, and representative multi-route QA.

## What changed

- Existing projects default to **read-only audit** unless changes are explicitly requested.
- Astro projects remain Astro: never replace their architecture with handwritten root HTML/CSS/JS.
- Audits cover both reusable source and emitted/deployed output.
- Route-family sampling distinguishes automated route coverage from human visual/editorial acceptance.
- Metadata, canonical, sitemap, JSON-LD, image, island, form, accessibility, and performance checks understand Astro ownership.
- Claims distinguish lab Lighthouse, field CWV, technical readiness, and ranking outcomes.
- Optional offline audit helper uses Node.js built-ins only; no install or network access required.

## Modes

| Mode | Trigger | Writes project files? |
| --- | --- | --- |
| `audit-only` | inspect/review/check an existing site | No |
| `fix-existing` | explicitly requested targeted changes | Yes, within approved scope |
| `generate` | explicitly requested new Astro site/page | Yes |

The skill never installs dependencies, calls network validators, changes production/server configuration, or uploads private content without explicit approval.

## Repository layout

```text
SKILL.md                       Agent Skill entry point
references/astro-workflow.md  Astro-specific audit and delivery checklist
references/tech-spec.md       Preserved generic/static-HTML specification
references/map-facade.md      Optional deferred map pattern
references/video-facade.md    Optional deferred video pattern
references/server-config.md   Review-only server configuration examples
scripts/audit-astro.mjs       Offline deterministic source/dist checks
tests/                        Node built-in tests and tiny fixtures
benchmark/                    Upstream benchmark evidence (historical scope)
UPSTREAM.md                   Safe upstream synchronization procedure
```

## Install

Clone this repository into a skill directory supported by your coding agent. Directory name should remain `seo-landing-astro`, matching skill identity.

```bash
git clone https://github.com/Pe4atnik/seo-landing-astro.git ~/.agents/skills/seo-landing-astro
```

Examples of other destinations:

```text
~/.claude/skills/seo-landing-astro
~/.cursor/skills/seo-landing-astro
~/.copilot/skills/seo-landing-astro
~/.gemini/skills/seo-landing-astro
~/.openclaw/skills/seo-landing-astro
<project>/.agents/skills/seo-landing-astro
```

Review client-specific trust and reload requirements. This repository does not auto-install itself or overwrite an existing skill.

## Use

Typical requests:

```text
Audit this Astro project in read-only mode. Check source and dist, inventory all routes,
then report representative desktop/mobile coverage and blocked checks.
```

```text
Fix the confirmed canonical and structured-data defects in this Astro project.
Preserve routes and design, run existing regression checks, and report rollback.
```

```text
Create an Astro landing from these verified business facts and assets.
Keep forms non-submitting until a reviewed destination is supplied.
```

## Offline helper

The helper is optional and intentionally narrow. It inventories source files and emitted HTML, then detects deterministic issues such as missing/relative canonicals, malformed rendered JSON-LD, duplicate/missing titles, H1 count, eager islands, and images without explicit dimensions.

```bash
node scripts/audit-astro.mjs /path/to/astro-project
```

It does **not** replace Astro build/type checks, browser rendering, accessibility tools, Lighthouse, schema semantics review, or human acceptance. It never fetches URLs or writes into the audited project.

## Tests

Requires Node.js 18+; no package installation required.

```bash
node --test tests/*.mjs
node scripts/audit-astro.mjs tests/fixtures/astro-basic
```

## Upstream relationship

`upstream` should point to `https://github.com/aleksandr-alhoff/seo-landing.git`. Because both projects intentionally modify `SKILL.md` and README files, use review-based merges, never destructive mirroring. See [UPSTREAM.md](UPSTREAM.md).

Upstream benchmark snapshots remain for provenance. Their numbers are one historical lab comparison, not promised results and not field Core Web Vitals.

## Limitations

- Static inspection cannot prove runtime behavior, visual quality, schema eligibility, or field CWV.
- Dynamic SSR routes may need a running deployment or project-native integration tests.
- Regex-based helper checks are conservative; component-generated attributes require output validation.
- Route-family sampling does not equal individual human review of every page.
- Generic upstream server recipes are review material, not automatically safe for a specific host.

## License and provenance

Fork retains the upstream MIT license and attribution. See [LICENSE](LICENSE). Security notes: [SECURITY.md](SECURITY.md).
