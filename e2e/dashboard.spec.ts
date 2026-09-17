import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('default comparison and audience toggle stay synchronized', async ({ page }) => {
  await expect(page.getByText('4/4 selected')).toBeVisible()
  await expect(page.getByRole('table')).toContainText('United States')
  await page.getByRole('radio', { name: 'Business' }).check()
  await expect(page.getByRole('columnheader', { name: 'Business price' })).toBeVisible()
  await expect(page.getByText('Average business price')).toBeVisible()
})

test('country changes, demo session, and CSV download work', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Germany' }).uncheck()
  await page.getByRole('checkbox', { name: 'Iran' }).check()
  await expect(page.getByRole('table')).toContainText('N/A')
  await page.getByRole('button', { name: 'Start demo session' }).click()
  await page.getByRole('radio', { name: 'Sustainability lead' }).check()
  await page.getByRole('dialog').getByRole('button', { name: 'Start demo session' }).click()
  await expect(page.getByRole('button', { name: /Sustainability lead/ })).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download selected CSV' }).click()
  expect((await download).suggestedFilename()).toBe('energy-atlas-household-comparison.csv')
})

test('keyboard navigation reaches primary controls', async ({ page }) => {
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await page.getByRole('radio', { name: 'Household' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('radio', { name: 'Business' })).toBeChecked()
})

test('production bundle has no external runtime requests or console errors', async ({ page }) => {
  const external: string[] = []
  const errors: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) external.push(request.url())
  })
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  expect(external).toEqual([])
  expect(errors).toEqual([])
})
