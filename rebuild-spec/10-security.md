# Security

## Headers
- CSP (strict, nonce-based for inline scripts)
- HSTS (`max-age=31536000; includeSubDomains; preload`)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: lock down camera, microphone, geolocation by default

## Auth tokens
- HttpOnly + Secure + SameSite=Lax cookies (preferred)
- Refresh token rotation
- Short-lived access tokens
- sessionStorage only for OAuth code exchange (never long-lived tokens)

## XSS
- DOMPurify for any user-rendered HTML
- React JSX auto-escaping (never `dangerouslySetInnerHTML` without sanitization)
- CSP blocks inline scripts (nonce-only)

## Inputs
- Zod validation on all forms (client + reused on server where applicable)
- File upload: MIME-type allowlist, size limit, virus scan hook

## Open redirects
- Safe-list for all redirect destinations
- Validate `returnUrl` against allowlist

## Secrets
- No secrets in client bundle (lint rule for `*_SECRET`, `*_PRIVATE_KEY`)
- Public env vars prefixed (`VITE_PUBLIC_*` / `REACT_APP_PUBLIC_*`)
- Pre-commit hook scans for leaked tokens

## Dependencies
- Renovate / Dependabot for automated bumps
- `npm audit` / Snyk on every PR
- Block CI on high-severity advisories

## CSRF
- SameSite cookies + state token for OAuth flows

## Rate limiting
- Client-side debounce on sensitive actions (login, password reset)
- Surface server 429s with retry-after toast

## Logging
- Never log tokens, passwords, PII
- Sentry beforeSend strips sensitive fields

## Third-party scripts
- Subresource Integrity (SRI) where possible
- Loaded with `defer` / `async`
- Sandboxed iframes for embeds
