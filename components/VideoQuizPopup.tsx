'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HelpCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { VideoQuiz } from '@/lib/lectureStorage';
import MathText from './MathText';
import styles from './VideoQuizPopup.module.css';

interface VideoQuizPopupProps {
    quiz: VideoQuiz;
    onAnswer: (correct: boolean, selectedIndex: number | null) => void;
    timeLimit?: number; // seconds, default 60
}

export default function VideoQuizPopup({
    quiz,
    onAnswer,
    timeLimit = 60
}: VideoQuizPopupProps) {
    const [timeRemaining, setTimeRemaining] = useState(timeLimit);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [showResult, setShowResult] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (isAnswered) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    // Time's up!
                    clearInterval(timer);
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isAnswered]);

    const handleTimeout = useCallback(() => {
        if (!isAnswered) {
            setIsAnswered(true);
            setShowResult(true);
            // After showing result briefly, call onAnswer
            setTimeout(() => {
                onAnswer(false, null);
            }, 2000);
        }
    }, [isAnswered, onAnswer]);

    const handleSelect = (index: number) => {
        if (isAnswered) return;

        setSelectedIndex(index);
        setIsAnswered(true);
        setShowResult(true);

        const isCorrect = index === quiz.correctIndex;

        // Show result for 2 seconds then callback
        setTimeout(() => {
            onAnswer(isCorrect, index);
        }, 2000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isCorrect = selectedIndex === quiz.correctIndex;
    const timerWarning = timeRemaining <= 10;

    return (
        <div className={styles.overlay}>
            <div className={`${styles.popup} ${showResult ? (isCorrect ? styles.correct : styles.incorrect) : ''}`}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <HelpCircle size={24} />
                        <span>Quick Quiz!</span>
                    </div>
                    <div className={`${styles.timer} ${timerWarning ? styles.timerWarning : ''}`}>
                        <Clock size={18} />
                        <span>{formatTime(timeRemaining)}</span>
                    </div>
                </div>

                {/* Question */}
                <div className={styles.question}>
                    <p><MathText text={quiz.question} /></p>
                </div>

                {/* Options */}
                <div className={styles.options}>
                    {quiz.options.map((option, index) => {
                        let optionClass = styles.option;

                        if (showResult) {
                            if (index === quiz.correctIndex) {
                                optionClass = `${styles.option} ${styles.correctOption}`;
                            } else if (selectedIndex === index) {
                                optionClass = `${styles.option} ${styles.wrongOption}`;
                            } else {
                                optionClass = `${styles.option} ${styles.disabledOption}`;
                            }
                        } else if (selectedIndex === index) {
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
                                {showResult && index === quiz.correctIndex && (
                                    <CheckCircle2 size={20} className={styles.correctIcon} />
                                )}
                                {showResult && selectedIndex === index && index !== quiz.correctIndex && (
                                    <XCircle size={20} className={styles.wrongIcon} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Result feedback */}
                {showResult && (
                    <div className={`${styles.result} ${isCorrect ? styles.resultCorrect : styles.resultWrong}`}>
                        {selectedIndex === null ? (
                            <p>⏰ Time's up! The correct answer was <strong>{String.fromCharCode(65 + quiz.correctIndex)}</strong></p>
                        ) : isCorrect ? (
                            <p>🎉 Correct! Well done!</p>
                        ) : (
                            <p>❌ Not quite. The correct answer was <strong>{String.fromCharCode(65 + quiz.correctIndex)}</strong></p>
                        )}
                    </div>
                )}

                {/* Progress bar for timer */}
                {!isAnswered && (
                    <div className={styles.timerBar}>
                        <div
                            className={`${styles.timerProgress} ${timerWarning ? styles.timerProgressWarning : ''}`}
                            style={{ width: `${(timeRemaining / timeLimit) * 100}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
