---
name: seo-landing
description: "Generates fast, SEO-optimized static HTML landing pages targeting 100/100 PageSpeed (LCP < 2.5s, INP < 100ms, CLS < 0.1), full schema.org JSON-LD, AVIF images, critical CSS, zero external dependencies. Use when: user asks to create/build/generate a landing page, one-pager, or static site with focus on SEO, speed, or PageSpeed; asks for an SEO-friendly page from a brief/ТЗ; or asks to audit/fix a landing against a performance checklist."
metadata:
  argument-hint: "[topic/domain or brief]"
---

# SEO Landing Generator

Builds a static single-page HTML landing optimized for 100/100 PageSpeed and maximum SEO: critical CSS, AVIF images, full JSON-LD structured data, native-only interactivity, zero third-party requests on first load.

## When to Use
- User asks for a landing page / one-pager focused on speed and SEO.
- User provides a brief (ТЗ) and wants a production-ready static page.
- User asks to audit or fix an existing landing against the performance checklist.

## Procedure

### 0. Collect the brief (ask if missing)
Required before generating anything:
- Domain / final URL — for canonical, og:url, absolute paths, JSON-LD `@id`.
- Site identity (for `WebSite` markup, only when the page is the domain/subdomain home page): preferred site name, optional alternate names, and the canonical home URL — collected separately from the landing URL.
- Breadcrumb trail (for `BreadcrumbList` markup, only when a real site hierarchy exists): the visible breadcrumb trail and canonical parent URLs.
- Page language and locale — for `lang` and `og:locale`.
- Topic + 1–3 target keywords — for H1, title, description.
- Business type: Organization or LocalBusiness. For LocalBusiness collect the verified public/legal business name and the complete structured postal address (street, locality, region, postal code, country), plus phone and geo coordinates. Also collect the verified schema.org subtype(s) based on the actual business (e.g. `Restaurant`, `Dentist`, `HardwareStore`) — never chosen from target keywords. Never invent missing identity facts: fall back to `Organization` markup or omit entity markup until the facts are provided.
- CTA and contacts (phone, form, messengers).
- A brand-approved favicon or explicit permission to create one — never invent a brand mark silently.
- Approved source material and a claim owner for objective marketing facts (numbers, prices, qualifications, guarantees, comparisons, case studies) — without them such claims are omitted, never invented.
- Whether images are provided; whether FAQ / reviews / video blocks are needed. For a video block collect source-backed facts: video URL/ID, title, description, accurate first-publication date/time with timezone, and a unique crawlable thumbnail (plus `contentUrl` when applicable). Never invent missing media facts.

If domain or keywords are missing — ask first, do not invent them.

### 1. Create the project folder
Every project lives in its own folder inside the workspace — **never write to the workspace root**:

```
<workspace>/<project-slug>/
  index.html        # the generated landing page
  images/           # local assets (AVIF/WebP/JPEG)
  favicon.png       # stable square brand icon, ≥48×48
  ASSETS.md         # rights & provenance record for every asset
  robots.txt
  sitemap.xml
  SERVER-SETUP.md   # hosting instructions
```

### 2. Generate the page
Build `index.html` strictly following [references/tech-spec.md](./references/tech-spec.md) — 12 requirement sections (performance, HTML structure, SEO, security, CSS/fonts, forbidden list, testing, accessibility, embedded video, typical blocks, deferred widgets, content truthfulness & provenance).

For embedded YouTube video use the facade pattern only: rules in tech-spec §9, reference implementation in [references/video-facade.md](./references/video-facade.md).

### 3. Generate companion files
- `robots.txt` at the site root with a fully qualified `Sitemap:` line, never blocking the canonical page or required media.
- `sitemap.xml` with XML-escaped absolute canonical `<loc>` URLs matching the HTML canonical; `lastmod` only from a verifiable significant-content-change timestamp (omit when unknown — never use generation time blindly).
- Hosting instructions from [references/server-config.md](./references/server-config.md): caching, Brotli/gzip, security headers.

### 4. STOP POINT — user approval
Show the generated page to the user and ask explicitly whether the HTML version is OK. **Do not proceed to validation and the final report until the user confirms.** If there are remarks — fix and ask again.

### 5. Validate
- W3C HTML validity.
- JSON-LD via a schema.org validator.
- Lighthouse / PageSpeed: performance, SEO, accessibility, best-practices.
- Crawlability contract: parse `sitemap.xml`, compare every `<loc>` with the HTML canonical, check the `Sitemap:` URL in `robots.txt`, and request both deployed files successfully (HTTP 200).

Fix any violations found before reporting. Do not mention the verification process in the final answer.

### 6. Final report
Briefly list:
- LCP parameters
- PageSpeed score
- schema.org types used in the code

## Main pitfalls
- Never use external JS/CSS libraries, external fonts, or SVG images (tech-spec §6).
- Never load YouTube iframes, maps, chats, subscription popups, or cookie banners on first load (tech-spec §9, §11).
- All content must exist in raw HTML — nothing rendered only by JS.
- Absolute URLs in JSON-LD, canonical, and OG tags.
- Total JS budget ≤ 15 KB, one file, `defer` before `</body>`.
