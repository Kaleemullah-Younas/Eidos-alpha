// Persistent Study Session Storage using Database
// Full session management with spaced repetition support

import {
  getSessionsAction,
  getSessionAction,
  saveSessionAction,
  deleteSessionAction
} from '@/app/actions/study';

export interface StudyMaterial {
  id: string;
  type: 'capture' | 'upload' | 'text';
  title: string;
  content: string;
  sourceType?: 'video' | 'pdf' | 'image' | 'text';
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  id: string;
  materialId: string;
  questions: QuizQuestion[];
  difficulty: string;
  createdAt: Date;
  attempts: QuizAttempt[];
}

export interface QuizQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  answers: (number | null)[];
  score: number;
  totalQuestions: number;
  completedAt: Date;
  timeSpentSeconds: number;
}



export interface StudySession {
  id: string;
  title: string;
  description?: string | null;
  materials: StudyMaterial[];
  quizzes: Quiz[];
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  tags: string[];
  totalStudyTimeMinutes: number;
  quizAverageScore: number;
}

export interface StudyStats {
  totalSessions: number;
  totalStudyTimeMinutes: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;

  streakDays: number;
  lastStudyDate: Date | null;
}

const CURRENT_SESSION_KEY = 'eidos.currentSession';

export function generateId(): string {
  // Generate a temporary ID if needed, but actions return real IDs.
  // We use this for generating *internal* IDs for quizzes/cards etc.
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function getAllSessions(): Promise<StudySession[]> {
  return await getSessionsAction();
}

async function saveSessions(session: StudySession): Promise<StudySession> {
  // Wrapper related to old name, but we only save one session at a time in DB.
  return (await saveSessionAction(session)) as StudySession;
}

export async function getSessionById(id: string): Promise<StudySession | null> {
  return await getSessionAction(id);
}

export async function createStudySession(
  title: string,
  description?: string
): Promise<StudySession> {
  const now = new Date();
  const session: StudySession = {
    id: '', // Empty ID, let DB generate
    title,
    description,
    materials: [],
    quizzes: [],
    createdAt: now,
    updatedAt: now,
    lastAccessedAt: now,
    tags: [],
    totalStudyTimeMinutes: 0,
    quizAverageScore: 0,
  };

  return await saveSessions(session);
}

export async function updateStudySession(session: StudySession): Promise<void> {
  session.updatedAt = new Date();
  await saveSessions(session);
}

export async function deleteStudySession(id: string): Promise<void> {
  await deleteSessionAction(id);
}

export async function addMaterialToSession(
  sessionId: string,
  material: Omit<StudyMaterial, 'id' | 'createdAt' | 'updatedAt'>
): Promise<StudyMaterial> {
  const session = await getSessionById(sessionId);
  if (!session) throw new Error('Session not found');

  const now = new Date();
  const newMaterial: StudyMaterial = {
    ...material,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  session.materials.push(newMaterial);
  await updateStudySession(session);

  return newMaterial;
}

export async function addQuizToSession(
  sessionId: string,
  materialId: string,
  questions: QuizQuestion[],
  difficulty: string
): Promise<Quiz> {
  const session = await getSessionById(sessionId);
  if (!session) throw new Error('Session not found');

  const quiz: Quiz = {
    id: generateId(),
    materialId,
    questions,
    difficulty,
    createdAt: new Date(),
    attempts: [],
  };

  session.quizzes.push(quiz);
  await updateStudySession(session);

  return quiz;
}

export async function recordQuizAttempt(
  sessionId: string,
  quizId: string,
  answers: (number | null)[],
  timeSpentSeconds: number
): Promise<QuizAttempt> {
  const session = await getSessionById(sessionId);
  if (!session) throw new Error('Session not found');

  const quiz = session.quizzes.find(q => q.id === quizId);
  if (!quiz) throw new Error('Quiz not found');

  const score = answers.reduce((acc: number, a, i) => {
    if (
      a !== null &&
      quiz.questions[i] &&
      a === quiz.questions[i].correctIndex
    ) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const attempt: QuizAttempt = {
    id: generateId(),
    answers,
    score,
    totalQuestions: quiz.questions.length,
    completedAt: new Date(),
    timeSpentSeconds,
  };

  quiz.attempts.push(attempt);

  // Update session stats
  const allAttempts = session.quizzes.flatMap(q => q.attempts);
  if (allAttempts.length > 0) {
    session.quizAverageScore =
      allAttempts.reduce(
        (acc, a) => acc + (a.score / a.totalQuestions) * 100,
        0
      ) / allAttempts.length;
  }

  await updateStudySession(session);
  return attempt;
}



import { getAllCourses } from './courseStorage';

export async function getStudyStats(): Promise<StudyStats> {
  const [sessions, courses] = await Promise.all([
    getAllSessions(),
    getAllCourses()
  ]);

  const totalQuizAttempts = sessions.flatMap(s =>
    s.quizzes.flatMap(q => q.attempts)
  );

  const averageScore =
    totalQuizAttempts.length > 0
      ? totalQuizAttempts.reduce(
        (acc, a) => acc + (a.score / a.totalQuestions) * 100,
        0
      ) / totalQuizAttempts.length
      : 0;

  // Aggregate all activity dates (sessions and courses)
  const sessionDates = sessions.map(s => s.lastAccessedAt);
  const courseDates = courses.map(c => c.updatedAt);

  // Also include Course.completedAt if it exists
  const completionDates = courses
    .filter(c => c.completedAt)
    .map(c => c.completedAt!) as Date[];

  const allDatesSorted = [...sessionDates, ...courseDates, ...completionDates]
    .sort((a, b) => b.getTime() - a.getTime());

  let streakDays = 0;
  if (allDatesSorted.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter to unique days for easier calculation
    const uniqueDays = Array.from(new Set(
      allDatesSorted.map(d => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    )).map(t => new Date(t));

    const lastStudy = uniqueDays[0];
    const diffDays = Math.floor(
      (today.getTime() - lastStudy.getTime()) / (24 * 60 * 60 * 1000)
    );

    // If last study was today or yesterday, start counting
    if (diffDays <= 1) {
      streakDays = 1;
      for (let i = 1; i < uniqueDays.length; i++) {
        const prevDate = uniqueDays[i - 1];
        const currDate = uniqueDays[i];

        const diff = Math.floor(
          (prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000)
        );

        if (diff === 1) {
          streakDays++;
        } else {
          break;
        }
      }
    }
  }

  return {
    totalSessions: sessions.length,
    totalStudyTimeMinutes: sessions.reduce(
      (acc, s) => acc + s.totalStudyTimeMinutes,
      0
    ),
    totalQuizzesTaken: totalQuizAttempts.length,
    averageQuizScore: Math.round(averageScore),

    streakDays,
    lastStudyDate: allDatesSorted.length > 0 ? allDatesSorted[0] : null,
  };
}

export function getCurrentSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_SESSION_KEY);
}

export function setCurrentSessionId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(CURRENT_SESSION_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
}

export async function getOrCreateQuickSession(): Promise<StudySession> {
  const currentId = getCurrentSessionId();

  if (currentId) {
    const session = await getSessionById(currentId);
    if (session) {
      session.lastAccessedAt = new Date();
      await updateStudySession(session);
      return session;
    }
  }

  const session = await createStudySession(
    `Study Session - ${new Date().toLocaleDateString()}`
  );
  setCurrentSessionId(session.id);
  return session;
}

export async function exportToAnki(sessionId: string): Promise<string> {
  const session = await getSessionById(sessionId);
  if (!session) throw new Error('Session not found');

  const lines: string[] = [];


  return lines.join('\n');
}

export async function exportSessionJSON(sessionId: string): Promise<string> {
  const session = await getSessionById(sessionId);
  if (!session) throw new Error('Session not found');
  return JSON.stringify(session, null, 2);
}

export async function importSessionJSON(jsonData: string): Promise<StudySession> {
  const data = JSON.parse(jsonData);
  const newSession: StudySession = {
    ...data,
    id: '', // New ID will be generated
    createdAt: new Date(),
    updatedAt: new Date(),
    lastAccessedAt: new Date(),
  };

  return await saveSessions(newSession);
}
