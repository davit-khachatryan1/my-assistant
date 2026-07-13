export interface StoredDocumentMeta {
  documentId: string;
  filename: string;
  title: string;
  sizeBytes: number;
  createdAt: string;
}

export interface DocumentStore {
  save(filename: string, title: string, pdfBytes: Uint8Array): Promise<StoredDocumentMeta>;
  read(documentId: string): Promise<{ meta: StoredDocumentMeta; bytes: Buffer } | null>;
}
