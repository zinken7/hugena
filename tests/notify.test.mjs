import assert from 'node:assert/strict';
import test from 'node:test';
import { parseRequestNotice, requestEmail } from '../data/notify.ts';

const valid = {
  requestId: 'hg-1b2c', customerEmail: 'ana@example.com',
  claim: { claim: 'Our checkout redesign will lift conversion by 20%.', context: 'Asked ChatGPT for a forecast.', constraints: '', decision: 'Ship it?', category: 'Delivery plan' },
  adviser: { id: 'business', name: 'Alex Morgan', role: 'Business Consultant', provider: 'platform', feeCents: 100 },
  report: 'Brief report', payment: { status: 'unpaid' },
};

test('accepts a complete request and trims the text', () => {
  const notice = parseRequestNotice({ ...valid, customerEmail: ' ana@example.com ', claim: { ...valid.claim, claim: '  Claim text  ' } });
  assert.equal(notice?.customerEmail, 'ana@example.com');
  assert.equal(notice?.claim.claim, 'Claim text');
});
test('rejects bad emails, missing claims, unknown reports and odd payment ids', () => {
  for (const body of [null, {}, { ...valid, customerEmail: 'not-an-email' }, { ...valid, claim: { ...valid.claim, claim: ' ' } },
    { ...valid, report: 'Gold report' }, { ...valid, adviser: { ...valid.adviser, feeCents: -1 } }, { ...valid, requestId: 'has space' },
    { ...valid, payment: { status: 'paid', sessionId: '<b>' } }, { ...valid, claim: { ...valid.claim, claim: 'x'.repeat(20001) } }]) {
    assert.equal(parseRequestNotice(body), null);
  }
});
test('the email lists the request, escapes HTML and names the Stripe reference when paid', () => {
  const notice = parseRequestNotice({ ...valid, claim: { ...valid.claim, claim: '<script>alert(1)</script> 20% lift' }, payment: { status: 'paid', ref: 'hg-1b2c', sessionId: 'cs_live_abc' } });
  const email = requestEmail(notice, 'https://hugena.vercel.app');
  assert.match(email.subject, /Delivery plan · Brief report · Alex Morgan/);
  assert.match(email.text, /Customer email: ana@example\.com/);
  assert.match(email.text, /Fee and report: A\$1\.00 · Brief report/);
  assert.match(email.text, /session cs_live_abc/);
  assert.ok(!email.html.includes('<script>'));
  assert.ok(email.html.includes('&lt;script&gt;'));
});
