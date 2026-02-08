import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * ──────────────────────────────────────────────────────────────
 * GEMINI 3 INTEGRATION – AI Tutor endpoint
 * ──────────────────────────────────────────────────────────────
 * Powers the voice-activated AI Tutor feature. Sends the user's
 * spoken question + on-screen context to Gemini 3 and returns a
 * concise, spoken-style answer.
 * Model: process.env.MODEL (e.g. gemini-3-flash-preview)
 * Key:   process.env.GOOGLE_API_KEY
 * ──────────────────────────────────────────────────────────────
 */
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: process.env.MODEL! });

    const prompt = `You are an expert AI Tutor within the Eidos learning platform.
    
    Current Context (The user is looking at this content right now):
    "${context || 'No specific visual context provided.'}"

    User's Question (Spoken): "${question}"

    Your Goal:
    - Answer the question clearly and concisely (spoken response).
    - Use the provided context to give relevant answers.
    - If the user asks about something on the screen, refer to the 'Current Context'.
    - Keep the response short (under 3-4 sentences) as it will be spoken out loud.
    - Be encouraging and friendly.
    
    Response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Tutor error:', error);
    return NextResponse.json(
      { error: 'Failed to get tutor response' },
      { status: 500 }
    );
  }
}
