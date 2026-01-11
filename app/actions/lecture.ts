'use server'

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { SavedLecture } from '@/lib/lectureStorage';

async function getUser() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return session?.user;
}

export async function getLecturesAction() {
    const user = await getUser();
    if (!user) return [];

    const lectures = await prisma.lecture.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' }
    });

    return lectures.map(l => ({
        ...l,
        type: l.type as any,
        videoData: l.videoData as any
    }));
}

export async function getLectureAction(id: string) {
    const user = await getUser();
    if (!user) return null;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;

    const lecture = await prisma.lecture.findUnique({
        where: { id }
    });

    if (!lecture || lecture.userId !== user.id) return null;

    return {
        ...lecture,
        type: lecture.type as any,
        videoData: lecture.videoData as any
    };
}

export async function saveLectureAction(lecture: Partial<SavedLecture>) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const data = {
        type: lecture.type || 'written',
        topic: lecture.topic || 'Untitled',
        title: lecture.title || 'Untitled',
        content: lecture.content,
        transcript: lecture.transcript,
        videoData: lecture.videoData as any,
    };

    if (lecture.id && lecture.id.match(/^[0-9a-fA-F]{24}$/)) {
        const existing = await prisma.lecture.findUnique({ where: { id: lecture.id } });
        if (existing) {
            if (existing.userId !== user.id) throw new Error("Unauthorized");

            const updated = await prisma.lecture.update({
                where: { id: lecture.id },
                data
            });
            return { ...updated, type: updated.type as any, videoData: updated.videoData as any };
        }
    }

    const newLecture = await prisma.lecture.create({
        data: {
            ...data,
            userId: user.id
        }
    });

    return { ...newLecture, type: newLecture.type as any, videoData: newLecture.videoData as any };
}

export async function deleteLectureAction(id: string) {
    const user = await getUser();
    if (!user) return false;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) return false;

    try {
        const result = await prisma.lecture.deleteMany({
            where: { id, userId: user.id }
        });
        return result.count > 0;
    } catch {
        return false;
    }
}
