import { documentStore } from '../../../../lib/documents/store';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const result = await documentStore.read(params.id);
  if (!result) {
    return new Response('Not found', { status: 404 });
  }

  const { meta, bytes } = result;
  const asciiFallback = meta.filename.replace(/[^\x20-\x7E]/g, '_') || 'document.pdf';
  const encodedFilename = encodeURIComponent(meta.filename);

  return new Response(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${asciiFallback}"; filename*=UTF-8''${encodedFilename}`,
    },
  });
}
