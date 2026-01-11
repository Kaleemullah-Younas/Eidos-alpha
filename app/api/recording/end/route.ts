import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/sessions';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = getSession(sessionId);

    if (session) {
      console.log(
        `📹 Recording ended. Frames: ${session.frames.length}, Transcripts: ${session.transcripts.length}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending recording:', error);
    return NextResponse.json(
      { error: 'Failed to end recording' },
      { status: 500 }
    );
  }
}
