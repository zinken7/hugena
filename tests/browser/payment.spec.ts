import { test, expect, type Page } from '@playwright/test';

// Runs only against a build made with NEXT_PUBLIC_STRIPE_CHECKOUT=test, for example:
// NEXT_PUBLIC_STRIPE_CHECKOUT=test npm run build
// /api/checkout and Stripe's hosted page are answered locally, so no real Checkout Session is created.
test.skip(process.env.NEXT_PUBLIC_STRIPE_CHECKOUT !== 'test', 'Build with NEXT_PUBLIC_STRIPE_CHECKOUT=test to test Stripe Checkout');

const claim = 'Our checkout redesign will lift conversion by 20% in a month.';

async function toConfirm(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.getByRole('link', { name: 'Verify a claim', exact: true }).click();
  await page.getByLabel('AI output to check').fill(claim);
  await page.getByRole('button', { name: 'Choose advisers', exact: true }).click();
  await page.getByRole('button', { name: 'External advisers', exact: true }).click();
  await page.getByRole('button', { name: 'Choose adviser', exact: true }).first().click();
  await page.getByLabel('Email for your report').fill('payer@example.com');
}

async function stripeSendsBackTo(page: Page, path: string) {
  await page.route('https://checkout.stripe.com/**', route => route.fulfill({ status: 302, headers: { location: `${new URL(page.url()).origin}${path}` } }));
}

test('paying through Stripe Checkout sends the request with its session', async ({ page }) => {
  const checkouts: Record<string, any>[] = [];
  const notices: Record<string, any>[] = [];
  await page.route('**/api/checkout', route => { checkouts.push(route.request().postDataJSON()); return route.fulfill({ json: { id: 'cs_test_123', url: 'https://checkout.stripe.com/c/pay/cs_test_123' } }); });
  await page.route('**/api/requests', route => { notices.push(route.request().postDataJSON()); return route.fulfill({ json: { ok: true } }); });
  await stripeSendsBackTo(page, '/review?paid=cs_test_123');
  await toConfirm(page);
  await expect(page.getByText('Stripe test mode: pay with card 4242 4242 4242 4242', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Pay A$2.00 with Stripe' }).click();
  await expect(page.getByRole('heading', { name: 'Your request is with your adviser.' })).toBeVisible();
  await expect(page).toHaveURL(/\/review$/);
  expect(checkouts).toHaveLength(1);
  expect(checkouts[0]).toMatchObject({ category: 'Cost estimate', example: false, customerEmail: 'payer@example.com', adviser: { id: 'external-taylor', name: 'Taylor Brooks', provider: 'external', feeCents: 200 } });
  expect(checkouts[0].requestId).toMatch(/^hg-[0-9a-f-]{36}$/);
  await expect.poll(() => notices.length).toBe(1);
  expect(notices[0]).toMatchObject({ requestId: checkouts[0].requestId, report: 'Comprehensive report', payment: { status: 'paid', ref: checkouts[0].requestId, sessionId: 'cs_test_123' } });
  await expect(page.getByText('Paid with Stripe')).toBeVisible();
  await page.getByRole('link', { name: 'Adviser view' }).click();
  await page.getByRole('button', { name: 'Review request', exact: true }).click();
  await expect(page.getByText('The customer has paid through Stripe.', { exact: false })).toBeVisible();
});

test('cancelling on Stripe keeps the request unsent', async ({ page }) => {
  await page.route('**/api/checkout', route => route.fulfill({ json: { id: 'cs_test_456', url: 'https://checkout.stripe.com/c/pay/cs_test_456' } }));
  await stripeSendsBackTo(page, '/review?cancelled=1');
  await toConfirm(page);
  await page.getByRole('button', { name: 'Pay A$2.00 with Stripe' }).click();
  await expect(page.getByText('Your payment wasn’t completed, so the request hasn’t been sent.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Confirm your request.' })).toBeVisible();
  await expect(page).toHaveURL(/\/review$/);
  await page.getByRole('link', { name: 'Adviser view' }).click();
  await expect(page.getByRole('heading', { name: 'No requests for you yet.' })).toBeVisible();
});

test('if checkout can’t start, the customer stays on the confirm step and can retry', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/checkout', route => { attempts++; return route.fulfill({ status: 503, json: { error: 'not_configured' } }); });
  await toConfirm(page);
  await page.getByRole('button', { name: 'Pay A$2.00 with Stripe' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'We couldn’t open Stripe checkout.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay A$2.00 with Stripe' })).toBeEnabled();
  await page.getByRole('button', { name: 'Pay A$2.00 with Stripe' }).click();
  await expect.poll(() => attempts).toBe(2);
});
