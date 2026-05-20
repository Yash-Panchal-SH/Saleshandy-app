import { redirect } from '@tanstack/react-router'
import { getAccessToken } from '@/features/auth/auth-tokens'
import { safeReturnUrl } from '@/shared/lib/http/safe-return-url'

interface GuardContext {
  location: { href: string }
}

function isAuthenticated(): boolean {
  return getAccessToken() !== null
}

/** Guest-only routes (login, signup). Authenticated users bounce to home. */
export function AuthRoute(): void {
  if (isAuthenticated()) {
    throw redirect({ to: '/' })
  }
}

/** Authenticated-only routes. Unauthenticated users go to login with returnUrl. */
export function ProtectedRoute(context: GuardContext): void {
  if (!isAuthenticated()) {
    throw redirect({
      to: '/login',
      search: { returnUrl: safeReturnUrl(context.location.href) },
    })
  }
}

export interface ConfigGate {
  /** Result of a plan / role / feature-flag check. The flag system lands in Phase C. */
  hasAccess: boolean
}

/**
 * Plan / role / feature-flag gated routes. Composes `ProtectedRoute` first,
 * then enforces the gate. Returns a `beforeLoad`-compatible function.
 */
export function ConfigRoute(gate: ConfigGate): (context: GuardContext) => void {
  return (context) => {
    ProtectedRoute(context)
    if (!gate.hasAccess) {
      throw redirect({ to: '/' })
    }
  }
}
