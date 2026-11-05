import { test, expect, type Page } from '@playwright/test';
import { sampleCase } from '../../data/sample-case';

const claim = 'Our checkout redesign will lift conversion by 20% in a month.';

async function toConfirm(page: Page, { example = false } = {}) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.getByRole('link', { name: 'Verify a claim', exact: true }).click();
  if (example) await page.getByRole('button', { name: 'Use the example', exact: true }).click();
  else {
    await page.getByLabel('AI output to check').fill(claim);
    await page.getByLabel('Background').fill('I asked an AI for a forecast.');
  }
  await page.getByRole('button', { name: 'Choose advisers', exact: true }).click();
  await page.getByRole('button', { name: 'Choose adviser', exact: true }).first().click();
}

test('a claim of your own is emailed to Hugena once, with the customer’s email', async ({ page }) => {
  const sent: Record<string, unknown>[] = [];
  await page.route('**/api/requests', route => { sent.push(route.request().postDataJSON()); return route.fulfill({ json: { ok: true } }); });
  await toConfirm(page);
  await page.getByRole('button', { name: 'Submit request', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Enter the email address' })).toBeVisible();
  expect(sent).toHaveLength(0);
  await page.getByLabel('Email for your report').fill('ana@example.com');
  await page.getByRole('button', { name: 'Submit request', exact: true }).click();
  await expect(page.getByText('Your adviser will email the report to ana@example.com.')).toBeVisible();
  expect(sent).toHaveLength(1);
  expect(sent[0]).toMatchObject({
    customerEmail: 'ana@example.com', report: 'Brief report', payment: { status: 'unpaid' },
    claim: { claim, context: 'I asked an AI for a forecast.' }, adviser: { name: 'Alex Morgan', feeCents: 100 },
  });
  expect(String(sent[0].requestId)).toMatch(/^hg-[0-9a-f-]{36}$/);
  await page.reload();
  await expect(page.getByText('Your adviser will email the report to ana@example.com.')).toBeVisible();
  await page.waitForTimeout(500);
  expect(sent).toHaveLength(1);
  await page.waitForTimeout(2200);
  await expect(page.locator('.sample-page')).toHaveCount(0);
});

test('if the email can’t be sent the customer can try again', async ({ page }) => {
  let fail = true;
  const sent: unknown[] = [];
  await page.route('**/api/requests', route => { sent.push(route.request().postDataJSON()); return fail ? route.fulfill({ status: 503, json: { error: 'not_configured' } }) : route.fulfill({ json: { ok: true } }); });
  await toConfirm(page);
  await page.getByLabel('Email for your report').fill('ana@example.com');
  await page.getByRole('button', { name: 'Submit request', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'We couldn’t send your request to Hugena.' })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'try again' }).click();
  await expect(page.getByText('Your adviser will email the report to ana@example.com.')).toBeVisible();
  expect(sent).toHaveLength(2);
  expect(sent[0]).toEqual(sent[1]);
});

test('the example claim sends no email and still opens its prepared report', async ({ page }) => {
  const sent: unknown[] = [];
  await page.route('**/api/requests', route => { sent.push(route.request().postDataJSON()); return route.fulfill({ json: { ok: true } }); });
  await toConfirm(page, { example: true });
  await expect(page.getByLabel('Email for your report')).toHaveCount(0);
  await page.getByRole('button', { name: 'Submit request', exact: true }).click();
  await expect(page.locator('.sample-page')).toHaveCount(2, { timeout: 5000 });
  await expect(page.locator('.sample-claim')).toHaveText(`“${sampleCase.claim.claim}”`);
  expect(sent).toHaveLength(0);
});

test('the request endpoint rejects bad input and cross-site posts', async ({ request }) => {
  expect((await request.post('/api/requests', { data: { claim: 'nope' } })).status()).toBe(400);
  expect((await request.post('/api/requests', { data: {}, headers: { origin: 'https://evil.example' } })).status()).toBe(403);
  // A valid post isn't sent here: with RESEND_API_KEY set it would deliver a real email.
});
