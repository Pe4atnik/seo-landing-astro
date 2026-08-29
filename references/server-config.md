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

# Caching
<IfModule mod_expires.c>
  ExpiresActive On
  # Static assets: 1 year, immutable
  ExpiresByType image/avif "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  # HTML: revalidate every time
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
# Serve HTML as UTF-8
AddDefaultCharset utf-8
<IfModule mod_mime.c>
  AddCharset utf-8 .html .css .js .xml .json
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\.(avif|webp|jpg|jpeg|png|css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\.html$">
    Header set Cache-Control "max-age=0, must-revalidate"
  </FilesMatch>

  # Security headers
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "DENY"
  Header set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
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

location ~* \.(avif|webp|jpg|jpeg|png|css|js)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location ~* \.html$ {
  add_header Cache-Control "max-age=0, must-revalidate";
}

# Serve HTML/CSS/JS as UTF-8
charset utf-8;
charset_types text/html text/css application/javascript application/json;

add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Checklist
- [ ] Brotli enabled (verify `Content-Encoding: br`), gzip as fallback
- [ ] Compressed responses carry `Vary: Accept-Encoding`; identity, gzip and Brotli requests each get the right `Content-Encoding` (verify at origin and through any CDN)
- [ ] Static assets cached 1 year with `immutable`
- [ ] HTML revalidated on every request
- [ ] All four security headers present
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] HTML responses carry `Content-Type: text/html; charset=utf-8` (verify with `curl -I`); `<meta charset="utf-8">` present within the first 1024 bytes; representative non-ASCII text, metadata and JSON-LD render correctly
