import { chromium } from '@playwright/test';
import { mkdir, copyFile } from 'node:fs/promises';

// Run against a production build. Each PDF is printed from the report the customer flow
// opens for the example claim: an A$1 adviser gives the brief report, an A$2 adviser the comprehensive one.
// Build without Stripe links (or with test-mode links) so the flow submits without opening a live checkout.
const baseURL = process.env.SAMPLE_BASE_URL || 'http://localhost:3100';
const channel = process.env.PLAYWRIGHT_CHANNEL || 'msedge';
const formats = [
  { kind: 'brief', pages: 2, filter: 'All advisers' },
  { kind: 'comprehensive', pages: 9, filter: 'External advisers' },
];
await mkdir('public/samples', { recursive: true });
await mkdir('output/pdf', { recursive: true });
const browser = await chromium.launch({ channel, headless: true });
try {
  for (const format of formats) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${baseURL}/review`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: 'Use the example', exact: true }).click();
    await page.getByRole('button', { name: 'Choose advisers', exact: true }).click();
    await page.getByRole('button', { name: format.filter, exact: true }).click();
    await page.getByRole('button', { name: 'Choose adviser', exact: true }).first().click();
    await page.getByRole('button', { name: 'Submit request', exact: true }).click();
    await page.locator('.sample-page').first().waitFor({ timeout: 10000 });
    const pages = await page.locator('.sample-page').count();
    if (pages !== format.pages) throw new Error(`Expected the ${format.kind} report (${format.pages} pages), got ${pages} pages`);
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: 'print' });
    const overflow = await page.locator('.sample-page').evaluateAll(sheets => sheets.flatMap((sheet, index) => {
      const body = sheet.querySelector('.sample-page-body');
      const footer = sheet.querySelector('.sample-page-footer');
      if (!body || !footer) return [index + 1];
      const last = body.lastElementChild;
      return last && last.getBoundingClientRect().bottom > footer.getBoundingClientRect().top ? [index + 1] : [];
    }));
    if (overflow.length) throw new Error(`Content overlaps the footer: ${format.kind} report pages ${overflow.join(', ')}`);
    const filename = `hugena-report-HG-001-${format.kind}.pdf`;
    await page.pdf({ path: `public/samples/${filename}`, printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
    await copyFile(`public/samples/${filename}`, `output/pdf/${filename}`);
    console.log(`Exported ${format.kind} report: ${filename}`);
    await page.close();
  }
} finally {
  await browser.close();
}
