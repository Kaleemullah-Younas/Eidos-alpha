import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * ──────────────────────────────────────────────────────────────
 * GEMINI 3 INTEGRATION – Text Lecture Generator (shared lib)
 * ──────────────────────────────────────────────────────────────
 * Shared utility consumed by /api/generate-lecture and
 * /api/generate-course to produce written lecture content via
 * Gemini 3.
 * Model: process.env.MODEL (e.g. gemini-3-flash-preview)
 * Key:   process.env.GOOGLE_API_KEY
 * ──────────────────────────────────────────────────────────────
 */
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * Generate a text lecture using the same comprehensive prompt as the main lecture page.
 * This is used by both /api/generate-lecture (streaming) and /api/generate-course (non-streaming)
 */
export function getTextLecturePrompt(topic: string, duration: number): string {
    return `You are a world-class professor and educational content creator. Create a comprehensive, engaging written lecture on the following topic.

## Topic: ${topic}

## Requirements:
- Target reading time: ${duration} minutes (approximately ${duration * 200}-${duration * 250} words)
- Write in an engaging, conversational yet educational tone
- Structure the content for optimal learning and retention

## Lecture Structure (use Markdown formatting):

### 1. Title & Introduction
- Compelling title
- Hook to grab attention
- Brief overview of what will be covered
- Why this topic matters (real-world relevance)

### 2. Learning Objectives
- 3-5 clear, measurable objectives
- What the student will understand after this lecture

### 3. Main Content
- Break into 3-5 major sections
- Each section should have:
  - Clear heading
  - Key concepts explained simply
  - Examples and analogies
  - Important terms in **bold**
  - Formulas/code in \`code blocks\`

### 4. EMBEDDED QUIZZES (IMPORTANT!)
After each major section, include an EMBEDDED QUIZ to test understanding of what was JUST covered.
Use this EXACT format:

:::quiz
question: [Question about the content BEFORE this quiz, not after]
options: A) [Option 1]|B) [Option 2]|C) [Option 3]|D) [Option 4]
answer: [Correct letter: A, B, C, or D]
explanation: [Brief explanation of why this is correct]
:::

Include 3-4 quizzes throughout the lecture, placed AFTER the content they test.

### 5. Key Takeaways
- Summarize the most important points
- Use bullet points for clarity

### 6. Further Reading
- Suggest 2-3 topics for deeper exploration
- How this connects to related subjects

## Formatting Guidelines:
- Use proper Markdown: #, ##, ###, **, *, \`, \`\`\`, >, -
- Include blockquotes for important definitions
- Use tables where appropriate
- Add horizontal rules (---) between major sections
- For math equations, use LaTeX: $inline$ or $$block$$
- For code, specify language: \`\`\`python

## Example Quiz Placement:
After explaining photosynthesis:

:::quiz
question: What is the primary purpose of chlorophyll in photosynthesis?
options: A) To absorb water|B) To absorb light energy|C) To release oxygen|D) To store glucose
answer: B
explanation: Chlorophyll absorbs light energy, particularly from the blue and red parts of the spectrum, which powers the photosynthesis process.
:::

Generate the complete lecture now with embedded quizzes and visual descriptions:`;
}

/**
 * Generate text lecture content (non-streaming version for course lessons)
 */
export async function generateTextLectureContent(topic: string, duration: number): Promise<string> {
    const model = genAI.getGenerativeModel({ model: process.env.MODEL! });
    const prompt = getTextLecturePrompt(topic, duration);

    const result = await model.generateContent([{ text: prompt }]);
    return result.response.text();
}
