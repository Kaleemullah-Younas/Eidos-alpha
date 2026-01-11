# EIDOS: Educational Intelligence & Dynamic Optimization System

<div align="center">

![EIDOS Logo](public/logo.svg)

**An AI-powered learning platform that transforms raw information into structured, actionable knowledge.**

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0+-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Google AI](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)

[Getting Started](#getting-started) • [Features](#core-features) • [Documentation](#documentation)

</div>

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
| **AI** | Google Gemini 2.0 Flash |
| **3D** | Three.js / React Three Fiber |

> 📖 **Learn more:** See the full [Architecture Documentation](docs/ARCHITECTURE.md) for system diagrams and data flows.

---

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- MongoDB instance (local or Atlas)
- Google AI Studio API Key

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-repo/eidos.git
cd eidos

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

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
  <sub>Built with ❤️ using Next.js, React, and Google Gemini AI</sub>
</div>
