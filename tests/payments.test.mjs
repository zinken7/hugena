import assert from 'node:assert/strict';
import test from 'node:test';
import { checkoutUrl, isPayment, isTestLink, parsePaymentLinks } from '../data/payments.ts';

test('reads Stripe Payment Links keyed by fee in cents', () => {
  const links = parsePaymentLinks('{"1000":"https://buy.stripe.com/test_abc","20000":"https://buy.stripe.com/xyz123"}');
  assert.deepEqual(links, { 1000: 'https://buy.stripe.com/test_abc', 20000: 'https://buy.stripe.com/xyz123' });
});
test('ignores malformed config and links that are not Stripe Payment Links', () => {
  for (const raw of [undefined, '', 'not json', '[]', 'null']) assert.deepEqual(parsePaymentLinks(raw), {});
  assert.deepEqual(parsePaymentLinks('{"ten":"https://buy.stripe.com/test_a","1000":"https://evil.example/pay","2000":"http://buy.stripe.com/test_b"}'), {});
});
test('marks test-mode links and adds the request reference to the checkout URL', () => {
  assert.equal(isTestLink('https://buy.stripe.com/test_abc'), true);
  assert.equal(isTestLink('https://buy.stripe.com/aFafZg9ul6xodfQ59qaVa00'), false);
  assert.equal(checkoutUrl('https://buy.stripe.com/test_abc', 'hg-123'), 'https://buy.stripe.com/test_abc?client_reference_id=hg-123');
  assert.equal(checkoutUrl('https://buy.stripe.com/test_abc', 'hg-123', 'ana+demo@example.com'), 'https://buy.stripe.com/test_abc?client_reference_id=hg-123&prefilled_email=ana%2Bdemo%40example.com');
});
test('accepts only well-formed stored payments', () => {
  assert.equal(isPayment({ status: 'pending', ref: 'hg-1' }), true);
  assert.equal(isPayment({ status: 'paid', ref: 'hg-1', sessionId: 'cs_test_a1' }), true);
  for (const value of [null, {}, { status: 'refunded', ref: 'hg-1' }, { status: 'paid', ref: 'bad ref' }, { status: 'paid', ref: 'hg-1', sessionId: '<script>' }]) assert.equal(isPayment(value), false);
});
