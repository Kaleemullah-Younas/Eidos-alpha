import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { notes, sessionId } = await request.json();

    if (!notes) {
      return NextResponse.json({ error: 'Notes required' }, { status: 400 });
    }

    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    await fs.mkdir(downloadsDir, { recursive: true });

    const base = `notes_${sessionId || Date.now()}_${Date.now()}`;
    const mdFile = path.join(downloadsDir, `${base}.md`);

    await fs.writeFile(mdFile, notes);

    return NextResponse.json({
      success: true,
      markdownUrl: `/downloads/${base}.md`,
      message: 'Markdown generated successfully.',
    });
  } catch (error) {
    console.error('❌ Error saving notes:', error);
    return NextResponse.json(
      { error: 'Failed to save notes', details: (error as Error).message },
      { status: 500 }
    );
  }
}
