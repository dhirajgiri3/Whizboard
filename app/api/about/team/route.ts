import { NextRequest, NextResponse } from "next/server";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  isActive: boolean;
  order: number;
}

// In-memory data store (replace with database in production)
let teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "CEO & Co-founder",
    bio: "Former design lead at Figma with 8+ years building collaborative tools that teams actually love to use.",
    avatar: "/api/placeholder/100/100",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "sarah@whizboard.com"
    },
    isActive: true,
    order: 1
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    role: "CTO & Co-founder", 
    bio: "Ex-Google engineer specializing in real-time systems. Built the infrastructure powering millions of collaborative sessions.",
    avatar: "/api/placeholder/100/100",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "marcus@whizboard.com"
    },
    isActive: true,
    order: 2
  },
  {
    id: "3",
    name: "Alex Kumar",
    role: "Head of Product",
    bio: "Product strategist from Slack, obsessed with creating intuitive experiences that make remote work feel seamless.",
    avatar: "/api/placeholder/100/100",
    social: {
      linkedin: "#",
      email: "alex@whizboard.com"
    },
    isActive: true,
    order: 3
  },
  {
    id: "4",
    name: "Emma Thompson",
    role: "Lead Designer",
    bio: "Design systems expert from Airbnb. Crafts beautiful, accessible interfaces that work perfectly across all devices.",
    avatar: "/api/placeholder/100/100",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "emma@whizboard.com"
    },
    isActive: true,
    order: 4
  }
];

// GET handler - Retrieve all active team members
export async function GET(req: NextRequest) {
  try {
    // Return only active team members, sorted by order
    const activeTeamMembers = teamMembers
      .filter(member => member.isActive)
      .sort((a, b) => a.order - b.order);
    
    return NextResponse.json(activeTeamMembers, { status: 200 });
  } catch (error) {
    console.error('Error retrieving team members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler - Add a new team member (admin only)
export async function POST(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    // For this example, we're allowing all POST requests
    
    // Parse request body
    const newMember = await req.json();
    
    // Validate required fields
    if (!newMember.name || !newMember.role || !newMember.bio) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate ID and set defaults
    const memberId = Date.now().toString();
    const member: TeamMember = {
      id: memberId,
      name: newMember.name,
      role: newMember.role,
      bio: newMember.bio,
      avatar: newMember.avatar || `/api/placeholder/100/100`,
      social: newMember.social || {},
      isActive: newMember.isActive ?? true,
      order: newMember.order || teamMembers.length + 1
    };
    
    // Add to collection
    teamMembers.push(member);
    
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT handler - Update a team member (admin only)
export async function PUT(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Parse request body
    const updates = await req.json();
    
    // Validate ID
    if (!updates.id) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }
    
    // Find the member
    const memberIndex = teamMembers.findIndex(m => m.id === updates.id);
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }
    
    // Update member properties
    const updatedMember = {
      ...teamMembers[memberIndex],
      ...updates,
      id: teamMembers[memberIndex].id // Ensure ID doesn't change
    };
    
    // Replace in array
    teamMembers[memberIndex] = updatedMember;
    
    return NextResponse.json(updatedMember, { status: 200 });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE handler - Remove a team member (admin only)
export async function DELETE(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Get ID from URL
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }
    
    // Find the member
    const memberIndex = teamMembers.findIndex(m => m.id === id);
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }
    
    // Soft delete (mark as inactive)
    teamMembers[memberIndex].isActive = false;
    
    return NextResponse.json(
      { success: true, message: 'Team member removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
