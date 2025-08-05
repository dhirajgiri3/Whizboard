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
let privacyDocuments: LegalDocument[] = [
  {
    id: "1",
    title: "Privacy Policy",
    content: `
      # PRIVACY POLICY

      ## 1. INTRODUCTION

      WhizBoard ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and use our services, and tell you about your privacy rights.

      ## 2. DATA WE COLLECT

      We may collect, use, store and transfer different kinds of personal data about you including:
      - Identity Data: name, username, or similar identifier
      - Contact Data: email address and telephone numbers
      - Technical Data: internet protocol (IP) address, browser type and version, time zone setting
      - Usage Data: information about how you use our website and services
      - Content Data: boards, drawings, and other content you create using our services

      ## 3. HOW WE USE YOUR DATA

      We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
      - To provide and maintain our service
      - To notify you about changes to our service
      - To allow you to participate in interactive features
      - To provide customer support
      - To gather analysis to improve our service
      - To monitor the usage of the service
      - To detect, prevent and address technical issues

      ## 4. DATA SHARING AND TRANSFERS

      We share your personal data with third parties to help us use your personal data, as described above. For example, we use cloud storage providers to store your content securely.

      ## 5. DATA SECURITY

      We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.

      ## 6. DATA RETENTION

      We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.

      ## 7. YOUR DATA RIGHTS

      Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to access, correct, erase, restrict, transfer, or object to processing of your personal data.

      ## 8. CHANGES TO THIS POLICY

      We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.

      ## 9. CONTACT US

      If you have any questions about this Privacy Policy, please contact us at privacy@whizboard.com.

      Last updated: July 01, 2024
    `,
    version: "1.0",
    effectiveDate: "2024-07-01",
    isLatest: true
  }
];

// GET handler - Retrieve the current (latest) privacy policy
export async function GET(req: NextRequest) {
  try {
    // Get any query parameters
    const url = new URL(req.url);
    const version = url.searchParams.get('version');
    
    if (version) {
      // Return specific version if requested
      const specificVersion = privacyDocuments.find(doc => doc.version === version);
      
      if (!specificVersion) {
        return NextResponse.json(
          { error: 'Version not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(specificVersion, { status: 200 });
    } else {
      // Return the latest version by default
      const latestPolicy = privacyDocuments.find(doc => doc.isLatest === true);
      
      if (!latestPolicy) {
        return NextResponse.json(
          { error: 'No privacy policy found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(latestPolicy, { status: 200 });
    }
  } catch (error) {
    console.error('Error retrieving privacy policy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler - Add a new version of the privacy policy (admin only)
export async function POST(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Parse request body
    const newPolicy = await req.json();
    
    // Validate required fields
    if (!newPolicy.title || !newPolicy.content || !newPolicy.version || !newPolicy.effectiveDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if version already exists
    const versionExists = privacyDocuments.some(doc => doc.version === newPolicy.version);
    if (versionExists) {
      return NextResponse.json(
        { error: 'Version already exists' },
        { status: 409 }
      );
    }
    
    // If new version will be the latest, update existing documents
    if (newPolicy.isLatest) {
      privacyDocuments = privacyDocuments.map(doc => ({
        ...doc,
        isLatest: false
      }));
    }
    
    // Generate ID and create new document
    const documentId = Date.now().toString();
    const document: LegalDocument = {
      id: documentId,
      title: newPolicy.title,
      content: newPolicy.content,
      version: newPolicy.version,
      effectiveDate: newPolicy.effectiveDate,
      isLatest: newPolicy.isLatest ?? false
    };
    
    // Add to collection
    privacyDocuments.push(document);
    
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error adding privacy document:', error);
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
    const versions = privacyDocuments.map(doc => ({
      version: doc.version,
      effectiveDate: doc.effectiveDate,
      isLatest: doc.isLatest
    }));
    
    return NextResponse.json(versions, { status: 200 });
  } catch (error) {
    console.error('Error retrieving privacy policy versions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
