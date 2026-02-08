import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import { getSession } from '@/lib/sessions';

/**
 * ──────────────────────────────────────────────────────────────
 * GEMINI 3 INTEGRATION – Streaming Note Generation
 * ──────────────────────────────────────────────────────────────
 * Same as /api/generate-notes but streams the response via SSE
 * for a real-time generation experience in the UI.
 * Model: process.env.MODEL (e.g. gemini-3-flash-preview)
 * Key:   process.env.GOOGLE_API_KEY
 * ──────────────────────────────────────────────────────────────
 */
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const session = getSession(sessionId);

    if (!session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`\n📝 Generating notes for session ${sessionId}`);
    console.log(`📸 Total frames: ${session.frames.length}`);
    console.log(`🎤 Total transcripts: ${session.transcripts.length}`);

    const model = genAI.getGenerativeModel({ model: process.env.MODEL! });

    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [];

    parts.push({
      text: `You are an expert lecture note-taker with deep expertise in educational content analysis. 
      
Analyze the following classroom lecture materials including screenshots and transcripts captured during the lecture.

Your task is to create COMPREHENSIVE, DETAILED lecture notes that would help a student study for an exam.

## Requirements:
1. **Main Topics & Subtopics**: Identify and organize ALL topics covered
2. **Key Concepts**: Extract every definition, formula, theorem, or important concept
3. **Visual Content**: Describe any diagrams, charts, equations visible in images
4. **Examples**: Include any examples or case studies mentioned
5. **Connections**: Show how concepts relate to each other

## Format (Markdown):
- Clear, descriptive title
- Table of contents with links
- Main sections (##) for major topics
- Subsections (###) for subtopics
- Bullet points for key concepts
- Code blocks for formulas/equations
- Bold for important terms
- Blockquotes for direct quotes or definitions

## Important:
- Be thorough - these notes should be sufficient for exam preparation
- Include timestamps where relevant for reference
- If something is unclear in the image, make reasonable inferences
- Organize chronologically AND thematically

Here are the lecture materials:`,
    });

    // Add transcripts
    if (session.transcripts.length > 0) {
      const transcriptText = session.transcripts
        .map(t => `[${Math.floor(t.timestamp / 1000)}s] ${t.text}`)
        .join('\n\n');
      parts.push({ text: `\n\n## TRANSCRIPTS:\n${transcriptText}` });
    }

    // Sample frames (max 10 for token limits)
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
          text: `[Screenshot at ${Math.floor(frame.timestamp / 1000)}s]`,
        });
        console.log(`  ✅ Added: ${frame.filename}`);
      } catch (error) {
        console.error(`  ❌ Error reading frame ${frame.path}:`, error);
      }
    }

    console.log('🚀 Starting streaming response from Gemini...');

    // Use streaming for real-time feedback
    const result = await model.generateContentStream(parts);

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';

          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;

            // Send each chunk as a Server-Sent Event
            const data = JSON.stringify({ chunk: text, done: false });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Send completion signal with full text
          const finalData = JSON.stringify({
            chunk: '',
            done: true,
            notes: fullText,
            sessionId,
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          controller.close();

          console.log('✅ Streaming complete!');
          console.log(`📄 Total notes length: ${fullText.length} characters`);
        } catch (error) {
          console.error('❌ Streaming error:', error);
          const errorData = JSON.stringify({
            error: (error as Error).message,
            done: true,
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('❌ Error generating notes:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate notes',
        details: (error as Error).message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
