import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ProtectedRoute } from '@/app/router/guards'

// Demonstrates Zod-validated, typed URL search params.
const searchSchema = z.object({
  tab: z.enum(['overview', 'details']).default('overview'),
})

export const Route = createFileRoute('/protected-example')({
  beforeLoad: ProtectedRoute,
  validateSearch: searchSchema,
  component: ProtectedExamplePage,
})

function ProtectedExamplePage() {
  const { tab } = Route.useSearch()
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="font-heading text-2xl font-semibold">Protected example</h1>
      <p className="text-muted-foreground text-sm">Active tab: {tab}</p>
    </main>
  )
}
