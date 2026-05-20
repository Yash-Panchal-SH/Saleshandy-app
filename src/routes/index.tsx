import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { t } = useTranslation('common')
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="font-heading text-3xl font-semibold">{t('appName')}</h1>
      <p className="text-muted-foreground text-sm">{t('tagline')}</p>
    </main>
  )
}
