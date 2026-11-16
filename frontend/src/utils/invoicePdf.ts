import type { jsPDF } from 'jspdf';
import type { Invoice } from '../types';
import { formatCurrency } from './formatters';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

type Rgb = readonly [number, number, number];

const COLORS: Record<string, Rgb> = {
  ink: [15, 23, 42],
  body: [51, 65, 85],
  muted: [100, 116, 139],
  subtle: [148, 163, 184],
  line: [226, 232, 240],
  surface: [248, 250, 252],
  brand: [79, 70, 229],
  brandSoft: [238, 242, 255],
  success: [5, 150, 105],
  white: [255, 255, 255],
};

const setFill = (doc: jsPDF, color: Rgb) => doc.setFillColor(color[0], color[1], color[2]);
const setText = (doc: jsPDF, color: Rgb) => doc.setTextColor(color[0], color[1], color[2]);
const setStroke = (doc: jsPDF, color: Rgb) => doc.setDrawColor(color[0], color[1], color[2]);

const today = () =>
  new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const safeName = (value: string) => value.replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-');

const drawHeader = (doc: jsPDF, documentLabel: string, documentNumber: string) => {
  setFill(doc, COLORS.brand);
  doc.roundedRect(MARGIN, MARGIN, 26, 26, 6, 6, 'F');
  setText(doc, COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('S', MARGIN + 9, MARGIN + 18);

  setText(doc, COLORS.ink);
  doc.setFontSize(17);
  doc.text('SubscriptIQ Inc.', MARGIN + 34, MARGIN + 12);
  doc.setFont('helvetica', 'normal');
  setText(doc, COLORS.muted);
  doc.setFontSize(8.5);
  doc.text('100 Tech Park, Suite 400, Bangalore, KA 560001, India', MARGIN + 34, MARGIN + 24);
  doc.text('GSTIN: 29AABCU9603R1ZM', MARGIN + 34, MARGIN + 35);

  doc.setFont('helvetica', 'bold');
  setText(doc, COLORS.brand);
  doc.setFontSize(19);
  doc.text(documentLabel, PAGE_WIDTH - MARGIN, MARGIN + 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  setText(doc, COLORS.muted);
  doc.setFontSize(9);
  doc.text(documentNumber, PAGE_WIDTH - MARGIN, MARGIN + 26, { align: 'right' });

  setStroke(doc, COLORS.line);
  doc.setLineWidth(1);
  doc.line(MARGIN, MARGIN + 48, PAGE_WIDTH - MARGIN, MARGIN + 48);
  return MARGIN + 70;
};

const drawPill = (doc: jsPDF, label: string, x: number, y: number, color: Rgb) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const width = doc.getTextWidth(label) + 18;
  setFill(doc, color);
  doc.roundedRect(x, y - 9, width, 16, 8, 8, 'F');
  setText(doc, COLORS.white);
  doc.text(label, x + 9, y + 2.5);
};

const drawLabelValue = (
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  align: 'left' | 'right' = 'left'
) => {
  setText(doc, COLORS.subtle);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(label.toUpperCase(), x, y, { align });
  setText(doc, COLORS.ink);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(value, x, y + 13, { align });
};

const drawTotals = (
  doc: jsPDF,
  rows: Array<{ label: string; value: string; strong?: boolean }>,
  startY: number
) => {
  const boxWidth = 220;
  const x = PAGE_WIDTH - MARGIN - boxWidth;
  let y = startY;

  rows.forEach((row) => {
    setText(doc, row.strong ? COLORS.ink : COLORS.muted);
    doc.setFont('helvetica', row.strong ? 'bold' : 'normal');
    doc.setFontSize(row.strong ? 12 : 9.5);
    doc.text(row.label, x, y);
    doc.setFont('helvetica', 'bold');
    setText(doc, row.strong ? COLORS.brand : COLORS.body);
    doc.setFontSize(row.strong ? 12 : 9.5);
    doc.text(row.value, PAGE_WIDTH - MARGIN, y, { align: 'right' });
    y += row.strong ? 18 : 16;
  });

  return y;
};

const drawFooter = (doc: jsPDF, note: string) => {
  const y = PAGE_HEIGHT - MARGIN;
  setStroke(doc, COLORS.line);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, y - 26, PAGE_WIDTH - MARGIN, y - 26);
  setText(doc, COLORS.subtle);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(note, PAGE_WIDTH / 2, y - 14, { align: 'center', maxWidth: CONTENT_WIDTH });
};

export const downloadInvoicePdf = async (invoice: Invoice) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const currency = invoice.currency || '₹';
  let y = drawHeader(doc, 'TAX INVOICE', invoice.invoiceNumber);

  drawPill(doc, invoice.status.toUpperCase(), MARGIN, y, COLORS.success);

  const metaX = PAGE_WIDTH - MARGIN;
  drawLabelValue(doc, 'Issued Date', invoice.date || today(), metaX, y, 'right');
  drawLabelValue(doc, 'Due Date', invoice.dueDate || 'On Receipt', metaX - 120, y, 'right');

  y += 34;

  setFill(doc, COLORS.surface);
  setStroke(doc, COLORS.line);
  doc.setLineWidth(0.8);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 58, 10, 10, 'FD');

  drawLabelValue(doc, 'Billed To', invoice.customer || 'Acme Corp', MARGIN + 14, y + 16);
  setText(doc, COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('ATTN: Accounts Payable', MARGIN + 14, y + 42);

  drawLabelValue(
    doc,
    'Payment Method',
    invoice.paymentMethod || 'Visa ending in 4242',
    PAGE_WIDTH - MARGIN - 14,
    y + 16,
    'right'
  );
  setText(doc, COLORS.success);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Verified Auto-Pay', PAGE_WIDTH - MARGIN - 14, y + 42, { align: 'right' });

  y += 84;

  const columns = [
    { label: 'Description', width: 200, align: 'left' as const },
    { label: 'Metered Metric', width: 130, align: 'left' as const },
    { label: 'Rate', width: 75, align: 'left' as const },
    { label: 'Amount', width: 108.28, align: 'right' as const },
  ];

  const drawTableHead = (top: number) => {
    setFill(doc, COLORS.ink);
    doc.rect(MARGIN, top, CONTENT_WIDTH, 24, 'F');
    setText(doc, COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    let x = MARGIN + 12;
    columns.forEach((col) => {
      const tx = col.align === 'right' ? x + col.width - 24 : x;
      doc.text(col.label.toUpperCase(), tx, top + 15.5, { align: col.align });
      x += col.width;
    });
  };

  drawTableHead(y);
  let rowY = y + 24;

  const items =
    invoice.lineItems.length > 0
      ? invoice.lineItems
      : [
          {
            id: 'fallback',
            lineItem: 'Standard Monthly Subscription',
            sourceUsage: invoice.period,
            rate: 'Flat',
            amount: invoice.total,
          },
        ];

  items.forEach((item, index) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const description = doc.splitTextToSize(item.lineItem, columns[0].width - 24) as string[];
    const metric = doc.splitTextToSize(item.sourceUsage || '—', columns[1].width - 24) as string[];
    const rate = doc.splitTextToSize(item.rate || '—', columns[2].width - 12) as string[];
    const lines = Math.max(description.length, metric.length, rate.length, 1);
    const rowHeight = Math.max(30, 14 + lines * 12);

    if (rowY + rowHeight > PAGE_HEIGHT - 150) {
      drawFooter(doc, 'SubscriptIQ Inc. · billing@subscriptiq.app');
      doc.addPage();
      rowY = MARGIN;
      drawTableHead(rowY);
      rowY += 24;
    }

    if (index % 2 === 1) {
      setFill(doc, COLORS.surface);
      doc.rect(MARGIN, rowY, CONTENT_WIDTH, rowHeight, 'F');
    }

    let x = MARGIN + 12;
    setText(doc, COLORS.ink);
    doc.setFont('helvetica', 'bold');
    doc.text(description, x, rowY + 18);
    x += columns[0].width;

    doc.setFont('helvetica', 'normal');
    setText(doc, COLORS.muted);
    doc.text(metric, x, rowY + 18);
    x += columns[1].width;

    doc.text(rate, x, rowY + 18);
    x += columns[2].width;

    setText(doc, COLORS.ink);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(item.amount, currency), x + columns[3].width - 24, rowY + 18, {
      align: 'right',
    });

    setStroke(doc, COLORS.line);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, rowY + rowHeight, PAGE_WIDTH - MARGIN, rowY + rowHeight);
    rowY += rowHeight;
  });

  rowY += 18;
  const tax = Math.round(invoice.total * 0.18);
  drawTotals(
    doc,
    [
      { label: 'Subtotal', value: formatCurrency(invoice.total, currency) },
      { label: 'GST / Tax (18% included)', value: formatCurrency(tax, currency) },
      { label: 'Total Amount Due', value: formatCurrency(invoice.total, currency), strong: true },
    ],
    rowY
  );

  drawFooter(doc, 'This is a computer-generated tax invoice and requires no physical signature.');
  doc.save(`${safeName(invoice.invoiceNumber || 'invoice')}.pdf`);
};

export interface ReceiptPdfData {
  transactionId: string;
  receiptNumber: string;
  date: string;
  amount: number;
  currency?: string;
  itemTitle?: string;
  itemSubtitle?: string;
  paymentMethod?: string;
}

export const downloadReceiptPdf = async (receipt: ReceiptPdfData) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const currency = receipt.currency || '₹';
  const y = drawHeader(doc, 'PAYMENT RECEIPT', receipt.receiptNumber);

  drawPill(doc, 'PAID', MARGIN, y, COLORS.success);

  setFill(doc, COLORS.brandSoft);
  doc.roundedRect(MARGIN, y + 22, CONTENT_WIDTH, 74, 12, 12, 'F');
  setText(doc, COLORS.brand);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('AMOUNT PAID', MARGIN + 18, y + 46);
  doc.setFontSize(30);
  doc.text(formatCurrency(receipt.amount, currency), MARGIN + 18, y + 80);

  let rowY = y + 128;
  const rows: Array<[string, string]> = [
    ['Receipt Number', receipt.receiptNumber],
    ['Transaction ID', receipt.transactionId],
    ['Payment For', receipt.itemTitle || 'Subscription Payment'],
    ...(receipt.itemSubtitle ? ([['Plan', receipt.itemSubtitle]] as Array<[string, string]>) : []),
    ['Payment Method', receipt.paymentMethod || 'Verified Gateway'],
    ['Date & Time', receipt.date],
  ];

  rows.forEach(([label, value], index) => {
    if (index % 2 === 0) {
      setFill(doc, COLORS.surface);
      doc.rect(MARGIN, rowY - 14, CONTENT_WIDTH, 30, 'F');
    }
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(label, MARGIN + 14, rowY + 5);
    setText(doc, COLORS.ink);
    doc.setFont('helvetica', 'bold');
    doc.text(value, PAGE_WIDTH - MARGIN - 14, rowY + 5, { align: 'right' });
    rowY += 30;
  });

  rowY += 18;
  setStroke(doc, COLORS.line);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, rowY, PAGE_WIDTH - MARGIN, rowY);
  setText(doc, COLORS.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Total Paid', MARGIN + 14, rowY + 24);
  setText(doc, COLORS.success);
  doc.setFontSize(16);
  doc.text(formatCurrency(receipt.amount, currency), PAGE_WIDTH - MARGIN - 14, rowY + 24, {
    align: 'right',
  });

  drawFooter(
    doc,
    'Thank you for choosing SubscriptIQ. This is a computer-generated receipt and requires no physical signature.'
  );
  doc.save(`receipt-${safeName(receipt.receiptNumber || receipt.transactionId)}.pdf`);
};
