# Assets & Media

## Images
- Modern formats: WebP / AVIF with PNG / JPG fallback
- Responsive `srcset` + `sizes` on all `<img>`
- Native `loading="lazy"` below the fold
- Native `fetchpriority="high"` on LCP image
- Explicit `width` / `height` on every image (no CLS)

## Icons
- Single icon library (Lucide)
- Tree-shaken imports
- Brand / product illustrations as inline React SVG components
- Icon registry exported from one entry

## SVG strategy
- Inline as React component for icons (current pattern, kept)
- Sprite via `<symbol>` for repeated marketing illustrations
- Optimize via SVGO in build

## Fonts
- Self-hosted (no CDN drift)
- Preloaded via `<link rel="preload" as="font" crossorigin>`
- `font-display: swap`
- Subset to Latin + Latin-Extended
- WOFF2 only

## Video / audio
- `<video>` with `preload="metadata"`
- Poster image required
- Captions / subtitles for accessibility

## Static assets
- Hashed filenames for cache busting
- CDN (Cloudflare / CloudFront) in front of build output
- Cache-Control: 1 year for hashed assets, no-cache for HTML

## CDN / optimization
- Image CDN (Cloudflare Images or imgix) for user-uploaded content
- On-the-fly resize / format negotiation
