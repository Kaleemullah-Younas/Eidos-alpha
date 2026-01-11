'use server'

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { SavedCapture } from '@/lib/captureStorage';

async function getUser() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return session?.user;
}

export async function getCapturesAction() {
    const user = await getUser();
    if (!user) return [];

    return await prisma.capture.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' }
    });
}

export async function getCaptureAction(id: string) {
    const user = await getUser();
    if (!user) return null;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;

    const capture = await prisma.capture.findUnique({
        where: { id }
    });

    if (!capture || capture.userId !== user.id) return null;

    return capture;
}

export async function saveCaptureAction(capture: Partial<SavedCapture>) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const data = {
        title: capture.title || 'Untitled',
        notes: capture.notes || '',
        transcript: capture.transcript || '',
        duration: capture.duration || 0,
        frameCount: capture.frameCount || 0,
    };

    if (capture.id && capture.id.match(/^[0-9a-fA-F]{24}$/)) {
        const existing = await prisma.capture.findUnique({ where: { id: capture.id } });
        if (existing) {
            if (existing.userId !== user.id) throw new Error("Unauthorized");

            return await prisma.capture.update({
                where: { id: capture.id },
                data
            });
        }
    }

    return await prisma.capture.create({
        data: {
            ...data,
            userId: user.id
        }
    });
}

export async function deleteCaptureAction(id: string) {
    const user = await getUser();
    if (!user) return false;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) return false;

    try {
        const result = await prisma.capture.deleteMany({
            where: { id, userId: user.id }
        });
        return result.count > 0;
    } catch {
        return false;
    }
}
