# Technical Specification — Fast SEO-Friendly Landing Pages

Version 1.7 (30.08.2026)

This file is the single source of truth for the specification version and its
change record. Other documents (README, SKILL) must point here instead of
repeating the version number — a number that exists in one place cannot diverge.

## Change record
- **1.7 (30.08.2026)** — single source of truth: the specification version and change record live only in this file; the README footer points here instead of duplicating the version, and the version-divergence check script is removed (#20 follow-up).
- **1.6 (30.08.2026)** — accessibility contract: native-HTML-first ARIA rule (#45); no forced new tabs for external links (#46); accessible carousel contract (#47); complete modal `<dialog>` workflow (#48); form labels and input-purpose metadata (#49); reduced-motion gate over every permitted animation (#50); non-text contrast 3:1 (#33); conditional bypass/skip-link mechanism (#34); purpose-based image alternatives (#13); required manual accessibility checks before claiming WCAG AA (#14).
- **1.5 (29.08.2026)** — truthfulness and provenance: verified LocalBusiness identity and most-specific subtype (#15, #44); WebSite only on the domain/subdomain home page (#35); BreadcrumbList only with a real hierarchy (#22); FAQPage eligibility limits (#23); Review/AggregateRating gated to eligible source-backed cases (#16); Speakable restricted to its beta news eligibility (#21); VideoObject only from collected media facts (#36); crawlable favicon in the output contract (#38); truthful sitemap/robots discovery contract (#37); source-backed marketing claims (#42); asset rights and provenance manifest (#43).
- **1.4 (29.08.2026)** — canonical workflow order with stop point before validation (#24); mandatory `<meta charset="utf-8">` and UTF-8 Content-Type (#30); CSP/no-JS-safe deferred CSS (#31); `Vary: Accept-Encoding` for compressed responses (#28).
- **1.3 (27.08.2026)** — initial published revision.

## Contents
- 1. Performance (100/100 PageSpeed)
- 2. HTML structure
- 3. SEO optimization
- 4. Security and accessibility
- 5. CSS / fonts
- 6. Forbidden
- 7. Testing
- 8. Accessibility and inclusivity
- 9. Embedded video (facade pattern only)
- 10. Typical blocks without speed loss
- 11. Deferred widgets
- 12. Content truthfulness & provenance
- 13. Input sanitization & output encoding
- Output requirements

Create a static HTML site focused on maximum performance and SEO.

## 1. PERFORMANCE (100/100 PageSpeed)
- **LCP target**: <2.5s (hero image or H1)
- **INP target**: <100ms (minimize JS on the first screen)
- **CLS target**: <0.1 (fixed dimensions for all elements, including fonts)
- Inline ALL critical CSS in `<style>` inside `<head>` (only first-screen styles)
- First screen = header + hero + CTA (up to 800px height on desktop, 70vh on smartphones)
- Critical CSS must include ONLY the styles of these blocks
- Below-the-fold CSS — two options, both must work with JavaScript disabled and under a strict CSP:
  - Default: inline ALL CSS (critical + below-the-fold) in `<head>` — landing CSS is usually small enough that deferral is not justified by measurement.
  - Only when measurement shows a real benefit: `<link rel="preload" href="styles.css" as="style">` plus `<link rel="stylesheet" href="styles.css" media="print">`, and switch `media` to `all` from the single deferred page script. Never use an inline `onload` handler on the link — it breaks under CSP and contradicts the script policy. Add a `<noscript><link rel="stylesheet" href="styles.css"></noscript>` fallback.
- Verify full screen rendering with JavaScript disabled, under the enforced CSP, and after a stylesheet load failure
- ALL images: AVIF with WebP/JPEG fallback via `<picture>`, lazy loading, `decoding="async"`, numeric width/height in pixels on every image
- Use `srcset` and `sizes` on all `<img>`
- Calculate `sizes` from the container max-width
- Responsive breakpoints: 320, 640, 768, 1024, 1280, 1920
- Blur placeholder or LQIP (Low Quality Image Placeholder)
- `aspect-ratio` in CSS to prevent layout shift
- `speakable` markup — BETA, do not use by default. Eligible only for topical news content from English-language publishers targeting Google Home users in the United States; recipes and ordinary landing pages are not eligible. When eligibility is established, collect the CSS selector or XPath targets, keep the selected text concise, visible and suitable for audio, and label the feature as beta. Omit it when eligibility cannot be confirmed.
- Static assets are emitted with fingerprinted filenames — a content-hash fragment in the name (e.g. `styles.a1b2c3d4.css`, `hero.9f31c2ab.webp`). Only fingerprinted URLs may receive `Cache-Control: public, max-age=31536000, immutable`; every asset change must regenerate the hash and update all HTML references (including `srcset`) in the same commit. A stable (unhashed) URL must never be marked `immutable` — a compliant cache may serve the old bytes for the entire max-age after the file is overwritten (RFC 9111); stable URLs get a revalidation policy (`no-cache`) instead.
- HTML: `max-age=0, must-revalidate`
- Server instructions must specify Brotli (br) preferred, gzip fallback — and state the Brotli module prerequisite honestly: Nginx needs ngx_brotli installed/loaded (verify with `nginx -t` and an `Accept-Encoding: br` request), Apache's `mod_brotli` block is skipped when absent. When the module cannot be installed, ship gzip-only and record that explicitly — never claim Brotli that is not actually served (see references/server-config.md)
- Preload the LCP image: `<link rel="preload" as="image" href="hero.webp" fetchpriority="high">`
- Add `fetchpriority="high"` to the main image
- ALL scripts (if any) must have the `defer` attribute and be placed before `</body>`
- Absolute paths for ALL resources: `src="https://site.com/images/photo.webp"`

## 2. HTML STRUCTURE
- Document encoding: `<meta charset="utf-8">` as the very first element inside `<head>`, entirely within the first 1024 bytes of the document. All files are saved as UTF-8 without BOM.
- Clean semantic HTML5: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`
- Bypass mechanism (WCAG SC 2.4.1): when the output is part of a multi-page site sharing repeated header/navigation, emit a first-focusable "Skip to main content" link targeting a stable `<main>` ID; make it visible on focus and verify activation moves focus and scroll to the main content. A genuinely standalone one-page landing without repeated blocks does not need this conditional mechanism.
- One responsive HTML, no duplicate content (mobile/desktop)
- Heading hierarchy: one H1, then H2–H6 by logic
- Language tag matching the content: `<html lang="en-US">` or equivalent
- Viewport: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">`
- Minify HTML, CSS and JS files: remove comments and extra whitespace

## 3. SEO OPTIMIZATION
- Meta tags:
  - `<title>Unique keyword title up to 60 characters</title>`
  - `<meta name="description" content="Unique keyword description up to 160 characters">`
  - `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`
  - `<link rel="canonical" href="https://site.com/">`
- Open Graph: og:title, og:description, og:image, og:type, og:url, og:locale (plus og:image:width, og:image:height, og:image:alt)
- Twitter card: twitter:card, twitter:title, twitter:description, twitter:image
- Favicon: a stable local square PNG/ICO of at least 48×48 (dimensions a multiple of 48px) plus `<link rel="icon" href="https://site.com/favicon.png">` on the home page. The asset must be brand-approved (or created with explicit permission), included in the project manifest, and verified to return 200 and remain crawlable. Meeting these rules makes the icon eligible for Google Search results — it does not guarantee display.
- JSON-LD structured data (at the end of body):
  - `@type: WebSite` (with `name` and the canonical root `url`) only on the domain or subdomain home page, consistent with visible branding; omit it for subdirectory landings when the root home page is outside this project's scope. Never invent a site identity or use a subdirectory URL as the WebSite root.
  - `Organization`/`LocalBusiness` (with GEO data: address, phone, coordinates)
  - `LocalBusiness` only when the verified identity facts exist: public/legal business name, complete structured postal address (street, locality, region, postal code, country), phone. Never invent identity data — fall back to `Organization` markup or omit entity markup when required facts are unavailable. Validate required properties against the current Google LocalBusiness structured-data documentation, not only schema.org syntax.
  - Emit the most specific truthful `LocalBusiness` subtype based on the actual business (e.g. `Restaurant`, `Dentist`), not target keywords; use an `@type` array only when multiple genuine types apply. Omit `LocalBusiness` markup entirely when no physical location exists. Validate the chosen type/property combination with Rich Results Test and Schema Markup Validator.
  - `@type: BreadcrumbList` only when a real site hierarchy exists: collect the visible breadcrumb trail and canonical parent URLs, require at least two truthful ordered `ListItem` entries, and keep the JSON-LD consistent with user-visible navigation. Omit `BreadcrumbList` for a standalone landing without a real hierarchy rather than inventing parent pages.
  - If a visible, complete FAQ content block exists, add `FAQPage` markup. Distinguish schema.org validity from Google rich-result eligibility: Google currently shows FAQ rich results regularly only for well-known authoritative government and health sites, and valid markup never guarantees display. Keep or omit the markup intentionally based on the user's goals, and never report it as an achieved rich-result benefit.
  - `Review`/`AggregateRating` markup is forbidden for the represented Organization/LocalBusiness itself (self-serving ratings are ineligible for LocalBusiness rich results). Emit review markup only for an eligible reviewed entity with collected facts: reviewed entity, author, date, source, rating scale and count — and only when every rating is visible on the page exactly as marked up. Omit rating markup when eligibility or source authenticity is not established.
  - All URLs absolute, `@id` specified
- Crawlability contract (robots.txt + sitemap.xml):
  - `sitemap.xml`: valid UTF-8 XML with XML-escaped, absolute canonical `<loc>` URLs; each `<loc>` must match the page's HTML canonical. Populate `lastmod` only from a verifiable significant-content-change timestamp — omit it when unknown rather than using generation time blindly.
  - `robots.txt`: deployed at the site root with a fully qualified `Sitemap:` URL; must not block the canonical page or required media (images, video covers).
  - Validation: parse the sitemap XML, compare every `<loc>` with the HTML canonical, check the `Sitemap:` URL in robots.txt, and request both deployed files successfully (HTTP 200).

## 4. SECURITY AND ACCESSIBILITY
- `<meta name="referrer" content="strict-origin-when-cross-origin">`
- Security headers (in the .htaccess instructions):
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - They must reach every response class, not only successful HTML: configure inheritance so Nginx child locations and Apache locally generated responses (404/error pages, internal redirects) carry them too, and verify with `curl -I` on `/`, `.css`, `.js`, and a 404 (see references/server-config.md).
- Content-Security-Policy is generated per page from its actual feature set — restrictive `default-src 'self'` base with explicit `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`; inline `<style>` authorized by `sha256-` hashes; no `unsafe-inline`/`unsafe-eval` for scripts; `youtube-nocookie.com` added to `frame-src`/`connect-src` only when the video block exists. Roll out report-only first, browser-test every feature combination, then enforce (see references/server-config.md).
- `Strict-Transport-Security` is deployed on HTTPS responses only, in stages: short `max-age` first, long lifetime after clean rollout; `includeSubDomains` only when every applicable subdomain serves HTTPS; `preload` only as an explicitly warned opt-in. HSTS supplements the HTTP→HTTPS redirect, it never replaces it (see references/server-config.md).
- Accessibility: native HTML first (W3C's first rule of ARIA). Use semantic elements (`<button>`, `<a>`, `<details>`, `<dialog>`, native form controls) and add ARIA only for necessary semantics not already supplied by the element. Never duplicate or override native roles/states. For each custom component define its accessible name, role, state, keyboard behavior, and how state changes are announced; validate ARIA conformance and inspect the resulting accessibility tree.
- Image alternatives are purpose-based (W3C images tutorial), not a blanket title/alt mandate:
  - Informative images: concise `alt` text conveying the image's purpose.
  - Decorative images or images whose content is duplicated in adjacent text: `alt=""` and no `title`, so assistive technology ignores them.
  - Images inside links: the `alt` describes the link destination/action (together with any adjacent link text).
  - Complex images (charts, diagrams): short `alt` identifying the image plus the essential information provided nearby in text.
  - Never use block-name/number wording as alt text. Include manual screen-reader and accessible-name checks in validation.
- External links open in the current browsing context by default. Use `target="_blank"` only for an explicit UX/task reason (e.g. a form submission must not be abandoned, a reference must stay open), keep `rel="noopener noreferrer"` when used, and warn users in advance both visibly and programmatically — e.g. `External site <span class="visually-hidden">(opens in a new tab)</span>` or equivalent link text. Test keyboard and screen-reader behavior so the link purpose and the new-tab context change are announced.
- All file links and external links must use HTTPS
- HTTPS enforcement is part of the deployment contract, not an assumption: the generated `SERVER-SETUP.md` must include a tested port-80 virtual host/server block that issues a single permanent 301/308 redirect preserving host, path, and query string to the canonical HTTPS host, plus the TLS certificate prerequisite and reverse-proxy/CDN caveats (see references/server-config.md).

## 5. CSS / FONTS
- ONLY system fonts: `font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Helvetica Neue", Arial, sans-serif;`
- Forbidden: external fonts, `font-display: swap`, Google Fonts
- CLS prevention:
  - `* { box-sizing: border-box; }`
  - `img { max-width: 100%; height: auto; display: block; }`
  - `.container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 15px; }`

## 6. FORBIDDEN
- External JS libraries (jQuery, React, Vue, etc.)
- External CSS frameworks (Bootstrap, Tailwind)
- SVG images
- External fonts
- iframe (exceptions: maps — only with `loading="lazy"`; YouTube video — only via the facade pattern, see §9)
- `document.write()`, synchronous scripts

## 7. TESTING
- Valid HTML per W3C
- Correct display at all sizes from 320px to 1920px
- Support for all modern browsers

## 8. ACCESSIBILITY AND INCLUSIVITY
- WCAG 2.1 Level AA compliance
- Text contrast ratio at least 4.5:1
- Non-text contrast at least 3:1 against adjacent colors (WCAG SC 1.4.11) for control boundaries, state indicators, focus indicators, and meaningful graphics needed to identify components or states. Validate the default, hover, `:focus-visible`, selected/expanded, error, and disabled states as applicable; record an exception only where the WCAG criterion itself excludes the component or state.
- `prefers-reduced-motion` support covers every permitted animation: gate nonessential CSS/JS animation behind `@media (prefers-reduced-motion: no-preference)` or provide a `reduce` branch that disables/replaces it. In reduced mode render final counter values without animated counting, avoid smooth/programmatic scrolling, and keep functional state cues that do not rely on motion. Test the reduced preference across every optional animation and interactive state.
- All interactive elements keyboard accessible
- Manual accessibility verification is required before claiming WCAG 2.1 AA — no automated tool alone determines conformance (W3C). Required manual checks: keyboard navigation, focus order and visibility, dialog/modal focus flow, zoom/reflow, reduced motion, semantic name-role-value, alternative-text quality, and all interactive visual states. Lighthouse accessibility output is automated audit evidence, not certification. Record pass/fail evidence per applicable WCAG 2.1 AA criterion and report unresolved items rather than silently certifying them.

## 9. EMBEDDED VIDEO (facade pattern only)
- Forbidden to load a YouTube iframe on page load — only on user click.
- Before the click show ONLY the video cover:
  - `<picture>` with a local cover in AVIF/WebP + JPEG fallback (no hotlinking from i.ytimg.com — extra domain, blocked by ad blockers);
  - numeric width/height + CSS `aspect-ratio: 16/9` (CLS prevention);
  - `loading="lazy"`, `decoding="async"`, srcset/sizes per §1 rules.
- Play button over the cover:
  - a real `<button>` (not a div), keyboard accessible (Enter/Space);
  - `aria-label="Watch video: <title>"`;
  - play icon — CSS only (no SVG, forbidden) or a raster image;
  - visible `:focus-visible`.
- On click/Enter remove the cover and button, insert an `<iframe>` in their place:
  - `src="https://www.youtube-nocookie.com/embed/<ID>?autoplay=1"` (privacy-enhanced mode);
  - `title="Video title"` (mandatory for accessibility);
  - `loading="lazy"`, `allowfullscreen`;
  - `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`;
  - move focus to the iframe after insertion.
- Add preconnect to https://www.youtube-nocookie.com only on hover over the cover (handler in the script), never in `<head>`.
- All pattern scripts — in one file with `defer` before `</body>`, no external libraries; for multiple videos use one delegated handler.
- If a video is actually on the page, add `@type: VideoObject` markup (name, description, thumbnailUrl, uploadDate, embedUrl) to JSON-LD — only when all required facts are collected and source-backed: the video URL/ID, title, description, accurate ISO-8601 `uploadDate` with timezone, and a unique crawlable thumbnail (plus `contentUrl` when applicable). Never invent media facts; users must be able to watch that specific video on the page. Validate with Rich Results Test and verify the thumbnail returns 200.
- Reference implementation: [video-facade.md](./video-facade.md)

## 10. TYPICAL BLOCKS WITHOUT SPEED LOSS
- FAQ / accordion: `<details>/<summary>` — 0 bytes of JS, content immediately in the DOM (good for AEO).
- Slider / carousel: prefer a plain linear list when horizontal interaction is not essential. When the result is a carousel (W3C APG carousel pattern), CSS `scroll-snap` may serve as the scrolling mechanism, but the carousel additionally needs: a labeled container, named slides, native previous/next `<button>` controls (a few `scrollBy` lines in the common script), and keyboard traversal between slides. Auto-rotation is forbidden by default; if explicitly enabled, add a stop/start control first in tab order and stop rotation whenever focus enters the carousel. Test keyboard-only, touch, screen-reader, and 320px behavior.
- Tabs: CSS-only (radio inputs) or ~15 lines of JS; content of all tabs always in the DOM.
- Modal window: native `<dialog>` opened with `showModal()` — `.show()` or a static `open` attribute is not modal. Provide a visible title that serves as the accessible name, a visible keyboard-operable close/cancel control, and Escape support (native `cancel` event). Verify the focus flow: focus moves into the dialog on open, stays inside while it is open, and returns to the invoking control on close. Do not add redundant ARIA to the native `<dialog>` just to satisfy an ARIA rule (§4). Loads nothing on start.
- Map: facade like video (§9) — map screenshot, iframe on click.
- Reviews: static HTML, no widgets. `Review`/`AggregateRating` JSON-LD only under the §3 gates: never self-serving for the represented business, only source-backed facts, visible-page parity.
- Form: native validation (`required`, `type="email"`), honeypot field against spam, no external form builders. Every user-facing control gets a visible label programmatically associated via `<label for>` (not placeholder-only), plus any required format/instruction text. Personal-data fields carry the correct standardized `autocomplete` token where the WCAG 2.1 input-purpose taxonomy applies (e.g. `name`, `email`, `tel`, `street-address`). The honeypot stays out of the accessibility tree and tab order (`tabindex="-1"`, `aria-hidden="true"`, visually hidden) and is never given an `autocomplete` value that browsers could autofill. Validate autocomplete values and test browser autofill plus assistive-technology exposure.
- Scroll counters and animations: one `IntersectionObserver` in the common script; animations only via `transform`/`opacity` and always inside the §8 reduced-motion gate — counters render their final value instantly and scrolling is never smoothed when the user prefers reduced motion.
- Sticky header: `position: sticky` — pure CSS, no JS listeners.
- Back-to-top button: anchor link or 5 lines of JS.
- General rules:
  - total page JS budget ≤ 15 KB, one file, `defer` before `</body>`;
  - one delegated handler for all interactivity;
  - 1 block = 0 external requests: no block may pull a script/style/widget from a third-party domain;
  - content always in the DOM: load on click only heavy media (video, maps);
  - forbidden on first load: third-party widgets, scroll-jacking, JS parallax.

## 11. DEFERRED WIDGETS (online chats, subscription popups, cookie banners)
- Forbidden to load their scripts/styles on first load — async only.
- Initialization strictly 1 second after the DOMContentLoaded event:

```javascript
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () { /* dynamically create <script> or insert the widget */ }, 1000);
});
```

- Insert widget scripts dynamically (`createElement` + `appendChild`) with async/defer attributes, never as a static tag in `<head>`.
- Cookie banner: own block (~20 lines of CSS + 5 lines of JS for localStorage), no third-party services; show only if consent has not been given yet.
- Online chat and subscription popup: if it is a third-party service — load its script only per the rule above; the widget container must not reserve space before loading (no CLS).
- All deferred widgets: keyboard accessible, closable with Esc, carry only the ARIA needed beyond native semantics (§4), and show visible `:focus-visible`.
- Popups must not cover first-screen content and must not shift the layout.

## 12. CONTENT TRUTHFULNESS & PROVENANCE
- Never invent objective marketing facts: numerical results, prices, availability, credentials, certifications, comparisons, guarantees, customer logos/cases, or regulated claims.
- Every objective claim in the generated copy must trace back to approved source material collected in the brief, with an identified claim owner. Self-check before the stop point: list each objective claim and its source; a claim without a source is requested from the user or omitted — never silently filled with generated copy.
- Health, financial, legal and other sensitive claims additionally require an identified subject-matter or legal reviewer appropriate to the target jurisdiction before publication.
- When evidence is missing, report a blocker instead of publishing unsupported claims.
- Image rights and provenance: for every asset used on the page (photos, logos, video covers, and all generated derivatives such as AVIF/WebP conversions) record in an `ASSETS.md` manifest: creator/rightsholder, source, license or permission, allowed reproduction/adaptation, attribution, territory, and expiry where applicable. Public availability of an image is not permission to copy or transform it — exclude or replace assets whose clearance is unavailable. Every generated derivative must link back to its provenance record. The manifest records supplied rights assertions and does not replace jurisdiction-specific legal advice.

## 13. INPUT SANITIZATION & OUTPUT ENCODING
Every value collected in the brief (domain, keywords, business name, address, contacts, media IDs, any free-text field) is UNTRUSTED input by default. Encode it for its exact output context — never copy a raw value into markup (OWASP XSS prevention):
- HTML element content: escape `& < > " '` as HTML entities.
- Attribute values: always quoted, attribute-escaped; never place untrusted data in event-handler attributes (`onclick` etc.) at all.
- URL contexts (`href`, `src`, canonical, OG/JSON-LD URLs): validate the scheme against an allow-list of `https` (and `http` only where the brief requires it); REJECT `javascript:` and unexpected `data:` URLs outright — do not attempt to "clean" them.
- JSON-LD: serialize with a JSON encoder, then additionally escape `<` (e.g. as `\u003c`) so embedded data can never terminate the `<script>` element — JSON escaping alone does not protect the HTML script context.
- Structured identifiers are validated against their exact format before use in any URL built at runtime: a YouTube video ID must match `^[A-Za-z0-9_-]{11}$`; a malformed ID is a generation error, not a value to embed (see references/video-facade.md).
- Generation self-test: run the generator with hostile brief values — quotes, angle brackets, a literal `</script>`, an `onerror=`/`onload=` payload, and `javascript:`/`data:` URLs. The output must remain valid HTML and execute none of them; a value that cannot be encoded safely for its context is rejected or omitted, never emitted raw.

## OUTPUT — canonical workflow order
Generate the complete HTML code complying with ALL points above.

One canonical sequence, shared with SKILL.md and README — do not reorder:
1. Generate the draft, then self-check it against every requirement in this spec; fix violations before showing the draft.
2. STOP POINT — show the draft to the user and ask explicitly whether the HTML version is OK. Do not run validation and do not report any metrics before the user approves.
3. After approval: serve the page, then run validation — W3C HTML validity, JSON-LD schema validator, Lighthouse (performance, SEO, accessibility, best practices — automated evidence only), and the manual accessibility checks in §8.
4. Fix any failures found. If fixes change the approved HTML, obtain renewed approval before reporting.
5. Final report — measured evidence only: LCP parameters, PageSpeed scores, schema.org types used.

Rules:
- Never claim LCP/PageSpeed numbers before the corresponding check has actually run on the served page.
- Do not mention the verification process in the final answer.
