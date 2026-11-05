import { test, expect, type Page } from '@playwright/test';

// Small pages shaped like each site's answer markup. Requests to the real sites are
// answered locally by page.route, so no network traffic reaches claude.ai or chatgpt.com.
const claudePage = `<!doctype html><html><body><main>
  <div class="turn"><div class="user-message">Can this app handle 5,000 users for under A$50 a month?</div>
    <div class="row"><button class="host-btn" aria-label="Copy">c</button><button class="host-btn" aria-label="Edit">e</button></div></div>
  <div class="turn"><div class="font-claude-response"><p>Yes. 5,000 monthly active users fit under A$50/month.</p>
    <pre><code>npm run build</code><button aria-label="Copy code">copy</button></pre></div>
    <div class="row" id="claude-actions"><button class="host-btn" data-testid="action-bar-copy" aria-label="Copy">c</button><button class="host-btn" aria-label="Retry">r</button></div></div>
</main></body></html>`;

const chatgptPage = `<!doctype html><html><body>
  <article><div data-message-author-role="user">How long will the MVP take?</div>
    <div><button data-testid="copy-turn-action-button" aria-label="Copy">c</button><button aria-label="Edit message">e</button></div></article>
  <article><div data-message-author-role="assistant"><div class="markdown"><p>One developer can ship it in 5 working days.</p></div></div>
    <div><div id="gpt-actions"><button class="gpt-btn" data-testid="copy-turn-action-button" aria-label="Copy">c</button><button class="gpt-btn" aria-label="Good response">u</button><button class="gpt-btn" aria-label="Bad response">d</button></div></div></article>
</body></html>`;

async function openWithExtension(page: Page, url: string, html: string) {
  await page.route(`${new URL(url).origin}/**`, route => route.fulfill({ contentType: 'text/html', body: html }));
  await page.addInitScript(() => {
    const w = window as unknown as { opened: string[]; open: (url: string) => null };
    w.opened = [];
    w.open = url => { w.opened.push(String(url)); return null; };
    Object.defineProperty(window, 'chrome', { configurable: true, writable: true, value: { storage: {
      sync: { get: (_defaults: unknown, done: (value: { hugenaUrl: string }) => void) => done({ hugenaUrl: 'http://localhost:3100/' }) },
      onChanged: { addListener() {} },
    } } });
  });
  await page.goto(url);
  await page.addScriptTag({ path: 'extension/content.js' });
}

async function sentPayload(page: Page) {
  const opened = await page.evaluate(() => (window as unknown as { opened: string[] }).opened);
  expect(opened).toHaveLength(1);
  expect(opened[0].startsWith('http://localhost:3100/review#import=')).toBe(true);
  return JSON.parse(decodeURIComponent(opened[0].split('#import=')[1])) as { v: number; source: string; text: string };
}

test('on a Claude-style page the send button goes at the end of the answer row and sends the whole answer', async ({ page }) => {
  await openWithExtension(page, 'https://claude.ai/chat/test', claudePage);
  const send = page.locator('[data-hugena-send]');
  await expect(send).toHaveCount(1);
  await expect(page.locator('#claude-actions > :last-child')).toHaveAttribute('aria-label', 'Send to Hugena');
  await expect(send).toHaveClass(/host-btn/);
  await send.click();
  const payload = await sentPayload(page);
  expect(payload).toMatchObject({ v: 1, source: 'Claude' });
  expect(payload.text).toContain('Yes. 5,000 monthly active users fit under A$50/month.');
  expect(payload.text).toContain('npm run build');
  await expect(send).toHaveAttribute('aria-label', 'Sent to Hugena');
  await page.evaluate(() => document.querySelector('main')!.insertAdjacentHTML('beforeend',
    '<div class="turn"><div class="font-claude-response"><p>A second answer.</p></div><div class="row"><button class="host-btn" aria-label="Copy">c</button><button class="host-btn" aria-label="Retry">r</button></div></div>'));
  await expect(send).toHaveCount(2);
});

test('on a ChatGPT-style page only the assistant turn gets the send button', async ({ page }) => {
  await openWithExtension(page, 'https://chatgpt.com/c/test', chatgptPage);
  await expect(page.locator('[data-hugena-send]')).toHaveCount(1);
  await expect(page.locator('#gpt-actions > :last-child')).toHaveAttribute('data-hugena-send', '');
  await page.locator('[data-hugena-send]').click();
  const payload = await sentPayload(page);
  expect(payload.source).toBe('ChatGPT');
  expect(payload.text).toBe('One developer can ship it in 5 working days.');
});

test('Hugena opens the claim form with the answer the extension sent', async ({ page }) => {
  const text = 'Yes. A Next.js app with hosted authentication can support 5,000 users for under A$50/month.\n\n- Hosting: A$20\n- Database: A$15';
  await page.goto('/review');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await page.goto(`/review#import=${encodeURIComponent(JSON.stringify({ v: 1, source: 'Claude', text }))}`);
  await expect(page.getByLabel('AI output to check')).toHaveValue(text);
  await expect(page.locator('.import-banner')).toContainText('Sent from Claude');
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('');
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Choose advisers', exact: true }).click();
  await expect(page.locator('.claim-summary')).toContainText('5,000 users for under A$50/month');
});
