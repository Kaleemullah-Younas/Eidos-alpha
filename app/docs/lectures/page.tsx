'use client';

import Link from 'next/link';
import {
    Presentation,
    ArrowRight,
    FileText,
    Video,
    Play,
    Pause,
    Volume2,
    Download,
    Save,
    Lightbulb,
    Gauge
} from 'lucide-react';
import styles from '../docs.module.css';

export default function LecturesPage() {
    return (
        <div className={styles.docsPage}>
            <div className={styles.docsContainer}>
                <div className={styles.articleContainer}>
                    {/* Breadcrumb */}
                    <nav className={styles.breadcrumb}>
                        <Link href="/docs">Documentation</Link>
                        <span>/</span>
                        <span>Lecture Generator</span>
                    </nav>

                    {/* Header */}
                    <header className={styles.articleHeader}>
                        <h1 className={styles.articleTitle}>Lecture Generator</h1>
                        <p className={styles.articleMeta}>
                            Create written or video lectures on any topic instantly
                        </p>
                    </header>

                    {/* Content */}
                    <div className={styles.articleContent}>
                        <p>
                            The Lecture Generator creates comprehensive educational content on any subject.
                            Choose between written lectures (Markdown) or video lectures (slides with narration).
                        </p>

                        <h2>Lecture Types</h2>

                        <div className={styles.featureBox}>
                            <h4><FileText size={18} /> Written Lectures</h4>
                            <p>
                                Comprehensive Markdown documents with headings, explanations, examples,
                                and key concepts. Perfect for reading and note-taking.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Video size={18} /> Video Lectures</h4>
                            <p>
                                Slide-based presentations with AI narration. Each slide includes visual
                                content and spoken explanation. Interactive and engaging.
                            </p>
                        </div>

                        <h2>Generating a Lecture</h2>

                        <ol className={styles.stepList}>
                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Enter Your Topic</h3>
                                <p className={styles.stepContent}>
                                    Navigate to Lectures and enter any topic. Be specific for focused
                                    content (e.g., &quot;Photosynthesis in C4 Plants&quot; vs &quot;Biology&quot;).
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Choose Format</h3>
                                <p className={styles.stepContent}>
                                    Select <strong>Written</strong> for text-based content or
                                    <strong>Video</strong> for slide presentations with narration.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Generate</h3>
                                <p className={styles.stepContent}>
                                    Click <strong>Generate</strong>. Wait while the AI creates your
                                    lecture content. This usually takes 10-30 seconds.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Review & Save</h3>
                                <p className={styles.stepContent}>
                                    Review the generated lecture. Save it to your library or download
                                    for offline use.
                                </p>
                            </li>
                        </ol>

                        <h2>Video Lecture Controls</h2>

                        <p>When viewing video lectures:</p>
                        <ul>
                            <li><Play size={16} style={{ marginRight: '0.5rem' }} />
                                <strong>Play/Pause</strong> – Start or pause the narration
                            </li>
                            <li><Pause size={16} style={{ marginRight: '0.5rem' }} />
                                <strong>Navigate Slides</strong> – Click prev/next or use keyboard arrows
                            </li>
                            <li><Gauge size={16} style={{ marginRight: '0.5rem' }} />
                                <strong>Playback Speed</strong> – Adjust from 0.5x to 2x
                            </li>
                            <li><Volume2 size={16} style={{ marginRight: '0.5rem' }} />
                                <strong>Voice</strong> – AI narration reads slide content
                            </li>
                        </ul>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} />
                            <div className={styles.tipContent}>
                                <strong>Pro Tip:</strong> Use 1.5x speed for review sessions once you&apos;re
                                familiar with the material. Slow down to 0.75x for complex topics.
                            </div>
                        </div>

                        <h2>Written Lecture Features</h2>

                        <h3>Karaoke Highlighting</h3>
                        <p>
                            When using text-to-speech on written lectures, words are highlighted as
                            they&apos;re spoken, making it easy to follow along.
                        </p>

                        <h3>Content Actions</h3>
                        <ul>
                            <li><Save size={16} style={{ marginRight: '0.5rem' }} />
                                <strong>Save</strong> – Store lecture to your library
                            </li>
                            <li><Download size={16} style={{ marginRight: '0.5rem' }} />
                                <strong>Download</strong> – Export as Markdown file
                            </li>
                            <li><strong>Generate Quiz</strong> – Create a quiz from lecture content</li>
                            <li><strong>Copy</strong> – Copy content to clipboard</li>
                        </ul>

                        <h2>Saved Lectures</h2>
                        <p>
                            All saved lectures appear in your Lecture Library. Access them anytime from
                            the Lectures page sidebar. Lectures are organized by date with type indicators.
                        </p>

                        <h2>Best Practices</h2>
                        <ul>
                            <li>Use specific topics for more detailed, focused content</li>
                            <li>Video lectures work best for visual/procedural topics</li>
                            <li>Written lectures are better for dense, reference material</li>
                            <li>Generate quizzes after lectures to test retention</li>
                            <li>Save important lectures for future reference</li>
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
