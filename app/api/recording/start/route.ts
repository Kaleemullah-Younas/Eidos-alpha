import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createSession } from '@/lib/sessions';

export async function POST() {
  const sessionId = Date.now().toString();

  createSession(sessionId);

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }

  console.log('✅ Session started:', sessionId);

  return NextResponse.json({ sessionId });
}
