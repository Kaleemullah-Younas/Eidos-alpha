'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import LoginPage from '@/components/LoginPage';
import {
  getOrCreateQuickSession,
  addQuizToSession,
  recordQuizAttempt,
  getCurrentSessionId,
  getSessionById,
} from '@/lib/studyStorage';
import {
  getStudySource,
  clearStudySource,
  isComingFromLecture,
  clearFromLectureFlag,
} from '@/lib/lectureStorage';
import {
  getSavedQuizzesAction,
  getSavedQuizAction,
  saveQuizAction,
  deleteQuizAction,
} from '@/app/actions/quiz';
import {
  FileQuestion,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Lightbulb,
  Target,
  BarChart3,
  Zap,
  BookOpen,
  Trophy,
  Trash2,
  ArrowLeft,
  Video,
  FileText,
  Save,
  List,
  Clock,
  Loader2,
} from 'lucide-react';
import styles from './quiz.module.css';
import ConfirmationModal from '@/components/ConfirmationModal';
import MathText from '@/components/MathText';

interface QuizQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface StudySource {
  type: string;
  lectureId?: string;
  lectureType?: string;
  title?: string;
}

export default function QuizPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [studyText, setStudyText] = useState('');
  const [studySource, setStudySource] = useState<StudySource | null>(null);
  const [count, setCount] = useState(8);
  const [difficulty, setDifficulty] = useState('Medium');
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [locked, setLocked] = useState<boolean[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);

  // Saved Quizzes State
  const [savedQuizzes, setSavedQuizzes] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    loadSavedQuizzes();
  }, []);

  async function loadSavedQuizzes() {
    const quizzes = await getSavedQuizzesAction();
    setSavedQuizzes(quizzes);
  }

  async function handleSaveQuiz() {
    if (!quiz.length || !saveTitle.trim()) return;
    setIsSaving(true);
    try {
      await saveQuizAction({
        title: saveTitle,
        topic: studySource?.title || 'General Knowledge',
        difficulty,
        questions: quiz,
      });
      setSaveTitle('');
      setMessage('Quiz saved successfully!');
      loadSavedQuizzes();
    } catch (error) {
      console.error(error);
      setMessage('Failed to save quiz');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLoadQuiz(id: string) {
    try {
      const loaded = await getSavedQuizAction(id);
      if (loaded) {
        setQuiz(loaded.questions);
        setAnswers(new Array(loaded.questions.length).fill(null));
        setLocked(new Array(loaded.questions.length).fill(false));
        setCurrentIdx(0);
        setQuizStartTime(Date.now());
        setIsDrawerOpen(false);
        setDifficulty(loaded.difficulty);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleDeleteSavedQuiz(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setQuizToDelete(id);
    setShowDeleteModal(true);
  }

  async function confirmDeleteQuiz() {
    if (!quizToDelete) return;
    setIsDeleting(true);
    try {
      await deleteQuizAction(quizToDelete);
      await loadSavedQuizzes();
      setShowDeleteModal(false);
      setQuizToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  useEffect(() => {
    // Check if we just navigated from a lecture
    const fromLecture = isComingFromLecture();
    const source = getStudySource();

    // Priority 1: If we just clicked from a lecture, use the lecture content
    if (fromLecture && source?.type === 'lecture') {
      clearFromLectureFlag(); // Clear the flag after reading
      setStudySource(source);
      const saved = localStorage.getItem('eidos.studyText');
      if (saved) {
        setStudyText(saved);
        return;
      }
    }

    // Priority 2: Try to load from current session (for study session flow)
    async function loadSession() {
      const currentSessionId = getCurrentSessionId();
      if (currentSessionId) {
        const session = await getSessionById(currentSessionId);
        if (session && session.materials.length > 0) {
          const content = session.materials
            .map(m => m.content)
            .join('\n\n---\n\n');
          setStudyText(content);
          // Clear lecture source since we're loading from session
          clearStudySource();
          setStudySource(null);
          return;
        }
      }
    }
    loadSession();

    // Priority 3: Fallback to localStorage (no source bar)
    clearStudySource();
    setStudySource(null);
    const saved = localStorage.getItem('eidos.studyText');
    if (saved) {
      setStudyText(saved);
    }
  }, []);

  const generateQuiz = async () => {
    if (!studyText.trim()) {
      setMessage('Please paste study text first.');
      return;
    }

    setIsGenerating(true);
    setMessage('');
    setProgress(0);

    try {
      const response = await fetch('/api/generate-quiz-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: studyText,
          count,
          difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.progress) {
                setProgress(data.progress);
                setMessage(`Generating quiz... ${data.progress}%`);
              }

              if (data.done && data.quiz) {
                const questions = Array.isArray(data.quiz) ? data.quiz : [];
                setQuiz(questions);
                setAnswers(new Array(questions.length).fill(null));
                setLocked(new Array(questions.length).fill(false));
                setCurrentIdx(0);
                setMessage('');
                setQuizStartTime(Date.now());

                const session = await getOrCreateQuickSession();
                const savedQuiz = await addQuizToSession(
                  session.id,
                  'manual-input',
                  questions,
                  difficulty
                );
                setCurrentQuizId(savedQuiz.id);
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      setMessage('Failed to generate quiz. Check your API key.');
      console.error(error);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const selectAnswer = (answerIdx: number) => {
    if (locked[currentIdx]) return;

    const newAnswers = [...answers];
    newAnswers[currentIdx] = answerIdx;
    setAnswers(newAnswers);

    const newLocked = [...locked];
    newLocked[currentIdx] = true;
    setLocked(newLocked);
  };

  const correctCount = () => {
    return answers.reduce((acc: number, a, i) => {
      if (a !== null && quiz[i] && a === quiz[i].correctIndex) {
        return acc + 1;
      }
      return acc;
    }, 0);
  };

  const allAnswered = () => {
    return quiz.length > 0 && answers.every(a => a !== null);
  };

  const currentQuestion = quiz[currentIdx];
  const answerLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage />
      </>
    );
  }

  return (
    <>
      <div className={styles.page}>
        <div className="container">
          {studySource?.type === 'lecture' && (
            <div className={styles.sourceBar}>
              <button
                className={styles.backToLecture}
                onClick={() => router.push('/lecture')}
              >
                <ArrowLeft size={16} />
                Back to Lecture
              </button>
              <div className={styles.sourceInfo}>
                {studySource.lectureType === 'video' ? (
                  <Video size={16} />
                ) : (
                  <FileText size={16} />
                )}
                <span>
                  Quiz from: <strong>{studySource.title}</strong>
                </span>
              </div>
            </div>
          )}
          <div className={styles.hero}>
            <h1>
              <span className={styles.heroGradient}>Quiz</span> Challenge
            </h1>
            <p className={styles.heroText}>
              Test your knowledge with AI-generated questions based on your
              study material.
            </p>
          </div>

          <div className={styles.controlsBar}>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className={styles.secondaryBtn}
            >
              <List size={18} />
              Saved Quizzes ({savedQuizzes.length})
            </button>
          </div>

          <div className={styles.mainGrid}>
            {quiz.length === 0 ? (
              <div className={styles.genSection}>
                <div className={styles.genHeader}>
                  <div className={styles.genIcon}>
                    <Sparkles size={20} />
                  </div>
                  <h3>Generate a Quiz</h3>
                </div>
                <div className={styles.genPanel}>
                  <div className={styles.textareaWrapper}>
                    <textarea
                      value={studyText}
                      onChange={e => setStudyText(e.target.value)}
                      placeholder="Paste your study notes here, or capture a lecture first to auto-populate..."
                      className="textarea"
                    />
                    {studyText && (
                      <button
                        className={styles.clearBtn}
                        onClick={() => setStudyText('')}
                        title="Clear text"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Questions</label>
                      <input
                        type="number"
                        min={3}
                        max={20}
                        value={count}
                        onChange={e => setCount(parseInt(e.target.value) || 8)}
                        className="input"
                        style={{ width: 90 }}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value)}
                        className="select"
                        style={{ width: 130 }}
                      >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                    <button
                      onClick={generateQuiz}
                      disabled={isGenerating}
                      className={`${styles.controlBtn} ${styles.primaryBtn}`}
                    >
                      <Sparkles size={18} />
                      {isGenerating ? 'Generating...' : 'Generate Quiz'}
                    </button>
                  </div>
                  {message && (
                    <div className={styles.message}>
                      {isGenerating && progress > 0 && (
                        <div
                          className={styles.progressBar}
                          style={{ marginBottom: '0.5rem' }}
                        >
                          <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                      <Lightbulb size={16} />
                      {message}
                    </div>
                  )}

                  {!studyText && (
                    <div className={styles.placeholder}>
                      <div className={styles.placeholderIcon}>
                        <BookOpen size={32} />
                      </div>
                      <div className={styles.placeholderText}>
                        <h4>No Study Material</h4>
                        <p>Paste your notes above or capture a lecture first</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.quizSection}>
                <div className={styles.quizHeader}>
                  <div className={styles.progressInfo}>
                    <span className={styles.questionBadge}>
                      Q {currentIdx + 1}/{quiz.length}
                    </span>
                    <span className={styles.scoreBadge}>
                      <Check size={14} />
                      {correctCount()} correct
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${((currentIdx + 1) / quiz.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {currentQuestion && (
                  <div className={styles.questionCard}>
                    <h3 className={styles.question}>
                      <MathText text={currentQuestion.question} />
                    </h3>

                    <div className={styles.answers}>
                      {currentQuestion.choices.map((choice, i) => {
                        let className = styles.answer;
                        if (locked[currentIdx]) {
                          if (i === currentQuestion.correctIndex) {
                            className += ` ${styles.correct}`;
                          } else if (
                            i === answers[currentIdx] &&
                            i !== currentQuestion.correctIndex
                          ) {
                            className += ` ${styles.wrong}`;
                          }
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => selectAnswer(i)}
                            disabled={locked[currentIdx]}
                            className={className}
                          >
                            <span className={styles.answerLetter}>
                              {answerLetters[i]}
                            </span>
                            <MathText text={choice} />
                            {locked[currentIdx] &&
                              i === currentQuestion.correctIndex && (
                                <Check size={18} className={styles.checkIcon} />
                              )}
                            {locked[currentIdx] &&
                              i === answers[currentIdx] &&
                              i !== currentQuestion.correctIndex && (
                                <X size={18} className={styles.wrongIcon} />
                              )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {locked[currentIdx] && currentQuestion && (
                  <div className={styles.explanation}>
                    <Lightbulb size={18} />
                    <div>
                      <strong>Explanation:</strong>{' '}
                      <MathText text={currentQuestion.explanation} />
                    </div>
                  </div>
                )}

                <div className={styles.quizActions}>
                  <button
                    onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                    disabled={currentIdx === 0}
                    className={styles.navBtn}
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>
                  {currentIdx < quiz.length - 1 ? (
                    <button
                      onClick={() =>
                        setCurrentIdx(i => Math.min(quiz.length - 1, i + 1))
                      }
                      className={`${styles.navBtn} ${styles.nextBtn}`}
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        if (allAnswered()) {
                          setIsFinishing(true);
                          try {
                            if (currentQuizId) {
                              const session = await getOrCreateQuickSession();
                              const timeSpent = Math.floor(
                                (Date.now() - quizStartTime) / 1000
                              );
                              await recordQuizAttempt(
                                session.id,
                                currentQuizId,
                                answers,
                                timeSpent
                              );
                            }
                            setShowResults(true);
                          } finally {
                            setIsFinishing(false);
                          }
                        }
                      }}
                      disabled={!allAnswered() || isFinishing}
                      className={`${styles.navBtn} ${styles.finishBtn}`}
                    >
                      {isFinishing ? (
                        <Loader2 size={18} className={styles.spinner} /> // Assuming .spinner exists in global or we need inline animate-spin
                      ) : (
                        <Trophy size={18} />
                      )}
                      {isFinishing ? 'Saving...' : 'Finish'}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className={styles.sidebar}>
              {quiz.length > 0 ? (
                <>
                  <div className={styles.statsCard}>
                    <div className={styles.statsHeader}>
                      <BarChart3 size={18} />
                      <h3>Progress</h3>
                    </div>
                    <div className={styles.statsGrid}>
                      <div className={styles.statItem}>
                        <p className={styles.statValue}>
                          {locked.filter(Boolean).length}
                        </p>
                        <p className={styles.statLabel}>Answered</p>
                      </div>
                      <div className={styles.statItem}>
                        <p className={styles.statValue}>
                          {quiz.length - locked.filter(Boolean).length}
                        </p>
                        <p className={styles.statLabel}>Remaining</p>
                      </div>
                      <div className={styles.statItem}>
                        <p className={styles.statValue}>{correctCount()}</p>
                        <p className={styles.statLabel}>Correct</p>
                      </div>
                      <div className={styles.statItem}>
                        <p className={styles.statValue}>
                          {locked.filter(Boolean).length > 0
                            ? Math.round(
                              (correctCount() /
                                locked.filter(Boolean).length) *
                              100
                            )
                            : 0}
                          %
                        </p>
                        <p className={styles.statLabel}>Accuracy</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.actionCard}>
                    <button
                      onClick={() => {
                        setQuiz([]);
                        setAnswers([]);
                        setLocked([]);
                        setCurrentIdx(0);
                        setShowResults(false);
                        setCurrentQuizId(null);
                        setQuizStartTime(0);
                      }}
                      className={styles.resetBtn}
                    >
                      <RotateCcw size={16} />
                      New Quiz
                    </button>
                    {!savedQuizzes.find(q => JSON.stringify(q.questions) === JSON.stringify(quiz)) && (
                      <div className={styles.saveSection}>
                        <h4 className={styles.saveHeader}>Save this Quiz</h4>
                        <div className={styles.saveForm}>
                          <input
                            type="text"
                            placeholder="Quiz Title"
                            value={saveTitle}
                            onChange={(e) => setSaveTitle(e.target.value)}
                            className={styles.saveInput}
                          />
                          <button
                            onClick={handleSaveQuiz}
                            disabled={isSaving || !saveTitle.trim()}
                            className={styles.saveBtn}
                          >
                            {isSaving ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.tipsCard}>
                    <div className={styles.tipsHeader}>
                      <Lightbulb size={18} />
                      <h3>Tips</h3>
                    </div>
                    <ul className={styles.tipsList}>
                      <li className={styles.tipItem}>
                        <BookOpen size={16} />
                        <span>
                          Paste comprehensive notes for better questions
                        </span>
                      </li>
                      <li className={styles.tipItem}>
                        <Target size={16} />
                        <span>Start with Medium difficulty</span>
                      </li>
                      <li className={styles.tipItem}>
                        <BarChart3 size={16} />
                        <span>8-10 questions is ideal for a quick review</span>
                      </li>
                      <li className={styles.tipItem}>
                        <RotateCcw size={16} />
                        <span>Generate multiple quizzes for variety</span>
                      </li>
                    </ul>
                  </div>

                  <div className={styles.statsCard}>
                    <div className={styles.statsHeader}>
                      <Zap size={18} />
                      <h3>Features</h3>
                    </div>
                    <div className={styles.statsGrid}>
                      <div className={styles.statItem}>
                        <p className={styles.statValue}>AI</p>
                        <p className={styles.statLabel}>Powered</p>
                      </div>
                      <div className={styles.statItem}>
                        <p className={styles.statValue}>3</p>
                        <p className={styles.statLabel}>Difficulties</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div >

      {/* Saved Quizzes Drawer */}
      {
        isDrawerOpen && (
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <h2>Saved Quizzes</h2>
              <button onClick={() => setIsDrawerOpen(false)} className={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.savedList}>
              {savedQuizzes.length === 0 ? (
                <p className={styles.emptyState}>
                  No saved quizzes yet. Generate one and save it!
                </p>
              ) : (
                savedQuizzes.map(sq => (
                  <div
                    key={sq.id}
                    onClick={() => handleLoadQuiz(sq.id)}
                    className={styles.savedItem}
                  >
                    <div className={styles.savedItemHeader}>
                      <h3 className={styles.savedItemTitle}>{sq.title}</h3>
                      <button
                        onClick={(e) => handleDeleteSavedQuiz(sq.id, e)}
                        className={styles.deleteBtn}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className={styles.savedItemMeta}>
                      <span className={styles.metaItem}>
                        <Target size={12} /> {sq.difficulty}
                      </span>
                      <span className={styles.metaItem}>
                        <FileQuestion size={12} /> {sq.questions.length} Qs
                      </span>
                      <span className={styles.metaItem}>
                        <Clock size={12} /> {new Date(sq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      }
      {
        isDrawerOpen && (
          <div
            onClick={() => setIsDrawerOpen(false)}
            className={styles.drawerOverlay}
          />
        )
      }

      {
        showResults && (
          <div
            className={styles.resultsOverlay}
            onClick={() => setShowResults(false)}
          >
            <div
              className={styles.resultsCard}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.resultsIcon}>
                <Trophy size={48} />
              </div>
              <h2>Quiz Complete!</h2>
              <div className={styles.resultsScore}>
                {correctCount()}/{quiz.length}
              </div>
              <p>
                {correctCount() === quiz.length
                  ? 'Perfect score! Amazing work!'
                  : correctCount() >= quiz.length * 0.7
                    ? 'Great job! Keep it up!'
                    : "Keep practicing, you'll get there!"}
              </p>
              <button
                onClick={() => setShowResults(false)}
                className={`${styles.controlBtn} ${styles.primaryBtn}`}
              >
                Close
              </button>
            </div>
          </div>
        )
      }
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteQuiz}
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Quiz'}
        isLoading={isDeleting}
        isDanger={true}
      />
    </>
  );
}
