'use client';

import Link from 'next/link';
import {
    Video,
    ArrowRight,
    Play,
    Square,
    Mic,
    Camera,
    FileText,
    Download,
    Save,
    Lightbulb,
    Sparkles
} from 'lucide-react';
import styles from '../docs.module.css';

export default function CapturePage() {
    return (
        <div className={styles.docsPage}>
            <div className={styles.docsContainer}>
                <div className={styles.articleContainer}>
                    {/* Breadcrumb */}
                    <nav className={styles.breadcrumb}>
                        <Link href="/docs">Documentation</Link>
                        <span>/</span>
                        <span>Live Capture</span>
                    </nav>

                    {/* Header */}
                    <header className={styles.articleHeader}>
                        <h1 className={styles.articleTitle}>Live Capture</h1>
                        <p className={styles.articleMeta}>
                            Record lectures and generate AI-powered notes in real-time
                        </p>
                    </header>

                    {/* Content */}
                    <div className={styles.articleContent}>
                        <p>
                            Live Capture is EIDOS&apos;s signature feature for recording lectures. It
                            simultaneously captures video frames, transcribes audio, and generates
                            comprehensive notes using AI.
                        </p>

                        <h2>How It Works</h2>

                        <ol className={styles.stepList}>
                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Grant Permissions</h3>
                                <p className={styles.stepContent}>
                                    Allow access to your camera and microphone when prompted. EIDOS needs
                                    these to record visual content and transcribe audio.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Start Recording</h3>
                                <p className={styles.stepContent}>
                                    Click the <Play size={14} /> <strong>Start Capture</strong> button.
                                    Point your camera at the lecture, whiteboard, or screen share.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Automatic Processing</h3>
                                <p className={styles.stepContent}>
                                    EIDOS extracts frames every 5 seconds and transcribes audio in real-time.
                                    You&apos;ll see the live transcript building as you record.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Stop & Generate</h3>
                                <p className={styles.stepContent}>
                                    Click <Square size={14} /> <strong>Stop</strong> when done. Then click
                                    <Sparkles size={14} /> <strong>Generate Notes</strong> to create structured notes.
                                </p>
                            </li>
                        </ol>

                        <h2>Recording Interface</h2>

                        <div className={styles.featureBox}>
                            <h4><Camera size={18} /> Video Preview</h4>
                            <p>
                                See what your camera is capturing in real-time. Position it to capture
                                slides, whiteboards, or any visual content.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Mic size={18} /> Live Transcript</h4>
                            <p>
                                Watch as your speech is transcribed in real-time. The transcript updates
                                continuously during recording.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><FileText size={18} /> Generated Notes</h4>
                            <p>
                                After generation, view beautifully formatted Markdown notes with headings,
                                lists, and key concepts highlighted.
                            </p>
                        </div>

                        <h2>After Capture</h2>

                        <p>Once you&apos;ve generated notes, you can:</p>

                        <ul>
                            <li><Save size={16} style={{ marginRight: '0.5rem' }} />
                                <strong>Save Capture</strong> – Store for later access from the Dashboard
                            </li>
                            <li><Download size={16} style={{ marginRight: '0.5rem' }} />
                                <strong>Download Notes</strong> – Export as a Markdown file
                            </li>
                            <li><strong>Generate Quiz</strong> – Create a quiz based on the captured content</li>
                            <li><strong>View History</strong> – Access previously saved captures</li>
                        </ul>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} />
                            <div className={styles.tipContent}>
                                <strong>Best Results:</strong> Position your camera to clearly capture any
                                visual aids (slides, whiteboard). Speak clearly for accurate transcription.
                                Longer recordings produce more comprehensive notes.
                            </div>
                        </div>

                        <h2>Tips for Better Captures</h2>

                        <ul>
                            <li>Use a stable camera position to avoid blurry frames</li>
                            <li>Ensure good lighting for visual content</li>
                            <li>Minimize background noise for clearer transcription</li>
                            <li>Record entire lecture segments for context-rich notes</li>
                            <li>Review and edit generated notes as needed</li>
                        </ul>

                        <h2>Capture History</h2>
                        <p>
                            All saved captures appear in the <strong>Captures</strong> section of your
                            Dashboard. Click any capture to view its notes, transcript, and metadata.
                        </p>
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
