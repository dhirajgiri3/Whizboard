import { NextRequest, NextResponse } from 'next/server';

interface IntegrationStatus {
  googleDrive: boolean;
  slack: boolean;
  microsoft: boolean;
  github: boolean;
  figma: boolean;
}

let integrations: IntegrationStatus = {
  googleDrive: false,
  slack: false,
  microsoft: false,
  github: false,
  figma: false,
};

export async function GET() {
  return NextResponse.json(integrations);
}

export async function PUT(req: NextRequest) {
  const updates: Partial<IntegrationStatus> = await req.json();
  integrations = { ...integrations, ...updates };
  return NextResponse.json(integrations);
} 