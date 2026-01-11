'use client';

import Link from 'next/link';
import {
    FileQuestion,
    ArrowRight,
    Sparkles,
    Check,
    X,
    BarChart3,
    Save,
    Lightbulb,
    Clock,
    List
} from 'lucide-react';
import styles from '../docs.module.css';

export default function QuizzesPage() {
    return (
        <div className={styles.docsPage}>
            <div className={styles.docsContainer}>
                <div className={styles.articleContainer}>
                    {/* Breadcrumb */}
                    <nav className={styles.breadcrumb}>
                        <Link href="/docs">Documentation</Link>
                        <span>/</span>
                        <span>Quizzes</span>
                    </nav>

                    {/* Header */}
                    <header className={styles.articleHeader}>
                        <h1 className={styles.articleTitle}>Quiz Generator</h1>
                        <p className={styles.articleMeta}>
                            Test your knowledge with AI-generated assessments
                        </p>
                    </header>

                    {/* Content */}
                    <div className={styles.articleContent}>
                        <p>
                            EIDOS generates intelligent quizzes based on your study materials, lectures,
                            or any topic. Each question includes detailed explanations to reinforce learning.
                        </p>

                        <h2>Ways to Generate Quizzes</h2>

                        <div className={styles.featureBox}>
                            <h4><Sparkles size={18} /> From Study Materials</h4>
                            <p>
                                Generate quizzes based on uploaded documents in your Study Session.
                                Questions are tailored to your specific content.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Sparkles size={18} /> From Lectures</h4>
                            <p>
                                After viewing a lecture (written or video), generate a quiz to test
                                your understanding of the material.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Sparkles size={18} /> From Captures</h4>
                            <p>
                                Create quizzes from your live capture notes to reinforce what you
                                learned during recorded lectures.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Sparkles size={18} /> Quick Quiz (Any Topic)</h4>
                            <p>
                                Go to the Quiz page and enter any topic. EIDOS generates questions
                                on demand without requiring existing materials.
                            </p>
                        </div>

                        <h2>Taking a Quiz</h2>

                        <ol className={styles.stepList}>
                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Select Question Count</h3>
                                <p className={styles.stepContent}>
                                    Choose how many questions you want (typically 5-20). More questions
                                    provide a more thorough assessment.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Answer Questions</h3>
                                <p className={styles.stepContent}>
                                    Each question is multiple choice. Click on your answer to select it.
                                    You can change your answer before submitting.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Submit & Review</h3>
                                <p className={styles.stepContent}>
                                    After answering all questions, submit the quiz. You&apos;ll see your
                                    score and can review each question with explanations.
                                </p>
                            </li>
                        </ol>

                        <h2>Results & Explanations</h2>

                        <p>After completing a quiz:</p>
                        <ul>
                            <li><Check size={16} style={{ color: 'var(--success)', marginRight: '0.5rem' }} />
                                <strong>Correct answers</strong> – Shown in green with explanation
                            </li>
                            <li><X size={16} style={{ color: 'var(--danger)', marginRight: '0.5rem' }} />
                                <strong>Incorrect answers</strong> – Shown in red with correct answer revealed
                            </li>
                            <li><BarChart3 size={16} style={{ marginRight: '0.5rem' }} />
                                <strong>Score breakdown</strong> – See your percentage and question-by-question results
                            </li>
                        </ul>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} />
                            <div className={styles.tipContent}>
                                <strong>Pro Tip:</strong> Read the explanations even for questions you got
                                right. They often contain additional context and insights.
                            </div>
                        </div>

                        <h2>Saving Quizzes</h2>
                        <p>
                            Click <Save size={14} /> <strong>Save Quiz</strong> to store it for later.
                            Saved quizzes appear in your Quiz Library and can be retaken anytime.
                        </p>

                        <h3>Quiz Library</h3>
                        <p>Access your saved quizzes from the sidebar:</p>
                        <ul>
                            <li><List size={16} style={{ marginRight: '0.5rem' }} />
                                View all past quizzes with scores
                            </li>
                            <li><Clock size={16} style={{ marginRight: '0.5rem' }} />
                                See when each quiz was taken
                            </li>
                            <li>Retake any quiz to improve your score</li>
                            <li>Delete quizzes you no longer need</li>
                        </ul>

                        <h2>Quiz Settings</h2>
                        <ul>
                            <li><strong>Difficulty</strong> – Choose Easy, Medium, or Hard</li>
                            <li><strong>Question Count</strong> – 5 to 20 questions</li>
                            <li><strong>Topic Focus</strong> – Let AI determine or specify subtopics</li>
                        </ul>

                        <h2>Best Practices</h2>
                        <ul>
                            <li>Take quizzes shortly after studying for best retention</li>
                            <li>Use &quot;Hard&quot; difficulty to challenge yourself</li>
                            <li>Review all explanations, not just wrong answers</li>
                            <li>Retake saved quizzes after a few days to test long-term memory</li>
                            <li>Track your scores over time to measure improvement</li>
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
