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

```nginx
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

## Checklist
- [ ] Brotli enabled (verify `Content-Encoding: br`), gzip as fallback
- [ ] Compressed responses carry `Vary: Accept-Encoding`; identity, gzip and Brotli requests each get the right `Content-Encoding` (verify at origin and through any CDN)
- [ ] Only fingerprinted asset URLs (content-hash in the filename) carry `immutable` with max-age 1 year; stable URLs carry a revalidation policy
- [ ] Two-version deploy check: publish asset version A, deploy version B (new hash + updated HTML references), reload from a warm cache — version B loads immediately, no stale styles/scripts/images
- [ ] HTML revalidated on every request
- [ ] Config syntax check passes before reload: `nginx -t` (Nginx) or `apachectl configtest` (Apache)
- [ ] All four security headers present on every response class — verify with `curl -I` against `/`, a `.css` file, a `.js` file, and a nonexistent URL (404); each response carries exactly one copy of all four headers (no duplicates, none missing on error responses or Nginx asset locations)
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] HTML responses carry `Content-Type: text/html; charset=utf-8` (verify with `curl -I`); `<meta charset="utf-8">` present within the first 1024 bytes; representative non-ASCII text, metadata and JSON-LD render correctly
