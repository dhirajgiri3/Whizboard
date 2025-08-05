import { NextRequest, NextResponse } from "next/server";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  type: 'general' | 'support' | 'sales' | 'partnership';
  status: 'new' | 'in-progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

// In-memory data store (replace with database in production)
let contactSubmissions: ContactSubmission[] = [];

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const formData = await req.json();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Create submission record
    const now = new Date().toISOString();
    const submission: ContactSubmission = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      company: formData.company || undefined,
      subject: formData.subject,
      message: formData.message,
      type: formData.type || 'general',
      status: 'new',
      createdAt: now,
      updatedAt: now
    };
    
    // Add to collection
    contactSubmissions.push(submission);
    
    // In a real app, you would:
    // 1. Store in database
    // 2. Send notification email to admin
    // 3. Send confirmation email to user
    
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      id: submission.id
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // In a real app, you'd check for admin authentication
    // For demo purposes, we'll allow access
    
    // Get any query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    
    // Filter submissions if status or type is provided
    let filteredSubmissions = [...contactSubmissions];
    
    if (status) {
      filteredSubmissions = filteredSubmissions.filter(
        submission => submission.status === status
      );
    }
    
    if (type) {
      filteredSubmissions = filteredSubmissions.filter(
        submission => submission.type === type
      );
    }
    
    // Sort by most recent first
    filteredSubmissions.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return NextResponse.json(filteredSubmissions, { status: 200 });
  } catch (error) {
    console.error('Error retrieving contact submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH handler - Update submission status (admin only)
export async function PATCH(req: NextRequest) {
  try {
    // In a real app, you'd check for admin authentication
    
    // Parse request body
    const updates = await req.json();
    
    // Validate ID
    if (!updates.id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }
    
    // Find the submission
    const submissionIndex = contactSubmissions.findIndex(s => s.id === updates.id);
    if (submissionIndex === -1) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }
    
    // Update status if provided and valid
    if (updates.status && ['new', 'in-progress', 'resolved'].includes(updates.status)) {
      contactSubmissions[submissionIndex].status = updates.status;
      contactSubmissions[submissionIndex].updatedAt = new Date().toISOString();
    } else if (updates.status) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(contactSubmissions[submissionIndex], { status: 200 });
  } catch (error) {
    console.error('Error updating submission status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
