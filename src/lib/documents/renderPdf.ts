import { PDFDocument, rgb, type PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFile } from 'fs/promises';
import path from 'path';

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 56;
const BODY_SIZE = 12;
const TITLE_SIZE = 20;
const LINE_HEIGHT = 18;

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
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

/**
 * Renders a title + body of text into PDF bytes using the vendored Armenian
 * font. Used by /api/generate-document, invoked once the user confirms a
 * document suggestion in the chat UI.
 */
export async function renderPdf(title: string, content: string): Promise<Uint8Array> {
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

  return pdfDoc.save();
}
