'use server'

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { StudySession } from '@/lib/studyStorage';

async function getUser() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return session?.user;
}

export async function getSessionsAction() {
    const user = await getUser();
    if (!user) return [];

    const sessions = await prisma.studySession.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' }
    });

    return sessions.map(s => ({
        ...s,
        materials: s.materials as any,
        quizzes: s.quizzes as any,

    }));
}

export async function getSessionAction(id: string) {
    const user = await getUser();
    if (!user) return null;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;

    const session = await prisma.studySession.findUnique({
        where: { id }
    });

    if (!session || session.userId !== user.id) return null;

    return {
        ...session,
        materials: session.materials as any,
        quizzes: session.quizzes as any,

    };
}

export async function saveSessionAction(session: Partial<StudySession>) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const data = {
        title: session.title || 'Untitled',
        description: session.description,
        tags: session.tags || [],
        totalStudyTimeMinutes: session.totalStudyTimeMinutes || 0,
        quizAverageScore: session.quizAverageScore || 0,
        materials: session.materials as any || [],
        quizzes: session.quizzes as any || [],
        lastAccessedAt: session.lastAccessedAt || new Date(),
    };

    if (session.id && session.id.match(/^[0-9a-fA-F]{24}$/)) {
        const existing = await prisma.studySession.findUnique({ where: { id: session.id } });
        if (existing) {
            if (existing.userId !== user.id) throw new Error("Unauthorized");

            const updated = await prisma.studySession.update({
                where: { id: session.id },
                data
            });
            return { ...updated, materials: updated.materials as any, quizzes: updated.quizzes as any };
        }
    }

    // Create new (ignoring passed ID if it's not a valid existing ObjectId)
    const newSession = await prisma.studySession.create({
        data: {
            ...data,
            userId: user.id
        }
    });

    return { ...newSession, materials: newSession.materials as any, quizzes: newSession.quizzes as any };
}

export async function deleteSessionAction(id: string) {
    const user = await getUser();
    if (!user) return false;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) return false;

    try {
        const result = await prisma.studySession.deleteMany({
            where: { id, userId: user.id }
        });
        return result.count > 0;
    } catch {
        return false;
    }
}
