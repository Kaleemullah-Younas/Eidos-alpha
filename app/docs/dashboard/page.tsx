'use client';

import Link from 'next/link';
import {
    LayoutDashboard,
    ArrowRight,
    Plus,
    FolderOpen,
    GraduationCap,
    Video,
    FileText,
    Trash2,
    Upload,
    Lightbulb
} from 'lucide-react';
import styles from '../docs.module.css';

export default function DashboardPage() {
    return (
        <div className={styles.docsPage}>
            <div className={styles.docsContainer}>
                <div className={styles.articleContainer}>
                    {/* Breadcrumb */}
                    <nav className={styles.breadcrumb}>
                        <Link href="/docs">Documentation</Link>
                        <span>/</span>
                        <span>Dashboard</span>
                    </nav>

                    {/* Header */}
                    <header className={styles.articleHeader}>
                        <h1 className={styles.articleTitle}>Dashboard Guide</h1>
                        <p className={styles.articleMeta}>
                            Your central hub for managing all learning activities
                        </p>
                    </header>

                    {/* Content */}
                    <div className={styles.articleContent}>
                        <p>
                            The Dashboard is your command center in EIDOS. From here, you can access all your
                            Study Sessions, Courses, and Captures, create new content, and track your progress.
                        </p>

                        <h2>Dashboard Sections</h2>

                        <h3>Study Sessions</h3>
                        <div className={styles.featureBox}>
                            <h4><FolderOpen size={18} /> Your Learning Workspaces</h4>
                            <p>
                                Study Sessions are containers for your learning materials. Each session can hold
                                documents, generated content, quizzes, and AI chat history.
                            </p>
                        </div>

                        <p><strong>To create a new session:</strong></p>
                        <ol>
                            <li>Click the <code><Plus size={14} /> New Session</code> button</li>
                            <li>Enter a title for your session (e.g., &quot;Biology 101&quot;)</li>
                            <li>Optionally add a description</li>
                            <li>Click <strong>Create</strong></li>
                        </ol>

                        <h3>My Courses</h3>
                        <div className={styles.featureBox}>
                            <h4><GraduationCap size={18} /> AI-Generated Learning Paths</h4>
                            <p>
                                View and continue your generated courses. Track progress, complete lessons,
                                and earn certificates upon completion.
                            </p>
                        </div>

                        <h3>Captures</h3>
                        <div className={styles.featureBox}>
                            <h4><Video size={18} /> Recorded Lecture Notes</h4>
                            <p>
                                Access all your saved captures from live recordings. Review notes, transcripts,
                                and generate quizzes from captured content.
                            </p>
                        </div>

                        <h2>Uploading Materials</h2>
                        <p>
                            You can add materials to a Study Session by:
                        </p>
                        <ul>
                            <li><Upload size={16} style={{ marginRight: '0.5rem' }} />
                                <strong>Drag & Drop</strong> – Drop files directly onto the dashboard
                            </li>
                            <li><FileText size={16} style={{ marginRight: '0.5rem' }} />
                                <strong>Paste Text</strong> – Paste content directly into a session
                            </li>
                            <li><Plus size={16} style={{ marginRight: '0.5rem' }} />
                                <strong>Upload Button</strong> – Click to browse and select files
                            </li>
                        </ul>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} />
                            <div className={styles.tipContent}>
                                <strong>Supported Formats:</strong> PDF, TXT, DOCX, and plain text.
                                EIDOS extracts content automatically for AI processing.
                            </div>
                        </div>

                        <h2>Managing Content</h2>

                        <h3>Editing Sessions</h3>
                        <p>
                            Click on any session card to open it. You can then:
                        </p>
                        <ul>
                            <li>View and edit materials</li>
                            <li>Generate quizzes from the content</li>
                            <li>Chat with the AI Tutor</li>
                            <li>Create lectures based on your materials</li>
                        </ul>

                        <h3>Deleting Content</h3>
                        <p>
                            To delete a session, course, or capture:
                        </p>
                        <ol>
                            <li>Hover over the item card</li>
                            <li>Click the <Trash2 size={14} /> delete icon</li>
                            <li>Confirm the deletion in the modal</li>
                        </ol>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} />
                            <div className={styles.tipContent}>
                                <strong>Warning:</strong> Deletion is permanent. All associated content,
                                quizzes, and chat history will be removed.
                            </div>
                        </div>

                        <h2>Quick Actions</h2>
                        <p>
                            The Dashboard provides quick access buttons to:
                        </p>
                        <ul>
                            <li><strong>Capture</strong> – Start a new live lecture capture</li>
                            <li><strong>Generate Course</strong> – Create an AI-powered course</li>
                            <li><strong>Lecture</strong> – Generate a standalone lecture</li>
                            <li><strong>Quiz</strong> – Create a quick assessment</li>
                        </ul>
                    </div>

                    {/* Back Link */}
                    <Link href="/docs" className={styles.backLink}>
                        <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
                        Back to Documentation
                    </Link>
                </div>
            </div>
        </div>
    );
}
