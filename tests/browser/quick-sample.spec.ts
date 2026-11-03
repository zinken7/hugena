import { test, expect } from '@playwright/test';
import { quickSampleCase as sample, quickTotalHours, quickReserveHours } from '../../data/quick-sample-case';

test('the A$10 report explains the new claim in two pages with five concrete working days', async ({ page }) => {
  await page.goto('/example');
  await page.getByRole('link', { name: /New: the five-day MVP claim/ }).click();
  await expect(page.locator('.sample-claim')).toHaveText(`“${sample.claim.claim}”`);
  await expect(page.locator('.quick-stats')).toContainText('A$10.00');
  await page.getByRole('link', { name: '02 / Two-page report' }).click();
  await expect(page.locator('.sample-page')).toHaveCount(2);
  await expect(page.locator('.sample-claim')).toHaveText(`“${sample.claim.claim}”`);
  await expect(page.locator('.quick-day')).toHaveCount(5);
  for (const day of sample.days) {
    expect(day.tasks.reduce((sum, task) => sum + task.hours, 0)).toBe(8);
    const row = page.locator('.quick-day').nth(day.day - 1);
    await expect(row).toContainText(day.done);
    for (const task of day.tasks) await expect(row).toContainText(task.text);
  }
  expect(quickTotalHours).toBe(40);
  expect(quickReserveHours).toBe(4);
  await expect(page.locator('.quick-verdict')).toContainText(sample.summary);
  for (const kind of ['claim', 'report']) {
    const result = await page.request.get(`/samples/pitchproof-${kind}-PP-002.pdf`);
    expect(result.ok()).toBeTruthy();
    expect((await result.body()).subarray(0, 5).toString()).toBe('%PDF-');
  }
});

test('quick claim and report fit mobile screens and pass automated accessibility checks', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  for (const path of ['/example/quick', '/example/quick/report']) {
    await page.goto(path);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/example/quick', '/example/quick/report']) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await page.screenshot({ path: 'artifacts/quick-report-mobile.png', fullPage: true });
});
