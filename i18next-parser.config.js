// Config for `pnpm i18n:check`. Extracts translation keys from source and
// reports gaps. Warn-only by design: no `failOnUpdate` / `failOnWarnings`, so
// it always exits 0 even when `fr` keys are missing — CI does not gate on it.
// See CONTRIBUTING.md → Internationalization.
export default {
  locales: ['en', 'fr'],
  defaultNamespace: 'common',
  input: ['src/**/*.{ts,tsx}'],
  output: 'src/i18n/$LOCALE/$NAMESPACE.json',
  keySeparator: '.',
  namespaceSeparator: ':',
  sort: true,
  failOnUpdate: false,
  failOnWarnings: false,
}
