import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

async function callGeminiJSON(prompt: string) {
  const model = genAI.getGenerativeModel({
    model: process.env.MODEL!,
    generationConfig: { responseMimeType: 'application/json' },
  });

  const result = await model.generateContent([{ text: prompt }]);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Gemini did not return valid JSON: ' + text.slice(0, 400));
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      text = '',
      count = 8,
      difficulty = 'Medium',
      qtype = 'Multiple Choice',
    } = await request.json();

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Study text is required' },
        { status: 400 }
      );
    }

    const prompt = `
You are a tutor. Create a ${qtype} quiz from the given study material.
Difficulty: ${difficulty}. Number of questions: ${count}.

Return STRICT JSON matching exactly:
{
  "quiz": [
    {
      "question": "string",
      "choices": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string"
    }
  ]
}

Rules:
- choices must be 3–5 items
- correctIndex must be an integer pointing at the right choice
- no markdown, no prose, JSON ONLY.

Study material:
"""${text.slice(0, 8000)}"""`;

    const json = await callGeminiJSON(prompt);
    return NextResponse.json(json);
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
