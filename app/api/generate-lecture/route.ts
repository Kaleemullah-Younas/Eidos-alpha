import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * ──────────────────────────────────────────────────────────────
 * GEMINI 3 INTEGRATION – Written Lecture Generation
 * ──────────────────────────────────────────────────────────────
 * Streams a comprehensive written lecture on any topic using
 * Gemini 3. Output is Markdown-formatted educational content.
 * Model: process.env.MODEL (e.g. gemini-3-flash-preview)
 * Key:   process.env.GOOGLE_API_KEY
 * ──────────────────────────────────────────────────────────────
 */
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { topic, duration = '3-5' } = await request.json();

    if (!topic?.trim()) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`\n📚 Generating written lecture on: "${topic}"`);
    console.log(`⏱️ Target duration: ${duration} minutes`);

    const model = genAI.getGenerativeModel({ model: process.env.MODEL! });

    const prompt = `You are a world-class professor and educational content creator. Create a comprehensive, engaging written lecture on the following topic.

## Topic: ${topic}

## Requirements:
- Target reading time: ${duration} minutes (approximately ${
      parseInt(duration) * 200
    }-${parseInt(duration) * 250} words)
- Write in an engaging, conversational yet educational tone
- Structure the content for optimal learning and retention

## Lecture Structure (use Markdown formatting):

### 1. Title & Introduction
- Compelling title
- Hook to grab attention
- Brief overview of what will be covered
- Why this topic matters (real-world relevance)

### 2. Learning Objectives
- 3-5 clear, measurable objectives
- What the student will understand after this lecture

### 3. Main Content
- Break into 3-5 major sections
- Each section should have:
  - Clear heading
  - Key concepts explained simply
  - Examples and analogies
  - Important terms in **bold**
  - Formulas/code in \`code blocks\`

### 4. EMBEDDED QUIZZES (IMPORTANT!)
After each major section, include an EMBEDDED QUIZ to test understanding of what was JUST covered.
Use this EXACT format:

:::quiz
question: [Question about the content BEFORE this quiz, not after]
options: A) [Option 1]|B) [Option 2]|C) [Option 3]|D) [Option 4]
answer: [Correct letter: A, B, C, or D]
explanation: [Brief explanation of why this is correct]
:::

Include 3-4 quizzes throughout the lecture, placed AFTER the content they test.

### 5. Key Takeaways
- Summarize the most important points
- Use bullet points for clarity

### 6. Further Reading
- Suggest 2-3 topics for deeper exploration
- How this connects to related subjects

## Formatting Guidelines:
- Use proper Markdown: #, ##, ###, **, *, \`, \`\`\`, >, -
- Include blockquotes for important definitions
- Use tables where appropriate
- Add horizontal rules (---) between major sections
- For math equations, use LaTeX: $inline$ or $$block$$
- For code, specify language: \`\`\`python

## Example Quiz Placement:
After explaining photosynthesis:

:::quiz
question: What is the primary purpose of chlorophyll in photosynthesis?
options: A) To absorb water|B) To absorb light energy|C) To release oxygen|D) To store glucose
answer: B
explanation: Chlorophyll absorbs light energy, particularly from the blue and red parts of the spectrum, which powers the photosynthesis process.
:::

Generate the complete lecture now with embedded quizzes and visual descriptions:`;

    // Stream the response
    const result = await model.generateContentStream([{ text: prompt }]);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';

          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullContent += text;

            const data = JSON.stringify({
              chunk: text,
              done: false,
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          const finalData = JSON.stringify({
            chunk: '',
            done: true,
            content: fullContent,
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          controller.close();

          console.log(
            `✅ Written lecture generated: ${fullContent.length} chars`,
          );
        } catch (error) {
          console.error('❌ Lecture generation error:', error);
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
    console.error('Lecture generation error:', error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message || 'Failed to generate lecture',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
