import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * ──────────────────────────────────────────────────────────────
 * GEMINI 3 INTEGRATION – Video Lecture Generator (shared lib)
 * ──────────────────────────────────────────────────────────────
 * Shared utility consumed by /api/generate-video-lecture and
 * /api/generate-course to produce slide-based video lecture
 * scripts via Gemini 3.
 * Model: process.env.MODEL (e.g. gemini-3-flash-preview)
 * Key:   process.env.GOOGLE_API_KEY
 * ──────────────────────────────────────────────────────────────
 */
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * Generate a video lecture using the same comprehensive prompt as the main lecture page.
 * This is used by both /api/generate-video-lecture and /api/generate-course
 */
export async function generateVideoLectureContent(
  topic: string,
  duration: number = 3
) {
  const model = genAI.getGenerativeModel({ model: process.env.MODEL! });

  // Calculate approximate word count for speaking (avg 150 words per minute)
  const targetWords = duration * 150;
  const slidesCount = Math.max(5, Math.min(12, duration * 2));

  const prompt = `You are a WARM, ENGAGING HUMAN TEACHER creating video lecture content. Your narration should sound like a real teacher speaking naturally - NOT like an AI or robot.

## Topic: ${topic}

## Requirements:
- Target duration: ${duration} minutes
- Approximately ${targetWords} words for narration
- ${slidesCount} content slides + 1-2 QUIZ SLIDES with animated whiteboard drawings

## TEACHER PERSONALITY (CRITICAL!):
Your narration MUST sound like a real human teacher:

1. **NATURAL SPEECH PATTERNS**:
   - Use contractions: "Let's", "We'll", "Don't", "It's"
   - Use filler expressions: "Now,", "So,", "Well,", "You see,"
   - Use casual transitions: "Alright, moving on...", "Here's the interesting part..."
   - Address the student directly: "I want you to think about...", "Imagine you're..."

2. **WARMTH AND ENCOURAGEMENT**:
   - "Don't worry if this seems tricky at first - it clicked for me after seeing a few examples too."
   - "This is one of my favorite parts to teach..."
   - "Stick with me here, this is going to make so much sense in a moment."
   - "Great job following along so far!"

3. **PERSONAL TOUCHES**:
   - "When I first learned this, I found it helpful to..."
   - "A trick I use to remember this is..."
   - "My students often ask me about..."

4. **CONVERSATIONAL FLOW**:
   - Vary sentence length - mix short punchy sentences with longer explanations
   - Ask rhetorical questions: "But why does this happen?"
   - Use pauses: Start sentences with "So..." or "Now..."
   - Build excitement: "And here's where it gets really interesting!"

## QUIZ SLIDES (Include 1-5 per lecture based on content):
The number of quizzes depends on content complexity and lecture length:
- Short/simple topics: 1-2 quizzes
- Medium complexity: 2-3 quizzes  
- Long/complex topics: 3-5 quizzes
Space quizzes evenly throughout the lecture after teaching key concepts.
Add quiz slides AFTER teaching content to test understanding. Each quiz slide needs:

{
  "id": 5,
  "title": "Quick Check!",
  "bulletPoints": [],
  "visualDescription": "Quiz question displayed",
  "narration": "[Will be set from quiz.teacherIntro]",
  "duration": 70,
  "isQuizSlide": true,
  "quiz": {
    "question": "Based on what we just covered, what is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 1,
    "teacherIntro": "Alright, let us pause here for a quick quiz! I want to see if you have been paying attention. Take a moment to think about this...",
    "correctFeedback": "Yes! Excellent work! You have really got this. That is exactly right.",
    "wrongFeedback": "Not quite, but that is okay - this is how we learn! The correct answer was B. Let me quickly explain why..."
  },
  "transition": "zoom",
  "drawings": [
    {"timestamp": 0, "type": "text", "text": "Quiz Time!", "start": {"x": 300, "y": 60}, "color": "#fbbf24", "fontSize": 32, "lineWidth": 0, "duration": 0.5, "glow": true}
  ]
}

**Quiz rules:**
- Place after teaching a concept (never before)
- Question MUST be about content already covered
- Make questions engaging, not trick questions
- Keep options clear and distinct
- Feedback should be encouraging, even for wrong answers

## CANVAS SIZE: 800x500 pixels
- Safe zone: x: 50-750, y: 40-460
- Title area: y: 40-80
- Main content: y: 100-400
- Leave margins from edges

## Output Format (JSON):
Return a valid JSON object with this exact structure:

{
  "title": "Lecture title",
  "description": "Brief 1-2 sentence description",
  "duration": ${duration},
  "slides": [
    {
      "id": 1,
      "title": "Slide title",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"],
      "visualDescription": "Description of visual/diagram displayed",
      "narration": "What the narrator says for this slide (2-4 sentences)",
      "duration": 30,
      "drawings": [
        {
          "timestamp": 0,
          "type": "text",
          "text": "Title Text",
          "start": {"x": 300, "y": 50},
          "color": "#60a5fa",
          "fontSize": 28,
          "lineWidth": 0,
          "duration": 0.5
        },
        {
          "timestamp": 2,
          "type": "rectangle",
          "start": {"x": 200, "y": 150},
          "width": 400,
          "height": 150,
          "color": "#22c55e",
          "lineWidth": 3,
          "duration": 1.5
        }
      ]
    }
  ],
  "totalNarration": "Complete narration script combining all slides"
}

## DRAWING TYPES & PROPERTIES:

1. **text**: Display text
   - start: {x, y} position
   - text: "string content"
   - fontSize: 18-32 (default 22)
   - color: "#hexcolor"
   - lineWidth: 0
   - duration: 0.3-0.8 seconds

2. **line**: Straight or multi-point line
   - points: [{x, y}, {x, y}, ...] (2+ points)
   - color, lineWidth: 2-4, duration: 0.5-1.5s

3. **circle**: Circle shape
   - start: {x, y} CENTER point
   - radius: number (30-100 typical)
   - color, lineWidth: 2-4, duration: 0.8-1.5s
   - fill: true/false (optional)

4. **rectangle**: Box/rectangle
   - start: {x, y} TOP-LEFT corner
   - width, height: numbers
   - color, lineWidth: 2-4, duration: 1-2s
   - fill: true/false (optional)

5. **arrow**: Directional arrow
   - start: {x, y} arrow tail
   - end: {x, y} arrow head
   - color, lineWidth: 2-3, duration: 0.5-1s

6. **polygon**: Multi-sided shape
   - points: [{x, y}, ...] vertices (3+)
   - color, lineWidth, duration: 1-2s
   - fill: true/false

7. **curve**: Smooth curve through points
   - points: [{x, y}, ...] (3+ points for smooth curve)
   - color, lineWidth: 2-3, duration: 1-2s

## ENHANCED TEXT PROPERTIES:
- **handwriting**: true/false - Progressive typewriter reveal effect
- **glow**: true/false - Neon glow effect around text

## 3D DRAWING TYPES (for appropriate topics):
Use 3D drawings when explaining spatial concepts, molecular structures, geometry, physics, etc.

1. **cube**: 3D box
   - position: {x, y, z} - center position (x: 0-800, y: 0-500, z: -2 to 2)
   - size: 50-150
   - color: "#hexcolor"
   - rotation: {x, y, z} - initial rotation in degrees
   - rotationSpeed: {x, y, z} - animated rotation (0.5-2 typical)
   - wireframe: true/false

2. **sphere**: 3D ball
   - position, size, color, rotation, rotationSpeed, wireframe

3. **cylinder**: 3D tube
   - position, size, color, rotation, rotationSpeed, wireframe

4. **pyramid**: 4-sided pyramid
   - position, size, color, rotation, rotationSpeed, wireframe

5. **torus**: Donut shape
   - position, size, color, rotation, rotationSpeed, wireframe

6. **cone**: Pointed cone
   - position, size, color, rotation, rotationSpeed, wireframe

## SLIDE TRANSITIONS:
Each slide can have a transition effect for cinematic feel:
- "fade" (default) - smooth fade between slides
- "zoom" - zoom in effect
- "slide-left" - slide from right
- "slide-right" - slide from left
- "flip" - 3D flip effect

## COLOR PALETTE (use these vibrant colors):
- Titles/Headers: #60a5fa (blue), #a78bfa (purple)
- Main shapes: #22c55e (green), #f59e0b (amber), #06b6d4 (cyan)
- Emphasis: #ef4444 (red), #ec4899 (pink)
- Secondary: #94a3b8 (gray), #fbbf24 (yellow)
- Text: #f1f5f9 (light gray), #e2e8f0 (off-white)
- 3D Objects: #60a5fa, #a78bfa, #22c55e, #f59e0b

## DRAWING GUIDELINES:

1. **TIMING**: 
   - Start title text at timestamp 0
   - Space drawings 2-4 seconds apart
   - Drawings should sync with narration content
   - Each slide has ${Math.round((duration * 60) / slidesCount)} seconds

2. **LAYOUT PER SLIDE**:
   - Title text at top (y: 50-70) with glow: true and handwriting: true
   - Main diagram in center (y: 120-350)
   - 4-8 2D drawings per slide
   - Add 1-2 3D objects per slide when topic is spatial/scientific
   - Use arrows to show relationships
   - Group related items visually

3. **VISUAL STORYTELLING**:
   - Build diagrams progressively
   - Use shapes to represent concepts
   - Add labels with text
   - Connect ideas with arrows
   - Use colors consistently for similar concepts
   - Use 3D objects for molecules, geometric shapes, physical objects

4. **EXAMPLE WITH 3D for "Molecular Structure"**:
   Slide 1:
   - transition: "zoom"
   - drawings: [text, circles, arrows, labels]
   - drawings3D: [
       {type: "sphere", position: {x: 400, y: 250, z: 0}, size: 80, color: "#60a5fa", rotationSpeed: {x: 0, y: 0.5, z: 0}}
     ]

5. **AVOID**:
   - Overlapping shapes (keep 30px+ spacing)
   - Too many drawings (max 8 per slide)
   - Drawings outside canvas (stay within 50-750 x, 40-460 y)
   - Long text strings (max 40 characters)
   - More than 3 3D objects per slide

## SLIDE STRUCTURE:
1. **Opening Slide**: transition: "zoom", Hook + topic title with glow, simple 3D object
2. **Overview**: transition: "fade", Learning objectives with bullet-style drawings
3. **Content Slides**: transition: "slide-left", One concept per slide with diagram
4. **Quiz Slide**: transition: "zoom", Test understanding of previous content
5. **More Content**: transition: "fade", Continue teaching
6. **Optional 2nd Quiz**: transition: "zoom", Another check-in
7. **Summary**: transition: "fade", Key takeaways
8. **Closing**: transition: "zoom", Encouraging final thoughts

## OUTPUT FORMAT:
Return JSON with this structure for each slide:
{
  "id": 1,
  "title": "Slide Title",
  "bulletPoints": ["Point 1", "Point 2"],
  "visualDescription": "What the viewer sees",
  "narration": "What the teacher says (natural, human-like speech)",
  "duration": 30,
  "transition": "fade",
  "drawings": [...],
  "drawings3D": [...],
  "isQuizSlide": false
}

For QUIZ slides, add:
- "isQuizSlide": true
- "quiz": {...quiz object...}

Generate the complete video lecture JSON now with natural teacher narration and 1-2 quiz slides:`;

  const result = await model.generateContent([{ text: prompt }]);
  const responseText = result.response.text();

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = responseText;
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Parse and validate
  let lectureData;
  try {
    lectureData = JSON.parse(jsonStr);
  } catch {
    // Try to fix common JSON issues
    jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    lectureData = JSON.parse(jsonStr);
  }

  // Ensure required fields
  if (!lectureData.slides || !Array.isArray(lectureData.slides)) {
    throw new Error('Invalid lecture data: missing slides array');
  }

  // Ensure each slide has drawings array (fallback to empty if missing)
  lectureData.slides = lectureData.slides.map((slide: any) => ({
    ...slide,
    drawings: slide.drawings || [],
  }));

  return lectureData;
}
