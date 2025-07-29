import { NextRequest, NextResponse } from 'next/server';

interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  colorMode: 'default' | 'colorblind' | 'high-contrast';
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  defaultViewMode: 'edit' | 'view' | 'present';
}

let displaySettings: DisplaySettings = {
  theme: 'system',
  colorMode: 'default',
  fontSize: 'medium',
  reducedMotion: false,
  defaultViewMode: 'edit',
};

export async function GET() {
  return NextResponse.json(displaySettings);
}

export async function PUT(req: NextRequest) {
  const updates: Partial<DisplaySettings> = await req.json();
  displaySettings = { ...displaySettings, ...updates };
  return NextResponse.json(displaySettings);
} 