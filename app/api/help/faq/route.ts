import { NextRequest, NextResponse } from "next/server";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isVisible: boolean;
  order: number;
}

// In-memory data store (replace with database in production)
const faqItems: FaqItem[] = [
  {
    id: "1",
    question: "How quickly do you respond to support requests?",
    answer: "We respond to all support requests within 24 hours. For enterprise customers, we offer priority support with response times under 4 hours.",
    category: "Support",
    isVisible: true,
    order: 1
  },
  {
    id: "2",
    question: "Do you offer phone support?",
    answer: "Yes! Phone support is available for Pro and Enterprise customers. We're available during business hours across all major time zones.",
    category: "Support",
    isVisible: true,
    order: 2
  },
  {
    id: "3",
    question: "Can I schedule a demo of WhizBoard?",
    answer: "Absolutely! We offer personalized 15-minute demos where we'll show you exactly how WhizBoard works for your specific use case.",
    category: "Sales",
    isVisible: true,
    order: 3
  },
  {
    id: "4",
    question: "Do you have partnerships or integration opportunities?",
    answer: "We're always interested in strategic partnerships and integrations. Please reach out to our partnerships team for more information.",
    category: "Partnerships",
    isVisible: true,
    order: 4
  },
  {
    id: "5",
    question: "Is WhizBoard free to use?",
    answer: "WhizBoard offers a free tier for individuals and small teams. We also have Pro and Enterprise plans with additional features for larger teams and organizations.",
    category: "Pricing",
    isVisible: true,
    order: 5
  }
];

// GET handler - Retrieve FAQ items
export async function GET(req: NextRequest) {
  try {
    // Get any query parameters for filtering
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    
    // Filter items if category is provided
    let filteredItems = faqItems.filter(item => item.isVisible);
    
    if (category) {
      filteredItems = filteredItems.filter(item => 
        item.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Sort by order
    filteredItems.sort((a, b) => a.order - b.order);
    
    return NextResponse.json(filteredItems, { status: 200 });
  } catch (error) {
    console.error('Error retrieving FAQ items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler - Add a new FAQ item (admin only)
export async function POST(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Parse request body
    const newFaq = await req.json();
    
    // Validate required fields
    if (!newFaq.question || !newFaq.answer || !newFaq.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate ID and set defaults
    const faqId = Date.now().toString();
    const faq: FaqItem = {
      id: faqId,
      question: newFaq.question,
      answer: newFaq.answer,
      category: newFaq.category,
      isVisible: newFaq.isVisible ?? true,
      order: newFaq.order || faqItems.length + 1
    };
    
    // Add to collection
    faqItems.push(faq);
    
    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error('Error adding FAQ item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT handler - Update a FAQ item (admin only)
export async function PUT(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Parse request body
    const updates = await req.json();
    
    // Validate ID
    if (!updates.id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }
    
    // Find the FAQ item
    const faqIndex = faqItems.findIndex(f => f.id === updates.id);
    if (faqIndex === -1) {
      return NextResponse.json(
        { error: 'FAQ item not found' },
        { status: 404 }
      );
    }
    
    // Update FAQ properties
    const updatedFaq = {
      ...faqItems[faqIndex],
      ...updates,
      id: faqItems[faqIndex].id // Ensure ID doesn't change
    };
    
    // Replace in array
    faqItems[faqIndex] = updatedFaq;
    
    return NextResponse.json(updatedFaq, { status: 200 });
  } catch (error) {
    console.error('Error updating FAQ item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE handler - Remove a FAQ item (admin only)
export async function DELETE(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Get ID from URL
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }
    
    // Find the FAQ item
    const faqIndex = faqItems.findIndex(f => f.id === id);
    if (faqIndex === -1) {
      return NextResponse.json(
        { error: 'FAQ item not found' },
        { status: 404 }
      );
    }
    
    // Soft delete (mark as not visible)
    faqItems[faqIndex].isVisible = false;
    
    return NextResponse.json(
      { success: true, message: 'FAQ item removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing FAQ item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
