import assert from 'node:assert/strict';
import test from 'node:test';
import { catalogFees } from '../data/advisers.ts';
import { chargeFor, checkoutSessionParams, checkPaidSession, parseCheckoutRequest } from '../data/checkout.ts';

const request = {
  requestId: 'hg-1b2c', customerEmail: ' ana@example.com ', category: 'Cost estimate', example: false,
  adviser: { id: 'external-taylor', name: 'Taylor Brooks', provider: 'external', feeCents: 1 },
};

test('validates the checkout request and trims the email', () => {
  assert.equal(parseCheckoutRequest(request)?.customerEmail, 'ana@example.com');
  assert.equal(parseCheckoutRequest({ ...request, customerEmail: undefined })?.customerEmail, undefined);
  for (const body of [null, {}, { ...request, requestId: 'has space' }, { ...request, customerEmail: 'nope' }, { ...request, example: 'no' },
    { ...request, adviser: { ...request.adviser, provider: 'admin' } }, { ...request, adviser: { ...request.adviser, feeCents: 1.5 } }]) {
    assert.equal(parseCheckoutRequest(body), null);
  }
});

test('listed advisers are charged their catalogue fee, whatever the browser says', () => {
  assert.deepEqual(chargeFor({ id: 'external-taylor', name: 'Taylor', provider: 'external', feeCents: 1 }, catalogFees), { feeCents: 200, source: 'catalog' });
  assert.deepEqual(chargeFor({ id: 'business', name: 'Alex', provider: 'platform', feeCents: 999999 }, catalogFees), { feeCents: 100, source: 'catalog' });
});

test('advisers who signed up in a browser are charged their profile fee within Stripe limits', () => {
  assert.deepEqual(chargeFor({ id: 'external-abc', name: 'Jamie', provider: 'external', feeCents: 4200 }, catalogFees), { feeCents: 4200, source: 'profile' });
  assert.equal(chargeFor({ id: 'external-abc', name: 'Jamie', provider: 'external', feeCents: 49 }, catalogFees), null);
  assert.equal(chargeFor({ id: 'invented', name: 'Someone', provider: 'platform', feeCents: 100 }, catalogFees), null);
});

test('builds a Checkout Session priced by the server with the request reference and return URLs', () => {
  const req = parseCheckoutRequest(request);
  const p = checkoutSessionParams(req, { feeCents: 200, source: 'catalog' }, { origin: 'https://hugena.vercel.app', reportLabel: 'Comprehensive report', managedPayments: false, automaticTax: true, taxCode: 'txcd_20030000' });
  assert.equal(p.get('mode'), 'payment');
  assert.equal(p.get('line_items[0][price_data][unit_amount]'), '200');
  assert.equal(p.get('line_items[0][price_data][currency]'), 'aud');
  assert.equal(p.get('line_items[0][price_data][product_data][name]'), 'Hugena comprehensive report by Taylor Brooks');
  assert.equal(p.get('line_items[0][price_data][product_data][tax_code]'), 'txcd_20030000');
  assert.equal(p.get('success_url'), 'https://hugena.vercel.app/review?paid={CHECKOUT_SESSION_ID}');
  assert.equal(p.get('cancel_url'), 'https://hugena.vercel.app/review?cancelled=1');
  assert.equal(p.get('client_reference_id'), 'hg-1b2c');
  assert.equal(p.get('customer_email'), 'ana@example.com');
  assert.equal(p.get('metadata[price_source]'), 'catalog');
  assert.equal(p.get('automatic_tax[enabled]'), 'true');
  assert.equal(p.get('managed_payments[enabled]'), null);
});

test('Managed Payments replaces automatic tax, which Stripe rejects alongside it', () => {
  const p = checkoutSessionParams(parseCheckoutRequest(request), { feeCents: 200, source: 'catalog' }, { origin: 'https://x.test', reportLabel: 'Brief report', managedPayments: true, automaticTax: true });
  assert.equal(p.get('managed_payments[enabled]'), 'true');
  assert.equal(p.get('automatic_tax[enabled]'), null);
  assert.equal(p.get('line_items[0][price_data][product_data][tax_code]'), null);
});

test('a request counts as paid only when Stripe says its own session is paid', () => {
  const paid = { object: 'checkout.session', mode: 'payment', payment_status: 'paid', client_reference_id: 'hg-1', amount_total: 220, currency: 'aud', customer_details: { email: 'ana@example.com' } };
  assert.deepEqual(checkPaidSession(paid, 'hg-1'), { ok: true, amountTotal: 220, currency: 'AUD', customerEmail: 'ana@example.com' });
  assert.deepEqual(checkPaidSession({ ...paid, payment_status: 'unpaid' }, 'hg-1'), { ok: false, reason: 'not_paid' });
  assert.deepEqual(checkPaidSession(paid, 'hg-2'), { ok: false, reason: 'different_request' });
  assert.deepEqual(checkPaidSession(null, 'hg-1'), { ok: false, reason: 'session_not_found' });
});
