'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import VideoPresenter from '@/components/VideoPresenter';
import FinalExam from '@/components/FinalExam';
import CertificateModal from '@/components/CertificateModal';
import EligibilityModal from '@/components/EligibilityModal';
import InteractiveLecture from '@/components/InteractiveLecture';
import AITutor from '@/components/AITutor';
import ConfirmationModal from '@/components/ConfirmationModal';
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Circle,
    Play,
    FileText,
    Video,
    Clock,
    BookOpen,
    Award,
    Menu,
    X,
    ChevronDown,
    ChevronUp,
    StickyNote,
    Download,
    Volume2,
    VolumeX,
    RefreshCcw,
    Loader2,
    Check,
} from 'lucide-react';
import {
    Course,
    Chapter,
    Lesson,
    getCourse,
    markLessonComplete,
    updateCoursePosition,
    updateLessonNotes,
    formatDuration,
    getProgressColor,
    saveCourse,
    hasExamChapter,
    addExamChapter,
    checkCertificateEligibility,
    getAttendancePercent,
} from '@/lib/courseStorage';
import styles from './viewer.module.css';

type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

export default function CourseViewer() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const courseId = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [currentChapter, setCurrentChapter] = useState(0);
    const [currentLesson, setCurrentLesson] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([0]));
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState('');

    // Video player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideElapsedTime, setSlideElapsedTime] = useState(0);
    const [spokenCharIndex, setSpokenCharIndex] = useState(0);
    const [showQuizPopup, setShowQuizPopup] = useState(false);
    const [quizAnswered, setQuizAnswered] = useState(false);
    const [showCertificateModal, setShowCertificateModal] = useState(false);
    const [showEligibilityModal, setShowEligibilityModal] = useState(false);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [isGeneratingExam, setIsGeneratingExam] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);

    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isPlayingRef = useRef(false);
    const playbackSpeedRef = useRef<PlaybackSpeed>(1);
    const isCancelledRef = useRef(false);
    const slideStartTimeRef = useRef<number>(0);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Keep refs in sync
    useEffect(() => {
        isPlayingRef.current = isPlaying;
        playbackSpeedRef.current = playbackSpeed;
    }, [isPlaying, playbackSpeed]);

    // Load course
    useEffect(() => {
        if (courseId) {
            getCourse(courseId).then((loadedCourse) => {
                if (loadedCourse) {
                    setCourse(loadedCourse);
                    setCurrentChapter(loadedCourse.currentChapter);
                    setCurrentLesson(loadedCourse.currentLesson);
                    setExpandedChapters(new Set([loadedCourse.currentChapter]));

                    // Load notes for current lesson
                    const lessonData = loadedCourse.chapters[loadedCourse.currentChapter]?.lessons[loadedCourse.currentLesson];
                    setNotes(lessonData?.notes || '');
                } else {
                    router.push('/course');
                }
            });
        }
    }, [courseId, router]);

    // Get current lesson
    const lesson = course?.chapters[currentChapter]?.lessons[currentLesson];
    const chapter = course?.chapters[currentChapter];

    // Cleanup on unmount - stop speech and timer
    useEffect(() => {
        return () => {
            // Mark as cancelled before stopping speech to prevent any callbacks
            isCancelledRef.current = true;
            window.speechSynthesis?.cancel();
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    // Stop speech when navigating away from this page (for client-side navigation)
    useEffect(() => {
        // When pathname changes from this course page, cancel speech
        if (!pathname?.startsWith('/course/')) {
            isCancelledRef.current = true;
            window.speechSynthesis?.cancel();
            setIsPlaying(false);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
    }, [pathname]);

    // Timer for elapsed time in current slide (for whiteboard animations)
    useEffect(() => {
        if (isPlaying) {
            // Use a delta-based approach to account for playback speed
            let lastTime = Date.now();
            timerIntervalRef.current = setInterval(() => {
                const now = Date.now();
                const delta = (now - lastTime) / 1000;
                lastTime = now;

                setSlideElapsedTime(prev => prev + (delta * playbackSpeedRef.current));
            }, 50); // Update every 50ms for smooth animations
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [isPlaying]);

    // Navigate to lesson (Moved up to fix hoisting issues)
    const goToLesson = useCallback(async (chapterIdx: number, lessonIdx: number) => {
        if (!course) return;

        // Stop any playing audio
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setCurrentSlide(0);
        setSpokenCharIndex(0);

        setCurrentChapter(chapterIdx);
        setCurrentLesson(lessonIdx);
        setExpandedChapters(prev => new Set(prev).add(chapterIdx));

        // Update course position
        const updated = await updateCoursePosition(courseId, chapterIdx, lessonIdx);
        if (updated) setCourse(updated);

        // Load notes for new lesson
        const newLesson = course.chapters[chapterIdx]?.lessons[lessonIdx];
        setNotes(newLesson?.notes || '');
    }, [course, courseId]);

    // Mark current lesson complete and go to next (Moved up)
    const completeAndNext = useCallback(async () => {
        if (!course || isCompleting) return;

        setIsCompleting(true);
        try {
            const updated = await markLessonComplete(courseId, currentChapter, currentLesson);
            if (updated) setCourse(updated);

            // Find next lesson
            const currentChapterData = course.chapters[currentChapter];
            if (currentLesson < currentChapterData.lessons.length - 1) {
                goToLesson(currentChapter, currentLesson + 1);
            } else if (currentChapter < course.chapters.length - 1) {
                goToLesson(currentChapter + 1, 0);
            }
        } catch (error) {
            console.error('Failed to complete lesson:', error);
        } finally {
            setIsCompleting(false);
        }
    }, [course, courseId, currentChapter, currentLesson, goToLesson, isCompleting]);

    // Go to previous lesson
    const goPrevious = useCallback(() => {
        if (!course) return;

        if (currentLesson > 0) {
            goToLesson(currentChapter, currentLesson - 1);
        } else if (currentChapter > 0) {
            const prevChapter = course.chapters[currentChapter - 1];
            goToLesson(currentChapter - 1, prevChapter.lessons.length - 1);
        }
    }, [course, currentChapter, currentLesson, goToLesson]);

    // Handle Exam Completion
    const handleExamComplete = useCallback(async (score: number) => {
        if (!course) return;

        // Update lesson with score
        const updatedCourse = { ...course };
        const lesson = updatedCourse.chapters[currentChapter].lessons[currentLesson];
        lesson.examScore = score;
        lesson.completed = true;

        // Store the final exam score on the course
        updatedCourse.finalExamScore = score;

        // Update progress
        updatedCourse.completedLessons = 0;
        updatedCourse.chapters.forEach(ch => {
            ch.lessons.forEach(l => {
                if (l.completed) updatedCourse.completedLessons++;
            });
        });
        updatedCourse.progressPercent = Math.round((updatedCourse.completedLessons / updatedCourse.totalLessons) * 100);

        // Check if current chapter is now complete (Fix for chapter tick bug)
        const chapter = updatedCourse.chapters[currentChapter];
        if (chapter.lessons.every(l => l.completed)) {
            chapter.completed = true;
        }

        // Check certification eligibility using attendance (not total progress)
        // >50% score AND >=80% attendance (regular lessons completed)
        const attendancePercent = getAttendancePercent(updatedCourse);
        if (score > 50 && attendancePercent >= 80) {
            updatedCourse.certificateEarned = true;
            updatedCourse.completedAt = new Date();
        } else {
            updatedCourse.certificateEarned = false;
        }

        await saveCourse(updatedCourse);
        setCourse(updatedCourse);
    }, [course, currentChapter, currentLesson]);

    // Regenerate content for current lesson
    const regenerateContent = useCallback(async () => {
        if (!course || !lesson) return;

        const chapter = course.chapters[currentChapter];

        setIsGeneratingContent(true);

        try {
            const response = await fetch('/api/generate-course', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate-lesson',
                    courseTitle: course.title,
                    chapterTitle: chapter.title,
                    lessonTitle: lesson.title,
                    lessonType: lesson.type,
                    lessonDuration: lesson.duration
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate content');
            }

            const data = await response.json();

            if (data.success && data.lessonContent) {
                // Update the lesson with generated content
                const updatedCourse = { ...course };
                const updatedLesson = updatedCourse.chapters[currentChapter].lessons[currentLesson];

                if (data.lessonContent.slides) {
                    updatedLesson.slides = data.lessonContent.slides;
                }
                if (data.lessonContent.content) {
                    updatedLesson.content = data.lessonContent.content;
                }

                await saveCourse(updatedCourse);
                setCourse(updatedCourse);
            }
        } catch (error) {
            console.error('Content regeneration error:', error);
            setErrorModal({
                title: 'Error',
                message: 'Failed to generate content. Please try again.'
            });
        } finally {
            setIsGeneratingContent(false);
        }
    }, [course, lesson, currentChapter, currentLesson]);

    // Handle Take Exam button - creates exam chapter if needed and navigates to it
    const handleTakeExam = useCallback(async () => {
        if (!course) return;

        setIsGeneratingExam(true);

        try {
            // Check if exam already exists
            if (hasExamChapter(course)) {
                // Navigate to existing exam
                const examChapterIndex = course.chapters.findIndex(ch =>
                    ch.lessons.some(l => l.type === 'exam')
                );
                if (examChapterIndex >= 0) {
                    const examLessonIndex = course.chapters[examChapterIndex].lessons.findIndex(
                        l => l.type === 'exam'
                    );
                    goToLesson(examChapterIndex, examLessonIndex >= 0 ? examLessonIndex : 0);
                }
            } else {
                // Generate exam questions via API
                const response = await fetch('/api/generate-exam', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        courseTitle: course.title,
                        chapters: course.chapters.map(ch => ({
                            title: ch.title,
                            lessons: ch.lessons.map(l => ({ title: l.title }))
                        }))
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to generate exam');
                }

                const data = await response.json();

                if (data.success && data.questions) {
                    // Add exam chapter to course
                    const updatedCourse = await addExamChapter(courseId, data.questions);
                    if (updatedCourse) {
                        setCourse(updatedCourse);
                        // Navigate to the exam (last chapter, first lesson)
                        const examChapterIndex = updatedCourse.chapters.length - 1;
                        goToLesson(examChapterIndex, 0);
                    }
                }
            }
        } catch (error) {
            console.error('Exam generation error:', error);
            setErrorModal({
                title: 'Error',
                message: 'Failed to generate exam. Please try again.'
            });
        } finally {
            setIsGeneratingExam(false);
        }
    }, [course, courseId, goToLesson]);

    // Handle certificate button click - check eligibility first
    const handleCertificateClick = useCallback(() => {
        if (!course) return;

        const eligibility = checkCertificateEligibility(course);

        if (eligibility.eligible) {
            setShowCertificateModal(true);
        } else {
            setShowEligibilityModal(true);
        }
    }, [course]);

    // TTS speak text function
    const speakText = useCallback(
        (text: string, speed: PlaybackSpeed, onEnd?: () => void) => {
            // Check for speech synthesis support
            if (!('speechSynthesis' in window)) {
                onEnd?.();
                return;
            }

            if (isMuted || !text) {
                if (isMuted && onEnd) {
                    setTimeout(onEnd, 2000);
                } else {
                    onEnd?.();
                }
                return;
            }

            // Reset cancelled flag before starting new speech
            isCancelledRef.current = false;
            setSpokenCharIndex(0);
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = speed;
            utterance.pitch = 1;
            utterance.volume = 1;

            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(
                v =>
                    v.name.includes('Zira') ||      // Windows female
                    v.name.includes('Samantha') ||  // macOS female
                    v.name.includes('Google US English') || // Chrome female
                    v.name.includes('Female') ||
                    v.name.includes('Aria')         // Windows 11
            ) || voices.find(v => v.lang.startsWith('en'));
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }

            // Character tracking for karaoke effect
            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    setSpokenCharIndex(event.charIndex + (event.charLength || 0));
                }
            };

            utterance.onend = () => {
                setSpokenCharIndex(text.length);
                if (!isCancelledRef.current) {
                    onEnd?.();
                }
            };

            utterance.onerror = () => {
                if (!isCancelledRef.current) {
                    onEnd?.();
                }
            };

            speechRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        },
        [isMuted]
    );

    // Play a specific slide
    const playSlide = useCallback(
        (index: number, speed?: PlaybackSpeed) => {
            if (!lesson?.slides || index >= lesson.slides.length) {
                setIsPlaying(false);
                return;
            }

            setCurrentSlide(index);
            slideStartTimeRef.current = Date.now();
            setSlideElapsedTime(0);
            setShowQuizPopup(false);
            setQuizAnswered(false);

            const slide = lesson.slides[index];
            const useSpeed = speed ?? playbackSpeedRef.current;

            // For quiz slides, speak the teacher intro then show popup
            if (slide.isQuizSlide && slide.quiz) {
                const introText = slide.quiz.teacherIntro || slide.narration;
                speakText(introText, useSpeed, () => {
                    setShowQuizPopup(true);
                    setIsPlaying(false);
                });
            } else {
                // Normal slide - speak narration and auto-advance
                speakText(slide.narration, useSpeed, () => {
                    if (isPlayingRef.current && index < lesson.slides!.length - 1) {
                        playSlide(index + 1);
                    } else if (index >= lesson.slides!.length - 1) {
                        setIsPlaying(false);
                        completeAndNext();
                    }
                });
            }
        },
        [lesson?.slides, speakText, completeAndNext]
    );

    // Jump to a slide (stops playback to match lecture page)
    const goToSlide = useCallback((index: number) => {
        if (!lesson?.slides) return;

        isCancelledRef.current = true;
        window.speechSynthesis.cancel();

        const boundedIndex = Math.max(0, Math.min(index, lesson.slides.length - 1));
        setCurrentSlide(boundedIndex);
        setIsPlaying(false);
    }, [lesson?.slides]);

    // Handle play/pause toggle
    const togglePlayPause = useCallback(() => {
        if (!lesson?.slides) return;

        if (isPlaying) {
            setIsPlaying(false);
            isCancelledRef.current = true; // Mark as intentionally cancelled
            window.speechSynthesis.cancel();
        } else {
            setIsPlaying(true);
            playSlide(currentSlide);
        }
    }, [lesson?.slides, isPlaying, currentSlide, playSlide]);

    // Handle quiz answer
    const handleQuizAnswer = useCallback(
        (correct: boolean, selectedIndex: number | null) => {
            setShowQuizPopup(false);
            setQuizAnswered(true);

            if (!lesson?.slides) return;

            const slide = lesson.slides[currentSlide];
            if (!slide?.quiz) return;

            // Speak teacher feedback
            const feedback = correct
                ? slide.quiz.correctFeedback
                : slide.quiz.wrongFeedback;

            speakText(feedback, playbackSpeedRef.current, () => {
                // After feedback, continue to next slide
                if (currentSlide < lesson.slides!.length - 1) {
                    setIsPlaying(true);
                    playSlide(currentSlide + 1);
                } else {
                    setIsPlaying(false);
                    completeAndNext();
                }
            });
        },
        [lesson?.slides, currentSlide, speakText, playSlide, completeAndNext]
    );



    // Toggle chapter expansion
    const toggleChapter = (idx: number) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            if (next.has(idx)) {
                next.delete(idx);
            } else {
                next.add(idx);
            }
            return next;
        });
    };

    // Save notes
    const saveNotes = useCallback(async () => {
        if (!course) return;
        const updated = await updateLessonNotes(courseId, currentChapter, currentLesson, notes);
        if (updated) {
            setCourse(updated);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2500);
        }
    }, [course, courseId, currentChapter, currentLesson, notes]);

    // Cycle playback speed
    const cyclePlaybackSpeed = useCallback(() => {
        const speeds: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentIndex = speeds.indexOf(playbackSpeed);
        const newSpeed = speeds[(currentIndex + 1) % speeds.length];
        setPlaybackSpeed(newSpeed);
        playbackSpeedRef.current = newSpeed;

        // If currently playing, restart speech at new speed (robustly like lecture page)
        if (isPlaying && lesson?.slides) {
            isCancelledRef.current = true;
            window.speechSynthesis.cancel();
            const slide = lesson.slides[currentSlide];
            if (slide) {
                setTimeout(() => {
                    speakText(slide.narration, newSpeed, () => {
                        if (isPlayingRef.current && lesson.slides && currentSlide < lesson.slides.length - 1) {
                            playSlide(currentSlide + 1, newSpeed);
                        } else {
                            setIsPlaying(false);
                        }
                    });
                }, 100);
            }
        }
    }, [playbackSpeed, isPlaying, lesson?.slides, currentSlide, speakText, playSlide]);

    if (!course || !lesson) {
        return (
            <main className={styles.loading}>
                <div className={styles.spinner} />
                <p>Loading course...</p>
            </main>
        );
    }

    const isFirstLesson = currentChapter === 0 && currentLesson === 0;
    const isLastLesson =
        currentChapter === course.chapters.length - 1 &&
        currentLesson === course.chapters[currentChapter].lessons.length - 1;

    return (
        <>
            <main className={styles.viewer}>
                {/* Top Bar */}
                <div className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={styles.menuBtn}
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <Link href="/course" className={styles.backLink}>
                            <ChevronLeft size={16} />
                            Back to Courses
                        </Link>
                    </div>

                    <div className={styles.courseTitle}>
                        <BookOpen size={18} />
                        {course.title}
                    </div>

                    <div className={styles.topBarRight}>
                        <div className={styles.progressPill}>
                            <span
                                className={styles.progressDot}
                                style={{ background: getProgressColor(course.progressPercent) }}
                            />
                            {course.progressPercent}% Complete
                        </div>
                        {/* Certificate button - always visible, checks eligibility on click */}
                        <button
                            className={`${styles.certificateBtn} ${course.certificateEarned ? styles.earned : ''}`}
                            onClick={handleCertificateClick}
                        >
                            <Award size={16} />
                            Certificate
                        </button>
                    </div>
                </div>

                <div className={styles.viewerBody}>
                    {/* Sidebar */}
                    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
                        <div className={styles.sidebarHeader}>
                            <h3>Course Content</h3>
                            <span>{course.completedLessons}/{course.totalLessons} complete</span>
                        </div>

                        <div className={styles.chapterList}>
                            {course.chapters.map((ch, chIdx) => (
                                <div key={ch.id} className={styles.chapterItem}>
                                    <button
                                        className={`${styles.chapterHeader} ${ch.completed ? styles.completed : ''}`}
                                        onClick={() => toggleChapter(chIdx)}
                                    >
                                        <div className={styles.chapterInfo}>
                                            {ch.completed ? (
                                                <CheckCircle2 size={18} className={styles.checkIcon} />
                                            ) : (
                                                <Circle size={18} />
                                            )}
                                            <div>
                                                <span className={styles.chapterNumber}>Chapter {chIdx + 1}</span>
                                                <h4>{ch.title}</h4>
                                            </div>
                                        </div>
                                        {expandedChapters.has(chIdx) ? (
                                            <ChevronUp size={18} />
                                        ) : (
                                            <ChevronDown size={18} />
                                        )}
                                    </button>

                                    {expandedChapters.has(chIdx) && (
                                        <div className={styles.lessonList}>
                                            {ch.lessons.map((l, lIdx) => (
                                                <button
                                                    key={l.id}
                                                    className={`${styles.lessonItem} ${currentChapter === chIdx && currentLesson === lIdx
                                                        ? styles.active
                                                        : ''
                                                        } ${l.completed ? styles.completed : ''}`}
                                                    onClick={() => goToLesson(chIdx, lIdx)}
                                                >
                                                    <div className={styles.lessonIcon}>
                                                        {l.completed ? (
                                                            <CheckCircle2 size={16} className={styles.checkIcon} />
                                                        ) : l.type === 'video' ? (
                                                            <Video size={16} />
                                                        ) : l.type === 'exam' ? (
                                                            <Award size={16} />
                                                        ) : (
                                                            <FileText size={16} />
                                                        )}
                                                    </div>
                                                    <div className={styles.lessonInfo}>
                                                        <span>{l.title}</span>
                                                        <span className={styles.lessonMeta}>
                                                            <Clock size={12} />
                                                            {l.duration} min
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className={styles.mainContent}>
                        {/* Lesson Header */}
                        <div className={styles.lessonHeader}>
                            <div className={styles.lessonBreadcrumb}>
                                <span>Chapter {currentChapter + 1}</span>
                                <ChevronRight size={14} />
                                <span>Lesson {currentLesson + 1}</span>
                            </div>
                            <h1>{lesson.title}</h1>
                            <div className={styles.lessonMeta}>
                                <span>
                                    {lesson.type === 'video' ? <Video size={14} /> : lesson.type === 'exam' ? <Award size={14} /> : <FileText size={14} />}
                                    {lesson.type === 'video' ? 'Video Lesson' : lesson.type === 'exam' ? 'Final Exam' : 'Reading'}
                                </span>
                                <span>
                                    <Clock size={14} />
                                    {lesson.duration} min
                                </span>
                            </div>
                        </div>

                        {/* Lesson Content */}
                        <div className={styles.lessonContent}>
                            {lesson.type === 'video' && lesson.slides ? (
                                <VideoPresenter
                                    slides={lesson.slides}
                                    currentSlide={currentSlide}
                                    isPlaying={isPlaying}
                                    isMuted={isMuted}
                                    elapsedTime={slideElapsedTime}
                                    playbackSpeed={playbackSpeed}
                                    spokenCharIndex={spokenCharIndex}
                                    showQuizPopup={showQuizPopup}
                                    onPlayPause={togglePlayPause}
                                    onPrevSlide={() => goToSlide(currentSlide - 1)}
                                    onNextSlide={() => goToSlide(currentSlide + 1)}
                                    onToggleMute={() => setIsMuted(!isMuted)}
                                    onSpeedChange={cyclePlaybackSpeed}
                                    onSlideClick={goToSlide}
                                    onQuizAnswer={handleQuizAnswer}
                                    onVideoEnd={completeAndNext}
                                    title={lesson.title}
                                />
                            ) : lesson.type === 'exam' && lesson.examQuestions ? (
                                <FinalExam
                                    questions={lesson.examQuestions}
                                    onComplete={handleExamComplete}
                                    title={lesson.title}
                                />
                            ) : lesson.content ? (
                                <div className={styles.textContent}>
                                    <InteractiveLecture content={lesson.content} />
                                </div>
                            ) : (
                                <div className={styles.noContent}>
                                    {isGeneratingContent ? (
                                        <>
                                            <Loader2 size={32} className={styles.spinner} />
                                            <p>Generating content...</p>
                                            <p className={styles.generatingHint}>This may take a minute</p>
                                        </>
                                    ) : (
                                        <>
                                            <p>Content could not be generated</p>
                                            <p className={styles.generatingHint}>
                                                This lesson's content failed to generate (API limit may have been reached)
                                            </p>
                                            <button
                                                onClick={regenerateContent}
                                                className={styles.retryBtn}
                                            >
                                                <RefreshCcw size={18} />
                                                Retry Generation
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Lesson Actions */}
                        <div className={styles.lessonActions}>
                            <button
                                onClick={goPrevious}
                                disabled={isFirstLesson}
                                className={styles.navBtn}
                            >
                                <ChevronLeft size={18} />
                                Previous
                            </button>

                            <div className={styles.actionCenter}>
                                <button
                                    onClick={() => setShowNotes(!showNotes)}
                                    className={`${styles.actionBtn} ${showNotes ? styles.active : ''}`}
                                >
                                    <StickyNote size={18} />
                                    Notes
                                </button>

                                {!lesson.completed && (
                                    <button
                                        onClick={completeAndNext}
                                        className={styles.completeBtn}
                                        disabled={isCompleting}
                                    >
                                        {isCompleting ? (
                                            <Loader2 size={18} className={styles.spinner} />
                                        ) : (
                                            <CheckCircle2 size={18} />
                                        )}
                                        Mark Complete & Continue
                                    </button>
                                )}

                                {/* Take Exam button - show on last regular lesson when attendance >= 80% */}
                                {(() => {
                                    // Check if current lesson is last non-exam lesson
                                    const regularChapters = course.chapters.filter(ch =>
                                        !ch.lessons.some(l => l.type === 'exam')
                                    );
                                    const isLastRegularChapter = currentChapter === regularChapters.length - 1 ||
                                        (hasExamChapter(course) && currentChapter === course.chapters.length - 2);
                                    const currentChapterData = course.chapters[currentChapter];
                                    const isLastLessonInChapter = currentLesson === currentChapterData.lessons.length - 1;
                                    const isAtLastRegularLesson = isLastRegularChapter && isLastLessonInChapter && lesson.type !== 'exam';
                                    const attendancePercent = getAttendancePercent(course);
                                    const showTakeExam = isAtLastRegularLesson && attendancePercent >= 80;

                                    if (showTakeExam) {
                                        return (
                                            <button
                                                onClick={handleTakeExam}
                                                disabled={isGeneratingExam}
                                                className={styles.takeExamBtn}
                                            >
                                                {isGeneratingExam ? (
                                                    <>
                                                        <Loader2 size={18} className={styles.spinner} />
                                                        Generating Exam...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Award size={18} />
                                                        Take Final Exam
                                                    </>
                                                )}
                                            </button>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            <button
                                onClick={completeAndNext}
                                disabled={(isLastLesson && lesson.completed) || isCompleting}
                                className={styles.navBtn}
                            >
                                {isCompleting ? (
                                    <Loader2 size={18} className={styles.spinner} />
                                ) : (
                                    <>
                                        {isLastLesson ? 'Finish Course' : 'Next'}
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Notes Panel */}
                        {showNotes && (
                            <div className={styles.notesPanel}>
                                <div className={styles.notesPanelHeader}>
                                    <h3>
                                        <StickyNote size={18} />
                                        Lesson Notes
                                    </h3>
                                    <div className={styles.notesPanelActions}>
                                        <button onClick={saveNotes} className={styles.saveNotesBtn}>
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setShowNotes(false)}
                                            className={styles.closeNotesBtn}
                                            title="Close Notes"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Take notes for this lesson..."
                                    className={styles.notesTextarea}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {
                showCertificateModal && course && (
                    <CertificateModal
                        courseName={course.title}
                        existingName={course.certificateData?.name}
                        date={course.certificateData?.date ? new Date(course.certificateData.date) : new Date()}
                        onClose={() => setShowCertificateModal(false)}
                        onSaveName={(name) => {
                            const updated = {
                                ...course,
                                certificateData: {
                                    name,
                                    date: new Date()
                                }
                            };
                            saveCourse(updated);
                            setCourse(updated);
                        }}
                    />
                )
            }

            {/* Eligibility Modal - shown when certificate requirements not met */}
            {
                showEligibilityModal && course && (() => {
                    const eligibility = checkCertificateEligibility(course);
                    return (
                        <EligibilityModal
                            courseName={course.title}
                            attendancePercent={eligibility.attendancePercent}
                            examScore={eligibility.examScore}
                            hasExam={eligibility.hasExam}
                            onClose={() => setShowEligibilityModal(false)}
                            onRetakeExam={() => {
                                setShowEligibilityModal(false);
                                handleTakeExam();
                            }}
                            onContinueLessons={() => {
                                setShowEligibilityModal(false);
                            }}
                        />
                    );
                })()
            }

            {/* Toast Notification */}
            {
                showToast && (
                    <div className={styles.toast}>
                        <Check size={18} />
                        Notes saved successfully
                    </div>
                )
            }

            {/* AI Voice Tutor */}
            {
                lesson && (
                    <AITutor
                        context={
                            lesson.type === 'video' && lesson.slides
                                ? `Slide ${currentSlide + 1}: ${lesson.slides[currentSlide]?.narration}`
                                : lesson.content || `Lesson: ${lesson.title}`
                        }
                    />
                )
            }
            <ConfirmationModal
                isOpen={!!errorModal}
                onClose={() => setErrorModal(null)}
                onConfirm={() => setErrorModal(null)}
                title={errorModal?.title || ''}
                message={errorModal?.message || ''}
                confirmText="OK"
                cancelText=""
                isDanger={true}
            />
        </>
    );
}
