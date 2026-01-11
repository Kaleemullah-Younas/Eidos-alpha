'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoPresenter from '@/components/VideoPresenter';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/components/AuthProvider';
import {
    BookOpen,
    Play,
    Clock,
    CheckCircle2,
    Plus,
    Sparkles,
    Loader2,
    Trash2,
    ChevronRight,
    ChevronDown,
    GraduationCap,
    BarChart3,
    Video,
    FileText,
    Layers,
    Film,
    BookText,
    Globe,
    Share2,
} from 'lucide-react';
import {
    Course,
    getAllCourses,
    deleteCourse,
    saveCourse,
    publishCourse,
    formatDuration,
    getProgressColor,
} from '@/lib/courseStorage';
import styles from './course.module.css';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function CoursePage() {
    const router = useRouter();
    const { isLoggedIn, isLoading: authLoading } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [topic, setTopic] = useState('');
    const [courseType, setCourseType] = useState<'hybrid' | 'written' | 'video'>('hybrid');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState('');

    // Confirmation Modal State
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        type: 'delete' | 'publish';
        id: string;
        title: string;
        message: string;
        isDanger: boolean;
        isAlert?: boolean;
    } | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const openPublishModal = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmation({
            isOpen: true,
            type: 'publish',
            id,
            title: 'Publish Course',
            message: 'Are you sure you want to publish this course? It will be visible to everyone in the Public Courses library.',
            isDanger: false
        });
    };

    const openDeleteModal = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmation({
            isOpen: true,
            type: 'delete',
            id,
            title: 'Delete Course',
            message: 'Are you sure you want to delete this course? This action cannot be undone.',
            isDanger: true
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmation) return;

        setIsConfirming(true);
        try {
            if (confirmation.type === 'publish') {
                await publishCourse(confirmation.id);
                setCourses(prev => prev.map(c =>
                    c.id === confirmation.id ? { ...c, isPublished: true } : c
                ));
            } else if (confirmation.type === 'delete') {
                await deleteCourse(confirmation.id);
                setCourses(await getAllCourses());
            }
            setConfirmation(null);
        } catch (error) {
            console.error(`Failed to ${confirmation.type} course:`, error);
            setConfirmation({
                isOpen: true,
                type: confirmation.type,
                id: confirmation.id,
                title: 'Error',
                message: `Failed to ${confirmation.type} course. Please try again.`,
                isDanger: true,
                isAlert: true
            });
        } finally {
            setIsConfirming(false);
        }
    };

    useEffect(() => {
        // Load courses from database
        async function loadCourses() {
            try {
                const data = await getAllCourses();
                setCourses(data);
            } finally {
                setIsLoading(false);
            }
        }
        loadCourses();
    }, []);

    const generateCourse = async () => {
        if (!topic.trim() || isGenerating) return;

        setIsGenerating(true);
        setGenerationStatus('Creating course outline...');

        try {
            const response = await fetch('/api/generate-course', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, courseType }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate course');
            }

            const data = await response.json();

            if (data.success && data.course) {
                // Save course to database immediately
                let course = data.course as Course;
                course = await saveCourse(course);

                setGenerationStatus('Course outline created! Generating content...');

                // Generate content for each lesson
                let lessonCount = 0;
                const totalLessons = course.totalLessons;

                for (let ci = 0; ci < course.chapters.length; ci++) {
                    const chapter = course.chapters[ci];
                    for (let li = 0; li < chapter.lessons.length; li++) {
                        const lesson = chapter.lessons[li];
                        lessonCount++;
                        setGenerationStatus(
                            `Generating lesson ${lessonCount}/${totalLessons}: ${lesson.title}`
                        );

                        // Pass all needed info to API (no server-side storage)
                        const lessonResponse = await fetch('/api/generate-course', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                action: 'generate-lesson',
                                courseTitle: course.title,
                                chapterTitle: chapter.title,
                                lessonTitle: lesson.title,
                                lessonType: lesson.type,
                                lessonDuration: lesson.duration,
                            }),
                        });

                        if (lessonResponse.ok) {
                            const lessonData = await lessonResponse.json();
                            if (lessonData.success && lessonData.lessonContent) {
                                // Update lesson content and save to localStorage
                                if (lessonData.lessonContent.content) {
                                    course.chapters[ci].lessons[li].content = lessonData.lessonContent.content;
                                }
                                if (lessonData.lessonContent.slides) {
                                    course.chapters[ci].lessons[li].slides = lessonData.lessonContent.slides;
                                }
                                if (lessonData.lessonContent.videoLecture) {
                                    course.chapters[ci].lessons[li].videoLecture = lessonData.lessonContent.videoLecture;
                                }
                                // Save after each lesson to preserve progress
                                course = await saveCourse(course);
                            }
                        }
                    }
                }

                // Mark generation complete and save
                course.generationStatus = 'completed';
                await saveCourse(course);

                setGenerationStatus('Course created successfully!');
                setCourses(await getAllCourses());
                setTopic('');

                // Navigate to the new course
                setTimeout(() => {
                    router.push(`/course/${course.id}`);
                }, 1000);
            }
        } catch (error) {
            console.error('Course generation error:', error);
            setGenerationStatus('Failed to generate course. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };



    const getContentTypeCounts = (course: Course) => {
        let text = 0;
        let video = 0;
        course.chapters.forEach(ch => {
            ch.lessons.forEach(l => {
                if (l.type === 'text') text++;
                else video++;
            });
        });
        return { text, video };
    };

    if (authLoading) {
        return (
            <main className={styles.main}>
                <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <p>Loading...</p>
                </div>
            </main>
        );
    }

    if (!isLoggedIn) {
        return (
            <LoginPage />
        );
    }

    return (
        <>
            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Hero Section */}
                    <div className={styles.hero}>
                        <h1>
                            <span className={styles.heroGradient}>Create Complete Courses</span>
                        </h1>
                        <p className={styles.heroText}>
                            Enter a topic and let AI generate a comprehensive course with chapters,
                            lessons, and quizzes.
                        </p>
                    </div>

                    {/* Course Generator */}
                    <div className={styles.generatorCard}>
                        <div className={styles.generatorHeader}>
                            <div className={styles.generatorIcon}>
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h2>Generate New Course</h2>
                                <p>AI will create a structured course based on your selected format</p>
                            </div>
                        </div>

                        <div className={styles.generatorForm}>
                            <input
                                type="text"
                                placeholder="Enter a course topic (e.g., Machine Learning Fundamentals)"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                disabled={isGenerating}
                                className={styles.topicInput}
                                onKeyDown={(e) => e.key === 'Enter' && generateCourse()}
                            />
                            <div className={styles.dropdownWrapper}>
                                <button
                                    type="button"
                                    onClick={() => !isGenerating && setIsDropdownOpen(!isDropdownOpen)}
                                    className={`${styles.courseTypeSelect} ${isDropdownOpen ? styles.open : ''}`}
                                    disabled={isGenerating}
                                >
                                    <span className={styles.selectedOption}>
                                        {courseType === 'hybrid' && <Layers size={16} />}
                                        {courseType === 'written' && <BookText size={16} />}
                                        {courseType === 'video' && <Film size={16} />}
                                        {courseType.charAt(0).toUpperCase() + courseType.slice(1)}
                                    </span>
                                    <ChevronDown size={16} className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.rotated : ''}`} />
                                </button>
                                {isDropdownOpen && (
                                    <div className={styles.dropdownMenu}>
                                        <button
                                            type="button"
                                            className={`${styles.dropdownItem} ${courseType === 'hybrid' ? styles.active : ''}`}
                                            onClick={() => { setCourseType('hybrid'); setIsDropdownOpen(false); }}
                                        >
                                            <Layers size={16} />
                                            <div className={styles.dropdownItemContent}>
                                                <span className={styles.dropdownItemTitle}>Hybrid</span>
                                                <span className={styles.dropdownItemDesc}>Mixed text & video lessons</span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.dropdownItem} ${courseType === 'written' ? styles.active : ''}`}
                                            onClick={() => { setCourseType('written'); setIsDropdownOpen(false); }}
                                        >
                                            <BookText size={16} />
                                            <div className={styles.dropdownItemContent}>
                                                <span className={styles.dropdownItemTitle}>Written</span>
                                                <span className={styles.dropdownItemDesc}>Text-only reading content</span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.dropdownItem} ${courseType === 'video' ? styles.active : ''}`}
                                            onClick={() => { setCourseType('video'); setIsDropdownOpen(false); }}
                                        >
                                            <Film size={16} />
                                            <div className={styles.dropdownItemContent}>
                                                <span className={styles.dropdownItemTitle}>Video</span>
                                                <span className={styles.dropdownItemDesc}>Video-only lessons</span>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={generateCourse}
                                disabled={!topic.trim() || isGenerating}
                                className={styles.generateBtn}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={18} className={styles.spinner} />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        Generate Course
                                    </>
                                )}
                            </button>
                        </div>

                        {generationStatus && (
                            <div className={styles.statusMessage}>
                                {isGenerating && <Loader2 size={16} className={styles.spinner} />}
                                {generationStatus}
                            </div>
                        )}
                    </div>

                    {/* Course Library */}
                    <div className={styles.librarySection}>
                        <div className={styles.sectionHeader}>
                            <h2>
                                <BookOpen size={20} />
                                Your Courses
                            </h2>
                            <span className={styles.courseCount}>{courses.length} courses</span>
                        </div>

                        {isLoading ? (
                            <div className={styles.courseGrid}>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={styles.courseCard} style={{ height: '240px', opacity: 0.5, animation: 'pulse 2s infinite' }}></div>
                                ))}
                            </div>
                        ) : courses.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <BookOpen size={32} />
                                </div>
                                <h3>No courses yet</h3>
                                <p>Generate your first course to get started!</p>
                            </div>
                        ) : (
                            <div className={styles.courseGrid}>
                                {courses.map((course) => {
                                    const counts = getContentTypeCounts(course);
                                    return (
                                        <Link
                                            key={course.id}
                                            href={`/course/${course.id}`}
                                            className={styles.courseCard}
                                        >
                                            <div className={styles.courseHeader}>
                                                <div
                                                    className={styles.courseThumbnail}
                                                    style={{
                                                        background: `linear-gradient(135deg, ${getProgressColor(course.progressPercent)}, var(--accent-strong))`,
                                                    }}
                                                >
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                                    </svg>
                                                </div>
                                                <div className={styles.courseHeaderActions}>
                                                    {!course.isPublished && !course.originalCourseId && (
                                                        <button
                                                            onClick={(e) => openPublishModal(course.id, e)}
                                                            className={styles.actionBtn}
                                                            title="Publish course"
                                                        >
                                                            <Share2 size={16} />
                                                        </button>
                                                    )}
                                                    {course.isPublished && (
                                                        <span className={styles.publishedBadge} title="Published">
                                                            <Globe size={14} />
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={(e) => openDeleteModal(course.id, e)}
                                                        className={styles.deleteBtn}
                                                        title="Delete course"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className={styles.courseContent}>
                                                <span className={styles.difficultyBadge}>
                                                    {course.difficulty}
                                                </span>
                                                <h3>{course.title}</h3>
                                                <p>{course.description}</p>

                                                <div className={styles.courseMeta}>
                                                    <span>
                                                        <Clock size={14} />
                                                        {formatDuration(course.totalDuration)}
                                                    </span>
                                                    <span>
                                                        <BarChart3 size={14} />
                                                        {course.chapters.length} chapters
                                                    </span>
                                                </div>

                                                <div className={styles.contentTypes}>
                                                    <span className={styles.typeTag}>
                                                        <FileText size={12} />
                                                        {counts.text} text
                                                    </span>
                                                    <span className={styles.typeTag}>
                                                        <Video size={12} />
                                                        {counts.video} video
                                                    </span>
                                                </div>

                                                <div className={styles.progressSection}>
                                                    <div className={styles.progressBar}>
                                                        <div
                                                            className={styles.progressFill}
                                                            style={{
                                                                width: `${course.progressPercent}%`,
                                                                background: getProgressColor(course.progressPercent),
                                                            }}
                                                        />
                                                    </div>
                                                    <div className={styles.progressText}>
                                                        <span>{course.progressPercent}% complete</span>
                                                        <span>
                                                            {course.completedLessons}/{course.totalLessons} lessons
                                                        </span>
                                                    </div>
                                                </div>

                                                {course.certificateEarned && (
                                                    <div className={styles.certificateBadge}>
                                                        <CheckCircle2 size={14} />
                                                        Certificate Earned
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.courseFooter}>
                                                <span>
                                                    {course.progressPercent > 0 ? 'Continue' : 'Start'} Course
                                                </span>
                                                <ChevronRight size={16} />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!confirmation}
                onClose={() => setConfirmation(null)}
                onConfirm={confirmation?.isAlert ? () => setConfirmation(null) : handleConfirmAction}
                title={confirmation?.title || ''}
                message={confirmation?.message || ''}
                confirmText={confirmation?.isAlert ? 'OK' : (isConfirming ? (confirmation?.type === 'delete' ? 'Deleting...' : 'Publishing...') : (confirmation?.title || 'Confirm'))}
                cancelText={confirmation?.isAlert ? '' : 'Cancel'}
                isLoading={isConfirming}
                isDanger={confirmation?.isDanger}
            />
        </>
    );
}
