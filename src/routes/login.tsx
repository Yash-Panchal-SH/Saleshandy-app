import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AuthRoute } from '@/app/router/guards'

const loginSearchSchema = z.object({
  returnUrl: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  beforeLoad: AuthRoute,
  validateSearch: loginSearchSchema,
  component: LoginPage,
})

function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="font-heading text-2xl font-semibold">Sign in</h1>
    </main>
  )
}
