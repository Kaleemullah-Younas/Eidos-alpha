'use client';

import Link from 'next/link';
import {
    Bot,
    ArrowRight,
    Mic,
    Volume2,
    MessageSquare,
    Sparkles,
    Lightbulb,
    Hand,
    Zap
} from 'lucide-react';
import styles from '../docs.module.css';

export default function AITutorPage() {
    return (
        <div className={styles.docsPage}>
            <div className={styles.docsContainer}>
                <div className={styles.articleContainer}>
                    {/* Breadcrumb */}
                    <nav className={styles.breadcrumb}>
                        <Link href="/docs">Documentation</Link>
                        <span>/</span>
                        <span>AI Tutor</span>
                    </nav>

                    {/* Header */}
                    <header className={styles.articleHeader}>
                        <h1 className={styles.articleTitle}>AI Tutor</h1>
                        <p className={styles.articleMeta}>
                            Your personal AI study assistant with voice interaction
                        </p>
                    </header>

                    {/* Content */}
                    <div className={styles.articleContent}>
                        <p>
                            The AI Tutor is your intelligent study companion. It understands your
                            study materials and provides personalized help through voice or text interaction.
                        </p>

                        <h2>Accessing the AI Tutor</h2>
                        <p>The AI Tutor is available in Study Sessions:</p>
                        <ol>
                            <li>Open any Study Session</li>
                            <li>Look for the <Bot size={14} /> AI Tutor button</li>
                            <li>Click to open the tutor interface</li>
                        </ol>

                        <div className={styles.tipBox}>
                            <Lightbulb size={20} />
                            <div className={styles.tipContent}>
                                <strong>Important:</strong> The AI Tutor uses your session materials as
                                context. Add materials to your session before chatting for the most
                                relevant responses.
                            </div>
                        </div>

                        <h2>Voice Interaction</h2>

                        <div className={styles.featureBox}>
                            <h4><Mic size={18} /> Voice Input</h4>
                            <p>
                                Click the microphone button and speak your question. EIDOS transcribes
                                and processes your speech in real-time.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Volume2 size={18} /> Voice Response</h4>
                            <p>
                                The AI responds with natural text-to-speech. Listen to explanations
                                while following along or taking notes.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Hand size={18} /> Interrupt Commands</h4>
                            <p>
                                Say &quot;stop&quot;, &quot;hey&quot;, or &quot;wait&quot; to interrupt the AI while it&apos;s speaking.
                                The tutor will pause and wait for your next question.
                            </p>
                        </div>

                        <h2>Starting a Conversation</h2>

                        <ol className={styles.stepList}>
                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Open the Tutor</h3>
                                <p className={styles.stepContent}>
                                    Click the AI Tutor button in your Study Session. The tutor interface
                                    will appear.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Start Voice Call</h3>
                                <p className={styles.stepContent}>
                                    Click <Mic size={14} /> <strong>Start Call</strong> to begin voice
                                    interaction. Grant microphone permission if prompted.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Ask Your Question</h3>
                                <p className={styles.stepContent}>
                                    Speak naturally. Ask about concepts from your materials, request
                                    explanations, or ask for examples.
                                </p>
                            </li>

                            <li className={styles.stepItem}>
                                <h3 className={styles.stepTitle}>Listen & Learn</h3>
                                <p className={styles.stepContent}>
                                    The AI responds with relevant information. Follow up with more
                                    questions or interrupt to ask something else.
                                </p>
                            </li>
                        </ol>

                        <h2>Effective Questions</h2>

                        <p>Get the most from your AI Tutor with these question types:</p>

                        <div className={styles.featureBox}>
                            <h4><Sparkles size={18} /> Concept Explanations</h4>
                            <p>
                                &quot;Can you explain [concept] in simple terms?&quot; – Get clear,
                                accessible explanations of complex topics.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Sparkles size={18} /> Examples & Analogies</h4>
                            <p>
                                &quot;Give me an example of [concept]&quot; – Real-world examples help
                                cement understanding.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Sparkles size={18} /> Comparisons</h4>
                            <p>
                                &quot;What&apos;s the difference between X and Y?&quot; – Clarify distinctions
                                between related concepts.
                            </p>
                        </div>

                        <div className={styles.featureBox}>
                            <h4><Sparkles size={18} /> Problem-Solving</h4>
                            <p>
                                &quot;How do I solve this type of problem?&quot; – Get step-by-step
                                guidance on solving exercises.
                            </p>
                        </div>

                        <h2>Interrupt Phrases</h2>
                        <p>These phrases will interrupt the AI while it&apos;s speaking:</p>
                        <ul>
                            <li><Zap size={16} style={{ marginRight: '0.5rem' }} /> &quot;Stop&quot;</li>
                            <li><Zap size={16} style={{ marginRight: '0.5rem' }} /> &quot;Hey&quot; or &quot;Hey hey&quot;</li>
                            <li><Zap size={16} style={{ marginRight: '0.5rem' }} /> &quot;Wait&quot; or &quot;Wait wait&quot;</li>
                            <li><Zap size={16} style={{ marginRight: '0.5rem' }} /> &quot;Hold on&quot;</li>
                            <li><Zap size={16} style={{ marginRight: '0.5rem' }} /> &quot;Pause&quot;</li>
                        </ul>

                        <h2>Text Chat</h2>
                        <p>
                            Prefer typing? Use the text input to type questions instead of speaking.
                            The AI responds with text that you can read at your own pace or
                            play with text-to-speech.
                        </p>

                        <h2>Chat History</h2>
                        <p>
                            Conversations are saved within your Study Session. Review past
                            Q&A exchanges anytime by opening the session and scrolling through
                            the chat history.
                        </p>

                        <h2>Best Practices</h2>
                        <ul>
                            <li>Upload materials before starting conversations</li>
                            <li>Ask specific questions for detailed answers</li>
                            <li>Use voice for natural, conversational learning</li>
                            <li>Interrupt if the answer isn&apos;t what you need</li>
                            <li>Follow up with &quot;tell me more&quot; for deeper explanations</li>
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
