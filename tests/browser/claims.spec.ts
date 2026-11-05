import { test, expect, type Page } from '@playwright/test';

async function sendCustomClaim(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.getByRole('link', { name: 'Verify a claim', exact: true }).click();
  await page.getByLabel('AI output to check').fill('Our checkout redesign will lift conversion by 20% in a month.');
  await page.getByRole('button', { name: 'Choose advisers', exact: true }).click();
  await page.getByRole('button', { name: 'Choose adviser', exact: true }).first().click();
  await page.getByLabel('Email for your report').fill('customer@example.com');
  await page.getByRole('button', { name: 'Submit request', exact: true }).click();
}

test('customer and adviser workflows stay separate through publication', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Have an expert check/ })).toBeVisible();
  await page.screenshot({ path: 'artifacts/simple-home-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Verify a claim', exact: true }).click();
  await expect(page).toHaveURL(/\/review$/);
  await page.getByRole('button', { name: 'Use the example' }).click();
  await page.getByRole('button', { name: 'Choose advisers', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Join as an external adviser' })).toHaveCount(0);
  await page.getByRole('button', { name: 'External advisers', exact: true }).click();
  await page.getByRole('button', { name: 'Choose adviser', exact: true }).first().click();
  await expect(page.getByLabel('Email for your report')).toHaveCount(0);
  await page.getByRole('button', { name: 'Submit request', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your request is with your adviser.' })).toBeVisible();
  await expect(page.getByLabel('Key finding')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Your earnings' })).toHaveCount(0);
  await page.screenshot({ path: 'artifacts/customer-status.png', fullPage: true });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your request is with your adviser.' })).toBeVisible();

  await page.getByRole('link', { name: 'Adviser view' }).click();
  await expect(page).toHaveURL(/\/advisers$/);
  await expect(page.locator('.session-bar')).toContainText('Taylor Brooks');
  await page.getByRole('button', { name: 'Review request', exact: true }).click();
  await expect(page.getByText('so they expect a comprehensive report')).toBeVisible();
  await page.getByLabel('Key finding').fill('The cost estimate omits request frequency.');
  await page.getByLabel('Evidence and sources').fill('No request or bandwidth model was supplied.');
  await page.getByLabel('Recommended next step').fill('Estimate usage before choosing a plan.');
  await page.reload();
  await page.getByRole('button', { name: 'Review request', exact: true }).click();
  await expect(page.getByLabel('Key finding')).toHaveValue('The cost estimate omits request frequency.');
  await page.getByRole('button', { name: 'Publish assessment' }).click();
  await expect(page.getByText('Published', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'artifacts/adviser-queue.png', fullPage: true });
  await page.getByRole('button', { name: 'Edit assessment', exact: true }).click();
  await expect(page.getByText('A$0.20', { exact: true })).toBeVisible();
  await expect(page.getByText('A$1.80', { exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Customer view' }).click();
  await expect(page.getByRole('heading', { name: 'Your review is ready.' })).toBeVisible();
  await page.getByRole('button', { name: 'Read my report' }).click();
  await expect(page.getByText('The cost estimate omits request frequency.', { exact: true })).toBeVisible();
  await expect(page.getByText(/hasn’t verified this independent adviser’s credentials/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Publish assessment' })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('advisers only see requests sent to them and only their own profile', async ({ page }) => {
  await sendCustomClaim(page);
  await page.goto('/advisers');
  await expect(page.locator('.session-bar')).toContainText('Alex Morgan');
  await expect(page.getByRole('button', { name: 'Review request', exact: true })).toBeVisible();
  await page.getByLabel('Demo: switch adviser').selectOption({ label: 'Sam Chen' });
  await expect(page.getByRole('heading', { name: 'No requests for you yet.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Review request', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'My profile' }).click();
  await expect(page.locator('.reviewer-card')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Sam Chen', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choose adviser' })).toHaveCount(0);
  await page.getByRole('button', { name: 'My requests' }).click();
  await page.getByRole('button', { name: 'Sign in as Alex Morgan' }).click();
  await expect(page.getByRole('button', { name: 'Review request', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('.session-bar')).toContainText('Alex Morgan');
});

test('an independent adviser can join and then appears on the customer board', async ({ page }) => {
  await page.goto('/advisers');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { name: 'No requests for you yet.' })).toBeVisible();
  await page.getByRole('button', { name: 'Join as an external adviser' }).click();
  await page.getByLabel('Your name').fill('Jamie Test');
  await page.getByLabel('Expertise (separated by commas)').fill('Cloud costs');
  await page.getByLabel('About you').fill('Technical adviser specialising in hosting costs.');
  await page.getByLabel('Sample opinion on the hosting-cost example').fill('I would check the request volume and storage assumptions first.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create profile' }).click();
  await expect(page.locator('.session-bar')).toContainText('Jamie Test');
  await expect(page.getByRole('heading', { name: 'My profile' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Jamie Test', exact: true })).toBeVisible();
  await page.goto('/review?new=1');
  await page.getByRole('button', { name: 'Use the example' }).click();
  await page.getByRole('button', { name: 'Choose advisers', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Jamie Test', exact: true })).toBeVisible();
});

test('the old /reviewers address opens the adviser workspace', async ({ page }) => {
  await page.goto('/reviewers');
  await expect(page).toHaveURL(/\/advisers$/);
  await expect(page.getByRole('heading', { name: 'My requests' })).toBeVisible();
});

test('mobile homepage and both workspaces fit narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const fits = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/'); await fits();
  await page.screenshot({ path: 'artifacts/simple-home-mobile.png', fullPage: true });
  await page.getByRole('link', { name: 'Verify a claim', exact: true }).click();
  await page.getByRole('button', { name: 'Use the example' }).click();
  await page.getByRole('button', { name: 'Choose advisers', exact: true }).click(); await fits();
  await page.getByRole('button', { name: 'Choose adviser', exact: true }).first().click();
  await page.getByRole('button', { name: 'Submit request', exact: true }).click(); await fits();
  await page.getByRole('link', { name: 'Adviser view' }).click(); await fits();
  await page.screenshot({ path: 'artifacts/adviser-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Review request', exact: true }).click(); await fits();
  await page.getByRole('button', { name: 'My profile' }).click(); await fits();
});

// An automated check complements the keyboard and visual review; it is not a full accessibility certification.
test('entry pages meet automated WCAG A/AA checks', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  for (const path of ['/', '/review', '/advisers']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations).toEqual([]);
  }
});
