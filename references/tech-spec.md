# Technical Specification — Fast SEO-Friendly Landing Pages

Version 1.4 (29.08.2026)

The README footer must declare the same specification version and date —
verify with `scripts/check-spec-version.sh` (fails when they diverge).

## Change record
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
- `speakable` markup for voice search (optional — only for news/recipe-type pages)
- Static assets: `Cache-Control: public, max-age=31536000, immutable`
- HTML: `max-age=0, must-revalidate`
- Server instructions must specify Brotli (br) preferred, gzip fallback
- Preload the LCP image: `<link rel="preload" as="image" href="hero.webp" fetchpriority="high">`
- Add `fetchpriority="high"` to the main image
- ALL scripts (if any) must have the `defer` attribute and be placed before `</body>`
- Absolute paths for ALL resources: `src="https://site.com/images/photo.webp"`

## 2. HTML STRUCTURE
- Document encoding: `<meta charset="utf-8">` as the very first element inside `<head>`, entirely within the first 1024 bytes of the document. All files are saved as UTF-8 without BOM.
- Clean semantic HTML5: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`
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
- JSON-LD structured data (at the end of body):
  - `@type: WebSite` (with `name` and the canonical root `url`) only on the domain or subdomain home page, consistent with visible branding; omit it for subdirectory landings when the root home page is outside this project's scope. Never invent a site identity or use a subdirectory URL as the WebSite root.
  - `Organization`/`LocalBusiness` (with GEO data: address, phone, coordinates)
  - `LocalBusiness` only when the verified identity facts exist: public/legal business name, complete structured postal address (street, locality, region, postal code, country), phone. Never invent identity data — fall back to `Organization` markup or omit entity markup when required facts are unavailable. Validate required properties against the current Google LocalBusiness structured-data documentation, not only schema.org syntax.
  - Emit the most specific truthful `LocalBusiness` subtype based on the actual business (e.g. `Restaurant`, `Dentist`), not target keywords; use an `@type` array only when multiple genuine types apply. Omit `LocalBusiness` markup entirely when no physical location exists. Validate the chosen type/property combination with Rich Results Test and Schema Markup Validator.
  - `@type: BreadcrumbList` only when a real site hierarchy exists: collect the visible breadcrumb trail and canonical parent URLs, require at least two truthful ordered `ListItem` entries, and keep the JSON-LD consistent with user-visible navigation. Omit `BreadcrumbList` for a standalone landing without a real hierarchy rather than inventing parent pages.
  - If such content blocks exist, add `FAQPage` and review markup
  - All URLs absolute, `@id` specified

## 4. SECURITY AND ACCESSIBILITY
- `<meta name="referrer" content="strict-origin-when-cross-origin">`
- Security headers (in the .htaccess instructions):
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Accessibility: aria attributes on interactive elements
- Title and alt mandatory for all images, matching the block name and number within the block when there are several images
- Wrap all external links: `<a href="https://example.com" target="_blank" rel="noopener noreferrer">External site</a>`
- All file links and external links must use HTTPS

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
- `prefers-reduced-motion` support
- All interactive elements keyboard accessible

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
- If a video is actually on the page, add `@type: VideoObject` markup (name, description, thumbnailUrl, uploadDate, embedUrl) to JSON-LD.
- Reference implementation: [video-facade.md](./video-facade.md)

## 10. TYPICAL BLOCKS WITHOUT SPEED LOSS
- FAQ / accordion: `<details>/<summary>` — 0 bytes of JS, content immediately in the DOM (good for AEO).
- Slider / carousel: CSS `scroll-snap` — native swipe scroll, no JS libraries.
- Tabs: CSS-only (radio inputs) or ~15 lines of JS; content of all tabs always in the DOM.
- Modal window: native `<dialog>`, opened on click, loads nothing on start.
- Map: facade like video (§9) — map screenshot, iframe on click.
- Reviews: static HTML + `Review`/`AggregateRating` in JSON-LD, no widgets.
- Form: native validation (`required`, `type="email"`), honeypot field against spam, no external form builders.
- Scroll counters and animations: one `IntersectionObserver` in the common script; animations only via `transform`/`opacity`.
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
- All deferred widgets: keyboard accessible, closable with Esc, have aria attributes and visible `:focus-visible`.
- Popups must not cover first-screen content and must not shift the layout.

## OUTPUT — canonical workflow order
Generate the complete HTML code complying with ALL points above.

One canonical sequence, shared with SKILL.md and README — do not reorder:
1. Generate the draft, then self-check it against every requirement in this spec; fix violations before showing the draft.
2. STOP POINT — show the draft to the user and ask explicitly whether the HTML version is OK. Do not run validation and do not report any metrics before the user approves.
3. After approval: serve the page, then run validation — W3C HTML validity, JSON-LD schema validator, Lighthouse (performance, SEO, accessibility, best practices).
4. Fix any failures found. If fixes change the approved HTML, obtain renewed approval before reporting.
5. Final report — measured evidence only: LCP parameters, PageSpeed scores, schema.org types used.

Rules:
- Never claim LCP/PageSpeed numbers before the corresponding check has actually run on the served page.
- Do not mention the verification process in the final answer.
