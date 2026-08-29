# SEO Landing

## Give your AI coding agent the capabilities of a senior Technical SEO engineer.

An agent skill for building high-performance, technically optimized SEO landing pages.
Turn an AI coding agent into a technical SEO specialist.

Build and improve landing pages with:
	•	🚀 100/100 Google PageSpeed target
	•	⚡ Core Web Vitals optimization
	•	🔍 Technical SEO
	•	🧩 Full Schema.org structured data
	•	🖼️ AVIF image optimization
	•	🎨 Critical CSS
	•	🧹 Zero third-party runtime dependencies
	•	📱 Mobile-first performance
	•	🤖 Semantic HTML
    
##Works with AI coding agents
Designed for agentic coding workflows and compatible with Agent Skills–style environments.

##What it does?
The skill guides an AI coding agent through the complete landing-page workflow:
	1.	Analyze the existing page
	2.	Fix technical SEO issues
	3.	Optimize HTML structure
	4.	Improve Core Web Vitals
	5.	Optimize images and fonts
	6.	Add structured data
	7.	Remove unnecessary dependencies
	8.	Validate the final implementation
    
##Why?
AI can generate a beautiful landing page in seconds.
The problem is that generated pages often contain:
	•	unnecessary JavaScript
	•	oversized images
	•	poor semantic structure
	•	missing structured data
	•	weak metadata
	•	performance bottlenecks
	•	technical SEO mistakes
    
SEO Landing Skill gives the agent a repeatable technical SEO workflow instead of relying on generic prompting.

An agent skill that builds and updates landing pages to hit **100/100 PageSpeed**, pass **Google Core Web Vitals**, and get the technical SEO right. Static HTML, critical CSS, AVIF images, full schema.org markup, zero third-party dependencies.

BEFORE
Landing page
↓
LCP: 4.2s
Performance: 61
Missing schema
Large PNG
Render-blocking CSS
        ↓ SEO LANDING SKILL ↓
AFTER
Landing page
↓
LCP: 1.1s
Performance: 100
Schema.org ✓
AVIF ✓
Critical CSS ✓
Semantic HTML ✓

Format — [Agent Skills](https://agentskills.io) (open standard originally developed by Anthropic): works in VS Code Copilot, Claude Code, OpenAI Codex, Google Antigravity, Cursor, Gemini CLI, OpenClaw, Hermes, and other compatible agents.

## What's inside

```
seo-landing/
├── SKILL.md              # Main workflow: brief → generation → stop point → validation → report
└── references/
    ├── tech-spec.md      # Technical spec (13 requirement sections)
    ├── server-config.md  # Server config: caching, Brotli/gzip, security headers (Nginx/Apache)
    └── video-facade.md   # Reference implementation of the "facade" pattern for YouTube
```

## Key requirements enforced by the skill

- **Performance**: LCP < 2.5s, INP < 100ms, CLS < 0.1; critical CSS inlined, the rest loaded async; `preload` + `fetchpriority="high"` for the LCP image
- **Images**: AVIF → WebP → JPEG via `<picture>`, `srcset`/`sizes`, `width`/`height`, `loading="lazy"`, breakpoints 320–1920
- **SEO**: title/description/canonical/robots, Open Graph, Twitter Card, JSON-LD (`WebSite`, `Organization`, `BreadcrumbList`, `FAQPage`, `VideoObject` — emitted only when fact-backed and eligible for the corresponding Google search feature)
- **Accessibility**: WCAG 2.1 AA, contrast ≥ 4.5:1, keyboard navigation, `prefers-reduced-motion`
- **Security**: `X-Content-Type-Options`, `X-Frame-Options`, `Permissions-Policy`, HTTPS, `rel="noopener noreferrer"`
- **Fonts**: system fonts only — no external fonts, no Google Fonts
- **JS budget ≤ 15 KB** for the whole page, one file with `defer`
- **Forbidden**: external JS/CSS libraries, SVG images, synchronous scripts, iframes on first load
- **Video & maps**: "facade" pattern only — the cover image loads immediately, the iframe loads on click
- **Common blocks without JS**: FAQ via `<details>`, slider via `scroll-snap`, modal via `<dialog>`
- **Stop point**: before validation and the final report, the skill always asks the user to confirm the HTML version

## Real-world result

Lighthouse CLI measurements, mobile emulation. Original — an Angular SPA (102 requests); the same page rebuilt as static HTML with this skill (18 requests):

| Metric | Original | Rebuilt | Gain |
|---|---:|---:|---:|
| Performance | 75 | **100** | +25 |
| Accessibility | 75 | **100** | +25 |
| Best Practices | 73 | **100** | +27 |
| LCP | 3.3 s | 1.6 s | −52% |
| Total Blocking Time | 490 ms | 10 ms | −98% |
| TTI | 9.4 s | 1.6 s | −83% |
| Data transferred | 769 KiB | 111 KiB | −86% |
| Requests | 102 | 18 | −82% |

## Installation

The skill is hosted at [github.com/aleksandr-alhoff/seo-landing](https://github.com/aleksandr-alhoff/seo-landing). Clone the repository — the repo root is the skill folder itself — then run the commands below from the directory that contains `seo-landing/`:

```bash
git clone https://github.com/aleksandr-alhoff/seo-landing.git
```

### Global (available in all projects)

```bash
# VS Code Copilot
cp -R seo-landing ~/.copilot/skills/

# Claude Code
cp -R seo-landing ~/.claude/skills/

# OpenAI Codex CLI / ChatGPT desktop
cp -R seo-landing ~/.agents/skills/

# Cursor
cp -R seo-landing ~/.cursor/skills/

# Gemini CLI
cp -R seo-landing ~/.gemini/skills/

# Google Antigravity
mkdir -p ~/.gemini/config/skills
cp -R seo-landing ~/.gemini/config/skills/

# OpenCode
mkdir -p ~/.config/opencode/skills
cp -R seo-landing ~/.config/opencode/skills/

# OpenClaw (via CLI — installs into the shared ~/.openclaw/skills)
openclaw skills install git:aleksandr-alhoff/seo-landing --global
# or from a local clone: openclaw skills install ./seo-landing --global
# or manually:
mkdir -p ~/.openclaw/skills
cp -R seo-landing ~/.openclaw/skills/

# Hermes
mkdir -p ~/.hermes/skills
cp -R seo-landing ~/.hermes/skills/
```

OpenClaw also picks up skills from `~/.agents/skills` (the Codex path above), and Hermes can scan it too if you add `~/.agents/skills` to `skills.external_dirs` in `~/.hermes/config.yaml`.

Gemini CLI can also install straight from a Git repository:

```bash
gemini skills install https://github.com/aleksandr-alhoff/seo-landing.git
```

### Per project (workspace only)

```bash
# Shared .agents/skills — picked up by VS Code Copilot, Codex, Cursor, Antigravity, Gemini CLI, OpenCode, OpenClaw, Hermes
mkdir -p .agents/skills
cp -R seo-landing .agents/skills/

# Claude Code
mkdir -p .claude/skills
cp -R seo-landing .claude/skills/

# VS Code Copilot (GitHub-style location)
mkdir -p .github/skills
cp -R seo-landing .github/skills/

# OpenClaw (workspace skills — highest precedence)
# via CLI: openclaw skills install ./seo-landing
mkdir -p skills
cp -R seo-landing skills/

# Hermes (project-local; then trust the repo once: hermes skills trust)
mkdir -p .hermes/skills
cp -R seo-landing .hermes/skills/
```

Once installed, the skill is picked up automatically by its description — just ask your agent to "build a landing page from a brief with focus on SEO and PageSpeed".

## Usage

1. Give the agent a brief: domain, language, topic and keywords, business type, CTA and contacts.
2. The skill creates a separate project folder (`<workspace>/<project-slug>/`) with `index.html`, `robots.txt`, `sitemap.xml`, and `SERVER-SETUP.md`.
3. At the stop point, confirm the HTML version — the skill then runs validation (W3C, JSON-LD, Lighthouse as automated evidence, plus required manual accessibility checks) and produces a report: LCP, PageSpeed scores, and the schema.org types used.

## About the author

**Aleksandr Alhov** — 14+ years of experience in SEO, content marketing, and GEO/AEO. Runs an SEO boutique for product teams working across EN, LATAM, MENA, and CIS markets: building in-house SEO departments turnkey, launching profitable corporate media, discovering growth hypotheses in the SEO channel, and providing hands-on SEO consulting.

Co-founder of:

- [Total Site Control](https://totalsitecontrol.com/)
- [Udalenka.work](https://udalenka.work)
- [QR Barcode Hub](https://qrbarcodehub.com)
- [DealRocket](https://dealrocket.ru/)

Made for the [t.me/sdelay_tam](https://t.me/sdelay_tam) channel — a cozy SEO channel for product teams. SEO questions: [t.me/alhov](https://t.me/alhov).

## License
[MIT](./LICENSE) — free to use, modify, and distribute, including commercially. Just keep the copyright notice.
Specification: see [references/tech-spec.md](./references/tech-spec.md) — the current version and change record are declared there.
