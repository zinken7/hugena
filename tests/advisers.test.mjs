import assert from 'node:assert/strict';
import test from 'node:test';
import { externalExample, isAdviser, settlement } from '../data/advisers.ts';

test('external success splits A$200 into A$20 commission and A$180 retained', () => {
  assert.deepEqual(settlement(externalExample, 'paid'), { commissionCents: 2000, adviserCents: 18000 });
});
test('in-progress and completed unpaid cases owe no commission', () => {
  for (const status of ['open', 'completed']) {
    assert.deepEqual(settlement(externalExample, status), { commissionCents: 0, adviserCents: 0 });
  }
});
test('standard advisers are exempt from the external commission', () => {
  assert.deepEqual(settlement({ provider: 'platform', feeCents: 1000 }, 'paid'), { commissionCents: 0, adviserCents: 1000 });
});
test('rounding to cents preserves the original total including small fees', () => {
  for (const feeCents of [1, 5, 99, 1005, 19999, 100000000]) {
    const result = settlement({ provider: 'external', feeCents }, 'paid');
    assert.equal(result.commissionCents + result.adviserCents, feeCents);
    assert.equal(result.commissionCents, Math.round(feeCents / 10));
  }
});
test('saved profiles reject malformed, unsupported, or invalid fees', () => {
  assert.equal(isAdviser(externalExample), true);
  for (const value of [null, {}, { ...externalExample, specialty: 'invalid' }, { ...externalExample, provider: 'invalid' }, { ...externalExample, feeCents: -1 }, { ...externalExample, feeCents: 1.2 }, { ...externalExample, name: ' ' }]) assert.equal(isAdviser(value), false);
});
