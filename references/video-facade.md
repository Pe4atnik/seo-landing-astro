# YouTube Facade Pattern — Reference Implementation

Load only the cover image; start loading the video only on click.

## HTML

```html
<div class="video-facade" data-video-id="dQw4w9WgXcQ">
  <picture>
    <source type="image/avif" srcset="https://site.com/images/video-cover.avif">
    <source type="image/webp" srcset="https://site.com/images/video-cover.webp">
    <img src="https://site.com/images/video-cover.jpg" alt="Video cover: Video title — Video block"
         width="1280" height="720" loading="lazy" decoding="async">
  </picture>
  <button class="video-play" type="button" aria-label="Watch video: Video title">
    <span class="video-play-icon" aria-hidden="true"></span>
  </button>
</div>
```

## CSS (play icon without SVG)

```css
.video-facade{position:relative;aspect-ratio:16/9;max-width:1200px;background:#000}
.video-facade img{width:100%;height:100%;object-fit:cover}
.video-facade iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.video-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:72px;height:72px;border:0;border-radius:50%;cursor:pointer;
  background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center}
.video-play-icon{width:0;height:0;border-style:solid;
  border-width:14px 0 14px 24px;border-color:transparent transparent transparent #fff;
  margin-left:5px}
.video-play:focus-visible{outline:3px solid #fff;outline-offset:3px}
@media (prefers-reduced-motion:no-preference){
  .video-play{transition:transform .2s}
  .video-play:hover{transform:translate(-50%,-50%) scale(1.1)}
}
```

## JS (defer, before `</body>`)

```javascript
document.addEventListener('click', function (e) {
  var btn = e.target.closest('.video-play');
  if (!btn) return;
  var box = btn.closest('.video-facade');
  // Validate the ID before building the URL — never interpolate untrusted
  // data into a DOM-created URL (tech-spec §13). A YouTube ID is exactly
  // 11 chars of [A-Za-z0-9_-]; anything else is a generation error.
  var id = box.dataset.videoId || '';
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
  var iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1';
  iframe.title = btn.getAttribute('aria-label').replace('Watch video: ', '');
  iframe.loading = 'lazy';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  box.innerHTML = '';
  box.appendChild(iframe);
  iframe.focus();
});

/* preconnect only on hover */
document.querySelectorAll('.video-facade').forEach(function (box) {
  box.addEventListener('pointerenter', function () {
    if (document.querySelector('link[href*="youtube-nocookie"]')) return;
    var l = document.createElement('link');
    l.rel = 'preconnect';
    l.href = 'https://www.youtube-nocookie.com';
    document.head.appendChild(l);
  }, { once: true, passive: true });
});
```

## Notes
- Store the cover locally in `images/` (AVIF/WebP/JPEG) — never hotlink `i.ytimg.com`.
- One delegated handler covers any number of videos.
- Before the click: zero requests to YouTube (~0.5–1 MB of JS and dozens of connections avoided).
- CLS = 0: fixed `aspect-ratio: 16/9` and numeric `width/height`.
- The video ID is untrusted input: it is validated against `^[A-Za-z0-9_-]{11}$` at generation time (tech-spec §13) and again before the iframe URL is built — a malformed ID must fail generation, not reach the DOM.
