'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Course, CourseOutline, Chapter, Lesson } from '@/lib/courseStorage';

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user;
}

export async function getCoursesAction() {
  const user = await getUser();
  if (!user) return [];

  const courses = await prisma.course.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  });

  // Map database format to application format if needed
  // Since we used Json for chapters, we need to cast it
  return courses.map(c => ({
    ...c,
    chapters: c.chapters as unknown as Chapter[],
    generationProgress: c.generationProgress as any,
    difficulty: c.difficulty as any,
    generationStatus: c.generationStatus as any,
    // Ensure dates are Dates (Prisma returns Dates, but over server boundary they become strings if not careful, though Server Actions usually handle Date serialization fine in Next.js 14+, but let's be safe if we were using plain API. Next.js actions serialize/deserialize automatically)
  }));
}

export async function getCourseAction(id: string) {
  const user = await getUser();
  if (!user) return null;

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course || course.userId !== user.id) return null;

  return {
    ...course,
    chapters: course.chapters as unknown as Chapter[],
    generationProgress: course.generationProgress as any,
    difficulty: course.difficulty as any,
    generationStatus: course.generationStatus as any,
  };
}

export async function saveCourseAction(course: Partial<Course>) {
  const user = await getUser();
  if (!user) throw new Error('Unauthorized');

  // Determine if creating or updating
  if (course.id && !course.id.startsWith('course_')) {
    // Check if exists in DB
    const existing = await prisma.course.findUnique({
      where: { id: course.id },
    });
    if (existing) {
      if (existing.userId !== user.id) throw new Error('Unauthorized');

      const updated = await prisma.course.update({
        where: { id: course.id },
        data: {
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          totalDuration: course.totalDuration,
          totalLessons: course.totalLessons,
          learningObjectives: course.learningObjectives,
          prerequisites: course.prerequisites,
          difficulty: course.difficulty || 'beginner',
          completedLessons: course.completedLessons,
          progressPercent: course.progressPercent,
          currentChapter: course.currentChapter,
          currentLesson: course.currentLesson,
          certificateEarned: course.certificateEarned,
          completedAt: course.completedAt,
          finalExamScore: course.finalExamScore,
          generationStatus: course.generationStatus,
          generationProgress: course.generationProgress as any,
          chapters: course.chapters as any,
        },
      });
      return {
        ...updated,
        chapters: updated.chapters as unknown as Chapter[],
        generationProgress: updated.generationProgress as any,
        difficulty: updated.difficulty as any,
        generationStatus: updated.generationStatus as any,
      };
    }
  }

  // Create new
  const newCourse = await prisma.course.create({
    data: {
      userId: user.id,
      title: course.title || 'Untitled',
      description: course.description || '',
      thumbnail: course.thumbnail,
      totalDuration: course.totalDuration || 0,
      totalLessons: course.totalLessons || 0,
      learningObjectives: course.learningObjectives || [],
      prerequisites: course.prerequisites || [],
      difficulty: course.difficulty || 'beginner',
      completedLessons: course.completedLessons || 0,
      progressPercent: course.progressPercent || 0,
      currentChapter: course.currentChapter || 0,
      currentLesson: course.currentLesson || 0,
      certificateEarned: course.certificateEarned || false,
      completedAt: course.completedAt,
      finalExamScore: course.finalExamScore,
      generationStatus: course.generationStatus || 'pending',
      generationProgress: course.generationProgress as any,
      chapters: (course.chapters as any) || [],
    },
  });

  return {
    ...newCourse,
    chapters: newCourse.chapters as unknown as Chapter[],
    generationProgress: newCourse.generationProgress as any,
    difficulty: newCourse.difficulty as any,
    generationStatus: newCourse.generationStatus as any,
  };
}

export async function deleteCourseAction(id: string) {
  const user = await getUser();
  if (!user) return false;

  try {
    const result = await prisma.course.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });
    return result.count > 0;
  } catch (e) {
    return false;
  }
}

// Publish a course
export async function publishCourseAction(id: string) {
  const user = await getUser();
  if (!user) throw new Error('Unauthorized');

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course || course.userId !== user.id) throw new Error('Unauthorized');

  const updated = await prisma.course.update({
    where: { id },
    data: {
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  return updated;
}

// Get all public courses
export async function getPublicCoursesAction() {
  const user = await getUser();

  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  // If user is logged in, check which courses they've enrolled in (cloned)
  let userEnrollments: Record<string, string> = {}; // originalId -> clonedId
  if (user) {
    const enrollments = await prisma.course.findMany({
      where: {
        userId: user.id,
        originalCourseId: { in: courses.map(c => c.id) }
      },
      select: {
        id: true,
        originalCourseId: true
      }
    });

    enrollments.forEach(e => {
      if (e.originalCourseId) userEnrollments[e.originalCourseId] = e.id;
    });
  }

  return courses.map(c => ({
    ...c,
    chapters: c.chapters as unknown as Chapter[],
    generationProgress: c.generationProgress as any,
    difficulty: c.difficulty as any,
    generationStatus: c.generationStatus as any,
    user: c.user,
    enrolledId: userEnrollments[c.id] || null,
  }));
}

// Copy (Enroll) a public course
export async function copyCourseAction(originalCourseId: string) {
  const user = await getUser();
  if (!user) throw new Error('Unauthorized');

  // Fetch the original course
  const original = await prisma.course.findUnique({
    where: { id: originalCourseId },
  });

  if (!original || !original.isPublished) throw new Error('Course not available');

  // Create a deep copy for the current user
  const newCourse = await prisma.course.create({
    data: {
      userId: user.id,
      title: original.title,
      description: original.description,
      thumbnail: original.thumbnail,
      totalDuration: original.totalDuration,
      totalLessons: original.totalLessons,
      learningObjectives: original.learningObjectives,
      prerequisites: original.prerequisites,
      difficulty: original.difficulty,
      // Reset progress
      completedLessons: 0,
      progressPercent: 0,
      currentChapter: 0,
      currentLesson: 0,
      certificateEarned: false,
      completedAt: null,
      finalExamScore: null,
      // Copy content
      chapters: original.chapters as any, // This copies the JSON structure including lessons
      generationStatus: 'completed', // Already generated

      // Track original
      originalCourseId: original.id,
    },
  });



  return {
    ...newCourse,
    chapters: newCourse.chapters as unknown as Chapter[],
    generationProgress: newCourse.generationProgress as any,
    difficulty: newCourse.difficulty as any,
    generationStatus: newCourse.generationStatus as any,
  };
}
