# Server Setup — Caching, Compression, Security Headers

Include these instructions in the project's `SERVER-SETUP.md`.

## Apache (.htaccess)

```apache
# Compression: Brotli preferred, gzip fallback
<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/html text/css application/javascript application/json image/svg+xml
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>

# Mark compressed responses so caches vary on Accept-Encoding
<IfModule mod_headers.c>
  <FilesMatch "\.(html|css|js|json|svg)$">
    Header append Vary "Accept-Encoding"
  </FilesMatch>
</IfModule>

# Caching — Cache-Control (mod_headers) is authoritative; no Expires headers.
# `immutable` is allowed ONLY for fingerprinted assets: the generator renames
# each static asset with a content-hash fragment (styles.a1b2c3d4.css) and
# updates every HTML reference on change. A stable (unhashed) URL must never
# be `immutable`: after the file is overwritten, a compliant cache may keep
# serving the old bytes for the entire max-age (RFC 9111).
<IfModule mod_headers.c>
  # Stable (unhashed) asset URLs: may be stored but must revalidate on reuse
  <FilesMatch "\.(avif|webp|jpg|jpeg|png|css|js)$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
  # Fingerprinted URLs (>=8 hex chars before the extension): 1 year, immutable
  <FilesMatch "\.[0-9a-f]{8,}\.(avif|webp|jpg|jpeg|png|css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  # HTML: revalidate every time
  <FilesMatch "\.html$">
    Header set Cache-Control "max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>

# Serve HTML as UTF-8
AddDefaultCharset utf-8
<IfModule mod_mime.c>
  AddCharset utf-8 .html .css .js .xml .json
</IfModule>

<IfModule mod_headers.c>
  # Security headers — `always` so they are also present on locally generated
  # responses: error pages (404/500), internal redirects, subrequests.
  # Use exactly this form (never a bare `Header set` alongside it) so headers
  # are set once and are not duplicated.
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

## Nginx

### Brotli prerequisite — the module must exist before these directives
`brotli`/`brotli_types` are NOT part of stock Nginx. On a build without the
module, `nginx -t` fails with `unknown directive "brotli"` and Nginx will not
start. Before including the Brotli lines, confirm the module is present
(https://github.com/google/ngx_brotli):

```bash
# Does this build know the brotli directives? (fails on stock builds)
nginx -t 2>&1 | grep -i 'unknown directive' ; echo "exit: $?"
# Which modules were compiled in / available?
nginx -V 2>&1 | tr ' ' '\n' | grep -i brotli
```

Install paths (pick one, matching the host):
- Distribution package that ships the module (e.g. Debian/Ubuntu
  `libnginx-mod-brotli` where available) — enable it and keep the package
  name/version in `SERVER-SETUP.md`.
- Dynamic build: compile with `--add-dynamic-module=.../ngx_brotli`, then load
  it in the MAIN context of `nginx.conf`, before any `http` block:
  ```nginx
  load_module modules/ngx_http_brotli_filter_module.so;
  load_module modules/ngx_http_brotli_static_module.so;
  ```
- Static build: compile Nginx with `--add-module=.../ngx_brotli` (directives
  then need no `load_module`).

If the module cannot be installed on the target host: REMOVE the `brotli`
lines entirely, ship gzip-only, and record that in the checklist — never leave
directives that fail `nginx -t`, and never claim Brotli when only gzip is
served. Apache behaves differently: the `<IfModule mod_brotli.c>` block is
silently skipped when the module is absent, so the checklist must likewise be
marked gzip-only (mod_brotli requires Apache ≥ 2.4.26).

```nginx
# Only when the ngx_brotli module is installed and loaded (see above):
brotli on;
brotli_types text/html text/css application/javascript application/json image/svg+xml;
gzip on;
gzip_vary on;
gzip_types text/html text/css application/javascript application/json image/svg+xml;
# ngx_brotli does not add Vary itself; if Brotli is served, ensure responses
# carry exactly one Vary: Accept-Encoding (e.g. via a map on $http_accept_encoding
# or CDN rules) without duplicating the value gzip_vary already adds.

# Security headers live in ONE shared file that is included at every level
# that carries its own add_header. Nginx inherits parent add_header values
# only when the child level defines NONE of its own — a location with a
# Cache-Control add_header would otherwise silently lose all security headers.
# Create conf.d/security-headers.conf containing exactly:
#   add_header X-Content-Type-Options "nosniff" always;
#   add_header X-Frame-Options "DENY" always;
#   add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
#   add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Cache-Control: `immutable` is allowed ONLY for fingerprinted assets — the
# generator renames each static asset with a content-hash fragment
# (styles.a1b2c3d4.css) and updates every HTML reference on change. Never mark
# a stable (unhashed) URL `immutable`: after the file is overwritten a
# compliant cache may keep serving the old bytes for the entire max-age
# (RFC 9111). Stable URLs get a revalidation policy instead.
location ~* \.(avif|webp|jpg|jpeg|png|css|js)$ {
  add_header Cache-Control "no-cache" always;
  include conf.d/security-headers.conf;
}
location ~* \.[0-9a-f]{8,}\.(avif|webp|jpg|jpeg|png|css|js)$ {
  add_header Cache-Control "public, max-age=31536000, immutable" always;
  include conf.d/security-headers.conf;
}
location ~* \.html$ {
  add_header Cache-Control "max-age=0, must-revalidate" always;
  include conf.d/security-headers.conf;
}

# Serve HTML/CSS/JS as UTF-8
charset utf-8;
charset_types text/html text/css application/javascript application/json;

# Server-level security headers (inherited by locations without their own
# add_header; locations above re-include the file explicitly).
include conf.d/security-headers.conf;
```

## HTTPS enforcement (HTTP → HTTPS redirect)

Prerequisites: a valid TLS certificate for the canonical host must already be
installed and the HTTPS endpoint must serve the site successfully before the
redirect is enabled. Behind a reverse proxy/CDN (Cloudflare, ALB, etc.) the
redirect may be terminated at the edge — apply the same rule there and make
sure the edge forwards the original scheme/host (e.g. `X-Forwarded-Proto`) if
the origin decides on the redirect.

The redirect must be a permanent `301` (or `308`, which additionally preserves
the request method), must preserve host, path, and query string, and must point
at the canonical host chosen for the project (e.g. always `https://site.com/…`
or always `https://www.site.com/…` — one canonical host, matching the HTML
canonical URL).

### Apache — port-80 virtual host

```apache
<VirtualHost *:80>
  ServerName site.com
  ServerAlias www.site.com
  # Preserve host, path and query; normalize to the canonical host
  Redirect permanent / https://site.com/
</VirtualHost>
```

`Redirect permanent` issues a 301 and appends the request path and query
automatically. If the canonical host equals the requested host and only the
scheme must change, `RewriteEngine On` +
`RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]` is the
equivalent (requires `mod_rewrite`).

### Nginx — port-80 server block

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name site.com www.site.com;
  # 301 to the canonical host, preserving path and query string
  return 301 https://site.com$request_uri;
}
```

### Verification
```bash
curl -I 'http://site.com/path?q=1'
# Expected: one 301/308 with Location: https://site.com/path?q=1
curl -I 'https://site.com/'
# Expected: 200 over HTTPS with the security headers present
```

## Content-Security-Policy (generated per page)

CSP cannot be bolted on generically — the policy is GENERATED from the exact
features the page uses (OWASP recommends CSP as defense-in-depth against
XSS/data injection, delivered via response header). The generated page keeps
CSP-compatible by design: no inline event handlers, no inline scripts (the
single page script is an external file with `defer`), inline CSS only in
`<style>` blocks, JSON-LD as non-executable `application/ld+json`.

Build the policy from this restrictive base, adding destinations only for
features that exist on the page:

```
default-src 'self';
script-src 'self';
style-src 'self' 'sha256-<hash>';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none'
```

Feature-specific additions:
- Inline `<style>` blocks (critical CSS): authorize each block with its
  `sha256-` hash in `style-src` — compute the hash of the exact emitted CSS.
  Never fall back to `style-src 'unsafe-inline'` as the default; and NEVER use
  `unsafe-inline` or `unsafe-eval` for `script-src`.
- YouTube facade block present: add `https://www.youtube-nocookie.com` to
  `frame-src` (iframe inserted on click) and to `connect-src` (the hover
  preconnect). Omit both when the page has no video.
- Form submitting to an external endpoint from the brief: extend
  `form-action` with that exact origin. Default is `'self'`.
- `data:` in `img-src` covers base64 LQIP placeholders; drop it when unused.

Rollout — report-only first, then enforce:
1. Deploy `Content-Security-Policy-Report-Only` with the generated policy.
2. Exercise every generated feature combination in a real browser (video
   click-through, form, deferred CSS path) and fix every reported violation.
3. Switch the same policy to the enforcing `Content-Security-Policy` header
   and re-test. Keep report-only available for future feature changes.

Apache (inside the existing `<IfModule mod_headers.c>`):

```apache
Header always set Content-Security-Policy-Report-Only "<generated policy>"
# After a clean report-only rollout, replace with:
# Header always set Content-Security-Policy "<generated policy>"
```

Nginx — add to `conf.d/security-headers.conf` so it follows the same
inheritance rules as the other headers (§ above):

```nginx
add_header Content-Security-Policy-Report-Only "<generated policy>" always;
# After a clean report-only rollout, replace with:
# add_header Content-Security-Policy "<generated policy>" always;
```

## Checklist
- [ ] Config syntax check passes BEFORE reload: `nginx -t` (Nginx) or `apachectl configtest` (Apache)
- [ ] Compression state recorded honestly: Brotli module installed and loaded (Nginx: package name / `load_module` lines documented; Apache: `mod_brotli` present). If not installed — the Brotli lines are removed and this is marked gzip-only, never silently skipped
- [ ] Brotli verified with `curl -I -H 'Accept-Encoding: br' <url>` → `Content-Encoding: br`; gzip fallback with `curl -I -H 'Accept-Encoding: gzip' <url>` → `Content-Encoding: gzip`. In gzip-only mode verify the gzip request only
- [ ] Compressed responses carry `Vary: Accept-Encoding`; identity, gzip and Brotli requests each get the right `Content-Encoding` (verify at origin and through any CDN)
- [ ] Only fingerprinted asset URLs (content-hash in the filename) carry `immutable` with max-age 1 year; stable URLs carry a revalidation policy
- [ ] Two-version deploy check: publish asset version A, deploy version B (new hash + updated HTML references), reload from a warm cache — version B loads immediately, no stale styles/scripts/images
- [ ] HTML revalidated on every request
- [ ] All four security headers present on every response class — verify with `curl -I` against `/`, a `.css` file, a `.js` file, and a nonexistent URL (404); each response carries exactly one copy of all four headers (no duplicates, none missing on error responses or Nginx asset locations)
- [ ] CSP generated for this page's exact feature set; deployed report-only first, browser-tested across every feature combination with zero unexpected violations, then enforced; no `unsafe-inline`/`unsafe-eval` in `script-src`; `youtube-nocookie.com` present in `frame-src`/`connect-src` only when the video block exists
- [ ] HTTPS enforced: TLS certificate installed, HTTPS endpoint serves the site, and a port-80 vhost/server block issues exactly one 301/308 preserving host/path/query to the canonical host. Verify deployed: `curl -I 'http://<host>/path?q=1'` returns the single redirect to the expected HTTPS URL, and the HTTPS request succeeds
- [ ] HTML responses carry `Content-Type: text/html; charset=utf-8` (verify with `curl -I`); `<meta charset="utf-8">` present within the first 1024 bytes; representative non-ASCII text, metadata and JSON-LD render correctly
