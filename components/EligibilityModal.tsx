'use client';

import React from 'react';
import { X, AlertTriangle, CheckCircle2, BookOpen, Award } from 'lucide-react';
import styles from './EligibilityModal.module.css';

interface EligibilityModalProps {
    courseName: string;
    attendancePercent: number;
    examScore: number | null;
    hasExam: boolean;
    onClose: () => void;
    onRetakeExam?: () => void;
    onContinueLessons?: () => void;
}

export default function EligibilityModal({
    courseName,
    attendancePercent,
    examScore,
    hasExam,
    onClose,
    onRetakeExam,
    onContinueLessons
}: EligibilityModalProps) {
    const attendanceMet = attendancePercent >= 80;
    const examPassed = examScore !== null && examScore > 50;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button onClick={onClose} className={styles.closeBtn}>
                    <X size={24} />
                </button>

                <div className={styles.header}>
                    <AlertTriangle size={48} className={styles.warningIcon} />
                    <h2>Certificate Not Available</h2>
                    <p className={styles.courseName}>{courseName}</p>
                </div>

                <div className={styles.requirements}>
                    <h3>Requirements to earn your certificate:</h3>

                    <div className={`${styles.requirement} ${attendanceMet ? styles.met : styles.notMet}`}>
                        <div className={styles.reqIcon}>
                            {attendanceMet ? <CheckCircle2 size={24} /> : <BookOpen size={24} />}
                        </div>
                        <div className={styles.reqContent}>
                            <span className={styles.reqTitle}>Attendance (≥80% lessons completed)</span>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${Math.min(attendancePercent, 100)}%` }}
                                />
                            </div>
                            <span className={styles.reqValue}>
                                {attendancePercent.toFixed(0)}% completed
                                {!attendanceMet && ` (need ${Math.max(0, 80 - attendancePercent).toFixed(0)}% more)`}
                            </span>
                        </div>
                    </div>

                    <div className={`${styles.requirement} ${examPassed ? styles.met : styles.notMet}`}>
                        <div className={styles.reqIcon}>
                            {examPassed ? <CheckCircle2 size={24} /> : <Award size={24} />}
                        </div>
                        <div className={styles.reqContent}>
                            <span className={styles.reqTitle}>Final Exam (&gt;50% score)</span>
                            {examScore !== null ? (
                                <>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={`${styles.progressFill} ${examPassed ? styles.passed : styles.failed}`}
                                            style={{ width: `${Math.min(examScore, 100)}%` }}
                                        />
                                    </div>
                                    <span className={styles.reqValue}>
                                        {examScore}% scored
                                        {!examPassed && ' (need passing grade)'}
                                    </span>
                                </>
                            ) : (
                                <span className={styles.reqValue}>
                                    {hasExam ? 'Exam not taken yet' : 'Complete lessons to unlock exam'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    {!attendanceMet && onContinueLessons && (
                        <button onClick={onContinueLessons} className={styles.primaryBtn}>
                            <BookOpen size={18} />
                            Continue Lessons
                        </button>
                    )}
                    {attendanceMet && !examPassed && hasExam && onRetakeExam && (
                        <button onClick={onRetakeExam} className={styles.primaryBtn}>
                            <Award size={18} />
                            {examScore !== null ? 'Retake Exam' : 'Take Exam'}
                        </button>
                    )}
                    <button onClick={onClose} className={styles.secondaryBtn}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
