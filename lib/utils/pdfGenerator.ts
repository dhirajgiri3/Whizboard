import jsPDF from 'jspdf';

interface PDFOptions {
  title: string;
  content: string;
  version?: string;
  effectiveDate?: string;
}

// PDF layout constants with improved design
const PDF_CONFIG = {
  MARGIN: 25,
  MAX_WIDTH: 160,
  LINE_HEIGHT: 14,
  TITLE_FONT_SIZE: 24,
  SUBTITLE_FONT_SIZE: 16,
  BODY_FONT_SIZE: 12,
  FOOTER_FONT_SIZE: 9,
  BRAND_FONT_SIZE: 14,
  TITLE_Y: 42, // will be used as base title Y
  INFO_Y: 56,  // right after title
  CONTENT_START_Y: 82, // increased to accommodate new header height
  FOOTER_Y: 275,
  PAGE_BREAK_Y: 250,
  NEW_PAGE_START_Y: 35,
  FONT_FAMILY: 'helvetica',
  PRIMARY_COLOR: [37, 99, 235] as [number, number, number], // Blue color for headers
  TEXT_COLOR: [51, 51, 51] as [number, number, number], // Dark gray for text
  TAG_BG: [235, 243, 255] as [number, number, number], // Light blue background
  DIVIDER_COLOR: [210, 210, 210] as [number, number, number]
} as const;

// Format date in Indian format (dd/mm/yyyy)
function formatIndianDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Convert markdown and HTML to plain text with better formatting
function convertMarkdownToPlainText(content: string): string {
  return content
    // Remove HTML tags and preserve structure
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    // Remove markdown headers
    .replace(/#{1,6}\s+/g, '')
    // Remove bold
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic
    .replace(/\*(.*?)\*/g, '$1')
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove code blocks
    .replace(/`([^`]+)`/g, '$1')
    // Normalize line breaks
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\n/g, '\n \n')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// Split text into lines that fit page width
function splitTextIntoLines(doc: jsPDF, text: string): string[] {
  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const testWidth = doc.getTextWidth(testLine);
    
    if (testWidth > PDF_CONFIG.MAX_WIDTH && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Ensure consistent body text styling
function setBodyTextStyle(doc: jsPDF): void {
  doc.setFont(PDF_CONFIG.FONT_FAMILY, 'normal');
  doc.setFontSize(PDF_CONFIG.BODY_FONT_SIZE);
  doc.setTextColor(...PDF_CONFIG.TEXT_COLOR);
}

// Draw a pill tag (e.g., "Legal Document")
function drawTag(doc: jsPDF, label: string, x: number, y: number): void {
  doc.setFont(PDF_CONFIG.FONT_FAMILY, 'bold');
  doc.setFontSize(10);
  const paddingX = 4;
  const paddingY = 2.5;
  const textWidth = doc.getTextWidth(label);
  const width = textWidth + paddingX * 2;
  const height = 8 + (paddingY - 2.5); // approx 10-11px total height

  // Background
  doc.setFillColor(...PDF_CONFIG.TAG_BG);
  doc.setDrawColor(...PDF_CONFIG.TAG_BG);
  // roundedRect(x, y, w, h, rx, ry?, style?)
  // jsPDF supports roundedRect with radius param
  (doc as any).roundedRect?.(x, y - height + 9, width, height, 2, 2, 'F') || doc.rect(x, y - height + 9, width, height, 'F');

  // Text
  doc.setTextColor(...PDF_CONFIG.PRIMARY_COLOR);
  doc.text(label, x + paddingX, y);

  // Reset text color for subsequent text
  doc.setTextColor(...PDF_CONFIG.TEXT_COLOR);
}

// Add header with refined spacing and divider
function addHeader(doc: jsPDF, title: string): void {
  const brandY = 18;
  const tagY = brandY + 8;
  const titleY = PDF_CONFIG.TITLE_Y;

  // Brand
  doc.setFont(PDF_CONFIG.FONT_FAMILY, 'bold');
  doc.setFontSize(PDF_CONFIG.BRAND_FONT_SIZE);
  doc.setTextColor(...PDF_CONFIG.PRIMARY_COLOR);
  doc.text('WhizBoard', PDF_CONFIG.MARGIN, brandY);

  // Tag
  drawTag(doc, 'Legal Document', PDF_CONFIG.MARGIN, tagY);

  // Title
  doc.setFont(PDF_CONFIG.FONT_FAMILY, 'bold');
  doc.setFontSize(PDF_CONFIG.TITLE_FONT_SIZE);
  doc.setTextColor(...PDF_CONFIG.TEXT_COLOR);
  doc.text(title, PDF_CONFIG.MARGIN, titleY);

  // Subtle divider under header
  doc.setDrawColor(...PDF_CONFIG.DIVIDER_COLOR);
  doc.line(PDF_CONFIG.MARGIN, PDF_CONFIG.INFO_Y - 6, PDF_CONFIG.MARGIN + PDF_CONFIG.MAX_WIDTH, PDF_CONFIG.INFO_Y - 6);
}

// Add version and date info with better formatting
function addVersionInfo(doc: jsPDF, version?: string, effectiveDate?: string): void {
  if (version || effectiveDate) {
    doc.setFont(PDF_CONFIG.FONT_FAMILY, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    const infoParts: string[] = [];
    if (version) infoParts.push(`Version: ${version}`);
    if (effectiveDate) infoParts.push(`Effective Date: ${effectiveDate}`);
    
    const infoText = infoParts.join(' | ');
    doc.text(infoText, PDF_CONFIG.MARGIN, PDF_CONFIG.INFO_Y);
    
    // Divider already drawn in header; keep info cleanly separated
  }
}

// Generate PDF document with improved design
export function generatePDF({
  title,
  content,
  version,
  effectiveDate
}: PDFOptions): jsPDF {
  const doc = new jsPDF();
  
  // Add header
  addHeader(doc, title);
  // Add version info
  addVersionInfo(doc, version, effectiveDate);
  // Content style baseline
  setBodyTextStyle(doc);
  
  let yPosition = PDF_CONFIG.CONTENT_START_Y;
  const paragraphs = convertMarkdownToPlainText(content).split('\n');
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      yPosition += PDF_CONFIG.LINE_HEIGHT * 0.5;
      continue;
    }
    
    const lines = splitTextIntoLines(doc, paragraph);
    
    for (const line of lines) {
      if (yPosition > PDF_CONFIG.PAGE_BREAK_Y) {
        doc.addPage();
        addHeader(doc, title);
        addVersionInfo(doc, version, effectiveDate);
        setBodyTextStyle(doc);
        yPosition = PDF_CONFIG.CONTENT_START_Y;
      }
      doc.text(line, PDF_CONFIG.MARGIN, yPosition);
      yPosition += PDF_CONFIG.LINE_HEIGHT;
    }
    yPosition += PDF_CONFIG.LINE_HEIGHT * 0.3;
  }
  
  // Add footer with Indian date format
  const pageCount = doc.getNumberOfPages();
  const generationDate = formatIndianDate(new Date());
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(PDF_CONFIG.FOOTER_FONT_SIZE);
    doc.setTextColor(150, 150, 150);
    doc.setDrawColor(...PDF_CONFIG.DIVIDER_COLOR);
    doc.line(PDF_CONFIG.MARGIN, PDF_CONFIG.FOOTER_Y - 5, PDF_CONFIG.MARGIN + PDF_CONFIG.MAX_WIDTH, PDF_CONFIG.FOOTER_Y - 5);
    doc.text(`Page ${i} of ${pageCount}`, PDF_CONFIG.MARGIN, PDF_CONFIG.FOOTER_Y);
    doc.text(`Generated on ${generationDate}`, 120, PDF_CONFIG.FOOTER_Y);
    doc.setFont(PDF_CONFIG.FONT_FAMILY, 'bold');
    doc.setTextColor(...PDF_CONFIG.PRIMARY_COLOR);
    doc.text('WhizBoard', PDF_CONFIG.MARGIN + 60, PDF_CONFIG.FOOTER_Y);
    setBodyTextStyle(doc);
  }
  
  return doc;
}

// Client-side download
export function downloadPDF(options: PDFOptions & { filename: string }): void {
  try {
    const doc = generatePDF(options);
    doc.save(options.filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF document');
  }
}

// Server-side buffer generation
export function generatePDFBuffer(options: PDFOptions): ArrayBuffer {
  const doc = generatePDF(options);
  return doc.output('arraybuffer');
}

// Utility for creating content from sections with better formatting
export function createContentFromSections(sections: Array<{ title: string; content: string }>): string {
  return sections.map(section => {
    const cleanContent = section.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    return `## ${section.title}\n\n${cleanContent}`;
  }).join('\n\n');
}
