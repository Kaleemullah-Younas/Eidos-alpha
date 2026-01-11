'use server'

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

async function getUser() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return session?.user;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export async function getChatHistoryAction(sessionId: string): Promise<ChatMessage[]> {
    const user = await getUser();
    if (!user) return [];

    // Verify session ownership
    const session = await prisma.studySession.findUnique({
        where: { id: sessionId }
    });

    if (!session || session.userId !== user.id) return [];

    const messages = await prisma.chatMessage.findMany({
        where: { studySessionId: sessionId },
        orderBy: { timestamp: 'asc' }
    });

    return messages.map((m: any) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.timestamp
    }));
}

export async function saveChatMessageAction(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string
): Promise<ChatMessage | null> {
    const user = await getUser();
    if (!user) return null;

    // Verify session ownership
    const session = await prisma.studySession.findUnique({
        where: { id: sessionId }
    });

    if (!session || session.userId !== user.id) return null;

    const message = await prisma.chatMessage.create({
        data: {
            studySessionId: sessionId,
            role,
            content,
            timestamp: new Date()
        }
    });

    return {
        id: message.id,
        role: message.role as 'user' | 'assistant',
        content: message.content,
        timestamp: message.timestamp
    };
}
