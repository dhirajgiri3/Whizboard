import { NextRequest, NextResponse } from "next/server";

interface ContactOffice {
  id: string;
  city: string;
  address: string;
  coordinates: string;
  timezone: string;
  isHeadquarters?: boolean;
  isVisible: boolean;
  order: number;
}

// In-memory data store (replace with database in production)
let contactOffices: ContactOffice[] = [
  {
    id: "1",
    city: "San Francisco",
    address: "123 Market Street, Suite 456",
    coordinates: "San Francisco, CA 94102",
    timezone: "PST (UTC-8)",
    isHeadquarters: true,
    isVisible: true,
    order: 1
  },
  {
    id: "2",
    city: "New York",
    address: "456 Fifth Avenue, 12th Floor", 
    coordinates: "New York, NY 10018",
    timezone: "EST (UTC-5)",
    isHeadquarters: false,
    isVisible: true,
    order: 2
  },
  {
    id: "3",
    city: "London",
    address: "789 Oxford Street, Level 3",
    coordinates: "London, UK W1C 1DX", 
    timezone: "GMT (UTC+0)",
    isHeadquarters: false,
    isVisible: true,
    order: 3
  }
];

// GET handler - Retrieve all visible offices
export async function GET(req: NextRequest) {
  try {
    // Return only visible offices, sorted by order
    const visibleOffices = contactOffices
      .filter(office => office.isVisible)
      .sort((a, b) => a.order - b.order);
    
    return NextResponse.json(visibleOffices, { status: 200 });
  } catch (error) {
    console.error('Error retrieving offices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler - Add a new office (admin only)
export async function POST(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Parse request body
    const newOffice = await req.json();
    
    // Validate required fields
    if (!newOffice.city || !newOffice.address || !newOffice.coordinates || !newOffice.timezone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate ID and set defaults
    const officeId = Date.now().toString();
    const office: ContactOffice = {
      id: officeId,
      city: newOffice.city,
      address: newOffice.address,
      coordinates: newOffice.coordinates,
      timezone: newOffice.timezone,
      isHeadquarters: newOffice.isHeadquarters || false,
      isVisible: newOffice.isVisible ?? true,
      order: newOffice.order || contactOffices.length + 1
    };
    
    // Add to collection
    contactOffices.push(office);
    
    return NextResponse.json(office, { status: 201 });
  } catch (error) {
    console.error('Error adding office:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT handler - Update an office (admin only)
export async function PUT(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Parse request body
    const updates = await req.json();
    
    // Validate ID
    if (!updates.id) {
      return NextResponse.json(
        { error: 'Office ID is required' },
        { status: 400 }
      );
    }
    
    // Find the office
    const officeIndex = contactOffices.findIndex(o => o.id === updates.id);
    if (officeIndex === -1) {
      return NextResponse.json(
        { error: 'Office not found' },
        { status: 404 }
      );
    }
    
    // Update office properties
    const updatedOffice = {
      ...contactOffices[officeIndex],
      ...updates,
      id: contactOffices[officeIndex].id // Ensure ID doesn't change
    };
    
    // Replace in array
    contactOffices[officeIndex] = updatedOffice;
    
    return NextResponse.json(updatedOffice, { status: 200 });
  } catch (error) {
    console.error('Error updating office:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE handler - Remove an office (admin only)
export async function DELETE(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Get ID from URL
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Office ID is required' },
        { status: 400 }
      );
    }
    
    // Find the office
    const officeIndex = contactOffices.findIndex(o => o.id === id);
    if (officeIndex === -1) {
      return NextResponse.json(
        { error: 'Office not found' },
        { status: 404 }
      );
    }
    
    // Soft delete (mark as not visible)
    contactOffices[officeIndex].isVisible = false;
    
    return NextResponse.json(
      { success: true, message: 'Office removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing office:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
