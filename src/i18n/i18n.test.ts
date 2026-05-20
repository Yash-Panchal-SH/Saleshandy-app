import { afterAll, describe, expect, it } from 'vitest'
import i18n, { i18nReady } from './index'

afterAll(async () => {
  await i18n.changeLanguage('en')
})

describe('i18n', () => {
  it('initializes and resolves common keys in en', async () => {
    await i18nReady
    await i18n.changeLanguage('en')
    expect(i18n.t('appName')).toBe('Saleshandy')
    expect(i18n.t('tagline')).toBe('Core runtime online.')
  })

  it('switches to fr', async () => {
    await i18nReady
    await i18n.changeLanguage('fr')
    expect(i18n.t('tagline')).toBe('Runtime opérationnel.')
  })

  it('reports a missing key via i18n.exists without throwing', async () => {
    await i18nReady
    expect(i18n.exists('appName')).toBe(true)
    expect(i18n.exists('common:doesNotExist')).toBe(false)
  })
})
