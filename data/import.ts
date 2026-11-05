// The Hugena Chrome extension opens /review#import=<payload>, where the payload is
// encodeURIComponent(JSON.stringify({ v: 1, source, text })). The fragment never
// reaches a server; the workspace reads it once and then removes it from the URL.
export const maxImportLength = 20000;
export type ImportedAnswer = { source: string; text: string };

export function parseImport(hash: string): ImportedAnswer | null {
  if (!hash.startsWith('#import=')) return null;
  try {
    const data: unknown = JSON.parse(decodeURIComponent(hash.slice('#import='.length)));
    if (!data || typeof data !== 'object') return null;
    const { text, source } = data as { text?: unknown; source?: unknown };
    if (typeof text !== 'string' || !text.trim()) return null;
    const name = typeof source === 'string' && source.trim() ? source.trim().slice(0, 40) : 'your AI assistant';
    return { source: name, text: text.trim().slice(0, maxImportLength) };
  } catch {
    return null;
  }
}
