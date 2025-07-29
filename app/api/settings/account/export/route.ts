import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // In a real application, you would fetch and package user data.
  // For this mock, return some sample data.
  const userData = {
    userId: 'user_123',
    email: 'user@example.com',
    boards: [
      { id: 'board1', name: 'Project Alpha', elements: 120 },
      { id: 'board2', name: 'Brainstorming Session', elements: 80 },
    ],
    settings: {
      theme: 'dark',
      notifications: { email: { updates: true } }
    },
    // ... more user data
  };

  return NextResponse.json(userData);
} 