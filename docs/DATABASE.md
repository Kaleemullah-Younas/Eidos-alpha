# EIDOS Database Schema

## Overview

EIDOS uses **Prisma ORM** with **MongoDB** as the database. The schema is defined in `/prisma/schema.prisma`.

## Connection

Configure the database URL in your `.env` file:

```env
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/eidos?retryWrites=true&w=majority"
```

## Entity Relationship Diagram

![Entity Relationship Diagram](entity-relation-diagram.png)

---

## Models

### User

Primary user model for authentication and ownership.

```prisma
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          String    @default("user")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  sessions      Session[]
  accounts      Account[]
  courses       Course[]
  studySessions StudySession[]
  lectures      Lecture[]
  captures      Capture[]
  savedQuizzes  Quiz[]
}
```

---

### Session

Authentication sessions for logged-in users.

```prisma
model Session {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

### Account

OAuth/social login accounts linked to users (managed by Better-Auth).

```prisma
model Account {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  accountId             String
  providerId            String
  userId                String    @db.ObjectId
  user                  User      @relation(...)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@unique([providerId, accountId])
}
```

---

### Course

AI-generated courses with chapters and lessons.

```prisma
model Course {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(...)
  title       String
  description String
  thumbnail   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Metadata
  totalDuration      Int
  totalLessons       Int
  learningObjectives String[]
  prerequisites      String[]
  difficulty         String    // 'beginner' | 'intermediate' | 'advanced'

  // Progress
  completedLessons Int @default(0)
  progressPercent  Int @default(0)
  currentChapter   Int @default(0)
  currentLesson    Int @default(0)

  // Completion
  certificateEarned Boolean   @default(false)
  completedAt       DateTime?
  finalExamScore    Float?

  // Generation
  generationStatus   String @default("pending") // 'pending' | 'generating' | 'completed' | 'error'
  generationProgress Json?
  chapters           Json   // Array of Chapter objects

  // Publishing
  isPublished      Boolean   @default(false)
  publishedAt      DateTime?
  originalCourseId String?
}
```

**Chapter JSON Structure:**
```typescript
interface Chapter {
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  title: string;
  type: 'written' | 'video';
  content: string;
  duration: number;
  completed: boolean;
}
```

---

### StudySession

User study sessions with materials and chat history.

```prisma
model StudySession {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  userId         String   @db.ObjectId
  user           User     @relation(...)
  title          String
  description    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  lastAccessedAt DateTime @default(now())
  tags           String[]

  // Analytics
  totalStudyTimeMinutes Float @default(0)
  quizAverageScore      Float @default(0)

  // Content (JSON arrays)
  materials    Json   // Array of StudyMaterial
  quizzes      Json   // Array of Quiz

  // Relations
  chatMessages ChatMessage[]
}
```

---

### ChatMessage

AI tutor conversation history.

```prisma
model ChatMessage {
  id             String       @id @default(auto()) @map("_id") @db.ObjectId
  studySessionId String       @db.ObjectId
  studySession   StudySession @relation(...)
  role           String       // 'user' | 'assistant'
  content        String
  timestamp      DateTime     @default(now())
}
```

---

### Lecture

Generated lectures (written or video).

```prisma
model Lecture {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  user   User   @relation(...)

  type       String   // 'written' | 'video'
  topic      String
  title      String
  content    String?  // for written
  transcript String?
  videoData  Json?    // for video items

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

### Capture

Live lecture capture recordings.

```prisma
model Capture {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  userId     String   @db.ObjectId
  user       User     @relation(...)
  title      String
  notes      String
  transcript String
  duration   Int
  frameCount Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

---

### Quiz

Saved quiz assessments.

```prisma
model Quiz {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  userId     String   @db.ObjectId
  user       User     @relation(...)
  title      String
  topic      String
  difficulty String   @default("medium")
  questions  Json     // Array of QuizQuestion
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**QuizQuestion Structure:**
```typescript
interface QuizQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}
```

---

## Common Operations

### Query Examples

```typescript
import { prisma } from '@/lib/db';

// Get user with courses
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { courses: true }
});

// Get study session with messages
const session = await prisma.studySession.findUnique({
  where: { id: sessionId },
  include: { chatMessages: { orderBy: { timestamp: 'asc' } } }
});

// Create a new capture
const capture = await prisma.capture.create({
  data: {
    userId,
    title: 'Lecture 1',
    notes: markdownNotes,
    transcript,
    duration: 3600,
    frameCount: 720
  }
});
```

---

## Migrations

Since MongoDB is schemaless, Prisma uses `db push` instead of migrations:

```bash
# Sync schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```
