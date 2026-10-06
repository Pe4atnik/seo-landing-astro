# Astro SEO and Performance Workflow

This reference extends the upstream landing-page specification for Astro projects. It applies to static, server-rendered, and hybrid/legacy Astro contours. Do not apply every item blindly; identify project version and architecture first.

## 1. Contour discovery

Read only what is needed:

- `package.json`, lockfile, `astro.config.*`, `tsconfig.json`;
- `src/pages/`, layouts, components, content/config files;
- `public/` and `src/assets/` ownership;
- existing test scripts and generated output;
- deployment adapter/config when relevant.

Record:

- Astro and integration versions;
- package manager and existing scripts;
- `output`, adapter, `site`, `base`, `trailingSlash`;
- route source and dynamic `getStaticPaths()` behavior;
- sitemap, redirects, i18n, image service, and content collections;
- client directives (`client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`).

Do not infer static output merely from the existence of `dist/`. Do not assume a single page from the word “landing”.

## 2. Dual source/output audit

### Source layer

Use source to locate the durable fix:

- shared head/SEO component versus duplicated layout logic;
- route/data ownership and schema builder;
- image imports and whether metadata can be inferred;
- client hydration ownership;
- global accessibility behavior;
- sitemap and canonical policy.

### Output layer

Use built or deployed HTML to verify:

- actual metadata and JSON-LD;
- generated paths and status behavior;
- final asset URLs and dependencies;
- rendered headings, links, forms, and islands;
- sitemap/robots and redirect behavior.

A generated file is evidence, not usually the edit target.

## 3. Route inventory and sampling

Inventory all routes from built output, sitemap, routing data, and dynamic path sources. Reconcile counts and explain differences (endpoints, redirects, 404, legacy HTML).

For multi-route projects:

1. fingerprint by layout, component tree/data shape, or emitted structure;
2. choose one representative per family;
3. identify outliers (unusual length, media count, forms, embeds, schema types, status);
4. run deterministic metadata/link/asset checks across every route;
5. render representatives and outliers at desktop and mobile widths;
6. report route coverage separately from visual/editorial acceptance.

## 4. URL and indexability contract

Reconcile:

- `site`, `base`, and `trailingSlash` in Astro config;
- canonical URL construction in layouts/components;
- sitemap URLs and production origin;
- slash/non-slash redirects;
- dynamic route output;
- legacy redirects and aliases;
- robots meta and `robots.txt`;
- staging `noindex` policy versus production.

Avoid chains, loops, mixed hosts, canonical-to-redirect, sitemap redirects, or both slash variants returning 200. Do not remove indexed legacy routes without an explicit migration decision.

## 5. Shared metadata and schema

Prefer one typed/shared SEO interface. Audit drift between layouts and special pages.

Minimum context-dependent set:

- unique, truthful title and description;
- canonical absolute URL;
- robots policy;
- Open Graph type/title/description/url/image;
- language, text direction, and `og:locale`;
- social-card fallback where wanted;
- favicon/manifest where appropriate.

Schema rules:

- parse every JSON-LD block;
- compare entity facts with visible content and linked/contact data;
- use stable `@id` for shared entities;
- emit `WebSite`, breadcrumbs, FAQ, article, product, local-business subtype, or video only when facts and visible page content support them;
- syntax does not prove Google feature eligibility;
- serialize safely inside `<script>`: escape `<` (for example as `\u003c`) so future editorial input cannot close the element.

Migration parity is not correctness. A source site can contain stale phone numbers, invalid schema, duplicate metadata, or old CDN URLs.

## 6. Astro images

Determine ownership first:

- imported `src/` assets can use `astro:assets` metadata and transformation;
- `public/` assets are served as-is and need explicit dimensions/variants;
- remote images require configured domains/patterns and continued availability.

Check each meaningful image for:

- intrinsic `width` and `height` or equivalent reserved aspect ratio;
- appropriate `Image`/`Picture` use;
- responsive `srcset` and truthful `sizes`;
- efficient WebP/AVIF for photographic content when smaller and visually acceptable;
- SVG retained for suitable vectors;
- descriptive alt or intentional empty alt;
- no lazy loading on the LCP candidate;
- suitable `fetchpriority`, preload, and decoding for measured LCP cases;
- no oversized source relative to rendered dimensions;
- stable local OG/social images with rights/provenance.

Do not demand AVIF for every asset. Verify visual parity after conversion.

## 7. Islands, JavaScript, CSS, and fonts

For every hydrated island, record directive and necessity. Prefer server-rendered HTML and the least eager directive compatible with UX. `client:load` and `client:only` need evidence.

Check bundle/runtime errors and third-party startup cost. Maps, videos, chats, analytics, and call tracking need explicit business purpose, privacy/consent handling, and measured impact.

Astro-generated same-origin hashed CSS is acceptable. Do not label external CSS files defective merely because critical CSS is not inline. Optimize only after measurement.

Use local/system fonts when possible; otherwise subset/preload only required faces and avoid invisible text.

## 8. Accessibility

Audit shared layouts and representative templates for:

- language and direction;
- landmarks and one meaningful H1;
- skip link to stable main target;
- keyboard navigation and visible focus;
- labels, names, errors, status messages, and form flow;
- contrast and non-color cues;
- zoom/reflow and horizontal overflow;
- reduced-motion override for smooth scrolling/animation;
- dialogs, carousels, menus, and embeds;
- alt text and media controls.

Automated axe checks are partial evidence. State severity filters and route coverage; do not hide moderate/minor findings without reporting that policy.

## 9. Performance evidence

Use the same environment before and after. Prefer an existing pinned runner. Record Lighthouse version, route, viewport/throttling, run count, aggregation method, and timestamp.

- Local Lighthouse = local lab evidence.
- Deployed Lighthouse = deployed lab evidence.
- CrUX/RUM = field evidence.
- Lighthouse does not establish real INP without interactions/field data.

Prioritize measured LCP asset, blocking resources, hydration, font behavior, caching/compression, and oversized media. Never promise 100/100 or ranking gain.

## 10. Existing QA integration

Inspect `package.json` scripts. Reuse safe project checks for build, routes, links, SEO, accessibility, visual regression, and redirects. Extend rather than duplicate them.

Audit-only must not run commands that write build output unless explicitly authorized. A command named `test` may still update snapshots/reports: inspect before running.

## 11. Generic defect patterns

These examples are intentionally generic:

- visible contact data differs from `Organization` JSON-LD;
- most emitted `<img>` elements lack intrinsic dimensions;
- Open Graph images depend on an old external platform/CDN;
- accessibility tests cover one representative while dozens of template variants exist;
- two layouts serialize metadata differently;
- sitemap reflects migration parity while canonicals use another slash policy.

Treat each as a hypothesis to verify, never as a presumed defect.

## 12. Fix validation

After authorized changes:

1. run focused assertion;
2. run existing build/type checks;
3. run route/link/SEO/schema checks;
4. test representatives/outliers desktop and mobile;
5. repeat performance measurement where relevant;
6. inspect git diff and generated artifacts;
7. document rollback and unresolved external gates.
