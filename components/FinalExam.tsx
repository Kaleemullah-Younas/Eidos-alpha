'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';
import { ExamQuestion } from '@/lib/courseStorage';
import styles from './FinalExam.module.css';

interface FinalExamProps {
    questions: ExamQuestion[];
    onComplete: (score: number) => void;
    onRetake?: () => void;
    title: string;
}

export default function FinalExam({ questions, onComplete, onRetake, title }: FinalExamProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleOptionSelect = (optionIndex: number) => {
        if (submitted) return;
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = () => {
        // Calculate score
        let correctCount = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correctIndex) {
                correctCount++;
            }
        });

        const finalScore = Math.round((correctCount / questions.length) * 100);
        setScore(finalScore);
        setSubmitted(true);
        onComplete(finalScore);
    };

    const handleRetake = () => {
        // Reset state
        setCurrentQuestion(0);
        setAnswers(new Array(questions.length).fill(-1));
        setSubmitted(false);
        setScore(0);
        // Call parent callback if provided
        if (onRetake) {
            onRetake();
        }
    };

    const allAnswered = answers.every(a => a !== -1);
    const progressPercent = ((currentQuestion + 1) / questions.length) * 100;

    if (submitted) {
        const passed = score > 50;
        return (
            <div className={styles.resultsContainer}>
                <div className={styles.scoreCard}>
                    <h2>
                        <Award size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Exam Results
                    </h2>
                    <div className={`${styles.scoreCircle} ${passed ? styles.passed : styles.failed}`}>
                        <span className={styles.scoreValue}>{score}%</span>
                        <span className={styles.scoreLabel}>Score</span>
                    </div>

                    <p className={`${styles.feedbackText} ${passed ? styles.passedText : styles.failedText}`}>
                        {passed
                            ? "🎉 Congratulations! You have passed the final exam."
                            : "😔 You didn't pass this time. Review the course material and try again."}
                    </p>

                    {/* Retake button for failed exam */}
                    {!passed && (
                        <button onClick={handleRetake} className={styles.retakeBtn}>
                            <RotateCcw size={18} />
                            Retake Exam
                        </button>
                    )}

                    <div className={styles.questionReview}>
                        {questions.map((q, idx) => (
                            <div key={q.id} className={`${styles.reviewItem} ${answers[idx] === q.correctIndex ? styles.correct : styles.incorrect}`}>
                                <div className={styles.reviewHeader}>
                                    <span className={styles.qNum}>Q{idx + 1}</span>
                                    {answers[idx] === q.correctIndex ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                </div>
                                <p>{q.question}</p>
                                <p className={styles.correctAnswer}>
                                    ✓ Correct: {q.options[q.correctIndex]}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const question = questions[currentQuestion];

    return (
        <div className={styles.examContainer}>
            <div className={styles.examHeader}>
                <h1>{title}</h1>
                <div className={styles.progressInfo}>
                    <span className={styles.questionBadge}>
                        Question {currentQuestion + 1} of {questions.length}
                    </span>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.questionCard}>
                <h3 className={styles.questionText}>{question.question}</h3>

                <div className={styles.optionsList}>
                    {question.options.map((option, idx) => (
                        <button
                            key={idx}
                            className={`${styles.optionBtn} ${answers[currentQuestion] === idx ? styles.selected : ''}`}
                            onClick={() => handleOptionSelect(idx)}
                        >
                            <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.navigation}>
                <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className={styles.navBtn}
                >
                    <ChevronLeft size={18} />
                    Previous
                </button>

                {currentQuestion < questions.length - 1 ? (
                    <button
                        onClick={handleNext}
                        className={styles.navBtn}
                    >
                        Next
                        <ChevronRight size={18} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                        className={styles.submitBtn}
                    >
                        <CheckCircle2 size={18} />
                        Submit Exam
                    </button>
                )}
            </div>
        </div>
    );
}
