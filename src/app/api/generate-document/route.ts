import { renderPdf } from '../../../lib/documents/renderPdf';
import { documentStore } from '../../../lib/documents/store';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { filename, title, content } = (await request.json()) as {
      filename: string;
      title: string;
      content: string;
    };

    const pdfBytes = await renderPdf(title, content);
    const meta = await documentStore.save(filename, title, pdfBytes);

    return Response.json({
      documentId: meta.documentId,
      url: `/api/documents/${meta.documentId}`,
      sizeBytes: meta.sizeBytes,
    });
  } catch (err) {
    return Response.json(
      { error: 'document_generation_failed', message: err instanceof Error ? err.message : 'PDF generation failed' },
      { status: 500 },
    );
  }
}
