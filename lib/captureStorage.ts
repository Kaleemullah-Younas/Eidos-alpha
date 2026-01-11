// Capture Storage System
// Stores captured lecture sessions with AI-generated notes

import {
  getCapturesAction,
  getCaptureAction,
  saveCaptureAction,
  deleteCaptureAction
} from '@/app/actions/capture';

import {
  createStudySession,
  addMaterialToSession,
  setCurrentSessionId,
  type StudySession,
} from './studyStorage';

export interface SavedCapture {
  id: string;
  title: string;
  notes: string;
  transcript: string;
  duration: number; // Recording duration in seconds
  frameCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaptureListItem {
  id: string;
  title: string;
  createdAt: Date;
  duration: number;
  frameCount: number;
}

const CURRENT_CAPTURE_KEY = 'eidos.currentCapture';
const FROM_CAPTURE_FLAG = 'eidos.fromCapture';

export function generateCaptureId(): string {
  return `capture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function getAllCaptures(): Promise<SavedCapture[]> {
  return await getCapturesAction();
}

async function saveCaptures(capture: SavedCapture): Promise<SavedCapture> {
  return (await saveCaptureAction(capture)) as SavedCapture;
}

export async function getCaptureById(id: string): Promise<SavedCapture | null> {
  return await getCaptureAction(id);
}

export async function saveCapture(
  title: string,
  notes: string,
  transcript: string,
  duration: number,
  frameCount: number
): Promise<SavedCapture> {
  const now = new Date();

  const capture: SavedCapture = {
    id: generateCaptureId(),
    title,
    notes,
    transcript,
    duration,
    frameCount,
    createdAt: now,
    updatedAt: now,
  };

  const saved = await saveCaptures(capture);

  // Also create a study session so user can chat with the capture
  await createStudySessionFromCapture(saved);

  return saved;
}

// Helper function to create a study session from a capture
async function createStudySessionFromCapture(capture: SavedCapture): Promise<StudySession> {
  const sessionTitle = `Capture: ${capture.title}`;
  const session = await createStudySession(
    sessionTitle,
    `Captured lecture recording with AI-generated notes`
  );

  // Add the capture notes as study material
  await addMaterialToSession(session.id, {
    type: 'capture',
    title: capture.title,
    content: capture.notes,
    sourceType: 'video',
  });

  // Set this as the current session -- Note: createStudySession no longer sets current session ID automatically generally, but helper usually does return session.
  // We explicitly set it here.
  setCurrentSessionId(session.id);

  return session;
}

export async function updateCapture(capture: SavedCapture): Promise<void> {
  capture.updatedAt = new Date();
  await saveCaptures(capture);
}

export async function deleteCapture(id: string): Promise<void> {
  await deleteCaptureAction(id);

  // Clear current capture if it was deleted
  if (getCurrentCaptureId() === id) {
    setCurrentCaptureId(null);
  }
}

export async function getCapturesList(): Promise<CaptureListItem[]> {
  const captures = await getAllCaptures();
  return captures.map(c => ({
    id: c.id,
    title: c.title,
    createdAt: new Date(c.createdAt),
    duration: c.duration,
    frameCount: c.frameCount,
  }));
}

// Current capture tracking (for quiz/flashcard generation)
export function setCurrentCaptureId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(CURRENT_CAPTURE_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_CAPTURE_KEY);
  }
}

export function getCurrentCaptureId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_CAPTURE_KEY);
}

// Flag to indicate navigation came from capture page
export async function setCaptureForStudy(captureId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FROM_CAPTURE_FLAG, captureId);
  setCurrentCaptureId(captureId);

  // Also set the study text for quiz/flashcard generation
  const capture = await getCaptureById(captureId);
  if (capture) {
    localStorage.setItem('eidos.studyText', capture.notes);
  }
}

export function getCaptureForStudy(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(FROM_CAPTURE_FLAG);
}

export function clearCaptureForStudy(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FROM_CAPTURE_FLAG);
}

// Format duration for display
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
