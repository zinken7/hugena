import assert from 'node:assert/strict';
import test from 'node:test';
import { maxImportLength, parseImport } from '../data/import.ts';

const hashFor = payload => `#import=${encodeURIComponent(JSON.stringify(payload))}`;

test('reads the answer and its source from the extension link', () => {
  const text = 'Yes. 5,000 users will cost under A$50/month.\n\n- Hosting: A$20\n- Database: A$15 — “estimate”';
  assert.deepEqual(parseImport(hashFor({ v: 1, source: 'Claude', text })), { source: 'Claude', text });
});
test('ignores other fragments, broken payloads and empty answers', () => {
  for (const hash of ['', '#how', '#import=', '#import=%E0%A4%A', '#import=not-json', hashFor({ text: '   ' }), hashFor({ text: 42 }), hashFor(null)]) {
    assert.equal(parseImport(hash), null);
  }
});
test('falls back to a generic source name and caps very long answers', () => {
  const result = parseImport(hashFor({ text: 'x'.repeat(maxImportLength + 500) }));
  assert.equal(result?.source, 'your AI assistant');
  assert.equal(result?.text.length, maxImportLength);
});
