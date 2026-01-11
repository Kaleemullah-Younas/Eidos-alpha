'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import MathText from './MathText';
import styles from './EmbeddedQuiz.module.css';

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

interface EmbeddedQuizProps {
    quiz: QuizQuestion;
    onAnswered: (correct: boolean) => void;
}

export default function EmbeddedQuiz({ quiz, onAnswered }: EmbeddedQuizProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSelect = (index: number) => {
        if (isAnswered) return;

        setSelectedIndex(index);
        const correct = index === quiz.correctIndex;
        setIsCorrect(correct);
        setIsAnswered(true);
        onAnswered(correct);
    };

    return (
        <div className={`${styles.quizContainer} ${isAnswered ? (isCorrect ? styles.correct : styles.incorrect) : ''}`}>
            <div className={styles.quizHeader}>
                <HelpCircle size={20} />
                <span>Quick Check</span>
            </div>

            <p className={styles.question}><MathText text={quiz.question} /></p>

            <div className={styles.options}>
                {quiz.options.map((option, index) => {
                    const isSelected = selectedIndex === index;
                    const isCorrectOption = index === quiz.correctIndex;

                    let optionClass = styles.option;
                    if (isAnswered) {
                        if (isCorrectOption) {
                            optionClass = `${styles.option} ${styles.correctOption}`;
                        } else if (isSelected && !isCorrectOption) {
                            optionClass = `${styles.option} ${styles.incorrectOption}`;
                        } else {
                            optionClass = `${styles.option} ${styles.disabledOption}`;
                        }
                    } else if (isSelected) {
                        optionClass = `${styles.option} ${styles.selectedOption}`;
                    }

                    return (
                        <button
                            key={index}
                            className={optionClass}
                            onClick={() => handleSelect(index)}
                            disabled={isAnswered}
                        >
                            <span className={styles.optionLabel}>
                                {String.fromCharCode(65 + index)}
                            </span>
                            <span className={styles.optionText}><MathText text={option} /></span>
                            {isAnswered && isCorrectOption && <CheckCircle2 size={18} className={styles.correctIcon} />}
                            {isAnswered && isSelected && !isCorrectOption && <XCircle size={18} className={styles.incorrectIcon} />}
                        </button>
                    );
                })}
            </div>

            {isAnswered && (
                <div className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect}`}>
                    <div className={styles.feedbackHeader}>
                        {isCorrect ? (
                            <>
                                <CheckCircle2 size={20} />
                                <span>Correct!</span>
                            </>
                        ) : (
                            <>
                                <XCircle size={20} />
                                <span>Not quite right</span>
                            </>
                        )}
                    </div>
                    <p className={styles.explanation}><MathText text={quiz.explanation} /></p>
                </div>
            )}
        </div>
    );
}

// Parse quiz block from markdown
export function parseQuizBlock(block: string): QuizQuestion | null {
    try {
        const lines = block.trim().split('\n');
        let question = '';
        let options: string[] = [];
        let correctIndex = 0;
        let explanation = '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('question:')) {
                question = trimmed.replace('question:', '').trim();
            } else if (trimmed.startsWith('options:')) {
                const optionsStr = trimmed.replace('options:', '').trim();
                options = optionsStr.split('|').map(o => {
                    // Remove A), B), etc. prefix if present
                    return o.trim().replace(/^[A-D]\)\s*/, '');
                });
            } else if (trimmed.startsWith('answer:')) {
                const answer = trimmed.replace('answer:', '').trim().toUpperCase();
                correctIndex = answer.charCodeAt(0) - 65; // A=0, B=1, etc.
            } else if (trimmed.startsWith('explanation:')) {
                explanation = trimmed.replace('explanation:', '').trim();
            }
        }

        if (question && options.length > 0) {
            return { question, options, correctIndex, explanation };
        }
        return null;
    } catch {
        return null;
    }
}
