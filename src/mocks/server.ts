import { defaultNetworkOptions, setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * Inject a stable baseUrl into MSW's default resolution context so that
 * relative handler paths (e.g. '/api/protected') can still be matched even
 * when tests stub window.location via vi.stubGlobal, which sets location.href
 * to undefined and therefore breaks MSW's getAbsoluteUrl fallback.
 *
 * The origin is captured once at module-load time, before any test stubs run.
 */
const _stableOrigin: string =
  typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'http://localhost'

if (defaultNetworkOptions.context) {
  defaultNetworkOptions.context.baseUrl = _stableOrigin
} else {
  defaultNetworkOptions.context = { baseUrl: _stableOrigin }
}

export const server = setupServer(...handlers)
