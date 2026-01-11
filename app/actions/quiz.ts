'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

async function getUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session?.user;
}

export async function getSavedQuizzesAction() {
    const user = await getUser();
    if (!user) return [];

    const quizzes = await prisma.quiz.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
    });

    return quizzes.map(q => ({
        ...q,
        questions: q.questions as any
    }));
}

export async function getSavedQuizAction(id: string) {
    const user = await getUser();
    if (!user) return null;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;

    const quiz = await prisma.quiz.findUnique({
        where: { id },
    });

    if (!quiz || quiz.userId !== user.id) return null;

    return {
        ...quiz,
        questions: quiz.questions as any
    };
}

export async function saveQuizAction(data: {
    id?: string;
    title: string;
    topic: string;
    difficulty: string;
    questions: any[];
}) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    const quizData = {
        title: data.title,
        topic: data.topic,
        difficulty: data.difficulty,
        questions: data.questions,
    };

    if (data.id && data.id.match(/^[0-9a-fA-F]{24}$/)) {
        const existing = await prisma.quiz.findUnique({ where: { id: data.id } });
        if (existing) {
            if (existing.userId !== user.id) throw new Error('Unauthorized');

            const updated = await prisma.quiz.update({
                where: { id: data.id },
                data: quizData,
            });
            return { ...updated, questions: updated.questions as any };
        }
    }

    const newQuiz = await prisma.quiz.create({
        data: {
            ...quizData,
            userId: user.id,
        },
    });
    return { ...newQuiz, questions: newQuiz.questions as any };
}

export async function deleteQuizAction(id: string) {
    const user = await getUser();
    if (!user) return false;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) return false;

    try {
        const result = await prisma.quiz.deleteMany({
            where: {
                id,
                userId: user.id,
            },
        });
        return result.count > 0;
    } catch (e) {
        return false;
    }
}
