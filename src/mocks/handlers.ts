import { HttpResponse, http } from 'msw'

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' })
  }),

  // Echoes the Authorization header back so tests can assert bearer injection.
  http.get('/api/echo-auth', ({ request }) => {
    return HttpResponse.json({ authorization: request.headers.get('authorization') })
  }),
]
