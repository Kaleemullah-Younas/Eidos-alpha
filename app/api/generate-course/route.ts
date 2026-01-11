import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CourseOutline, Course, Chapter, Lesson, LessonType } from '@/lib/courseStorage';
import { generateVideoLectureContent } from '@/lib/videoLectureGenerator';
import { generateTextLectureContent } from '@/lib/textLectureGenerator';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Generate unique ID on server
function generateId(): string {
    return `course_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Create course structure from outline (no localStorage)
function buildCourseFromOutline(outline: CourseOutline): Course {
    const id = generateId();

    let totalDuration = 0;
    let totalLessons = 0;

    const chapters: Chapter[] = outline.chapters.map((ch, chIndex) => {
        let chapterDuration = 0;

        const lessons: Lesson[] = ch.lessons.map((l, lIndex) => {
            totalLessons++;
            chapterDuration += l.duration;
            totalDuration += l.duration;

            return {
                id: `${id}_ch${chIndex}_l${lIndex}`,
                title: l.title,
                type: l.type as LessonType,
                duration: l.duration,
                completed: false,
            };
        });

        return {
            id: `${id}_ch${chIndex}`,
            title: ch.title,
            description: ch.description,
            lessons,
            completed: false,
            duration: chapterDuration,
        };
    });

    return {
        id,
        title: outline.title,
        description: outline.description,
        createdAt: new Date(),
        updatedAt: new Date(),
        chapters,
        totalDuration,
        totalLessons,
        learningObjectives: outline.learningObjectives,
        prerequisites: outline.prerequisites,
        difficulty: outline.difficulty,
        completedLessons: 0,
        progressPercent: 0,
        currentChapter: 0,
        currentLesson: 0,
        certificateEarned: false,
        generationStatus: 'pending',
        userId: '', // Temporary ID, will be overwritten by server action/DB
    };
}

export async function POST(request: NextRequest) {
    try {
        const { topic, courseType, action, course, chapterIndex, lessonIndex, lessonType, lessonTitle, chapterTitle, courseTitle, lessonDuration } = await request.json();

        // If generating lesson content
        if (action === 'generate-lesson') {
            return await generateLessonContent(
                courseTitle,
                chapterTitle,
                lessonTitle,
                lessonType,
                lessonDuration
            );
        }

        // Generate new course outline
        if (!topic?.trim()) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        console.log(`\n📚 Generating ${courseType || 'hybrid'} course on: "${topic}"`);

        const outline = await generateCourseOutline(topic, courseType || 'hybrid');
        const courseData = buildCourseFromOutline(outline);

        return NextResponse.json({
            success: true,
            course: courseData,
            message: 'Course outline created. Ready to generate content.'
        });

    } catch (error) {
        console.error('Course generation error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to generate course' },
            { status: 500 }
        );
    }
}

async function generateCourseOutline(topic: string, courseType: 'hybrid' | 'written' | 'video'): Promise<CourseOutline> {
    const model = genAI.getGenerativeModel({ model: process.env.MODEL! });

    // Build lesson type instructions based on courseType
    let lessonTypeInstructions = '';
    if (courseType === 'written') {
        lessonTypeInstructions = `
## IMPORTANT: Text-Only Course
- ALL lessons MUST have type "text"
- This is a written/reading-based course only
- No video lessons allowed`;
    } else if (courseType === 'video') {
        lessonTypeInstructions = `
## IMPORTANT: Video-Only Course
- ALL lessons MUST have type "video"
- This is a video-based course only
- No text lessons allowed`;
    } else {
        lessonTypeInstructions = `
## Lesson Type Guidelines (Hybrid Course)
- MIX of lesson types based on content:
  - Use "video" for: visual concepts, demonstrations, complex processes, spatial topics
  - Use "text" for: reading-heavy content, detailed explanations, reference material, code examples

## Decision Guide for Lesson Types:
- Math/Science formulas → text (easier to read/reference)
- Step-by-step processes → video (visual demonstration)
- Historical/background info → text (reading material)
- Diagrams/visualizations → video (animated explanations)
- Code tutorials → text (can copy/paste)
- Conceptual overviews → video (engaging presentation)`;
    }

    const prompt = `You are an expert course designer. Create a comprehensive course outline for the following topic.

## Topic: ${topic}
${lessonTypeInstructions}

## Requirements:
- Create 4-8 chapters covering the topic thoroughly
- Each chapter should have 2-5 lessons
- Estimate realistic duration for each lesson (5-15 minutes typically)

## Return JSON in this exact format:
{
  "title": "Course Title",
  "description": "2-3 sentence course description",
  "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
  "prerequisites": ["Prerequisite 1"] or [],
  "difficulty": "beginner" | "intermediate" | "advanced",
  "chapters": [
    {
      "title": "Chapter 1 Title",
      "description": "What this chapter covers",
      "lessons": [
        {
          "title": "Lesson Title",
          "type": "text" or "video",
          "duration": 10,
          "reasoning": "Why this type was chosen"
        }
      ]
    }
  ]
}

Generate the course outline now:`;

    const result = await model.generateContent([{ text: prompt }]);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to parse course outline');
    }

    const outline: CourseOutline = JSON.parse(jsonMatch[0]);
    return outline;
}

async function generateLessonContent(
    courseTitle: string,
    chapterTitle: string,
    lessonTitle: string,
    lessonType: LessonType,
    duration: number
): Promise<NextResponse> {
    if (lessonType === 'text') {
        // Use the shared text lecture generator (same as main lecture page)
        const lessonTopic = `${lessonTitle} (${chapterTitle} - ${courseTitle})`;
        const content = await generateTextLectureContent(lessonTopic, duration);

        return NextResponse.json({
            success: true,
            lessonContent: { content },
            message: 'Text lesson generated successfully'
        });
    } else {
        // Use the shared video lecture generator (same as main lecture page)
        const lessonTopic = `${lessonTitle} (${chapterTitle} - ${courseTitle})`;
        const videoData = await generateVideoLectureContent(lessonTopic, duration);

        return NextResponse.json({
            success: true,
            lessonContent: { slides: videoData.slides, videoLecture: videoData },
            message: 'Video lesson generated successfully'
        });
    }
}
