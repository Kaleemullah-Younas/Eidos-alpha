// Course Generation Module - Data Types and Storage

import { Slide, VideoLecture } from './lectureStorage';
import {
    getCoursesAction,
    getCourseAction,
    saveCourseAction,
    deleteCourseAction
} from '@/app/actions/course';

// Lesson types
export type LessonType = 'text' | 'video' | 'exam';

// Exam Question
export interface ExamQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
}

// Quiz embedded in lessons
export interface LessonQuiz {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    answered: boolean;
    correct: boolean | null;
}

// Individual lesson within a chapter
export interface Lesson {
    id: string;
    title: string;
    type: LessonType;
    duration: number; // minutes
    completed: boolean;

    // For text lessons - markdown content with embedded quizzes
    content?: string;

    // For video lessons - reuses existing Slide type
    slides?: Slide[];
    videoLecture?: VideoLecture;

    // For exam lessons
    examQuestions?: ExamQuestion[];
    examScore?: number; // percentage 0-100

    // Quiz results for this lesson
    quizResults?: {
        total: number;
        correct: number;
        completed: boolean;
    };

    // Notes taken by user
    notes?: string;

    // Timestamp when last accessed
    lastAccessed?: Date;
}

// Chapter containing multiple lessons
export interface Chapter {
    id: string;
    title: string;
    description: string;
    lessons: Lesson[];
    completed: boolean;
    duration: number; // total minutes for this chapter
}

// Full course structure
export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail?: string | null;
    createdAt: Date;
    updatedAt: Date;

    // Course structure
    chapters: Chapter[];

    // Metadata
    totalDuration: number; // total minutes
    totalLessons: number;
    learningObjectives: string[];
    prerequisites: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';

    // Progress tracking
    completedLessons: number;
    progressPercent: number;
    currentChapter: number;
    currentLesson: number;

    // Completion & Certification
    certificateEarned: boolean;
    certificateData?: {
        name: string;
        date: Date;
    } | null;
    completedAt?: Date | null;
    finalExamScore?: number | null; // Final exam score (0-100)

    // Generation status
    generationStatus: 'pending' | 'generating' | 'completed' | 'error';
    generationProgress?: {
        currentChapter: number;
        totalChapters: number;
        currentLesson: number;
        totalLessons: number;
    } | null;

    // Public & Publishing
    isPublished?: boolean;
    publishedAt?: Date | null;
    originalCourseId?: string | null;
    user?: {
        name: string;
        image: string | null;
    };
    userId: string;
    enrolledId?: string | null; // ID of the copy if current user enrolled
}

// Course outline for generation
export interface CourseOutline {
    title: string;
    description: string;
    learningObjectives: string[];
    prerequisites: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    chapters: {
        title: string;
        description: string;
        lessons: {
            title: string;
            type: LessonType;
            duration: number;
            reasoning: string; // why AI chose this type
        }[];
    }[];
}

// Storage key (Legacy)
const COURSES_KEY = 'eidos_courses';
const CURRENT_COURSE_KEY = 'eidos_current_course';

// Generate unique ID
function generateId(): string {
    // We let DB generate IDs for new items if possible, but for optimistic UI or structure building we might need one.
    // However, the new flow uses actions. We can keep this for internal logic or just rely on DB?
    // The createCourseFromOutline uses this.
    // If we want MongoId, we should let server do it?
    // For now, we'll strip this ID on server if it looks like this.
    return `course_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get all saved courses
export async function getAllCourses(): Promise<Course[]> {
    return await getCoursesAction();
}

// Get a single course by ID
export async function getCourse(id: string): Promise<Course | null> {
    return await getCourseAction(id);
}

// Save a course (create or update)
export async function saveCourse(course: Course): Promise<Course> {
    const saved = await saveCourseAction(course);
    return saved as Course;
}

// Create a new course from outline
export async function createCourseFromOutline(outline: CourseOutline): Promise<Course> {
    const id = generateId(); // Temporary ID, action will likely replace/ignore or use it.

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
                type: l.type,
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

    const course: Course = {
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
        userId: '', // Temporary ID, will be overwritten by server action
    };

    return await saveCourse(course);
}

// Update lesson content (text or video)
export async function updateLessonContent(
    courseId: string,
    chapterIndex: number,
    lessonIndex: number,
    content: { content?: string; slides?: Slide[]; videoLecture?: VideoLecture }
): Promise<Course | null> {
    const course = await getCourse(courseId);
    if (!course) return null;

    const lesson = course.chapters[chapterIndex]?.lessons[lessonIndex];
    if (!lesson) return null;

    if (content.content) lesson.content = content.content;
    if (content.slides) lesson.slides = content.slides;
    if (content.videoLecture) lesson.videoLecture = content.videoLecture;

    return await saveCourse(course);
}

// Mark a lesson as complete
export async function markLessonComplete(
    courseId: string,
    chapterIndex: number,
    lessonIndex: number
): Promise<Course | null> {
    const course = await getCourse(courseId);
    if (!course) return null;

    const lesson = course.chapters[chapterIndex]?.lessons[lessonIndex];
    if (!lesson || lesson.completed) return course;

    lesson.completed = true;
    lesson.lastAccessed = new Date();

    // Update course progress
    course.completedLessons++;
    course.progressPercent = Math.round(
        (course.completedLessons / course.totalLessons) * 100
    );

    // Check if chapter is complete
    const chapter = course.chapters[chapterIndex];
    if (chapter.lessons.every(l => l.completed)) {
        chapter.completed = true;
    }

    // Check if course is complete
    if (course.completedLessons === course.totalLessons) {
        course.certificateEarned = true;
        course.completedAt = new Date();
    }

    return await saveCourse(course);
}

// Update course position (where user left off)
export async function updateCoursePosition(
    courseId: string,
    chapterIndex: number,
    lessonIndex: number
): Promise<Course | null> {
    const course = await getCourse(courseId);
    if (!course) return null;

    course.currentChapter = chapterIndex;
    course.currentLesson = lessonIndex;

    return await saveCourse(course);
}

// Update lesson notes
export async function updateLessonNotes(
    courseId: string,
    chapterIndex: number,
    lessonIndex: number,
    notes: string
): Promise<Course | null> {
    const course = await getCourse(courseId);
    if (!course) return null;

    const lesson = course.chapters[chapterIndex]?.lessons[lessonIndex];
    if (!lesson) return null;

    lesson.notes = notes;
    return await saveCourse(course);
}

// Delete a course
export async function deleteCourse(id: string): Promise<boolean> {
    return await deleteCourseAction(id);
}

// Set current course for study (Kept in LocalStorage for session persistence across tabs if needed, OR move to DB)
// User asked to convert "all localstorage... to use database".
// But `currentCourse` is UI state (navigation history). Maybe that's fine in LS?
// Text: "convert all the localstorage storage to use database".
// I'll keep this one in LS or SessionStorage as it's just "what was I looking at?".
export function setCurrentCourse(id: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_COURSE_KEY, id);
    }
}

// Get current course ID
export function getCurrentCourseId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(CURRENT_COURSE_KEY);
}

// Format duration for display
export function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Get progress color based on percentage
export function getProgressColor(percent: number): string {
    if (percent === 100) return '#22c55e'; // green
    if (percent >= 75) return '#60a5fa'; // blue
    if (percent >= 50) return '#a78bfa'; // purple
    if (percent >= 25) return '#fbbf24'; // yellow
    return '#94a3b8'; // gray
}

// Check if course has an exam chapter
export function hasExamChapter(course: Course): boolean {
    return course.chapters.some(ch =>
        ch.lessons.some(l => l.type === 'exam')
    );
}

// Get count of regular (non-exam) lessons
export function getRegularLessonsCount(course: Course): { total: number; completed: number } {
    let total = 0;
    let completed = 0;

    course.chapters.forEach(ch => {
        ch.lessons.forEach(l => {
            if (l.type !== 'exam') {
                total++;
                if (l.completed) completed++;
            }
        });
    });

    return { total, completed };
}

// Get attendance (completion) percentage for regular lessons only
export function getAttendancePercent(course: Course): number {
    const { total, completed } = getRegularLessonsCount(course);
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

// Add exam chapter to a course
export async function addExamChapter(
    courseId: string,
    examQuestions: ExamQuestion[]
): Promise<Course | null> {
    const course = await getCourse(courseId);
    if (!course) return null;

    // Check if exam chapter already exists
    if (hasExamChapter(course)) {
        // Update existing exam questions
        for (const chapter of course.chapters) {
            for (const lesson of chapter.lessons) {
                if (lesson.type === 'exam') {
                    lesson.examQuestions = examQuestions;
                    return await saveCourse(course);
                }
            }
        }
    }

    // Create new exam chapter
    const examChapter: Chapter = {
        id: `${course.id}_exam`,
        title: 'Final Examination',
        description: 'Complete this final exam to earn your certificate',
        duration: 30,
        completed: false,
        lessons: [{
            id: `${course.id}_exam_lesson`,
            title: 'Final Exam',
            type: 'exam',
            duration: 30,
            completed: false,
            examQuestions
        }]
    };

    // Add exam chapter at the end
    course.chapters.push(examChapter);
    course.totalLessons++;

    return await saveCourse(course);
}

// Check certificate eligibility
export function checkCertificateEligibility(course: Course): {
    eligible: boolean;
    attendancePercent: number;
    examScore: number | null;
    hasExam: boolean;
} {
    const attendancePercent = getAttendancePercent(course);
    const hasExam = hasExamChapter(course);
    const examScore = course.finalExamScore ?? null;

    const eligible =
        attendancePercent >= 80 &&
        examScore !== null &&
        examScore > 50;

    return { eligible, attendancePercent, examScore, hasExam };
}

// Publish a course
export async function publishCourse(id: string): Promise<Course | null> {
    const result = await import('@/app/actions/course').then(m => m.publishCourseAction(id));
    return result as unknown as Course;
}

// Get public courses
export async function getPublicCourses(): Promise<Course[]> {
    const result = await import('@/app/actions/course').then(m => m.getPublicCoursesAction());
    return result as unknown as Course[];
}

// Copy/Enroll in a course
export async function copyCourse(originalId: string): Promise<Course | null> {
    const result = await import('@/app/actions/course').then(m => m.copyCourseAction(originalId));
    return result as unknown as Course;
}
