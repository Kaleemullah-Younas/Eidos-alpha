import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * ──────────────────────────────────────────────────────────────
 * GEMINI 3 INTEGRATION – Document Upload & Analysis
 * ──────────────────────────────────────────────────────────────
 * Uses Gemini 3's multimodal (vision) capabilities to extract
 * and structure educational content from uploaded PDFs / images.
 * Model: process.env.MODEL (e.g. gemini-3-flash-preview)
 * Key:   process.env.GOOGLE_API_KEY
 * ──────────────────────────────────────────────────────────────
 */
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Supported MIME types for Gemini Vision
const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || 'Uploaded Document';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate file type
    if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: `Unsupported file type: ${
            file.type
          }. Supported: ${SUPPORTED_MIME_TYPES.join(', ')}`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Read file as base64
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');

    console.log(`📄 Processing uploaded file: ${file.name} (${file.type})`);
    console.log(`📊 File size: ${(bytes.byteLength / 1024).toFixed(2)} KB`);

    const model = genAI.getGenerativeModel({ model: process.env.MODEL! });

    const prompt = `You are an expert at extracting educational content from documents.

## Task
Analyze this ${
      file.type.includes('pdf') ? 'PDF document' : 'image'
    } and extract ALL educational content.

## Requirements
1. **Extract Everything**: Get all text, formulas, diagrams descriptions, tables
2. **Organize Logically**: Structure the content with clear headings
3. **Preserve Details**: Include all specific facts, numbers, definitions
4. **Describe Visuals**: If there are diagrams/charts, describe them in detail
5. **Maintain Context**: Keep related information together

## Output Format (Markdown)
- Use ## for main sections
- Use ### for subsections
- Use bullet points for lists
- Use code blocks for formulas/equations
- Use tables where appropriate
- Use bold for key terms

## Important
- Be comprehensive - extract everything that could be useful for studying
- If text is unclear, make reasonable inferences
- Organize content even if the original is disorganized
- Include page references if multiple pages

Document title: "${title}"`;

    const parts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      },
    ];

    // Stream the response
    const result = await model.generateContentStream(parts);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';

          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;

            const data = JSON.stringify({
              chunk: text,
              done: false,
              progress: Math.min(
                95,
                Math.floor((fullText.length / 5000) * 100),
              ),
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          const finalData = JSON.stringify({
            chunk: '',
            done: true,
            content: fullText,
            title,
            fileType: file.type,
            fileName: file.name,
            progress: 100,
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          controller.close();

          console.log(
            `✅ Document processed: ${fullText.length} characters extracted`,
          );
        } catch (error) {
          console.error('❌ Document processing error:', error);
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
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message || 'Failed to process upload',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

// Next.js App Router automatically handles multipart/form-data
// No additional config needed
