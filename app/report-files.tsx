'use client';
import { useEffect, useState } from 'react';
import { ArrowDownToLine, FileText } from 'lucide-react';
import type { ReportFile } from '../data/sample-case';

// Report files uploaded by advisers live in IndexedDB (localStorage is too small for PDFs).
// Only the file's metadata is kept with the assessment in localStorage.
const DB_NAME = 'hugena-files';
const STORE = 'reports';
export const maxReportFileBytes = 10 * 1024 * 1024;
const allowed = /\.(pdf|docx?)$/i;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

export function reportFileProblem(file: File): string | null {
  if (!allowed.test(file.name)) return 'Attach a PDF or Word file.';
  if (file.size > maxReportFileBytes) return 'The file is larger than 10 MB.';
  if (file.size === 0) return 'The file is empty.';
  return null;
}

export async function saveReportFile(file: File): Promise<ReportFile> {
  const id = crypto.randomUUID();
  await run('readwrite', store => store.put(file, id));
  return { id, name: file.name, size: file.size, type: file.type || 'application/octet-stream' };
}

export async function clearReportFiles() {
  try { await run('readwrite', store => store.clear()); } catch { /* nothing stored */ }
}

export async function deleteReportFile(id: string) {
  try { await run('readwrite', store => store.delete(id)); } catch { /* already gone */ }
}

export const fileSize = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Download link for the adviser's report on the customer's report page.
export function ReportFileLink({ file }: { file: ReportFile }) {
  const [url, setUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let objectUrl: string | null = null;
    run<Blob | undefined>('readonly', store => store.get(file.id))
      .then(blob => { if (blob) { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); } else setMissing(true); })
      .catch(() => setMissing(true));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [file.id]);
  return <div className="report-file">
    <FileText size={22} />
    <div><strong>{file.name}</strong><small>{missing ? 'This file isn’t available in this browser.' : `Your adviser’s report · ${fileSize(file.size)}`}</small></div>
    {url && <a className="button secondary small" href={url} download={file.name}><ArrowDownToLine size={15} />Download</a>}
  </div>;
}
