import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { DocumentStore, StoredDocumentMeta } from './DocumentStore';

const STORAGE_DIR = path.join(process.cwd(), '.data', 'documents');

async function ensureStorageDir(): Promise<void> {
  await mkdir(STORAGE_DIR, { recursive: true });
}

export function createFilesystemDocumentStore(): DocumentStore {
  return {
    async save(filename, title, pdfBytes) {
      await ensureStorageDir();
      const documentId = crypto.randomUUID();
      const meta: StoredDocumentMeta = {
        documentId,
        filename,
        title,
        sizeBytes: pdfBytes.byteLength,
        createdAt: new Date().toISOString(),
      };

      await writeFile(path.join(STORAGE_DIR, `${documentId}.pdf`), pdfBytes);
      await writeFile(path.join(STORAGE_DIR, `${documentId}.json`), JSON.stringify(meta));

      return meta;
    },

    async read(documentId) {
      try {
        const metaRaw = await readFile(path.join(STORAGE_DIR, `${documentId}.json`), 'utf-8');
        const meta = JSON.parse(metaRaw) as StoredDocumentMeta;
        const bytes = await readFile(path.join(STORAGE_DIR, `${documentId}.pdf`));
        return { meta, bytes };
      } catch {
        return null;
      }
    },
  };
}
