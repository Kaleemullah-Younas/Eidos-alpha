# EIDOS Components

## Overview

EIDOS uses a component-based architecture with CSS Modules for styling. All components are located in `/components/`.

## Component Categories

### Layout Components

#### `Header.tsx`
Main navigation header with theme toggle and user menu.

```tsx
import Header from '@/components/Header';

<Header />
```

**Features:**
- Logo with home link
- Navigation links
- Dark/light mode toggle
- User authentication state

---

#### `AuthProvider.tsx`
Context provider for authentication state management.

```tsx
import { AuthProvider, useAuth } from '@/components/AuthProvider';

// In layout
<AuthProvider>{children}</AuthProvider>

// In components
const { isLoggedIn, user, signOut } = useAuth();
```

---

#### `ThemeProvider.tsx`
Manages dark/light mode preference with system detection.

```tsx
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';

const { theme, toggleTheme } = useTheme();
```

---

### Feature Components

#### `CapturePage.tsx`
Live lecture capture interface with video recording, speech transcription, and AI note generation.

**Key Features:**
- Video stream capture
- Frame extraction at intervals
- Real-time speech-to-text
- Gemini-powered note generation
- Save/load captures

**State:**
- `isRecording`: Recording status
- `transcript`: Speech transcription
- `frames`: Captured video frames
- `notes`: Generated notes

---

#### `VideoPresenter.tsx`
Slide-based video lecture player with TTS narration.

```tsx
import VideoPresenter from '@/components/VideoPresenter';

<VideoPresenter 
  slides={slidesArray}
  onComplete={() => {}}
/>
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| slides | Slide[] | Array of slide objects |
| onComplete | () => void | Callback on completion |

---

#### `AITutor.tsx`
Voice-interactive AI assistant with context awareness.

```tsx
import AITutor from '@/components/AITutor';

<AITutor context={studyMaterialContent} />
```

**Features:**
- Voice activation ("Hey" to interrupt)
- Context-aware responses
- Text-to-speech output
- Conversation history

---

#### `InteractiveLecture.tsx`
Written lecture display with markdown rendering and text-to-speech.

**Features:**
- Markdown rendering
- Karaoke-style word highlighting
- Playback controls
- Speed adjustment

---

#### `FinalExam.tsx`
Course completion exam component with scoring.

---

#### `Certificate.tsx` & `CertificateModal.tsx`
Certificate generation and display for course completion.

**Features:**
- PDF generation (jsPDF)
- Canvas rendering (html2canvas)
- Download functionality

---

### UI Components

#### `ConfirmationModal.tsx`
Reusable confirmation dialog.

```tsx
import ConfirmationModal from '@/components/ConfirmationModal';

<ConfirmationModal
  isOpen={showModal}
  title="Delete Item?"
  message="This cannot be undone."
  confirmLabel="Delete"
  onConfirm={handleDelete}
  onCancel={() => setShowModal(false)}
  danger
/>
```

---

#### `CustomSelect.tsx`
Styled dropdown select component.

```tsx
import CustomSelect from '@/components/CustomSelect';

<CustomSelect
  options={[
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' }
  ]}
  value={selectedValue}
  onChange={setValue}
/>
```

---

#### `Skeleton.tsx`
Loading skeleton components for various layouts.

```tsx
import Skeleton from '@/components/Skeleton';

<Skeleton.Card />
<Skeleton.Text lines={3} />
<Skeleton.List count={5} />
```

---

#### `MarkdownRenderer.tsx`
Markdown to React component renderer.

```tsx
import MarkdownRenderer from '@/components/MarkdownRenderer';

<MarkdownRenderer content={markdownString} />
```

**Features:**
- Syntax highlighting (react-syntax-highlighter)
- Math equations (KaTeX)
- Custom styling

---

#### `MathText.tsx`
Inline math equation rendering with KaTeX.

```tsx
import MathText from '@/components/MathText';

<MathText text="The equation is $E = mc^2$" />
```

---

#### `EmbeddedQuiz.tsx`
Inline quiz component for courses.

---

#### `EligibilityModal.tsx`
Certificate eligibility checker modal.

---

#### `VideoQuizPopup.tsx`
Quiz interruption during video lectures.

---

### 3D Components

#### `Scene3D.tsx`
Three.js scene for landing page with floating geometric shapes.

```tsx
import Scene3D from '@/components/Scene3D';

<Scene3D />
```

**Features:**
- React Three Fiber integration
- Animated 3D objects
- Mouse interaction
- Theme-aware colors

---

#### `Whiteboard.tsx`
3D whiteboard visualization for video lectures.

---

### Authentication Pages

#### `LoginPage.tsx`
Sign-in form with validation.

#### `SignUpPage.tsx`
Registration form with validation.

---

## Styling Approach

All components use CSS Modules with a consistent pattern:

```tsx
import styles from './ComponentName.module.css';

export default function ComponentName() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hello</h1>
    </div>
  );
}
```

### Design Tokens

Components use CSS custom properties from `globals.css`:

```css
.container {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
}

.accent {
  background: var(--accent);
  color: white;
}
```

### Common Patterns

1. **Glass effect**: `backdrop-filter: blur()` with semi-transparent backgrounds
2. **Hover states**: Subtle transforms and shadow changes
3. **Focus states**: Accent-colored outlines with shadow glow
4. **Animations**: Smooth transitions with `cubic-bezier` easing

---

## Adding New Components

1. Create `ComponentName.tsx` in `/components/`
2. Create `ComponentName.module.css` for styles
3. Use TypeScript interfaces for props
4. Follow existing patterns for consistency
5. Use design tokens from `globals.css`

```tsx
// Template for new component
'use client';

import styles from './ComponentName.module.css';

interface ComponentNameProps {
  title: string;
  onAction?: () => void;
}

export default function ComponentName({ title, onAction }: ComponentNameProps) {
  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      {onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          Action
        </button>
      )}
    </div>
  );
}
```
