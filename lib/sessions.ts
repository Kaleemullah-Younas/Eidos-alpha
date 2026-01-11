// In-memory session storage
// In production, use a database or Redis

interface Session {
  frames: Array<{ path: string; filename: string; timestamp: number }>;
  transcripts: Array<{ text: string; timestamp: number }>;
  startTime: Date;
}

const sessions = new Map<string, Session>();

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

export function createSession(sessionId: string): Session {
  const session: Session = {
    frames: [],
    transcripts: [],
    startTime: new Date(),
  };
  sessions.set(sessionId, session);
  return session;
}

export function hasSession(sessionId: string): boolean {
  return sessions.has(sessionId);
}
