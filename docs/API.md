# EIDOS API Reference

## Overview

EIDOS uses Next.js API Routes (App Router) for backend functionality. All endpoints are located in `/app/api/`.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

## Authentication

### `POST /api/auth/[...all]`

Better-Auth handles all authentication routes automatically:

| Path | Method | Description |
|------|--------|-------------|
| `/api/auth/sign-in/email` | POST | Email/password sign in |
| `/api/auth/sign-up/email` | POST | Create new account |
| `/api/auth/sign-out` | POST | End session |
| `/api/auth/session` | GET | Get current session |

**Sign In Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Session Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "image": null
  },
  "session": {
    "id": "session_id",
    "expiresAt": "2024-01-15T00:00:00Z"
  }
}
```

---

## Content Generation

### `POST /api/generate-notes-stream`

Generate structured notes from lecture content using AI.

**Request Body:**
```json
{
  "transcript": "Full lecture transcript text...",
  "frames": ["base64_image_1", "base64_image_2"]
}
```

**Response:** Server-Sent Events (SSE) stream of markdown content.

---

### `POST /api/generate-notes`

Non-streaming version of notes generation.

**Request/Response:** Same as above, returns complete markdown.

---

### `POST /api/generate-quiz-stream`

Generate quiz questions from study material.

**Request Body:**
```json
{
  "context": "Study material content...",
  "numQuestions": 10,
  "difficulty": "medium"
}
```

**Response (SSE):**
```json
{
  "question": "What is...?",
  "choices": ["A", "B", "C", "D"],
  "correctIndex": 2,
  "explanation": "The correct answer is C because..."
}
```

---

### `POST /api/generate-quiz`

Non-streaming quiz generation.

---

### `POST /api/generate-lecture`

Generate a written lecture on a topic.

**Request Body:**
```json
{
  "topic": "Introduction to Machine Learning",
  "style": "academic"
}
```

**Response:**
```json
{
  "title": "Introduction to Machine Learning",
  "content": "# Introduction to Machine Learning\n\n..."
}
```

---

### `POST /api/generate-video-lecture`

Generate a slide-based video lecture.

**Request Body:**
```json
{
  "topic": "Quantum Computing Basics"
}
```

**Response:**
```json
{
  "title": "Quantum Computing Basics",
  "slides": [
    {
      "title": "What is Quantum Computing?",
      "content": "...",
      "narration": "Welcome to this lecture on quantum computing...",
      "sceneType": "whiteboard"
    }
  ]
}
```

---

### `POST /api/generate-course`

Generate a complete course structure.

**Request Body:**
```json
{
  "topic": "Web Development Fundamentals",
  "difficulty": "beginner"
}
```

**Response:**
```json
{
  "id": "course_id",
  "title": "Web Development Fundamentals",
  "description": "...",
  "chapters": [
    {
      "title": "HTML Basics",
      "lessons": [
        {
          "title": "Introduction to HTML",
          "type": "written",
          "content": "..."
        }
      ]
    }
  ]
}
```

---

### `POST /api/generate-exam`

Generate a final exam for a course.

**Request Body:**
```json
{
  "courseId": "course_id",
  "courseContent": "Aggregated course content..."
}
```

---

### `POST /api/generate-speech`

Generate TTS audio for text (if using external TTS).

---

## AI Tutor

### `POST /api/ask`

Ask the AI tutor a question with context.

**Request Body:**
```json
{
  "question": "Can you explain photosynthesis?",
  "context": "Study session content about biology..."
}
```

**Response:**
```json
{
  "answer": "Photosynthesis is the process by which plants..."
}
```

---

## Recording Management

### `POST /api/recording`

Start a new recording session.

---

### `GET /api/recording/[id]`

Get recording session details.

---

### `DELETE /api/recording/[id]`

Delete a recording session.

---

## File Upload

### `POST /api/upload-document`

Upload a document for processing.

**Request:** `multipart/form-data` with file field.

**Response:**
```json
{
  "id": "document_id",
  "filename": "notes.pdf",
  "extractedText": "..."
}
```

---

## Download

### `GET /api/download`

Download generated content.

**Query Parameters:**
- `type`: Content type (notes, certificate, etc.)
- `id`: Content ID

---

## Error Handling

All API routes return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Rate Limiting

API routes interacting with Gemini API may be subject to rate limits. Implement appropriate retry logic with exponential backoff.

---

## Authentication Requirement

Most endpoints require authentication. Include the session cookie (automatically handled by browser) or pass session token in headers:

```
Cookie: better-auth.session_token=xxx
```

Unauthenticated requests return `401 Unauthorized`.
