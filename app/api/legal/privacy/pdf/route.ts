import { NextRequest, NextResponse } from "next/server";
import { generatePDFBuffer } from "@/lib/utils/pdfGenerator";
import { LEGAL_DOCUMENTS } from "@/lib/constants/legalDocuments";

export async function GET(req: NextRequest) {
  try {
    const { PRIVACY_POLICY } = LEGAL_DOCUMENTS;
    
    const pdfBuffer = generatePDFBuffer({
      title: PRIVACY_POLICY.title,
      content: PRIVACY_POLICY.content,
      version: PRIVACY_POLICY.version,
      effectiveDate: PRIVACY_POLICY.effectiveDate
    });
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="whizboard-privacy-policy.pdf"',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating privacy policy PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
