import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';

export interface InvoiceSaleItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceSaleData {
  invoiceNumber: number;
  status: string;
  paymentStatus: 'paid' | 'credit' | 'prospect';
  amountPaid?: number;
  customerName: string;
  customerContact?: string | null;
  customerEmail?: string | null;
  notes?: string | null;
  createdAt: Date;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  items: InvoiceSaleItem[];
}

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const COLORS = {
  primary: rgb(0.035, 0.612, 0.306),
  dark: rgb(0.11, 0.169, 0.055),
  muted: rgb(0.361, 0.42, 0.29),
  border: rgb(0.847, 0.816, 0.745),
  band: rgb(0.929, 0.91, 0.863),
  white: rgb(1, 1, 1),
};

const COMPANY = {
  name: 'Olivoria Organics',
  tagline: 'Wellness · Natural · Healthy Living',
  address: ['Matasia, along Kiserian–Matasia Road', 'Moran Towers, Matasia'],
  phone: '+254 708 261674',
  email: 'hello@olivoriaorganics.com',
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const COL = {
  description: MARGIN,
  descriptionWidth: 275,
  qty: 375,
  unitPrice: 460,
  amount: PAGE_WIDTH - MARGIN,
};

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function invoiceNumberLabel(n: number): string {
  return `#${String(n).padStart(4, '0')}`;
}

function clean(text: string): string {
  return Array.from(text)
    .map((char) => (char.charCodeAt(0) <= 0xff ? char : '-'))
    .join('');
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = clean(text).split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawRight(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  xRight: number,
  y: number,
  color = COLORS.dark
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: xRight - width, y, size, font, color });
}

export async function buildInvoicePdf(
  sale: InvoiceSaleData,
  logoPng: Uint8Array
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await pdf.embedPng(logoPng);

  const { width, height } = { width: PAGE_WIDTH, height: PAGE_HEIGHT };
  pdf.setTitle(`Olivoria Organics Invoice ${invoiceNumberLabel(sale.invoiceNumber)}`);
  pdf.setAuthor(COMPANY.name);
  pdf.setCreator(COMPANY.name);

  let page = pdf.addPage([width, height]);
  let y = height - MARGIN;

  const line = (from: number, to: number, at: number, color = COLORS.border, thickness = 1) =>
    page.drawLine({ start: { x: from, y: at }, end: { x: to, y: at }, thickness, color });

  // ── Header ─────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 6, width, height: 6, color: COLORS.primary });
  const logoHeight = 34;
  const logoWidth = (logo.width / logo.height) * logoHeight;
  page.drawImage(logo, { x: MARGIN, y: y - logoHeight + 6, width: logoWidth, height: logoHeight });
  const brandX = MARGIN + logoWidth + 10;
  page.drawText(COMPANY.name, { x: brandX, y: y - 10, size: 22, font: bold, color: COLORS.dark });
  page.drawText(COMPANY.tagline, { x: brandX, y: y - 26, size: 9.5, font, color: COLORS.muted });
  drawRight(page, 'INVOICE', bold, 26, width - MARGIN, y - 18, COLORS.primary);
  drawRight(
    page,
    invoiceNumberLabel(sale.invoiceNumber),
    bold,
    12,
    width - MARGIN,
    y - 36,
    COLORS.dark
  );
  drawRight(
    page,
    `Issued: ${dateFormat.format(sale.createdAt)}`,
    font,
    10,
    width - MARGIN,
    y - 52,
    COLORS.muted
  );
  const completed = sale.status === 'completed';
  drawRight(
    page,
    completed ? 'Status: Completed' : 'Status: Pending',
    completed ? bold : font,
    10,
    width - MARGIN,
    y - 66,
    completed ? COLORS.primary : COLORS.muted
  );
  const paymentLine =
    sale.paymentStatus === 'paid'
      ? 'Payment: Paid'
      : sale.paymentStatus === 'prospect'
        ? 'Payment: Prospect'
        : sale.amountPaid !== undefined && sale.amountPaid > 0
          ? `Payment: On Credit (Paid ${formatKESAmount(sale.amountPaid)} of ${formatKESAmount(sale.total)})`
          : 'Payment: On Credit';
  drawRight(page, paymentLine, font, 10, width - MARGIN, y - 80, COLORS.muted);

  y -= 100;
  line(MARGIN, width - MARGIN, y);
  y -= 24;

  // ── From / Billed to ───────────────────────────────────
  const label = (text: string, atY: number, x = MARGIN) =>
    page.drawText(text.toUpperCase(), { x, y: atY, size: 8.5, font: bold, color: COLORS.muted });

  label('From', y);
  page.drawText(COMPANY.name, { x: MARGIN, y: y - 16, size: 11, font: bold, color: COLORS.dark });
  let fromY = y - 30;
  for (const addressLine of COMPANY.address) {
    page.drawText(clean(addressLine), {
      x: MARGIN,
      y: fromY,
      size: 9.5,
      font,
      color: COLORS.muted,
    });
    fromY -= 13;
  }
  page.drawText(`${COMPANY.phone} · ${COMPANY.email}`, {
    x: MARGIN,
    y: fromY,
    size: 9.5,
    font,
    color: COLORS.muted,
  });

  const billedX = width / 2 + 20;
  label('Billed to', y, billedX);
  page.drawText(clean(sale.customerName), {
    x: billedX,
    y: y - 16,
    size: 11,
    font: bold,
    color: COLORS.dark,
  });
  let billedY = y - 30;
  for (const detail of [sale.customerContact, sale.customerEmail].filter(Boolean)) {
    page.drawText(clean(detail as string), {
      x: billedX,
      y: billedY,
      size: 9.5,
      font,
      color: COLORS.muted,
    });
    billedY -= 13;
  }

  y = Math.min(fromY, billedY) - 20;
  line(MARGIN, width - MARGIN, y);
  y -= 28;

  // ── Items table ────────────────────────────────────────
  const drawTableHeader = (atY: number) => {
    page.drawRectangle({
      x: MARGIN,
      y: atY - 8,
      width: width - MARGIN * 2,
      height: 24,
      color: COLORS.band,
    });
    page.drawText('DESCRIPTION', {
      x: COL.description + 8,
      y: atY,
      size: 8.5,
      font: bold,
      color: COLORS.dark,
    });
    drawRight(page, 'QTY', bold, 8.5, COL.qty, atY, COLORS.dark);
    drawRight(page, 'UNIT PRICE', bold, 8.5, COL.unitPrice, atY, COLORS.dark);
    drawRight(page, 'AMOUNT', bold, 8.5, COL.amount - 8, atY, COLORS.dark);
    return atY - 24;
  };

  y = drawTableHeader(y);

  const drawItem = (name: string, quantity: number, unitPrice: number, total: number): number => {
    const nameLines = wrapText(name, font, 10, COL.descriptionWidth - 16);
    const rowHeight = Math.max(nameLines.length * 13 + 12, 28);
    if (y - rowHeight < 120) {
      page = pdf.addPage([width, height]);
      y = height - MARGIN;
      y = drawTableHeader(y);
    }
    const baseY = y - 16;
    nameLines.forEach((text, i) => {
      page.drawText(text, {
        x: COL.description + 8,
        y: baseY - i * 13,
        size: 10,
        font,
        color: COLORS.dark,
      });
    });
    drawRight(page, String(quantity), font, 10, COL.qty, baseY);
    drawRight(page, formatKESAmount(unitPrice), font, 10, COL.unitPrice, baseY);
    drawRight(page, formatKESAmount(total), bold, 10, COL.amount - 8, baseY);
    y -= rowHeight;
    line(COL.description, width - MARGIN, y + 6, COLORS.border, 0.5);
    return y;
  };

  for (const item of sale.items) {
    y = drawItem(item.name, item.quantity, item.unitPrice, item.total);
  }

  // ── Totals ─────────────────────────────────────────────
  const hasBalanceRows = sale.paymentStatus === 'credit' && sale.amountPaid !== undefined;
  if (y - (hasBalanceRows ? 150 : 110) < MARGIN + 60) {
    page = pdf.addPage([width, height]);
    y = height - MARGIN;
  }

  y -= 12;
  const totalsX = width - MARGIN - 170;
  page.drawText('Subtotal', { x: totalsX, y, size: 10, font, color: COLORS.muted });
  drawRight(page, formatKESAmount(sale.subtotal), font, 10, width - MARGIN, y, COLORS.dark);
  y -= 18;
  if (sale.taxRate > 0) {
    const rateLabel = sale.taxRate.toFixed(1).replace(/\.0$/, '');
    page.drawText(`Tax (${rateLabel}%)`, { x: totalsX, y, size: 10, font, color: COLORS.muted });
    drawRight(page, formatKESAmount(sale.tax), font, 10, width - MARGIN, y, COLORS.dark);
    y -= 18;
  }
  page.drawRectangle({
    x: totalsX - 12,
    y: y - 8,
    width: width - MARGIN - totalsX + 12,
    height: 24,
    color: COLORS.primary,
  });
  page.drawText('TOTAL', { x: totalsX, y, size: 10.5, font: bold, color: COLORS.white });
  drawRight(page, formatKESAmount(sale.total), bold, 11, width - MARGIN - 8, y, COLORS.white);

  if (hasBalanceRows) {
    y -= 22;
    page.drawText('Amount Paid', { x: totalsX, y, size: 10, font, color: COLORS.muted });
    drawRight(page, formatKESAmount(sale.amountPaid!), font, 10, width - MARGIN, y, COLORS.dark);
    y -= 18;
    page.drawText('Balance Due', { x: totalsX, y, size: 10, font: bold, color: COLORS.dark });
    drawRight(
      page,
      formatKESAmount(Math.max(0, round2(sale.total - sale.amountPaid!))),
      bold,
      10,
      width - MARGIN,
      y,
      COLORS.primary
    );
  }

  // ── Notes ──────────────────────────────────────────────
  if (sale.notes) {
    y -= 40;
    page.drawText('NOTES', { x: MARGIN, y, size: 8.5, font: bold, color: COLORS.muted });
    y -= 14;
    for (const noteLine of wrapText(sale.notes, font, 9.5, width - MARGIN * 2)) {
      page.drawText(noteLine, { x: MARGIN, y, size: 9.5, font, color: COLORS.muted });
      y -= 12;
    }
  }

  // ── Footer (last page) ─────────────────────────────────
  const footerY = MARGIN + 30;
  line(MARGIN, width - MARGIN, footerY + 26, COLORS.border, 0.5);
  page.drawText('Thank you for choosing Olivoria Organics!', {
    x: MARGIN,
    y: footerY + 10,
    size: 9.5,
    font: bold,
    color: COLORS.dark,
  });
  page.drawText(clean(`${COMPANY.address.join(', ')} · ${COMPANY.phone} · ${COMPANY.email}`), {
    x: MARGIN,
    y: footerY - 4,
    size: 8.5,
    font,
    color: COLORS.muted,
  });
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    const pageLabel = `Page ${i + 1} of ${pages.length}`;
    const textWidth = font.widthOfTextAtSize(pageLabel, 8.5);
    p.drawText(pageLabel, {
      x: width - MARGIN - textWidth,
      y: footerY - 4,
      size: 8.5,
      font,
      color: COLORS.muted,
    });
  });

  return pdf.save();
}

const kes = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatKESAmount(amount: number): string {
  return kes.format(Number.isFinite(amount) ? amount : 0);
}
