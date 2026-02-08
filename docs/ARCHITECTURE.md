# EIDOS Architecture

## Overview

EIDOS (Educational Intelligence & Dynamic Optimization System) is a modern, AI-powered learning platform built on Next.js 14+ with the App Router. It transforms raw educational content into structured, interactive learning experiences.

## Project Structure

```
eidos/
├── app/                    # Next.js App Router pages
│   ├── api/               # API route handlers
│   │   ├── ask/           # AI Tutor endpoint
│   │   ├── auth/          # Authentication handlers
│   │   ├── generate-*/    # AI content generation endpoints
│   │   ├── recording/     # Recording management
│   │   └── upload-document/
│   ├── capture/           # Live lecture capture
│   ├── course/            # Course management & viewing
│   ├── dashboard/         # Main user dashboard
│   ├── docs/              # User documentation (HTML)
│   ├── lecture/           # Lecture generation & viewing
│   ├── login/             # Authentication pages
│   ├── public-courses/    # Published course discovery
│   ├── quiz/              # Quiz generation & taking
│   ├── signup/            # User registration
│   ├── study/             # Study session management
│   ├── globals.css        # Design system & tokens
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable React components
├── lib/                   # Utilities and services
├── prisma/                # Database schema
├── public/                # Static assets
└── docs/                  # Developer documentation
```

## Architecture Diagram

![EIDOS Architecture](architecture-diagram.png)

## Core Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14+ | Full-stack React framework with App Router |
| Frontend | React 19 | UI components and state management |
| Styling | CSS Modules | Scoped component styles |
| Language | TypeScript | Type-safe development |
| Database | MongoDB | Document storage via Prisma |
| ORM | Prisma | Database abstraction layer |
| Auth | Better-Auth | Session-based authentication |
| AI | Google Gemini 3 (`@google/generative-ai` SDK) | Content generation and tutoring |
| 3D | Three.js / React Three Fiber | Landing page visual effects |
| Math | KaTeX | Mathematical equation rendering |

## AI Integration

EIDOS integrates Google Gemini 3 API (via the `@google/generative-ai` SDK) for multiple AI-powered features.
The API key is loaded from the `GOOGLE_API_KEY` environment variable and the model name from `MODEL` (default: `gemini-3-flash-preview`).
See the main [README](../README.md#-gemini-3-integration) for a complete file-by-file reference.

### Content Generation Flow

```
User Input → API Route → Gemini API → Structured Response → Storage → UI
```

1. **Notes Generation** (`/api/generate-notes-stream`)
   - Accepts transcript + frames
   - Returns structured markdown notes

2. **Quiz Generation** (`/api/generate-quiz-stream`)
   - Accepts study context
   - Returns questions with explanations

3. **Lecture Generation** (`/api/generate-lecture`, `/api/generate-video-lecture`)
   - Accepts topic
   - Returns written or slide-based content

4. **Course Generation** (`/api/generate-course`)
   - Accepts topic/resource
   - Returns complete course structure

5. **AI Tutor** (`/api/ask`)
   - Accepts question + context
   - Returns contextual response

## Authentication Flow

```
1. User submits credentials
2. Better-Auth validates
3. Session created in database
4. Session token stored in cookie
5. AuthProvider manages client state
6. Protected routes check session
```

## Data Flow Examples

### Live Capture Session

```
1. User starts recording
2. Browser captures video frames (every 5s)
3. Speech recognition transcribes audio
4. On stop: frames + transcript sent to API
5. Gemini generates structured notes
6. Notes displayed and optionally saved
```

### Course Generation

```
1. User enters topic
2. API generates course structure
3. For each lesson: generate content
4. Store complete course in database
5. Track progress as user advances
6. Generate certificate on completion
```

## File Storage

- **Uploads**: `/uploads/` directory for user documents
- **Downloads**: `/public/downloads/` for generated content
- **Assets**: `/public/` for static files (fonts, icons)

## Design System

The design system is defined in `globals.css` with CSS custom properties:

- **Color Palette**: Teal/cyan accent with dark/light modes
- **Typography**: Inter and Space Grotesk fonts
- **Effects**: Glassmorphism, aurora backgrounds, subtle animations
- **Components**: Buttons, cards, inputs, pills with consistent styling

See [COMPONENTS.md](./COMPONENTS.md) for component-specific documentation.
