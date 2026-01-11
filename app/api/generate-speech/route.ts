import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Initialize the TTS model
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite-preview-tts',
        });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text }] }],
        });

        const response = await result.response;
        const candidate = response.candidates?.[0];
        const part = candidate?.content?.parts?.[0];

        if (!part) {
            throw new Error('No content generated');
        }

        console.log('TTS part keys:', Object.keys(part));

        let audioData: string = '';

        if ('inlineData' in part && part.inlineData) {
            audioData = part.inlineData.data;
        } else if ('text' in part && part.text) {
            audioData = part.text;
        } else {
            throw new Error('Unexpected response format');
        }

        if (typeof audioData === 'string' && audioData.length > 0) {
            const buffer = Buffer.from(audioData, 'base64');
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'audio/mp3',
                    'Content-Length': buffer.length.toString(),
                },
            });
        }

        return NextResponse.json(
            { error: 'Failed to process audio data' },
            { status: 500 }
        );
    } catch (error) {
        console.error('Speech generation error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to generate speech' },
            { status: 500 }
        );
    }
}
