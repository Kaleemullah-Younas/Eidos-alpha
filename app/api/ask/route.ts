import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * ──────────────────────────────────────────────────────────────
 * GEMINI 3 INTEGRATION – Study Q&A / Ask endpoint
 * ──────────────────────────────────────────────────────────────
 * Uses the Google Generative AI SDK (@google/generative-ai) to
 * power the interactive Q&A feature within study sessions.
 * The model (e.g. gemini-3-flash-preview) is resolved from the
 * MODEL environment variable; the API key from GOOGLE_API_KEY.
 * ──────────────────────────────────────────────────────────────
 */
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const {
      question,
      context,
      conversationHistory = [],
      enableSearch = false,
    } = await request.json();

    if (!question?.trim()) {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`🤔 Q&A: "${question.slice(0, 50)}..."`);
    console.log(`📚 Context length: ${context?.length || 0} chars`);
    console.log(
      `💬 Conversation history: ${conversationHistory.length} messages`,
    );
    console.log(`🔍 Search enabled: ${enableSearch}`);

    const model = genAI.getGenerativeModel({
      model: process.env.MODEL!,
    });

    // Build conversation history string
    const historyMessages = (conversationHistory as ChatMessage[]).slice(0, -1); // Exclude the current question
    const historyText = historyMessages
      .map(
        (m: ChatMessage) =>
          `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`,
      )
      .join('\n\n');

    console.log(`📝 History messages used: ${historyMessages.length}`);

    // Build the prompt with context if available
    let prompt = '';

    if (context?.trim()) {
      prompt = `You are a strict study assistant. A student is asking a question about their study material.

## Study Material Context
"""
${context.slice(0, 15000)}
"""${
        historyText
          ? `

## Previous Conversation
${historyText}`
          : ''
      }

## Student's Current Question
${question}

## STRICT Instructions
1. Answer the question ONLY using the information provided in the Study Material Context above
2. Do NOT use any external knowledge or information not present in the context
3. If the answer cannot be found in the provided material, clearly state: "I couldn't find information about this in your study material. Please make sure you've uploaded relevant content or try asking a different question."
4. Quote or reference specific parts of the material when answering
5. Be educational and clear in your explanations
6. Stay focused on what's in the document - do not speculate or add information
7. Remember the conversation history and maintain context from previous exchanges
8. If the student refers to something discussed earlier, use the conversation history to understand their reference

Provide your answer based strictly on the study material:`;
    } else {
      prompt = `You are a study assistant. The student hasn't provided any study material yet.${
        historyText
          ? `

## Previous Conversation
${historyText}`
          : ''
      }

## Student's Question
${question}

## Instructions
The student hasn't uploaded any study material yet. Please respond with:
"I don't have any study material to reference. Please upload a PDF, image, or capture a lecture first, then I can answer questions based on that content."

Response:`;
    }

    // Stream the response
    const result = await model.generateContentStream([{ text: prompt }]);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullAnswer = '';

          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullAnswer += text;

            const data = JSON.stringify({
              chunk: text,
              done: false,
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          const finalData = JSON.stringify({
            chunk: '',
            done: true,
            answer: fullAnswer,
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          controller.close();

          console.log(`✅ Q&A answered: ${fullAnswer.length} chars`);
        } catch (error) {
          console.error('❌ Q&A error:', error);
          const errorData = JSON.stringify({
            error: (error as Error).message,
            done: true,
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Q&A error:', error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message || 'Failed to answer question',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
