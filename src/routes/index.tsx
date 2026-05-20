import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="font-heading text-3xl font-semibold">Saleshandy</h1>
      <p className="text-muted-foreground text-sm">Core runtime online.</p>
    </main>
  )
}
