/**
 * Validates a redirect target against an open-redirect attack.
 * Only same-origin relative paths (starting with a single "/") are allowed.
 */
export function safeReturnUrl(raw: string | null | undefined, fallback = '/'): string {
  if (!raw) return fallback
  // Reject protocol-relative ("//host") and anything not rooted at "/".
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback
  return raw
}
