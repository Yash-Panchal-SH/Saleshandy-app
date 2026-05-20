import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('homepage renders and has no axe violations', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Saleshandy' })).toBeVisible()

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations).toEqual([])
})

test('an unauthenticated visit to a protected route redirects to login', async ({ page }) => {
  await page.goto('/protected-example')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})
