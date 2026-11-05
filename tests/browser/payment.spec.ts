import { test, expect, type Page } from '@playwright/test';

// Runs only against a build made with a Stripe link for a A$42 fee, for example:
// NEXT_PUBLIC_STRIPE_PAYMENT_LINKS='{"4200":"https://buy.stripe.com/test_hugenaCheck"}' npm run build
// Requests to buy.stripe.com are answered locally, so no real checkout is opened.
const links = JSON.parse(process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINKS || '{}') as Record<string, string>;
test.skip(!links['4200'], 'Build with NEXT_PUBLIC_STRIPE_PAYMENT_LINKS containing a "4200" link to test Stripe checkout');

async function chooseA42Adviser(page: Page) {
  await page.goto('/advisers');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Join as an external adviser' }).click();
  await page.getByLabel('Your name').fill('Pat Paid');
  await page.getByLabel('Your fee per review (AUD)').fill('42');
  await page.getByLabel('Expertise (separated by commas)').fill('Pricing');
  await page.getByLabel('About you').fill('Checks pricing claims.');
  await page.getByLabel('Sample opinion on the hosting-cost example').fill('I would want usage numbers before trusting this budget.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create profile' }).click();
  await page.goto('/review?new=1');
  await page.getByLabel('AI output to check').fill('Our checkout redesign will lift conversion by 20% in a month.');
  await page.getByRole('button', { name: 'Choose advisers', exact: true }).click();
  await page.getByRole('button', { name: 'External advisers', exact: true }).click();
  await page.locator('.reviewer-card', { hasText: 'Pat Paid' }).getByRole('button', { name: 'Choose adviser' }).click();
  await page.getByLabel('Email for your report').fill('payer@example.com');
}

test('paying with the Stripe link sends the request to the adviser', async ({ page }) => {
  let reference = '';
  let prefilled = '';
  const sent: Record<string, unknown>[] = [];
  await page.route('**/api/requests', route => { sent.push(route.request().postDataJSON()); return route.fulfill({ json: { ok: true } }); });
  await page.route('https://buy.stripe.com/**', route => {
    const url = new URL(route.request().url());
    reference = url.searchParams.get('client_reference_id') || '';
    prefilled = url.searchParams.get('prefilled_email') || '';
    return route.fulfill({ status: 302, headers: { location: `${new URL(page.url()).origin}/review?paid=cs_test_${reference.replace(/-/g, '')}` } });
  });
  await chooseA42Adviser(page);
  await expect(page.getByText('Stripe test mode: pay with card 4242 4242 4242 4242', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Pay A$42.00 with Stripe' }).click();
  await expect(page.getByRole('heading', { name: 'Your request is with your adviser.' })).toBeVisible();
  expect(reference).toMatch(/^hg-[0-9a-f-]{36}$/);
  expect(prefilled).toBe('payer@example.com');
  await expect.poll(() => sent.length).toBe(1);
  expect(sent[0]).toMatchObject({ requestId: reference, customerEmail: 'payer@example.com', report: 'Comprehensive report', payment: { status: 'paid', ref: reference } });
  await expect(page.getByText('Paid with Stripe')).toBeVisible();
  await expect(page).toHaveURL(/\/review$/);
  await page.getByRole('link', { name: 'Adviser view' }).click();
  await expect(page.locator('.session-bar')).toContainText('Pat Paid');
  await page.getByRole('button', { name: 'Review request', exact: true }).click();
  await expect(page.getByText('The customer has paid through Stripe.', { exact: false })).toBeVisible();
});

test('coming back from Stripe without paying keeps the request unsent', async ({ page }) => {
  await page.route('https://buy.stripe.com/**', route => route.fulfill({ status: 302, headers: { location: `${new URL(page.url()).origin}/review` } }));
  await chooseA42Adviser(page);
  await page.getByRole('button', { name: 'Pay A$42.00 with Stripe' }).click();
  await expect(page.getByText('Your payment wasn’t completed, so the request hasn’t been sent.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Confirm your request.' })).toBeVisible();
  await page.getByRole('link', { name: 'Adviser view' }).click();
  await expect(page.getByRole('heading', { name: 'No requests for you yet.' })).toBeVisible();
});
