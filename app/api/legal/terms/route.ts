import { NextRequest, NextResponse } from "next/server";

interface LegalDocument {
  id: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: string;
  isLatest: boolean;
}

// In-memory data store (replace with database in production)
let termsDocuments: LegalDocument[] = [
  {
    id: "1",
    title: "Terms of Service",
    content: `
      # TERMS OF SERVICE

      ## 1. ACCEPTANCE OF TERMS

      By accessing and using the services provided by WhizBoard ("the Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing the Service.

      ## 2. USE LICENSE

      Permission is granted to temporarily use the Service for personal, non-commercial or business purposes, subject to the restrictions specified in these Terms of Service. This license shall automatically terminate if you violate any of these restrictions.

      ## 3. INTELLECTUAL PROPERTY

      The Service and its original content, features, and functionality are and will remain the exclusive property of WhizBoard. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.

      ## 4. USER ACCOUNTS

      You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account.

      ## 5. LIMITATION OF LIABILITY

      In no event shall WhizBoard be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.

      ## 6. GOVERNING LAW

      These Terms shall be governed by and defined following the laws of the United States and the State of California.

      ## 7. CHANGES TO TERMS

      WhizBoard reserves the right, at its sole discretion, to modify or replace these Terms at any time. It is your responsibility to check the Terms periodically for changes.

      ## 8. CONTACT US

      If you have any questions about these Terms, please contact us at legal@whizboard.com.

      Last updated: July 01, 2024
    `,
    version: "1.0",
    effectiveDate: "2024-07-01",
    isLatest: true
  }
];

// GET handler - Retrieve the current (latest) terms of service
export async function GET(req: NextRequest) {
  try {
    // Get any query parameters
    const url = new URL(req.url);
    const version = url.searchParams.get('version');
    
    if (version) {
      // Return specific version if requested
      const specificVersion = termsDocuments.find(doc => doc.version === version);
      
      if (!specificVersion) {
        return NextResponse.json(
          { error: 'Version not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(specificVersion, { status: 200 });
    } else {
      // Return the latest version by default
      const latestTerms = termsDocuments.find(doc => doc.isLatest === true);
      
      if (!latestTerms) {
        return NextResponse.json(
          { error: 'No terms document found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(latestTerms, { status: 200 });
    }
  } catch (error) {
    console.error('Error retrieving terms of service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler - Add a new version of the terms of service (admin only)
export async function POST(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Parse request body
    const newTerms = await req.json();
    
    // Validate required fields
    if (!newTerms.title || !newTerms.content || !newTerms.version || !newTerms.effectiveDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if version already exists
    const versionExists = termsDocuments.some(doc => doc.version === newTerms.version);
    if (versionExists) {
      return NextResponse.json(
        { error: 'Version already exists' },
        { status: 409 }
      );
    }
    
    // If new version will be the latest, update existing documents
    if (newTerms.isLatest) {
      termsDocuments = termsDocuments.map(doc => ({
        ...doc,
        isLatest: false
      }));
    }
    
    // Generate ID and create new document
    const documentId = Date.now().toString();
    const document: LegalDocument = {
      id: documentId,
      title: newTerms.title,
      content: newTerms.content,
      version: newTerms.version,
      effectiveDate: newTerms.effectiveDate,
      isLatest: newTerms.isLatest ?? false
    };
    
    // Add to collection
    termsDocuments.push(document);
    
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error adding terms document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET handler for retrieving all versions
export async function HEAD(req: NextRequest) {
  try {
    // Return just the versions and dates
    const versions = termsDocuments.map(doc => ({
      version: doc.version,
      effectiveDate: doc.effectiveDate,
      isLatest: doc.isLatest
    }));
    
    return NextResponse.json(versions, { status: 200 });
  } catch (error) {
    console.error('Error retrieving terms versions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
