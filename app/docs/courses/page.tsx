'use client';

import Link from 'next/link';
import {
    GraduationCap,
    ArrowRight,
    Sparkles,
    BookOpen,
    Play,
    Award,
    BarChart3,
    Lightbulb,
    Check,
    FileQuestion
} from 'lucide-react';
import styles from '../docs.module.css';

export default function CoursesPage() {
    return (
        <div className={styles.docsPage}>
            <div className={styles.docsContainer}>
                <div className={styles.articleContainer}>
                    {/* Breadcrumb */}
                    <nav className={styles.breadcrumb}>
                        <Link href="/docs">Documentation</Link>
                        <span>/</span>
                        <span>Course Architect</span>
                    </nav>

                    {/* Header */}
                    <header className={styles.articleHeader}>
                        <h1 className={styles.articleTitle}>Course Architect</h1>
                        <p className={styles.articleMeta}>
                            Generate complete AI-powered courses from any topic
                        </p>
                    </header>

                    {/* Content */}
                    <div className={styles.articleContent}>
                        <p>
                            Course Architect is EIDOS&apos;s most powerful feature. Enter any topic and
                            the AI generates a complete, structured course with chapters, lessons,
                            quizzes, and a final exam.
                        </p>

                        <h2>Creating a Course</h2>

                        <ol className={styles.stepList}>
                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Navigate to Course Creation</h3>
                                <p className={styles.stepContent}>
                                    From the Dashboard, click <strong>Generate Course</strong> or go to
                                    the Courses page and click <strong>Create New Course</strong>.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Enter Your Topic</h3>
                                <p className={styles.stepContent}>
                                    Type any subject you want to learn. Be as specific or broad as you like.
                                    Examples: &quot;Machine Learning Fundamentals&quot;, &quot;World War II History&quot;,
                                    &quot;JavaScript for Beginners&quot;.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Select Difficulty</h3>
                                <p className={styles.stepContent}>
                                    Choose <strong>Beginner</strong>, <strong>Intermediate</strong>, or
                                    <strong>Advanced</strong>. This affects the depth and complexity of content.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Generate & Wait</h3>
                                <p className={styles.stepContent}>
                                    Click <Sparkles size={14} /> <strong>Generate Course</strong>. The AI
                                    will create chapters and lessons. This may take a few minutes.
                                </p>
                            </li>
                        </ol>

                        <h2>Course Structure</h2>

                        <div className={styles.featureBox}>
                            <h4><BookOpen size={18} /> Chapters</h4>
                            <p>
                                Courses are divided into logical chapters. Each chapter covers a major
                                topic area with multiple lessons.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Play size={18} /> Lessons</h4>
                            <p>
                                Lessons can be written (text-based with markdown) or video (slide-based
                                with AI narration). Complete lessons to progress.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><FileQuestion size={18} /> Embedded Quizzes</h4>
                            <p>
                                Some lessons include inline quizzes to test your understanding as you learn.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Award size={18} /> Final Exam & Certificate</h4>
                            <p>
                                Complete all lessons, pass the final exam (80%+), and earn a downloadable
                                certificate of completion.
                            </p>
                        </div>

                        <h2>Navigating a Course</h2>

                        <p>When viewing a course:</p>
                        <ul>
                            <li>Use the <strong>sidebar</strong> to jump between chapters and lessons</li>
                            <li>Click <strong>Continue</strong> to resume from where you left off</li>
                            <li>Completed lessons show a <Check size={14} /> checkmark</li>
                            <li>Your progress percentage is displayed at the top</li>
                        </ul>

                        <h2>Progress Tracking</h2>

                        <div className={styles.featureBox}>
                            <h4><BarChart3 size={18} /> Course Progress</h4>
                            <p>
                                EIDOS tracks your progress automatically. See completion percentage,
                                current chapter, and time invested directly on the course card.
                            </p>
                        </div>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} />
                            <div className={styles.tipContent}>
                                <strong>Pro Tip:</strong> Complete lessons in order for the best learning
                                experience. Each lesson builds on previous concepts.
                            </div>
                        </div>

                        <h2>Earning Certificates</h2>

                        <p>To earn your certificate:</p>
                        <ol>
                            <li>Complete all lessons in the course</li>
                            <li>Take the final exam</li>
                            <li>Score 80% or higher</li>
                            <li>Download your personalized certificate</li>
                        </ol>

                        <p>
                            Certificates include your name, the course title, completion date, and
                            your exam score. They can be downloaded as PDF.
                        </p>

                        <h2>Public Courses</h2>
                        <p>
                            You can publish your courses for others to learn from. Published courses
                            appear in the <strong>Public Courses</strong> section for all users.
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
