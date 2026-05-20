import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('homepage renders the Saleshandy button and has no axe violations', async ({ page }) => {
  await page.goto('/')

  // Assert the button is visible
  const button = page.getByRole('button', { name: 'Saleshandy' })
  await expect(button).toBeVisible()

  // Run axe accessibility scan (WCAG 2.x A/AA only — best-practice rules are excluded
  // as the scaffold app is a minimal stub without a full page structure).
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations).toEqual([])
})
