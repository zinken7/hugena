import { test, expect, type Page } from '@playwright/test';
import { sampleCase, sampleScenarios } from '../../data/sample-case';

const waiting = 'Your request is with your adviser.';

async function submit(page: Page, { example = true, filter = 'All advisers' } = {}) {
  await page.goto('/review');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  if (example) {
    await page.getByRole('button', { name: 'Use the example', exact: true }).click();
    await expect(page.getByLabel('AI output to check')).toHaveValue(sampleCase.claim.claim);
  } else {
    await page.getByLabel('AI output to check').fill('Our checkout redesign will lift conversion by 20% in a month.');
  }
  await page.getByRole('button', { name: 'Choose advisers', exact: true }).click();
  await page.getByRole('button', { name: filter, exact: true }).click();
  await page.getByRole('button', { name: 'Choose adviser', exact: true }).first().click();
  if (!example) await page.getByLabel('Email for your report').fill('customer@example.com');
  await page.getByRole('button', { name: 'Submit request', exact: true }).click();
  await expect(page.getByRole('heading', { name: waiting })).toBeVisible();
}

async function expectPdf(page: Page, kind: 'brief' | 'comprehensive') {
  const href = await page.getByRole('link', { name: 'Download PDF' }).getAttribute('href');
  expect(href).toBe(`/samples/hugena-report-${sampleCase.id}-${kind}.pdf`);
  const response = await page.request.get(href!);
  expect(response.ok()).toBeTruthy();
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
}

test('an A$1 adviser opens the brief report after the request is sent', async ({ page }) => {
  await submit(page);
  await expect(page.locator('.sample-page')).toHaveCount(0);
  await expect(page.locator('.sample-page')).toHaveCount(2, { timeout: 5000 });
  await expect(page.getByRole('heading', { name: waiting })).toHaveCount(0);
  await expect(page.locator('.sample-claim')).toHaveText(`“${sampleCase.claim.claim}”`);
  await expect(page.locator('.sample-toolbar')).toContainText('Brief report');
  await expect(page.locator('.brief-verdict')).toContainText(sampleCase.review.finding);
  await expect(page.locator('.sample-total')).toContainText('A$41.80');
  await expectPdf(page, 'brief');
  await page.getByRole('button', { name: 'Back to my request' }).click();
  await expect(page.getByRole('heading', { name: 'Your review is ready.' })).toBeVisible();
  await page.getByRole('button', { name: 'Read my report' }).click();
  await expect(page.locator('.sample-page')).toHaveCount(2);
});

test('an A$2 adviser opens the comprehensive report', async ({ page }) => {
  await submit(page, { filter: 'External advisers' });
  await expect(page.locator('.sample-page')).toHaveCount(9, { timeout: 5000 });
  await expect(page.locator('#page-2 .sample-claim')).toHaveText(`“${sampleCase.claim.claim}”`);
  await expect(page.locator('#page-3')).toContainText(sampleCase.review.finding);
  expect(sampleScenarios.map(s => s.total)).toEqual([41.8, 85.8]);
  await expect(page.locator('#page-5 .sample-total')).toContainText('A$41.80');
  await expect(page.locator('#page-5 .sample-total')).toContainText('A$85.80');
  await expect(page.locator('.sample-toolbar')).toContainText('Comprehensive report');
  await expect(page.getByText('COMPREHENSIVE REPORT', { exact: true })).toBeVisible();
  await expectPdf(page, 'comprehensive');
});

test('a claim of your own waits for the adviser instead of opening a report', async ({ page }) => {
  await submit(page, { example: false });
  await page.waitForTimeout(2600);
  await expect(page.getByRole('heading', { name: waiting })).toBeVisible();
  await expect(page.locator('.sample-page')).toHaveCount(0);
});

test('both report types pass automated accessibility checks and fit mobile screens', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  for (const filter of ['All advisers', 'External advisers']) {
    await submit(page, { filter });
    await page.locator('.sample-page').first().waitFor({ timeout: 5000 });
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  }
  await page.screenshot({ path: 'artifacts/comprehensive-report-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const filter of ['All advisers', 'External advisers']) {
    await submit(page, { filter });
    await page.locator('.sample-page').first().waitFor({ timeout: 5000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.screenshot({ path: 'artifacts/comprehensive-report-mobile.png', fullPage: true });
});
