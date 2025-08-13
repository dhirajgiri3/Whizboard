import { NextRequest, NextResponse } from "next/server";
import { generatePDFBuffer } from "@/lib/utils/pdfGenerator";
import { LEGAL_DOCUMENTS } from "@/lib/constants/legalDocuments";

export async function GET(req: NextRequest) {
  try {
    const { TERMS_OF_SERVICE } = LEGAL_DOCUMENTS;
    
    const pdfBuffer = generatePDFBuffer({
      title: TERMS_OF_SERVICE.title,
      content: TERMS_OF_SERVICE.content,
      version: TERMS_OF_SERVICE.version,
      effectiveDate: TERMS_OF_SERVICE.effectiveDate
    });
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="whizboard-terms-of-service.pdf"',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating terms of service PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
