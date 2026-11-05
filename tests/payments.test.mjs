import assert from 'node:assert/strict';
import test from 'node:test';
import { isPayment, parseCheckoutMode } from '../data/payments.ts';

test('checkout is on only for the live and test modes', () => {
  assert.equal(parseCheckoutMode('live'), 'live');
  assert.equal(parseCheckoutMode('test'), 'test');
  for (const raw of [undefined, '', 'true', 'LIVE', '{"200":"https://buy.stripe.com/x"}']) assert.equal(parseCheckoutMode(raw), null);
});
test('accepts only well-formed stored payments', () => {
  assert.equal(isPayment({ status: 'pending', ref: 'hg-1' }), true);
  assert.equal(isPayment({ status: 'paid', ref: 'hg-1', sessionId: 'cs_test_a1' }), true);
  for (const value of [null, {}, { status: 'refunded', ref: 'hg-1' }, { status: 'paid', ref: 'bad ref' }, { status: 'paid', ref: 'hg-1', sessionId: '<script>' }]) assert.equal(isPayment(value), false);
});
