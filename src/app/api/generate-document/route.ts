import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 56;
const BODY_SIZE = 12;
const TITLE_SIZE = 20;
const LINE_HEIGHT = 18;

function wrapText(text: string, font: import('pdf-lib').PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(' ');
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    lines.push(current);
  }
  return lines;
}

export async function POST(request: Request) {
  try {
    const { filename, title, content } = (await request.json()) as {
      filename: string;
      title: string;
      content: string;
    };

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontPath = path.join(process.cwd(), 'src/lib/fonts/NotoSansArmenian-Regular.ttf');
    const fontBytes = await readFile(fontPath);
    const font = await pdfDoc.embedFont(fontBytes);

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;
    const maxWidth = PAGE_WIDTH - MARGIN * 2;

    page.drawText(title, { x: MARGIN, y, size: TITLE_SIZE, font, color: rgb(0.1, 0.1, 0.1) });
    y -= TITLE_SIZE + 16;

    const lines = wrapText(content, font, BODY_SIZE, maxWidth);
    for (const line of lines) {
      if (y < MARGIN) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
      }
      page.drawText(line, { x: MARGIN, y, size: BODY_SIZE, font, color: rgb(0.2, 0.2, 0.2) });
      y -= LINE_HEIGHT;
    }

    const pdfBytes = await pdfDoc.save();
    // Content-Disposition header values must be ByteString (Latin-1) — Armenian
    // filenames can't go in the plain `filename=` param directly. Provide an
    // ASCII fallback plus the RFC 5987 `filename*=` extended param with the
    // real UTF-8 name percent-encoded, per the standard dual-param pattern.
    const asciiFallback = filename.replace(/[^\x20-\x7E]/g, '_') || 'document.pdf';
    const encodedFilename = encodeURIComponent(filename);

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (err) {
    return Response.json(
      { error: 'document_generation_failed', message: err instanceof Error ? err.message : 'PDF generation failed' },
      { status: 500 },
    );
  }
}
