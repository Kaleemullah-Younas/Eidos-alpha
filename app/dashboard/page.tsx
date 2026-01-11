'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import LoginPage from '@/components/LoginPage';
import {
  getAllSessions,
  createStudySession,
  deleteStudySession,
  getStudyStats,
  setCurrentSessionId,
  addMaterialToSession,
  StudySession,
  StudyStats,
} from '@/lib/studyStorage';
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  TrendingUp,
  Layers,
  Flame,
  Video,
  Upload,
  FileQuestion,
  FolderOpen,
  Plus,
  FileText,
  HelpCircle,
  BarChart3,
  Trash2,
  X,
  Bot,
  Sparkles,
  Loader2,
} from 'lucide-react';
import styles from './dashboard.module.css';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function DashboardPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setSessions(await getAllSessions());
      setStats(await getStudyStats());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      const session = await createStudySession(newTitle, newDescription);

      // Add content as material if provided
      if (newContent.trim()) {
        await addMaterialToSession(session.id, {
          type: 'text',
          title: newTitle,
          content: newContent,
          sourceType: 'text',
        });
        // Also save to localStorage for quick access
        localStorage.setItem('eidos.studyText', newContent);
      }

      setCurrentSessionId(session.id);
      setShowNewModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewContent('');
      loadData();
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessionToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteSession = async () => {
    if (sessionToDelete) {
      setIsDeleting(true);
      try {
        await deleteStudySession(sessionToDelete);
        await loadData();
        setShowDeleteModal(false);
        setSessionToDelete(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.progress) setUploadProgress(data.progress);
              if (data.content) content = data.content;
              if (data.error) throw new Error(data.error);
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      const session = await createStudySession(file.name);
      await addMaterialToSession(session.id, {
        type: 'upload',
        title: file.name,
        content,
        sourceType: file.type.includes('pdf') ? 'pdf' : 'image',
      });

      localStorage.setItem('eidos.studyText', content);
      setCurrentSessionId(session.id);

      setShowUploadModal(false);
      loadData();
    } catch (error) {
      console.error('Error processing document:', error);
      setErrorModal({
        title: 'Error',
        message: 'Failed to process document. Please try again.'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <>
        <main className={styles.main}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <p>Loading...</p>
          </div>
        </main>
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage />
      </>
    );
  }

  return (
    <>
      <main className={styles.main}>
        <div className={styles.page}>
          <div className={styles.hero}>
            <h1>
              <span className={styles.heroGradient}>Study</span> Command Center
            </h1>
            <p className={styles.heroText}>
              Track your progress, manage sessions, and accelerate your learning
              journey.
            </p>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className={styles.statCard} style={{ opacity: 0.5, animation: 'pulse 1.5s infinite', animationDelay: `${i * 0.1}s` }}>
                  <div className={styles.statIcon} style={{ background: '#eee' }}></div>
                  <p className={styles.statValue}>-</p>
                  <p className={styles.statLabel}>Loading...</p>
                </div>
              ))
            ) : (
              <>
                <div className={styles.statCard} style={{ animationDelay: '0.1s' }}>
                  <div className={styles.statIcon}>
                    <BookOpen size={22} />
                  </div>
                  <p className={styles.statValue}>{stats?.totalSessions || 0}</p>
                  <p className={styles.statLabel}>Study Sessions</p>
                </div>
                <div className={styles.statCard} style={{ animationDelay: '0.2s' }}>
                  <div className={styles.statIcon}>
                    <Brain size={22} />
                  </div>
                  <p className={styles.statValue}>
                    {stats?.totalQuizzesTaken || 0}
                  </p>
                  <p className={styles.statLabel}>Quizzes Taken</p>
                </div>
                <div className={styles.statCard} style={{ animationDelay: '0.3s' }}>
                  <div className={styles.statIcon}>
                    <TrendingUp size={22} />
                  </div>
                  <p className={styles.statValue}>
                    {stats?.averageQuizScore || 0}%
                  </p>
                  <p className={styles.statLabel}>Avg Quiz Score</p>
                </div>

                <div className={styles.statCard} style={{ animationDelay: '0.4s' }}>
                  <div className={styles.statIcon}>
                    <Flame size={22} />
                  </div>
                  <p className={styles.statValue}>{stats?.streakDays || 0}</p>
                  <p className={styles.statLabel}>Day Streak</p>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <Link href="/capture" className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <Video size={24} />
              </div>
              <h3>Capture Lecture</h3>
              <p>Record and analyze a live lecture with AI</p>
            </Link>
            <div
              className={styles.actionCard}
              onClick={() => setShowUploadModal(true)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.actionIcon}>
                <Upload size={24} />
              </div>
              <h3>Upload Document</h3>
              <p>Upload PDF or images for AI analysis</p>
            </div>
            <Link
              href="/lecture"
              className={`${styles.actionCard} ${styles.highlightCard}`}
            >
              <div className={styles.actionIcon}>
                <Sparkles size={24} />
              </div>
              <h3>AI Lecture</h3>
              <p>Generate video & written lectures on any topic</p>
            </Link>
            <Link href="/study" className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <Brain size={24} />
              </div>
              <h3>Smart Study</h3>
              <p>Ask AI questions about your material</p>
            </Link>
            <Link href="/quiz" className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <FileQuestion size={24} />
              </div>
              <h3>Take Quiz</h3>
              <p>Test your knowledge with AI quizzes</p>
            </Link>

          </div>

          {/* Sessions List */}
          <div className={styles.sessionsSection}>
            <div className={styles.sessionsHeader}>
              <h2>
                <FolderOpen size={20} />
                Study Sessions
              </h2>
              <button
                className={styles.newSessionBtn}
                onClick={() => setShowNewModal(true)}
              >
                <Plus size={16} />
                New Session
              </button>
            </div>

            {isLoading ? (
              <div className={styles.sessionsList}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.sessionCard} style={{ opacity: 0.5, height: '150px', animation: 'pulse 1.5s infinite' }}></div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <BookOpen size={40} />
                </div>
                <h3>No study sessions yet</h3>
                <p>Start by capturing a lecture or uploading study materials</p>
                <button
                  className={styles.newSessionBtn}
                  onClick={() => setShowNewModal(true)}
                >
                  <Plus size={16} />
                  Create Your First Session
                </button>
              </div>
            ) : (
              <div className={styles.sessionsList}>
                {sessions.map(session => (
                  <div key={session.id} className={styles.sessionCard}>
                    <div className={styles.sessionTop}>
                      <div className={styles.sessionInfo}>
                        <h3>{session.title}</h3>
                        <span className={styles.sessionDate}>
                          {formatDate(session.createdAt)}
                        </span>
                      </div>
                      <div className={styles.sessionActions}>
                        <Link href={`/study?session=${session.id}`}>
                          <button
                            className={styles.iconBtn}
                            onClick={() => handleSelectSession(session.id)}
                            title="Smart Study"
                          >
                            <Brain size={16} />
                          </button>
                        </Link>
                        <Link href="/quiz">
                          <button
                            className={styles.iconBtn}
                            onClick={() => handleSelectSession(session.id)}
                            title="Take Quiz"
                          >
                            <FileQuestion size={16} />
                          </button>
                        </Link>

                        <button
                          className={`${styles.iconBtn} ${styles.danger}`}
                          onClick={() => handleDeleteSession(session.id)}
                          title="Delete Session"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.sessionStats}>
                      <div className={styles.sessionStat}>
                        <FileText size={14} />
                        {session.materials.length} materials
                      </div>
                      <div className={styles.sessionStat}>
                        <HelpCircle size={14} />
                        {session.quizzes.reduce(
                          (acc, q) => acc + q.questions.length,
                          0
                        )}{' '}
                        questions
                      </div>

                      {session.quizAverageScore > 0 && (
                        <div className={styles.sessionStat}>
                          <BarChart3 size={14} />
                          {Math.round(session.quizAverageScore)}% avg score
                        </div>
                      )}
                    </div>
                    {session.tags.length > 0 && (
                      <div className={styles.sessionTags}>
                        {session.tags.map(tag => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Session Modal */}
      {showNewModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowNewModal(false)}
        >
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Session</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowNewModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalForm}>
              <div className={styles.field}>
                <label>Session Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Biology Chapter 5"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className={styles.field}>
                <label>Description (optional)</label>
                <textarea
                  className="textarea"
                  placeholder="Add notes about this study session..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className={styles.field}>
                <label>Study Content (optional)</label>
                <textarea
                  className="textarea"
                  placeholder="Paste your study material, notes, or text content here..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  rows={6}
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setShowNewModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.createBtn}
                  onClick={handleCreateSession}
                  disabled={!newTitle.trim() || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className={styles.spinner} style={{ animation: 'spin 1s linear infinite' }} />
                      Creating...
                    </>
                  ) : (
                    'Create Session'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => !isUploading && setShowUploadModal(false)}
        >
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Upload Document</h2>
              <button
                className={styles.closeBtn}
                onClick={() => !isUploading && setShowUploadModal(false)}
                disabled={isUploading}
              >
                <X size={18} />
              </button>
            </div>
            <div
              className={`${styles.uploadArea} ${dragOver ? styles.dragOver : ''
                }`}
              onDragOver={e => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <div className={styles.uploadIcon}>
                <Upload size={32} />
              </div>
              <p>
                <strong>Click to upload</strong> or drag and drop
              </p>
              <p>PDF, JPG, PNG, GIF, WEBP</p>
            </div>
            {isUploading && (
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            {isUploading && (
              <p className={styles.uploadingText}>
                <Bot size={16} />
                Analyzing document with Gemini AI... {uploadProgress}%
              </p>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteSession}
        title="Delete Session"
        message="Are you sure you want to delete this study session? This action cannot be undone and all associated quizzes will be permanently deleted."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Session'}
        isLoading={isDeleting}
        isDanger={true}
      />

      <ConfirmationModal
        isOpen={!!errorModal}
        onClose={() => setErrorModal(null)}
        onConfirm={() => setErrorModal(null)}
        title={errorModal?.title || ''}
        message={errorModal?.message || ''}
        confirmText="OK"
        cancelText=""
        isDanger={true}
      />
    </>
  );
}
