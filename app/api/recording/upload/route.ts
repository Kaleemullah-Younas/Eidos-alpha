import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSession, createSession, hasSession } from '@/lib/sessions';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get('sessionId') as string;
    const timestamp = formData.get('timestamp') as string;
    const transcript = formData.get('transcript') as string;
    const frame = formData.get('frame') as File | null;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get or create session
    if (!hasSession(sessionId)) {
      createSession(sessionId);
    }

    const session = getSession(sessionId)!;

    // Save frame if provided
    if (frame) {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      const filename = `frame_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.jpg`;
      const filepath = path.join(uploadsDir, filename);

      const bytes = await frame.arrayBuffer();
      await fs.writeFile(filepath, Buffer.from(bytes));

      console.log(`✅ Frame uploaded: ${filename}`);

      session.frames.push({
        path: filepath,
        filename,
        timestamp: parseInt(timestamp || '0'),
      });
    }

    // Save transcript if provided
    if (transcript) {
      session.transcripts.push({
        text: transcript,
        timestamp: parseInt(timestamp || '0'),
      });
    }

    return NextResponse.json({
      success: true,
      frameCount: session.frames.length,
      transcriptCount: session.transcripts.length,
    });
  } catch (error) {
    console.error('Error uploading frame:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
