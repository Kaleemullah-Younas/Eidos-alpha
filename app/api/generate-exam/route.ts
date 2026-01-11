import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExamQuestion } from '@/lib/courseStorage';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Generate unique ID
function generateId(): string {
    return `exam_q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function POST(request: NextRequest) {
    try {
        const { courseTitle, chapters } = await request.json();

        if (!courseTitle) {
            return NextResponse.json({ error: 'Course title is required' }, { status: 400 });
        }

        console.log(`\n📝 Generating final exam for: "${courseTitle}"`);

        const model = genAI.getGenerativeModel({ model: process.env.MODEL! });

        // Build context from chapters
        const chapterContext = chapters?.map((ch: { title: string; lessons: { title: string }[] }, idx: number) =>
            `Chapter ${idx + 1}: ${ch.title}\n  Lessons: ${ch.lessons.map((l: { title: string }) => l.title).join(', ')}`
        ).join('\n') || '';

        const prompt = `You are an expert educator creating a comprehensive final exam for a course.

## Course: ${courseTitle}

## Course Chapters:
${chapterContext}

## Requirements:
- Create 10-15 multiple choice questions
- Questions should cover key concepts from ALL chapters
- Mix of difficulty levels (easy, medium, hard)
- Each question should have exactly 4 options
- Only ONE correct answer per question
- Questions should test understanding, not just memorization

## Return JSON in this exact format:
{
  "questions": [
    {
      "question": "The question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}

Generate the exam questions now:`;

        const result = await model.generateContent([{ text: prompt }]);
        const responseText = result.response.text();

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse exam questions');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Add IDs to questions
        const questions: ExamQuestion[] = parsed.questions.map((q: Omit<ExamQuestion, 'id'>) => ({
            id: generateId(),
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex
        }));

        return NextResponse.json({
            success: true,
            questions,
            message: 'Exam questions generated successfully'
        });

    } catch (error) {
        console.error('Exam generation error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to generate exam' },
            { status: 500 }
        );
    }
}
