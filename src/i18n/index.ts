import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { env } from '@/shared/lib/env'
import enCommon from './en/common.json'
import frCommon from './fr/common.json'

export const defaultNS = 'common'

/** All bundled translation resources. One namespace per feature — seeded with `common`. */
export const resources = {
  en: { common: enCommon },
  fr: { common: frCommon },
} as const

const isDev = env.VITE_APP_ENV === 'development'

/**
 * Awaitable init promise — import this in tests to wait for resources to load.
 * App code only needs the default `i18n` export.
 */
export const i18nReady = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    detection: {
      // A persisted user override wins; otherwise fall back to the browser language.
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'sh.lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    // Missing keys: dev logs a warning; prod silently renders the raw key.
    saveMissing: isDev,
    missingKeyHandler: (_lngs, ns, key) => {
      if (isDev) console.warn(`[i18n] missing key: ${ns}:${key}`)
    },
  })

export default i18n
