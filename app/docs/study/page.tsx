'use client';

import Link from 'next/link';
import {
    FolderOpen,
    ArrowRight,
    Plus,
    Upload,
    FileText,
    Bot,
    FileQuestion,
    Presentation,
    Lightbulb,
    Clock,
    Tags
} from 'lucide-react';
import styles from '../docs.module.css';

export default function StudyPage() {
    return (
        <div className={styles.docsPage}>
            <div className={styles.docsContainer}>
                <div className={styles.articleContainer}>
                    {/* Breadcrumb */}
                    <nav className={styles.breadcrumb}>
                        <Link href="/docs">Documentation</Link>
                        <span>/</span>
                        <span>Study Sessions</span>
                    </nav>

                    {/* Header */}
                    <header className={styles.articleHeader}>
                        <h1 className={styles.articleTitle}>Study Sessions</h1>
                        <p className={styles.articleMeta}>
                            Organize materials and study effectively with AI assistance
                        </p>
                    </header>

                    {/* Content */}
                    <div className={styles.articleContent}>
                        <p>
                            Study Sessions are your personal learning workspaces. Upload documents,
                            paste notes, generate quizzes, and chat with an AI tutor – all in one place.
                        </p>

                        <h2>Creating a Study Session</h2>

                        <ol className={styles.stepList}>
                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Create New Session</h3>
                                <p className={styles.stepContent}>
                                    Click <Plus size={14} /> <strong>New Session</strong> on the Dashboard.
                                    Enter a descriptive title (e.g., &quot;Organic Chemistry Midterm&quot;).
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Add Materials</h3>
                                <p className={styles.stepContent}>
                                    Upload documents (PDF, DOCX, TXT) or paste text directly. EIDOS extracts
                                    and organizes the content for AI processing.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Generate Content</h3>
                                <p className={styles.stepContent}>
                                    Use your materials to generate quizzes, lectures, or chat with the AI tutor
                                    about specific concepts.
                                </p>
                            </li>
                        </ol>

                        <h2>Managing Materials</h2>

                        <div className={styles.featureBox}>
                            <h4><Upload size={18} /> Uploading Documents</h4>
                            <p>
                                Drag and drop files or use the upload button. Supported formats: PDF,
                                DOCX, TXT. Content is extracted automatically.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><FileText size={18} /> Pasting Text</h4>
                            <p>
                                Copy and paste notes, articles, or any text content directly into
                                a session. Great for web content or lecture notes.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Tags size={18} /> Tags & Organization</h4>
                            <p>
                                Add tags to sessions for easy filtering. Use consistent tags like
                                subjects, semesters, or project names.
                            </p>
                        </div>

                        <h2>Study Features</h2>

                        <h3>AI Tutor Chat</h3>
                        <p>
                            Each session includes access to an AI tutor that understands your materials.
                            Ask questions, request explanations, or get help understanding complex topics.
                        </p>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} />
                            <div className={styles.tipContent}>
                                <strong>Pro Tip:</strong> The AI tutor works best when you have materials
                                uploaded. It uses your content as context for more accurate answers.
                            </div>
                        </div>

                        <h3>Quiz Generation</h3>
                        <p>
                            Generate quizzes based on your study materials:
                        </p>
                        <ol>
                            <li>Open a session with materials</li>
                            <li>Click <FileQuestion size={14} /> <strong>Generate Quiz</strong></li>
                            <li>Select the number of questions</li>
                            <li>Take the quiz and review explanations</li>
                        </ol>

                        <h3>Lecture Generation</h3>
                        <p>
                            Create written or video lectures from your materials:
                        </p>
                        <ol>
                            <li>Select content from your materials</li>
                            <li>Click <Presentation size={14} /> <strong>Generate Lecture</strong></li>
                            <li>Choose written or video format</li>
                            <li>Review and save the generated lecture</li>
                        </ol>

                        <h2>Session Analytics</h2>

                        <div className={styles.featureBox}>
                            <h4><Clock size={18} /> Study Time Tracking</h4>
                            <p>
                                EIDOS tracks time spent in each session. View your study statistics
                                to understand your learning patterns.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Bot size={18} /> Quiz Performance</h4>
                            <p>
                                See your average quiz scores per session. Identify topics that need
                                more attention based on your performance.
                            </p>
                        </div>

                        <h2>Best Practices</h2>
                        <ul>
                            <li>Create separate sessions for different subjects or courses</li>
                            <li>Upload all relevant materials before generating content</li>
                            <li>Use descriptive titles and tags for easy organization</li>
                            <li>Review quiz results to identify weak areas</li>
                            <li>Chat with the AI tutor when stuck on concepts</li>
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
