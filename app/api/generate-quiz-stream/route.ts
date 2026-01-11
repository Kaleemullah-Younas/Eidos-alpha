import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const {
      text = '',
      count = 8,
      difficulty = 'Medium',
    } = await request.json();

    if (!text.trim()) {
      return new Response(JSON.stringify({ error: 'Study text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const model = genAI.getGenerativeModel({
      model: process.env.MODEL!,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `You are an expert educator creating a challenging quiz to test student understanding.

## Task
Create exactly ${count} multiple-choice questions from the study material below.
Difficulty: ${difficulty}

## Question Guidelines
- Test understanding, not just memorization
- Include questions that require applying concepts
- Mix factual recall with analytical questions
- For ${difficulty} difficulty:
  ${
    difficulty === 'Easy'
      ? '- Focus on basic definitions and straightforward facts'
      : ''
  }
  ${
    difficulty === 'Medium'
      ? '- Balance definitions with application questions'
      : ''
  }
  ${
    difficulty === 'Hard'
      ? '- Focus on nuanced understanding, edge cases, and application'
      : ''
  }

## Response Format (JSON only)
{
  "quiz": [
    {
      "question": "Clear, specific question text",
      "choices": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation of why this answer is correct and others are wrong"
    }
  ]
}

## Rules
- Exactly ${count} questions
- Each question must have 4 choices
- correctIndex is 0-based (0, 1, 2, or 3)
- Explanations should be educational
- No markdown, JSON only

## Study Material
"""
${text.slice(0, 12000)}
"""`;

    console.log(`🧠 Generating ${count} quiz questions (${difficulty})...`);

    // Stream the response for real-time feedback
    const result = await model.generateContentStream([{ text: prompt }]);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';

          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;

            // Send progress updates
            const data = JSON.stringify({
              chunk: text,
              done: false,
              progress: Math.min(
                95,
                Math.floor((fullText.length / 2000) * 100)
              ),
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Parse the complete JSON
          let quiz;
          try {
            const parsed = JSON.parse(fullText);
            quiz = parsed.quiz || parsed;
          } catch (parseError) {
            // Try to extract JSON from the response
            const jsonMatch = fullText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              quiz = parsed.quiz || parsed;
            } else {
              throw new Error('Invalid JSON response from AI');
            }
          }

          // Send completion with parsed data
          const finalData = JSON.stringify({
            chunk: '',
            done: true,
            quiz,
            progress: 100,
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          controller.close();

          console.log(`✅ Generated ${quiz.length} questions`);
        } catch (error) {
          console.error('❌ Quiz generation error:', error);
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
    console.error('Quiz generation error:', error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message || 'Failed to generate quiz',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
