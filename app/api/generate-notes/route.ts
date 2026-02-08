import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import { getSession } from '@/lib/sessions';

/**
 * ──────────────────────────────────────────────────────────────
 * GEMINI 3 INTEGRATION – Note Generation
 * ──────────────────────────────────────────────────────────────
 * Takes captured lecture transcript + extracted frames and uses
 * Gemini 3 to produce structured Markdown study notes.
 * Model: process.env.MODEL (e.g. gemini-3-flash-preview)
 * Key:   process.env.GOOGLE_API_KEY
 * ──────────────────────────────────────────────────────────────
 */
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 },
      );
    }

    const session = getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    console.log(`\n📝 Generating notes for session ${sessionId}`);
    console.log(`📸 Total frames: ${session.frames.length}`);
    console.log(`🎤 Total transcripts: ${session.transcripts.length}`);

    const model = genAI.getGenerativeModel({ model: process.env.MODEL! });

    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [];

    parts.push({
      text: `You are an expert lecture note-taker. Analyze the following classroom lecture materials including screenshots and transcripts captured every 5 seconds during the lecture.

Your task is to:
1. Identify the main topics and subtopics covered
2. Extract key concepts, definitions, and formulas from the images
3. Organize the information chronologically and thematically
4. Create comprehensive, well-structured lecture notes in markdown format
5. Include any diagrams, equations, or important visual information described in text

Format your response as a complete markdown document with:
- A clear title
- Table of contents
- Main sections with headers (##)
- Subsections (###)
- Bullet points for key concepts
- Code blocks for any code or formulas
- Clear explanations

Here are the lecture materials:`,
    });

    // Add transcripts
    if (session.transcripts.length > 0) {
      const transcriptText = session.transcripts
        .map(t => `[${Math.floor(t.timestamp / 1000)}s] ${t.text}`)
        .join('\n\n');
      parts.push({ text: `\n\nTRANSCRIPTS:\n${transcriptText}` });
    }

    // Sample frames to avoid token limits (max 10 frames)
    const sampleFrames = session.frames
      .filter((_, i) => i % Math.ceil(session.frames.length / 10) === 0)
      .slice(0, 10);

    console.log(`📸 Sending ${sampleFrames.length} frames to Gemini...`);

    for (const frame of sampleFrames) {
      try {
        const imageData = await fs.readFile(frame.path);
        const base64Image = imageData.toString('base64');
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        });
        parts.push({
          text: `[Image at ${Math.floor(frame.timestamp / 1000)}s - ${
            frame.filename
          }]`,
        });
        console.log(`  ✅ Added: ${frame.filename}`);
      } catch (error) {
        console.error(`  ❌ Error reading frame ${frame.path}`);
      }
    }

    console.log('🚀 Sending to Gemini API...');
    const result = await model.generateContent(parts);
    const response = await result.response;
    const notes = response.text();

    console.log('✅ Notes generated successfully!');
    console.log(`📄 Notes length: ${notes.length} characters`);

    return NextResponse.json({ notes, sessionId });
  } catch (error) {
    console.error('❌ Error generating notes:', error);
    return NextResponse.json(
      { error: 'Failed to generate notes', details: (error as Error).message },
      { status: 500 },
    );
  }
}
