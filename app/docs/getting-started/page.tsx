'use client';

import Link from 'next/link';
import {
    Rocket,
    ArrowRight,
    Check,
    Lightbulb,
    User,
    LayoutDashboard,
    Video,
    GraduationCap
} from 'lucide-react';
import styles from '../docs.module.css';

export default function GettingStartedPage() {
    return (
        <div className={styles.docsPage}>
            <div className={styles.docsContainer}>
                <div className={styles.articleContainer}>
                    {/* Breadcrumb */}
                    <nav className={styles.breadcrumb}>
                        <Link href="/docs">Documentation</Link>
                        <span>/</span>
                        <span>Getting Started</span>
                    </nav>

                    {/* Header */}
                    <header className={styles.articleHeader}>
                        <h1 className={styles.articleTitle}>Getting Started with EIDOS</h1>
                        <p className={styles.articleMeta}>
                            Learn the basics and start your AI-powered learning journey
                        </p>
                    </header>

                    {/* Content */}
                    <div className={styles.articleContent}>
                        <p>
                            Welcome to <strong>EIDOS</strong> – your Educational Intelligence & Dynamic Optimization System.
                            This guide will walk you through everything you need to know to get started.
                        </p>

                        <h2>What is EIDOS?</h2>
                        <p>
                            EIDOS is an AI-powered learning platform that transforms how you study. Whether you&apos;re
                            capturing live lectures, generating comprehensive courses, or testing your knowledge with
                            quizzes, EIDOS uses advanced AI to accelerate your learning.
                        </p>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} />
                            <div className={styles.tipContent}>
                                <strong>Pro Tip:</strong> EIDOS works best when you give it context. The more
                                information you provide, the better the AI can help you learn.
                            </div>
                        </div>

                        <h2>Step-by-Step Setup</h2>

                        <ol className={styles.stepList}>
                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Create Your Account</h3>
                                <p className={styles.stepContent}>
                                    Click <strong>Sign Up</strong> on the landing page. Enter your name, email, and
                                    create a secure password. You&apos;ll be logged in automatically.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Explore the Dashboard</h3>
                                <p className={styles.stepContent}>
                                    The Dashboard is your home base. From here, you can access all your Study Sessions,
                                    Courses, and Captures. Create new sessions or continue where you left off.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Choose Your Learning Path</h3>
                                <p className={styles.stepContent}>
                                    Depending on your needs, you can: capture a live lecture, generate a course on
                                    any topic, create study sessions with your materials, or generate instant quizzes.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Let AI Do the Heavy Lifting</h3>
                                <p className={styles.stepContent}>
                                    Upload documents, paste text, or simply type a topic. EIDOS will generate notes,
                                    lectures, quizzes, and more – all tailored to your learning needs.
                                </p>
                            </li>
                        </ol>

                        <h2>Core Features Overview</h2>

                        <div className={styles.featureBox}>
                            <h4><Video size={18} /> Live Capture</h4>
                            <p>
                                Record lectures in real-time. EIDOS transcribes audio, captures visual frames,
                                and generates structured notes using AI.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><GraduationCap size={18} /> Course Architect</h4>
                            <p>
                                Enter any topic and EIDOS generates a complete course with chapters, lessons,
                                and interactive content. Earn certificates upon completion.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><LayoutDashboard size={18} /> Study Sessions</h4>
                            <p>
                                Organize your learning materials in sessions. Upload documents, generate quizzes,
                                and chat with the AI Tutor about your content.
                            </p>
                        </div>

                        <h2>Quick Tips for Success</h2>

                        <ul>
                            <li><Check size={16} style={{ color: 'var(--success)', marginRight: '0.5rem' }} />
                                Start with a <strong>Study Session</strong> to organize your existing materials
                            </li>
                            <li><Check size={16} style={{ color: 'var(--success)', marginRight: '0.5rem' }} />
                                Use <strong>Live Capture</strong> during online or in-person lectures
                            </li>
                            <li><Check size={16} style={{ color: 'var(--success)', marginRight: '0.5rem' }} />
                                Generate <strong>Quizzes</strong> regularly to test retention
                            </li>
                            <li><Check size={16} style={{ color: 'var(--success)', marginRight: '0.5rem' }} />
                                Ask the <strong>AI Tutor</strong> when you&apos;re stuck on a concept
                            </li>
                            <li><Check size={16} style={{ color: 'var(--success)', marginRight: '0.5rem' }} />
                                Complete courses to earn <strong>Certificates</strong>
                            </li>
                        </ul>

                        <h2>Next Steps</h2>
                        <p>
                            Now that you know the basics, explore the feature guides to learn more about
                            each capability:
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                            <Link href="/docs/dashboard" className={styles.navPill}>
                                <LayoutDashboard size={16} /> Dashboard Guide
                            </Link>
                            <Link href="/docs/capture" className={styles.navPill}>
                                <Video size={16} /> Live Capture
                            </Link>
                            <Link href="/docs/courses" className={styles.navPill}>
                                <GraduationCap size={16} /> Course Architect
                            </Link>
                        </div>
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
