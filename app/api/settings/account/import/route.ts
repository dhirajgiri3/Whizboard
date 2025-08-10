import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.json') && !file.name.endsWith('.zip')) {
      return NextResponse.json({ error: 'Invalid file type. Only JSON and ZIP files are supported.' }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();
    let importData;

    try {
      importData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }

    // Validate import data structure
    if (!importData.version || !importData.exportedAt) {
      return NextResponse.json({ error: 'Invalid export format' }, { status: 400 });
    }

    // Basic import: upsert settings and append boards owned by user
    const db = await connectToDatabase();
    const userEmail = session.user.email;

    let importedBoards = 0;
    if (Array.isArray(importData.boards)) {
      for (const b of importData.boards) {
        try {
          await db.collection('boards').insertOne({ ...b, ownerEmail: userEmail });
          importedBoards++;
        } catch {}
      }
    }

    let importedSettings = 0;
    if (importData.settings) {
      await db.collection('userSettings').updateOne(
        { userEmail },
        { $set: { ...importData.settings, userEmail, updatedAt: new Date() } },
        { upsert: true }
      );
      importedSettings = 1;
    }

    let importedIntegrations = 0;
    if (Array.isArray(importData.integrations)) {
      for (const token of importData.integrations) {
        await db.collection('integrationTokens').updateOne(
          { userEmail, provider: token.provider },
          { $set: { ...token, userEmail, updatedAt: new Date() } },
          { upsert: true }
        );
        importedIntegrations++;
      }
    }

    const importResult = {
      success: true,
      importedBoards,
      importedSettings,
      importedIntegrations,
      importedHistory: Array.isArray(importData.history) ? importData.history.length : 0,
      conflicts: [],
      warnings: []
    };

    return NextResponse.json(importResult);
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    );
  }
}
