import { test, expect } from '@playwright/test';
import { sampleCase, sampleScenarios } from '../../data/sample-case';

test('the prepared report matches its claim without changing a customer request', async ({ page }) => {
  await page.goto('/review');
  await page.getByRole('button', { name: 'Use the example', exact: true }).click();
  await expect(page.getByLabel('Exact AI claim')).toHaveValue(sampleCase.claim.claim);
  await expect(page.getByLabel('AI output & expected usage')).toHaveValue(sampleCase.claim.context);
  await page.getByLabel('Exact AI claim').fill('My separate claim must remain unchanged when I explore the sample.');
  await page.getByRole('button', { name: 'Compare advisers', exact: true }).click();
  const stored = await page.evaluate(() => localStorage.getItem('pitchproof-claims-v2'));
  await page.goto('/example');
  await expect(page.locator('.sample-claim')).toHaveText(`“${sampleCase.claim.claim}”`);
  await page.getByRole('link', { name: '02 / Completed report' }).click();
  await expect(page).toHaveURL(/\/example\/report$/);
  await expect(page.locator('.sample-page')).toHaveCount(9);
  await expect(page.locator('#page-2 .sample-claim')).toHaveText(`“${sampleCase.claim.claim}”`);
  await expect(page.locator('#page-3')).toContainText(sampleCase.review.finding);
  expect(sampleScenarios.map(s => s.total)).toEqual([41.8, 85.8]);
  await expect(page.locator('#page-5 .sample-total')).toContainText('A$41.80');
  await expect(page.locator('#page-5 .sample-total')).toContainText('A$85.80');
  expect(await page.evaluate(() => localStorage.getItem('pitchproof-claims-v2'))).toBe(stored);
  for (const kind of ['claim', 'report']) {
    const response = await page.request.get(`/samples/pitchproof-${kind}-PP-001.pdf`);
    expect(response.ok()).toBeTruthy();
    expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
  }
});

test('sample documents are accessible and readable on desktop and mobile', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  for (const path of ['/example', '/example/report']) {
    await page.goto(path);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  }
  await page.screenshot({ path: 'artifacts/sample-report-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/example', '/example/report']) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.screenshot({ path: 'artifacts/sample-report-mobile.png', fullPage: true });
});
