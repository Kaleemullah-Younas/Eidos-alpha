// Lecture Storage System
// Stores both text-based and video-based lectures

import {
  getLecturesAction,
  getLectureAction,
  saveLectureAction,
  deleteLectureAction
} from '@/app/actions/lecture';

import {
  createStudySession,
  addMaterialToSession,
  setCurrentSessionId,
  type StudySession,
} from './studyStorage';

// Whiteboard Drawing Types
export interface Point {
  x: number;
  y: number;
}

export interface DrawingInstruction {
  timestamp: number;    // When to start drawing (seconds into slide)
  duration: number;     // How long the drawing animation takes
  type: 'line' | 'circle' | 'rectangle' | 'arrow' | 'text' | 'polygon' | 'curve';
  color: string;
  lineWidth: number;
  // Type-specific properties
  points?: Point[];     // For line, polygon, curve
  start?: Point;        // For arrow, rectangle, circle, text
  end?: Point;          // For arrow
  radius?: number;      // For circle
  width?: number;       // For rectangle
  height?: number;      // For rectangle
  text?: string;        // For text
  fontSize?: number;    // For text
  fill?: boolean;       // Whether to fill the shape
  // Enhanced effects
  glow?: boolean;       // Add glow effect
  handwriting?: boolean; // Use handwriting animation for text
}

// 3D Drawing Types
export type DrawingType3D = 'cube' | 'sphere' | 'cylinder' | 'pyramid' | 'torus' | 'cone';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Drawing3D {
  timestamp: number;
  duration: number;
  type: DrawingType3D;
  position: Vector3D;
  size: number;
  color: string;
  rotation?: Vector3D;
  rotationSpeed?: Vector3D; // Animated rotation
  wireframe?: boolean;
  opacity?: number;
}

// Slide transition types
export type SlideTransition = 'fade' | 'zoom' | 'slide-left' | 'slide-right' | 'flip' | 'none';

// Camera movement for cinematic effect
export interface CameraSettings {
  zoom?: number;
  pan?: { x: number; y: number };
  duration?: number;
}

// Video quiz for interactive learning
export interface VideoQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  teacherIntro: string;    // What teacher says before quiz popup
  correctFeedback: string; // Teacher's response when correct
  wrongFeedback: string;   // Teacher's response when wrong/timeout
}

export interface Slide {
  id: number;
  title: string;
  bulletPoints: string[];
  visualDescription: string;
  narration: string;
  duration: number;
  drawings?: DrawingInstruction[];  // Animated whiteboard drawings
  drawings3D?: Drawing3D[];         // 3D animated objects
  transition?: SlideTransition;     // Slide transition effect
  camera?: CameraSettings;          // Camera movement during slide
  isQuizSlide?: boolean;            // Flag for quiz slides
  quiz?: VideoQuiz;                 // Quiz data for quiz slides
}

export interface VideoLecture {
  title: string;
  description: string;
  duration: number;
  slides: Slide[];
  totalNarration: string;
}

export interface SavedLecture {
  id: string;
  type: 'written' | 'video';
  topic: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  // For written lectures
  content?: string | null;
  // For video lectures
  videoData?: VideoLecture | null;
  // Full transcript for generating quizzes/flashcards
  transcript: string | null;
}

export interface LectureListItem {
  id: string;
  type: 'written' | 'video';
  topic: string;
  title: string;
  createdAt: Date;
  duration?: number;
  slideCount?: number;
}

const CURRENT_LECTURE_KEY = 'eidos.currentLecture';
const FROM_LECTURE_FLAG = 'eidos.fromLecture';

export function generateLectureId(): string {
  // Use for temporary ID or let DB generate
  return `lecture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function getAllLectures(): Promise<SavedLecture[]> {
  return await getLecturesAction();
}

// Internal save wrapper
async function saveLectures(lecture: SavedLecture): Promise<SavedLecture> {
  return (await saveLectureAction(lecture)) as SavedLecture;
}

export async function getLectureById(id: string): Promise<SavedLecture | null> {
  return await getLectureAction(id);
}

export async function saveWrittenLecture(
  topic: string,
  content: string
): Promise<SavedLecture> {
  const now = new Date();

  // Extract title from content (first heading or first line)
  const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : topic;

  const lecture: SavedLecture = {
    id: generateLectureId(),
    type: 'written',
    topic,
    title,
    content,
    transcript: content, // For written lectures, content IS the transcript
    createdAt: now,
    updatedAt: now,
  };

  await saveLectures(lecture);

  // Also create a study session so user can chat with the lecture
  await createStudySessionFromLecture(lecture);

  return lecture;
}

export async function saveVideoLecture(
  topic: string,
  videoData: VideoLecture
): Promise<SavedLecture> {
  const now = new Date();

  // Generate full transcript from all slide narrations
  const transcript = videoData.slides
    .map((slide, i) => `## ${slide.title}\n\n${slide.narration}`)
    .join('\n\n');

  const lecture: SavedLecture = {
    id: generateLectureId(),
    type: 'video',
    topic,
    title: videoData.title,
    videoData,
    transcript: videoData.totalNarration || transcript,
    createdAt: now,
    updatedAt: now,
  };

  await saveLectures(lecture);

  // Also create a study session so user can chat with the lecture
  await createStudySessionFromLecture(lecture);

  return lecture;
}

// Helper function to create a study session from a lecture
async function createStudySessionFromLecture(lecture: SavedLecture): Promise<StudySession> {
  const sessionTitle = `Lecture: ${lecture.title}`;
  const session = await createStudySession(
    sessionTitle,
    `Generated ${lecture.type} lecture on "${lecture.topic}"`
  );

  // Add the lecture transcript as study material
  await addMaterialToSession(session.id, {
    type: 'text',
    title: lecture.title,
    content: lecture.transcript || '',
    sourceType: 'text',
  });

  return session;
}

export async function updateLecture(lecture: SavedLecture): Promise<void> {
  lecture.updatedAt = new Date();
  await saveLectures(lecture);
}

export async function deleteLecture(id: string): Promise<void> {
  await deleteLectureAction(id);

  // Clear current lecture if it was deleted
  if (getCurrentLectureId() === id) {
    setCurrentLectureId(null);
  }
}

export async function getLecturesList(): Promise<LectureListItem[]> {
  const lectures = await getAllLectures();
  return lectures.map(l => ({
    id: l.id,
    type: l.type,
    topic: l.topic,
    title: l.title,
    createdAt: new Date(l.createdAt), // ensure date
    duration: l.videoData?.duration,
    slideCount: l.videoData?.slides.length,
  }));
}

export function getCurrentLectureId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_LECTURE_KEY);
}

export function setCurrentLectureId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(CURRENT_LECTURE_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_LECTURE_KEY);
  }
}

export async function getCurrentLecture(): Promise<SavedLecture | null> {
  const currentId = getCurrentLectureId();
  if (!currentId) return null;
  return await getLectureById(currentId);
}

// Set lecture content to be used for quiz/flashcard generation
export async function setLectureForStudy(lectureId: string): Promise<boolean> {
  const lecture = await getLectureById(lectureId);
  if (!lecture) return false;

  // Store the transcript in the standard location for quiz/flashcard pages
  // Store the transcript in the standard location for quiz/flashcard pages
  localStorage.setItem('eidos.studyText', lecture.transcript || '');
  localStorage.setItem(
    'eidos.studySource',
    JSON.stringify({
      type: 'lecture',
      lectureId: lecture.id,
      lectureType: lecture.type,
      title: lecture.title,
    })
  );

  // Set navigation flag to indicate we're coming from a lecture
  // This uses sessionStorage so it persists only for this tab/session
  sessionStorage.setItem(FROM_LECTURE_FLAG, Date.now().toString());

  setCurrentLectureId(lectureId);
  return true;
}

// Check if user just navigated from a lecture (within last 10 seconds)
export function isComingFromLecture(): boolean {
  if (typeof window === 'undefined') return false;
  const timestamp = sessionStorage.getItem(FROM_LECTURE_FLAG);
  if (!timestamp) return false;

  const elapsed = Date.now() - parseInt(timestamp, 10);
  // Consider it "from lecture" if within 10 seconds
  return elapsed < 10000;
}

// Clear the navigation flag after reading
export function clearFromLectureFlag(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(FROM_LECTURE_FLAG);
}

export function getStudySource(): {
  type: string;
  lectureId?: string;
  lectureType?: string;
  title?: string;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem('eidos.studySource');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearStudySource(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('eidos.studySource');
}

// Search lectures by topic or title
export async function searchLectures(query: string): Promise<LectureListItem[]> {
  const lectures = await getLecturesList();
  const lowerQuery = query.toLowerCase();
  return lectures.filter(
    l =>
      l.topic.toLowerCase().includes(lowerQuery) ||
      l.title.toLowerCase().includes(lowerQuery)
  );
}

// Get recent lectures (last 5)
export async function getRecentLectures(count: number = 5): Promise<LectureListItem[]> {
  const lectures = await getLecturesList();
  return lectures.slice(0, count);
}

// Export lecture as JSON
export async function exportLectureJSON(id: string): Promise<string | null> {
  const lecture = await getLectureById(id);
  if (!lecture) return null;
  return JSON.stringify(lecture, null, 2);
}

// Import lecture from JSON
export async function importLectureJSON(jsonData: string): Promise<SavedLecture> {
  const data = JSON.parse(jsonData);
  const now = new Date();

  const newLecture: SavedLecture = {
    ...data,
    id: generateLectureId(),
    createdAt: now,
    updatedAt: now,
  };

  await saveLectures(newLecture);
  return newLecture;
}
