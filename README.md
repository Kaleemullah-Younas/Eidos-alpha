# EIDOS: Educational Intelligence & Dynamic Optimization System

<div align="center">

![EIDOS Logo](public/logo.svg)

**An AI-powered learning platform built with Google Gemini 3 that transforms raw information into structured, actionable knowledge.**

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0+-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Google Gemini 3](https://img.shields.io/badge/Google_Gemini_3-Powered-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)

[Getting Started](#getting-started) • [Gemini 3 Integration](#-gemini-3-integration) • [Features](#core-features) • [Documentation](#documentation)

</div>

---

## 🔥 Gemini 3 Integration

**EIDOS is built entirely on Google Gemini 3.** Every AI feature in the platform is powered by the Gemini 3 API via the official [`@google/generative-ai`](https://www.npmjs.com/package/@google/generative-ai) Node.js SDK (v0.24.1).

### Model Configuration

The Gemini model is configured through environment variables (see [`.env.example`](.env.example)):

| Variable | Purpose | Default Value |
|----------|---------|---------------|
| `GOOGLE_API_KEY` | Google AI Studio API key | *(required)* |
| `MODEL` | Gemini model identifier | `gemini-3-flash-preview` |

Other supported models are listed in [`models.txt`](models.txt):
- `gemini-3-pro-preview`
- `gemini-2.5-flash-lite` (used for TTS)

### Where Gemini 3 Is Called — File-by-File Reference

Every AI-powered API route and shared library initializes the Gemini client the same way:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: process.env.MODEL! });
```

Below is the **complete list** of files that call the Gemini API:

| # | File | Feature | Gemini Capability Used |
|---|------|---------|------------------------|
| 1 | [`app/api/generate-course/route.ts`](app/api/generate-course/route.ts) | Full course generation (outline → chapters → lessons → quizzes) | Text generation, structured JSON output |
| 2 | [`app/api/generate-lecture/route.ts`](app/api/generate-lecture/route.ts) | Written lecture generation (streaming) | Text generation with streaming |
| 3 | [`app/api/generate-video-lecture/route.ts`](app/api/generate-video-lecture/route.ts) | Video lecture script generation | Text generation, structured JSON output |
| 4 | [`app/api/generate-notes/route.ts`](app/api/generate-notes/route.ts) | AI note generation from captured lectures | Text generation |
| 5 | [`app/api/generate-notes-stream/route.ts`](app/api/generate-notes-stream/route.ts) | Streaming note generation (real-time UX) | Text generation with streaming |
| 6 | [`app/api/generate-quiz/route.ts`](app/api/generate-quiz/route.ts) | Quiz generation with JSON mode | Text generation, `responseMimeType: 'application/json'` |
| 7 | [`app/api/generate-quiz-stream/route.ts`](app/api/generate-quiz-stream/route.ts) | Streaming quiz generation | Text generation with streaming + JSON mode |
| 8 | [`app/api/generate-exam/route.ts`](app/api/generate-exam/route.ts) | Final exam generation for courses | Text generation, structured JSON output |
| 9 | [`app/api/generate-speech/route.ts`](app/api/generate-speech/route.ts) | Text-to-speech for video lectures | Gemini TTS (`gemini-2.5-flash-lite-preview-tts`) |
| 10 | [`app/api/tutor/route.ts`](app/api/tutor/route.ts) | Voice-activated AI tutor | Text generation with context |
| 11 | [`app/api/ask/route.ts`](app/api/ask/route.ts) | Study session Q&A chat | Text generation with conversation history |
| 12 | [`app/api/upload-document/route.ts`](app/api/upload-document/route.ts) | Document analysis (PDF/image) | **Multimodal** — vision + text generation |
| 13 | [`lib/textLectureGenerator.ts`](lib/textLectureGenerator.ts) | Shared text-lecture generator | Text generation (used by routes #1 & #2) |
| 14 | [`lib/videoLectureGenerator.ts`](lib/videoLectureGenerator.ts) | Shared video-lecture generator | Text generation (used by routes #1 & #3) |

### Gemini Capabilities Leveraged

- **Text Generation** — All lecture, note, quiz, and exam content
- **Structured JSON Output** — Quiz & exam generation use `responseMimeType: 'application/json'`
- **Streaming** — Real-time content delivery for notes, lectures, and quizzes
- **Multimodal (Vision)** — PDF and image document analysis via base64 inline data
- **Text-to-Speech** — Natural voice narration for video lectures

> **Note:** The API key is loaded from environment variables for security — it is never committed to the repository. See [`.env.example`](.env.example) for the required configuration.

---

## Core Features

### 🎥 Live Capture
Record lectures in real-time with automatic video frame extraction, speech-to-text transcription, and AI-powered note generation.

> 📖 **Learn more:** See the [Architecture Guide](docs/ARCHITECTURE.md) for technical details on how capture processing works.

### 🤖 AI Content Generation
- **Structured Notes** – Comprehensive markdown notes from lectures using Google Gemini
- **Video Lectures** – Slide-based presentations with AI narration
- **Written Lectures** – In-depth educational content on any topic
- **Adaptive Quizzes** – AI-generated assessments with instant feedback

> 📖 **Learn more:** See the [API Reference](docs/API.md) for all generation endpoints.

### 🎓 Course Architect
Generate complete courses from any topic with chapters, lessons, quizzes, and final exams. Earn certificates upon completion.

### 📚 Study Sessions
Organize learning materials, upload documents, and chat with an AI tutor that understands your specific content.

### 🧠 Interactive AI Tutor
Voice-activated study assistant with interrupt detection, context-aware responses, and natural conversation flow.

> 📖 **Learn more:** See the [Components Guide](docs/COMPONENTS.md) for details on the AITutor component.

---

## Technical Architecture

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14+ (App Router) |
| **Frontend** | React 19, TypeScript |
| **Styling** | CSS Modules with Design Tokens |
| **Database** | Prisma ORM + MongoDB |
| **Auth** | Better-Auth |
| **AI** | Google Gemini 3 (`@google/generative-ai` SDK) |
| **3D** | Three.js / React Three Fiber |

> 📖 **Learn more:** See the full [Architecture Documentation](docs/ARCHITECTURE.md) for system diagrams and data flows.

---

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- MongoDB instance (local or Atlas)
- Google AI Studio API Key ([get one here](https://aistudio.google.com/apikey))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-repo/eidos.git
cd eidos

# Install dependencies
npm install

# Configure environment (IMPORTANT — set GOOGLE_API_KEY and MODEL)
cp .env.example .env.local
# Edit .env.local with your credentials (see .env.example for all variables)

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | **Yes** | Your Google AI Studio API key — powers all Gemini 3 features |
| `MODEL` | **Yes** | Gemini model name (default: `gemini-3-flash-preview`) |
| `DATABASE_URL` | **Yes** | MongoDB connection string |
| `BETTER_AUTH_SECRET` | **Yes** | Auth secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | **Yes** | App URL (default: `http://localhost:3000`) |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |

> See [`.env.example`](.env.example) for the full template with comments.

> 📖 **Need help?** See the complete [Setup Guide](docs/SETUP.md) for detailed instructions and troubleshooting.

---

## Documentation

| Document | Description |
|----------|-------------|
| [🏗️ Architecture](docs/ARCHITECTURE.md) | System architecture, project structure, and technical overview |
| [🧩 Components](docs/COMPONENTS.md) | React component reference with usage examples |
| [🔌 API Reference](docs/API.md) | All API endpoints with request/response formats |
| [🗄️ Database](docs/DATABASE.md) | Prisma schema, models, and query examples |
| [⚙️ Setup Guide](docs/SETUP.md) | Development environment setup and configuration |


### User Documentation

When running the app, visit `/docs` for interactive user guides on all features.

---

## Project Roadmap

- [x] High-fidelity live capture system
- [x] AI-driven note and quiz generation
- [x] Multi-modal course architect
- [x] Comprehensive user documentation
- [ ] Advanced analytics and learning streaks
- [ ] Collaborative study workspaces
- [ ] Native mobile applications (iOS/Android)

---

## License

This project is developed with a focus on academic excellence and modern design principles.

---

<div align="center">
  <sub>Built with ❤️ using Next.js, React, and Google Gemini 3</sub>
</div>
