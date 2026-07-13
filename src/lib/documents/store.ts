import { createFilesystemDocumentStore } from './FilesystemDocumentStore';
import type { DocumentStore } from './DocumentStore';

// Later phase changes only this file's contents to swap for object storage.
export const documentStore: DocumentStore = createFilesystemDocumentStore();
