import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { sampleCase } from '../../data/sample-case';

async function submitClaim(page: Page, { example = false } = {}) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.getByRole('link', { name: 'Verify a claim', exact: true }).click();
  if (example) await page.getByRole('button', { name: 'Use the example', exact: true }).click();
  else await page.getByLabel('AI output to check').fill('Our checkout redesign will lift conversion by 20% in a month.');
  await page.getByRole('button', { name: 'Choose advisers', exact: true }).click();
  await page.getByRole('button', { name: 'Choose adviser', exact: true }).first().click();
  if (!example) await page.getByLabel('Email for your report').fill('customer@example.com');
  await page.getByRole('button', { name: 'Submit request', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your request is with your adviser.' })).toBeVisible();
}

test('an adviser imports a report file and the customer downloads it', async ({ page }) => {
  await submitClaim(page);
  await page.goto('/advisers');
  await page.getByRole('button', { name: 'Review request', exact: true }).click();
  await page.getByLabel('Report file').setInputFiles({ name: 'notes.png', mimeType: 'image/png', buffer: Buffer.from('png') });
  await expect(page.getByRole('alert').filter({ hasText: 'Attach a PDF or Word file.' })).toBeVisible();
  const pdf = Buffer.from('%PDF-1.4\n% Hugena test report\n');
  await page.getByLabel('Report file').setInputFiles({ name: 'sam-chen-review.pdf', mimeType: 'application/pdf', buffer: pdf });
  await expect(page.locator('.report-file')).toContainText('sam-chen-review.pdf');
  await expect(page.getByLabel('Evidence and sources')).not.toHaveAttribute('required', '');
  await page.getByLabel('Key finding').fill('The conversion claim has no baseline.');
  await page.getByRole('button', { name: 'Publish assessment' }).click();
  await expect(page.getByText('Published', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Customer view' }).click();
  await expect(page.getByRole('heading', { name: 'Your review is ready.' })).toBeVisible();
  await page.getByRole('button', { name: 'Read my report' }).click();
  await expect(page.getByText('The conversion claim has no baseline.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Evidence & sources' })).toHaveCount(0);
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Download', exact: true }).click()]);
  expect(download.suggestedFilename()).toBe('sam-chen-review.pdf');
  expect(readFileSync((await download.path())!).equals(pdf)).toBe(true);
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
});

test('Verify a claim on the homepage always opens a blank claim', async ({ page }) => {
  await submitClaim(page, { example: true });
  await page.goto('/');
  await page.getByRole('link', { name: 'Verify a claim', exact: true }).click();
  await expect(page).toHaveURL(/\/review$/);
  await expect(page.getByLabel('AI output to check')).toHaveValue('');
  await expect(page.getByRole('heading', { name: /Paste the AI output/ })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('AI output to check')).toHaveValue('');
  await page.getByRole('button', { name: 'Use the example', exact: true }).click();
  await expect(page.getByLabel('AI output to check')).toHaveValue(sampleCase.claim.claim);
});
