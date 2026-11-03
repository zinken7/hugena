import { chromium } from '@playwright/test';
import { mkdir, copyFile } from 'node:fs/promises';

// Run against a production build. Both PDFs render the same components/data as the website.
const baseURL = process.env.SAMPLE_BASE_URL || 'http://localhost:3100';
const cases = [{ id: 'PP-001', route: '/example' }, { id: 'PP-002', route: '/example/quick' }];
const selectedId = process.argv.find(arg => arg.startsWith('--case='))?.slice(7);
if (selectedId && !cases.some(item => item.id === selectedId)) throw new Error(`Unknown sample: ${selectedId}`);
const selectedCases = selectedId ? cases.filter(item => item.id === selectedId) : cases;
await mkdir('public/samples', { recursive: true });
await mkdir('output/pdf', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  for (const sample of selectedCases) for (const kind of ['claim', 'report']) {
    const response = await page.goto(`${baseURL}${sample.route}${kind === 'report' ? '/report' : ''}`);
    if (!response?.ok()) throw new Error(`Cannot open sample ${kind}`);
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: 'print' });
    const overflow = await page.locator('.sample-page').evaluateAll(pages => pages.flatMap((page, index) => {
      const body = page.querySelector('.sample-page-body');
      const footer = page.querySelector('.sample-page-footer');
      if (!body || !footer) return [index + 1];
      const last = body.lastElementChild;
      return last && last.getBoundingClientRect().bottom > footer.getBoundingClientRect().top ? [index + 1] : [];
    }));
    if (overflow.length) throw new Error(`Content overlaps the footer: ${kind} pages ${overflow.join(', ')}`);
    const filename = `pitchproof-${kind}-${sample.id}.pdf`;
    await page.pdf({ path: `public/samples/${filename}`, printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
    await copyFile(`public/samples/${filename}`, `output/pdf/${filename}`);
    console.log(`Exported ${kind}: ${filename}`);
  }
} finally {
  await browser.close();
}
