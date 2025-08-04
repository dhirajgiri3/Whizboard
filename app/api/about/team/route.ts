import { NextRequest, NextResponse } from 'next/server';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
  isActive: boolean;
  order: number;
}

// Solo founder data
let teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Dhiraj Giri",
    role: "Solo Founder & Everything Else",
    bio: "The one-man army behind Whizboard. Building, designing, marketing, and occasionally remembering to eat. Formerly lost in corporate meetings, now happily lost in code. When not debugging at 3 AM, you'll find me explaining to my cat why the API is down.",
    avatar: "https://res.cloudinary.com/dgak25skk/image/upload/v1754345951/dhiraj-st3-mini_eq3fmn.png",
    social: {
      linkedin: "https://linkedin.com/in/dhirajgiri",
      twitter: "https://twitter.com/dhirajgiri",
      github: "https://github.com/dhirajgiri",
      email: "dhiraj@whizboard.com"
    },
    isActive: true,
    order: 1
  }
];

// GET handler - Retrieve all active team members
export async function GET(req: NextRequest) {
  try {
    // Filter only active team members and sort by order
    const activeMembers = teamMembers
      .filter(member => member.isActive)
      .sort((a, b) => a.order - b.order);

    return NextResponse.json(activeMembers, { status: 200 });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST handler - Add new team member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newMember: TeamMember = {
      id: Date.now().toString(),
      ...body,
      isActive: true,
      order: teamMembers.length + 1
    };

    teamMembers.push(newMember);
    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}

// PUT handler - Update team member
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    const memberIndex = teamMembers.findIndex(member => member.id === id);
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    teamMembers[memberIndex] = { ...teamMembers[memberIndex], ...updates };
    return NextResponse.json(teamMembers[memberIndex], { status: 200 });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// DELETE handler - Deactivate team member
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      );
    }

    const memberIndex = teamMembers.findIndex(member => member.id === id);
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    teamMembers[memberIndex].isActive = false;
    return NextResponse.json(
      { message: 'Team member deactivated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deactivating team member:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate team member' },
      { status: 500 }
    );
  }
}
