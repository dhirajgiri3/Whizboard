import { NextRequest, NextResponse } from "next/server";

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  icon: string;
  isVisible: boolean;
  order: number;
}

// In-memory data store (replace with database in production)
let timelineEvents: TimelineEvent[] = [
  {
    id: "1",
    year: "2021",
    title: "The Spark",
    description: "Founded during a frustrating remote meeting when our whiteboard tool crashed in front of a major client.",
    icon: "Sparkles",
    isVisible: true,
    order: 1
  },
  {
    id: "2",
    year: "2022", 
    title: "First 100 Teams",
    description: "Achieved lightning-fast real-time sync and gained our first 100 passionate user teams.",
    icon: "Users",
    isVisible: true,
    order: 2
  },
  {
    id: "3",
    year: "2023",
    title: "Enterprise Ready",
    description: "Launched enterprise security features and reached 1,000+ teams with SOC 2 compliance.",
    icon: "Shield",
    isVisible: true,
    order: 3
  },
  {
    id: "4",
    year: "2024",
    title: "AI-Powered Future",
    description: "Currently developing AI features to make collaboration even more intelligent and intuitive.",
    icon: "Zap",
    isVisible: true,
    order: 4
  }
];

// GET handler - Retrieve all visible timeline events
export async function GET(req: NextRequest) {
  try {
    // Return only visible events, sorted by order
    const visibleEvents = timelineEvents
      .filter(event => event.isVisible)
      .sort((a, b) => a.order - b.order);
    
    return NextResponse.json(visibleEvents, { status: 200 });
  } catch (error) {
    console.error('Error retrieving timeline events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler - Add a new timeline event (admin only)
export async function POST(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Parse request body
    const newEvent = await req.json();
    
    // Validate required fields
    if (!newEvent.year || !newEvent.title || !newEvent.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate ID and set defaults
    const eventId = Date.now().toString();
    const event: TimelineEvent = {
      id: eventId,
      year: newEvent.year,
      title: newEvent.title,
      description: newEvent.description,
      icon: newEvent.icon || "Sparkles",
      isVisible: newEvent.isVisible ?? true,
      order: newEvent.order || timelineEvents.length + 1
    };
    
    // Add to collection
    timelineEvents.push(event);
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error adding timeline event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT handler - Update a timeline event (admin only)
export async function PUT(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Parse request body
    const updates = await req.json();
    
    // Validate ID
    if (!updates.id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    // Find the event
    const eventIndex = timelineEvents.findIndex(e => e.id === updates.id);
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Timeline event not found' },
        { status: 404 }
      );
    }
    
    // Update event properties
    const updatedEvent = {
      ...timelineEvents[eventIndex],
      ...updates,
      id: timelineEvents[eventIndex].id // Ensure ID doesn't change
    };
    
    // Replace in array
    timelineEvents[eventIndex] = updatedEvent;
    
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error('Error updating timeline event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE handler - Remove a timeline event (admin only)
export async function DELETE(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Get ID from URL
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    // Find the event
    const eventIndex = timelineEvents.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Timeline event not found' },
        { status: 404 }
      );
    }
    
    // Soft delete (mark as not visible)
    timelineEvents[eventIndex].isVisible = false;
    
    return NextResponse.json(
      { success: true, message: 'Timeline event removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing timeline event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
