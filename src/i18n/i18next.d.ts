import 'i18next'
import type common from './en/common.json'

// Makes `useTranslation` / `t()` key-checked at compile time — unknown keys
// fail typecheck. `en` is the source of truth for the key set.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
    }
  }
}
